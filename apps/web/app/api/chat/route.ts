import { auth } from '@/auth';
import { env } from '@/env';
import { extractRecipeTitles } from '@/lib/ai/recipe-utils';
import { buildSystemPrompt } from '@/lib/ai/system-prompt';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { db } from '@yeschefai/db';
import { chatConversations, chatMessages } from '@yeschefai/db/schema';
import {
    type UIMessage,
    convertToModelMessages,
    stepCountIs,
    streamText,
    tool,
} from 'ai';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const openrouter = createOpenRouter({
    apiKey: env.OPENROUTER_API_KEY,
});

const DEFAULT_MODEL = 'openai/gpt-4o';
const SEARCH_MAX_RESULTS = 5;
const BROWSE_MAX_RESULTS = 8;
const MAX_TOOL_STEPS = 3;

function extractTextFromUIMessage(message: UIMessage): string {
    return message.parts
        .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
        .map((p) => p.text)
        .join('');
}

async function searchScraper(query: string, maxResults: number) {
    if (!query) {
        return { results: [], error: 'No query provided' };
    }
    try {
        const response = await fetch(`${env.SCRAPER_URL}/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, max_results: maxResults }),
        });

        if (!response.ok) {
            return {
                results: [],
                error: `Search failed: ${response.status}`,
            };
        }

        const data = await response.json();
        return {
            results: (
                data.results as Array<{
                    title: string;
                    url: string;
                    content: string;
                    image?: string | null;
                    calories?: number | null;
                }>
            ).map((r) => ({
                title: r.title,
                url: r.url,
                content: r.content,
                image: r.image ?? null,
                calories: r.calories ?? null,
            })),
        };
    } catch (error) {
        console.error('[Scraper] Exception:', error);
        return { results: [], error: 'Failed to search for recipes' };
    }
}

export async function POST(req: Request) {
    const session = await auth.api.getSession({
        headers: req.headers,
    });

    if (!session?.user?.id) {
        return new Response('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const messages: UIMessage[] = body.messages ?? [];
    const conversationId: string | undefined = body.conversationId;
    const modelId: string | undefined = body.model;
    const filters: string[] | undefined = body.filters;

    const model = modelId || DEFAULT_MODEL;
    const systemPrompt = buildSystemPrompt(filters);

    // Create conversation if none provided
    let activeConversationId = conversationId;
    if (!activeConversationId) {
        const firstUserMessage = messages.find((m) => m.role === 'user');
        const title = firstUserMessage
            ? extractTextFromUIMessage(firstUserMessage).slice(0, 100)
            : 'New conversation';

        const [conversation] = await db
            .insert(chatConversations)
            .values({
                userId,
                model,
                title,
            })
            .returning();
        activeConversationId = conversation.id;
    } else {
        const firstUserMessage = messages.find((m) => m.role === 'user');
        const userTitle = firstUserMessage
            ? extractTextFromUIMessage(firstUserMessage).slice(0, 100)
            : null;

        // Fetch current conversation to check if title needs updating
        const [existing] = await db
            .select({ title: chatConversations.title })
            .from(chatConversations)
            .where(eq(chatConversations.id, activeConversationId))
            .limit(1);

        const updates: Record<string, unknown> = {
            model,
            updatedAt: new Date(),
        };
        if (existing && existing.title === 'New conversation' && userTitle) {
            updates.title = userTitle;
        }

        await db
            .update(chatConversations)
            .set(updates)
            .where(eq(chatConversations.id, activeConversationId));
    }

    // Save the latest user message
    const lastUserMessage = [...messages]
        .reverse()
        .find((m) => m.role === 'user');
    if (lastUserMessage) {
        await db.insert(chatMessages).values({
            conversationId: activeConversationId,
            role: 'user',
            content: extractTextFromUIMessage(lastUserMessage),
        });
    }

    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
        model: openrouter(model),
        system: systemPrompt,
        messages: modelMessages,
        tools: {
            search_recipes: tool({
                description:
                    'Search the web for recipes and cooking information. Use this tool whenever the user asks about a recipe, ingredient, or cooking technique.',
                inputSchema: z.object({
                    query: z
                        .string()
                        .describe(
                            'The search query for finding recipes, e.g. "chicken parmesan recipe"',
                        ),
                }),
                execute: async ({ query }) =>
                    searchScraper(query, SEARCH_MAX_RESULTS),
            }),
            browse_recipes: tool({
                description:
                    'Browse recipe options for broad or exploratory queries. Use this when the user asks for general ideas (e.g. "pasta recipes", "something with chicken", "quick dinner ideas") rather than a specific recipe. Returns search results to present as selectable options.',
                inputSchema: z.object({
                    query: z
                        .string()
                        .describe(
                            'The broad search query for browsing recipes',
                        ),
                }),
                execute: async ({ query }) =>
                    searchScraper(query, BROWSE_MAX_RESULTS),
            }),
        },
        stopWhen: stepCountIs(MAX_TOOL_STEPS),
        onFinish: async ({ text }) => {
            const recipeTitles = extractRecipeTitles(text);
            await db.insert(chatMessages).values({
                conversationId: activeConversationId,
                role: 'assistant',
                content: text,
                ...(recipeTitles.length > 0 && {
                    metadata: { recipeTitles },
                }),
            });

            await db
                .update(chatConversations)
                .set({ updatedAt: new Date() })
                .where(eq(chatConversations.id, activeConversationId));
        },
    });

    return result.toUIMessageStreamResponse();
}
