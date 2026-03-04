'use client';

import { ChatInput } from '@/components/chat/chat-input';
import { ChatMessage } from '@/components/chat/chat-message';
import type { RecipeOptionData } from '@/components/recipe/recipe-options-grid';

import { SuggestionChips } from '@/components/chat/suggestion-chips';
import { useChatHeaderActions } from '@/components/chat/use-chat-header-actions';
import { authClient } from '@/lib/auth-client';
import { useChatStore } from '@/stores/chat-store';
import { api } from '@/trpc/react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { ArrowDownIcon, ChefHatIcon } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

function getMessageText(message: {
    parts: Array<{ type: string; text?: string }>;
}): string {
    return message.parts
        .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
        .map((p) => p.text)
        .join('');
}

function getTimeOfDayGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning! What\u2019s cooking?';
    if (hour < 17) return 'Good afternoon! Ready to cook?';
    return 'Good evening! What\u2019s for dinner?';
}

function ToolCallIndicator({ message }: { message: string }) {
    return (
        <div className="flex items-start gap-2.5 mb-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <ChefHatIcon className="size-4 text-primary" />
            </div>
            <div className="rounded-lg bg-muted px-3 py-2">
                <span className="text-sm text-muted-foreground animate-pulse">
                    {message}
                </span>
            </div>
        </div>
    );
}

function hasActiveToolCall(
    messages: Array<{ parts: Array<{ type: string; state?: string }> }>,
    toolName?: string,
): boolean {
    if (messages.length === 0) return false;
    const lastMsg = messages[messages.length - 1];
    return lastMsg.parts.some(
        (p) =>
            (toolName
                ? p.type === `tool-${toolName}`
                : p.type.startsWith('tool-')) &&
            (p.state === 'input-streaming' || p.state === 'input-available'),
    );
}

const SCROLL_THRESHOLD = 100;

