"use client";

import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessage } from "@/components/chat/chat-message";
import type { RecipeOptionData } from "@/components/recipe/recipe-options-grid";

import { SuggestionChips } from "@/components/chat/suggestion-chips";
import { authClient } from "@/lib/auth-client";
import { useChatStore } from "@/stores/chat-store";
import { api } from "@/trpc/react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@souschef/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@souschef/ui/components/select";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@souschef/ui/components/sheet";
import { Skeleton } from "@souschef/ui/components/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@souschef/ui/components/tooltip";
import { DefaultChatTransport } from "ai";
import {
  ArrowDownIcon,
  BookOpenIcon,
  ChefHatIcon,
  GlobeIcon,
  LogOutIcon,
  MenuIcon,
  MessageSquareIcon,
  MessageSquarePlusIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const MOBILE_NAV_ITEMS = [
  { href: "/chat", label: "Chat", icon: MessageSquareIcon },
  { href: "/explore", label: "Explore", icon: GlobeIcon },
  { href: "/recipes", label: "My Recipes", icon: BookOpenIcon },
];

const MODELS = [
  { id: "deepseek/deepseek-v3.1-terminus", label: "DeepSeek V3.1 Terminus" },
  { id: "openai/gpt-4o", label: "GPT-4o" },
  { id: "anthropic/claude-sonnet-4", label: "Claude Sonnet 4" },
  { id: "google/gemini-2.0-flash-exp", label: "Gemini 2.0 Flash" },
  { id: "qwen/qwen3.5-plus-02-15", label: "Qwen 3.5 Plus" },
  { id: "z-ai/glm-5", label: "GLM-5" },
];

function getMessageText(message: {
  parts: Array<{ type: string; text?: string }>;
}): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning! What\u2019s cooking?";
  if (hour < 17) return "Good afternoon! Ready to cook?";
  return "Good evening! What\u2019s for dinner?";
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
      (toolName ? p.type === `tool-${toolName}` : p.type.startsWith("tool-")) &&
      (p.state === "input-streaming" || p.state === "input-available"),
  );
}

interface SidebarContentProps {
  conversations:
    | Array<{ id: string; title: string | null; model: string | null }>
    | undefined;
  conversationsLoading: boolean;
  conversationId: string | null;
  conversationRecipes: Record<string, string[]> | undefined;
  loadConversation: (id: string) => void;
  deleteConversation: { mutate: (args: { id: string }) => void };
  handleNewConversation: () => void;
}