export function ChatPanel() {
    const { conversationId, setConversationId } = useChatStore();
    useChatHeaderActions();
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [showJumpToBottom, setShowJumpToBottom] = useState(false);
    const isNearBottomRef = useRef(true);
    const utils = api.useUtils();
    const searchParams = useSearchParams();
    const prefilled = useRef(false);

    const { data: session } = authClient.useSession();
    const userName = session?.user?.name ?? undefined;
    const userImage = session?.user?.image ?? undefined;

    // Pre-fill input from ?q= search param (e.g. from Explore page)
    useEffect(() => {
        const q = searchParams.get('q');
        if (q && !prefilled.current) {
            prefilled.current = true;
            setInputValue(`I want to make ${q}`);
        }
    }, [searchParams]);

    const createConversation = api.chat.createConversation.useMutation();

    const transport = useMemo(
        () =>
            new DefaultChatTransport({
                api: '/api/chat',
                body: () => {
                    const state = useChatStore.getState();
                    const filterIds = state.activeFilters.map((f) => f.id);
                    return {
                        conversationId: state.conversationId,
                        model: state.model,
                        filters: filterIds.length > 0 ? filterIds : undefined,
                    };
                },
            }),
        [],
    );

    const { messages, sendMessage, status, error } = useChat({
        transport,
        onFinish: async () => {
            utils.chat.listConversations.invalidate();
            utils.chat.listConversationRecipes.invalidate();
        },
    });

    const isLoading = status === 'streaming' || status === 'submitted';

    // Callback ref for scroll container – guarantees the listener attaches
    // as soon as the DOM node mounts (avoids stale-ref issues with useEffect + empty deps).
    const scrollContainerCallbackRef = useCallback(
        (node: HTMLDivElement | null) => {
            scrollContainerRef.current = node;
            if (!node) return;

            const handleScroll = () => {
                const distanceFromBottom =
                    node.scrollHeight - node.scrollTop - node.clientHeight;
                const nearBottom = distanceFromBottom < SCROLL_THRESHOLD;
                isNearBottomRef.current = nearBottom;
                setShowJumpToBottom(!nearBottom);
            };
            node.addEventListener('scroll', handleScroll, { passive: true });
        },
        [],
    );

    // Auto-scroll only when user is near the bottom
    useEffect(() => {
        if (isNearBottomRef.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    const sendWithConversation = useCallback(
        async (text: string) => {
            const state = useChatStore.getState();
            if (!state.conversationId) {
                const { id } = await createConversation.mutateAsync({
                    title: text.slice(0, 100),
                    model: state.model,
                });
                setConversationId(id);
                utils.chat.listConversations.invalidate();
            }
            sendMessage({ text });
        },
        [
            createConversation,
            setConversationId,
            sendMessage,
            utils.chat.listConversations,
        ],
    );

    const handleSend = useCallback(
        (overrideText?: string) => {
            const text = overrideText ?? inputValue;
            if (!text.trim() || isLoading) return;
            setInputValue('');
            sendWithConversation(text);
        },
        [inputValue, isLoading, sendWithConversation],
    );

    const handleSuggestionSend = useCallback(
        (text: string) => {
            if (isLoading) return;
            sendWithConversation(text);
        },
        [isLoading, sendWithConversation],
    );

    const handleFindMore = useCallback(() => {
        if (isLoading) return;
        sendWithConversation('Show me more recipe options');
    }, [isLoading, sendWithConversation]);

    const handleSelectRecipeOption = useCallback(
        (option: RecipeOptionData) => {
            if (isLoading) return;
            const parts = [`I'd like to make the ${option.title}`];
            if (option.sourceUrl) {
                parts.push(`Here's the recipe link: ${option.sourceUrl}`);
            }
            sendWithConversation(parts.join('\n\n'));
        },
        [isLoading, sendWithConversation],
    );

    return (
        <div className="flex h-full flex-col overflow-hidden">
            {/* Messages */}
            <div className="relative min-h-0 flex-1">
                <div
                    ref={scrollContainerCallbackRef}
                    className="h-full max-w-dvw overflow-y-auto p-4"
                >
                    <div className="mx-auto max-w-4xl">
                        {messages.length === 0 && (
                            <div className="flex h-full items-center justify-center pt-16 pb-8">
                                <div className="text-center">
                                    <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
                                        <ChefHatIcon className="size-8 text-primary" />
                                    </div>
                                    <p className="mb-1 text-lg font-medium">
                                        {getTimeOfDayGreeting()}
                                    </p>
                                    <p className="mb-6 text-sm text-muted-foreground">
                                        Ask me for any recipe and I&apos;ll
                                        search the web for the best options.
                                    </p>
                                    <SuggestionChips
                                        onSend={handleSuggestionSend}
                                    />
                                </div>
                            </div>
                        )}
                        {messages.map((m, i) => (
                            <ChatMessage
                                key={m.id}
                                role={m.role as 'user' | 'assistant'}
                                content={getMessageText(m)}
                                conversationId={conversationId ?? undefined}
                                userName={userName}
                                userImage={userImage}
                                isStreaming={
                                    status === 'streaming' &&
                                    m.role === 'assistant' &&
                                    i === messages.length - 1
                                }
                                onSelectRecipeOption={handleSelectRecipeOption}
                                onFindMore={handleFindMore}
                            />
                        ))}
                        {status === 'submitted' && (
                            <ToolCallIndicator message="Thinking..." />
                        )}
                        {isLoading &&
                            hasActiveToolCall(messages, 'search_recipes') && (
                                <ToolCallIndicator message="Searching for recipes..." />
                            )}
                        {isLoading &&
                            hasActiveToolCall(messages, 'browse_recipes') && (
                                <ToolCallIndicator message="Finding recipes..." />
                            )}
                        {error && (
                            <div className="mx-auto my-4 max-w-md rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                {error.message ||
                                    'An error occurred. Please try again.'}
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
                {showJumpToBottom && (
                    <button
                        type="button"
                        onClick={scrollToBottom}
                        className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 flex items-center justify-center size-8 rounded-full bg-background border shadow-md text-muted-foreground hover:text-foreground transition-all animate-in fade-in-0 zoom-in-95 duration-200"
                    >
                        <ArrowDownIcon className="size-4" />
                    </button>
                )}
            </div>

            {/* Input area */}
            <div className="border-t p-3 pb-[calc(0.75rem+var(--safe-area-override,var(--safe-area-inset-bottom))+var(--keyboard-height))] transition-[padding-bottom] duration-300 ease-out">
                <div className="mx-auto max-w-4xl space-y-2">
                    <ChatInput
                        value={inputValue}
                        onChange={setInputValue}
                        onSend={handleSend}
                        disabled={isLoading}
                        textareaRef={textareaRef}
                    />
                </div>
            </div>
        </div>
    );
}