function SidebarContent({
  conversations,
  conversationsLoading,
  conversationId,
  conversationRecipes,
  loadConversation,
  deleteConversation,
  handleNewConversation,
}: SidebarContentProps) {
  return (
    <>
      <div className="p-3">
        <Button
          size="sm"
          variant="outline"
          className="w-full gap-1.5"
          onClick={handleNewConversation}
        >
          <MessageSquarePlusIcon className="size-4" />
          New Chat
        </Button>
      </div>
      <div className="px-3">
        <p className="mb-1 px-2 text-xs font-medium text-muted-foreground">
          History
        </p>
        {conversationsLoading && (
          <div className="space-y-2 p-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        )}
        {conversations?.map((conv) => (
          <div
            key={conv.id}
            className={`group flex items-center gap-1 rounded px-2 py-1.5 text-xs cursor-pointer ${
              conv.id === conversationId
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent/50"
            }`}
          >
            <Button
              variant="ghost"
              className="h-auto flex-1 justify-start truncate p-0 font-normal"
              onClick={() => loadConversation(conv.id)}
            >
              {conv.title || "Untitled"}
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              className="shrink-0 text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                deleteConversation.mutate({
                  id: conv.id,
                });
              }}
            >
              <Trash2Icon className="size-3" />
            </Button>
            {conversationRecipes?.[conv.id] && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex shrink-0 items-center gap-0.5 text-muted-foreground">
                    <ChefHatIcon className="size-3" />
                    <span className="text-[10px]">
                      {conversationRecipes[conv.id].length}
                    </span>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <ul className="list-none p-0">
                    {conversationRecipes[conv.id].map((title) => (
                      <li key={title}>{title}</li>
                    ))}
                  </ul>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export function ChatPanel() {
  const { conversationId, model, setConversationId, setModel } = useChatStore();
  const [inputValue, setInputValue] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
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
  const userEmail = session?.user?.email ?? undefined;
  const userImage = session?.user?.image ?? undefined;
  const pathname = usePathname();

  // Pre-fill input from ?q= search param (e.g. from Explore page)
  useEffect(() => {
    const q = searchParams.get("q");
    if (q && !prefilled.current) {
      prefilled.current = true;
      setInputValue(`I want to make ${q}`);
    }
  }, [searchParams]);

  const { data: conversations, isLoading: conversationsLoading } =
    api.chat.listConversations.useQuery();

  const { data: conversationRecipes } =
    api.chat.listConversationRecipes.useQuery();

  const deleteConversation = api.chat.deleteConversation.useMutation({
    onSuccess: () => {
      utils.chat.listConversations.invalidate();
      utils.chat.listConversationRecipes.invalidate();
      if (conversationId) {
        setConversationId(null);
      }
    },
  });

  const createConversation = api.chat.createConversation.useMutation();

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
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

  const { messages, sendMessage, setMessages, status, error } = useChat({
    transport,
    onFinish: async () => {
      utils.chat.listConversations.invalidate();
      utils.chat.listConversationRecipes.invalidate();
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Callback ref for scroll container – guarantees the listener attaches
  // as soon as the DOM node mounts (avoids stale-ref issues with useEffect + empty deps).
  const scrollContainerCallbackRef = useCallback(
    (node: HTMLDivElement | null) => {
      scrollContainerRef.current = node;
      if (!node) return;

      const handleScroll = () => {
        const threshold = 100;
        const distanceFromBottom =
          node.scrollHeight - node.scrollTop - node.clientHeight;
        const nearBottom = distanceFromBottom < threshold;
        isNearBottomRef.current = nearBottom;
        setShowJumpToBottom(!nearBottom);
      };
      node.addEventListener("scroll", handleScroll, { passive: true });
    },
    [],
  );

  // Auto-scroll only when user is near the bottom
  useEffect(() => {
    if (isNearBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const loadConversation = useCallback(
    async (id: string) => {
      setConversationId(id);
      setSheetOpen(false);
      const conversation = await utils.chat.getConversation.fetch({ id });
      if (conversation?.messages) {
        setMessages(
          conversation.messages.map((m) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            parts: [{ type: "text" as const, text: m.content }],
          })),
        );
        const conv = conversations?.find((c) => c.id === id);
        if (conv?.model) {
          setModel(conv.model);
        }
      }
    },
    [
      setMessages,
      setConversationId,
      setModel,
      utils.chat.getConversation,
      conversations,
    ],
  );

  const handleNewConversation = useCallback(() => {
    setConversationId(null);
    setMessages([]);
    setSheetOpen(false);
  }, [setConversationId, setMessages]);

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
      setInputValue("");
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
    sendWithConversation("Show me more recipe options");
  }, [isLoading, sendWithConversation]);

  const handleSelectRecipeOption = useCallback(
    (option: RecipeOptionData) => {
      if (isLoading) return;
      const parts = [`I'd like to make the ${option.title}`];
      if (option.sourceUrl) {
        parts.push(`Here's the recipe link: ${option.sourceUrl}`);
      }
      sendWithConversation(parts.join("\n\n"));
    },
    [isLoading, sendWithConversation],
  );

  const sidebarProps: SidebarContentProps = {
    conversations,
    conversationsLoading,
    conversationId,
    conversationRecipes,
    loadConversation,
    deleteConversation,
    handleNewConversation,
  };

  return (
    <div className="flex h-full">
      {/* Desktop conversation sidebar */}
      <div className="hidden w-64 shrink-0 overflow-y-auto border-r bg-muted/30 md:block">
        <SidebarContent {...sidebarProps} />
      </div>

      {/* Main chat area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-2 pt-[calc(0.5rem+var(--safe-area-inset-top))] md:pt-2">
          <div className="flex items-center gap-2">
            {/* Mobile sidebar trigger */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon-xs" className="md:hidden">
                  <MenuIcon className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetTitle className="sr-only">Chat history</SheetTitle>
                <div className="flex h-full flex-col">
                  {/* User info */}
                  <div className="border-b p-4 pt-[calc(1rem+var(--safe-area-inset-top))]">
                    <div className="flex items-center gap-3">
                      {userImage ? (
                        <img
                          src={userImage}
                          alt=""
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <ChefHatIcon className="size-5 text-primary" />
                        </div>
                      )}
                      <div className="min-w-0">
                        {userName && (
                          <p className="truncate text-sm font-medium">
                            {userName}
                          </p>
                        )}
                        {userEmail && (
                          <p className="truncate text-xs text-muted-foreground">
                            {userEmail}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Nav links */}
                  <nav className="border-b p-2">
                    {MOBILE_NAV_ITEMS.map((item) => {
                      const isActive = pathname.startsWith(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setSheetOpen(false)}
                          className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                            isActive
                              ? "bg-accent text-accent-foreground font-medium"
                              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                          }`}
                        >
                          <item.icon className="size-4" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </nav>
                  {/* Chat history */}
                  <div className="flex-1 overflow-y-auto">
                    <SidebarContent {...sidebarProps} />
                  </div>
                  {/* Sign out */}
                  <div className="border-t p-2 pb-[calc(0.5rem+var(--safe-area-inset-bottom))]">
                    <button
                      type="button"
                      onClick={() => {
                        setSheetOpen(false);
                        authClient.signOut();
                      }}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
                    >
                      <LogOutIcon className="size-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <ChefHatIcon className="size-5 text-primary" />
            <span className="text-sm font-medium">SousChef</span>
          </div>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger size="sm" className="w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODELS.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Messages */}
        <div className="relative min-h-0 flex-1">
          <div
            ref={scrollContainerCallbackRef}
            className="h-full overflow-y-auto p-4"
          >
            <div className="mx-auto max-w-3xl">
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
                      Ask me for any recipe and I&apos;ll search the web for the
                      best options.
                    </p>
                    <SuggestionChips onSend={handleSuggestionSend} />
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <ChatMessage
                  key={m.id}
                  role={m.role as "user" | "assistant"}
                  content={getMessageText(m)}
                  conversationId={conversationId ?? undefined}
                  userName={userName}
                  userImage={userImage}
                  isStreaming={
                    status === "streaming" &&
                    m.role === "assistant" &&
                    i === messages.length - 1
                  }
                  onSelectRecipeOption={handleSelectRecipeOption}
                  onFindMore={handleFindMore}
                />
              ))}
              {status === "submitted" && (
                <ToolCallIndicator message="Thinking..." />
              )}
              {isLoading && hasActiveToolCall(messages, "search_recipes") && (
                <ToolCallIndicator message="Searching for recipes..." />
              )}
              {isLoading && hasActiveToolCall(messages, "browse_recipes") && (
                <ToolCallIndicator message="Finding recipes..." />
              )}
              {error && (
                <div className="mx-auto my-4 max-w-md rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error.message || "An error occurred. Please try again."}
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
        <div className="border-t p-3 pb-[calc(0.75rem+var(--safe-area-inset-bottom))]">
          <div className="mx-auto max-w-3xl space-y-2">
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
    </div>
  );
}
