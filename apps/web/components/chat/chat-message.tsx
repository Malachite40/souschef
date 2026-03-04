"use client";

import { UserAvatar } from "@/components/ui/user-avatar";
import { RecipeCard, type RecipeData } from "@/components/recipe/recipe-card";
import {
  type RecipeOptionData,
  RecipeOptionsGrid,
  RecipeOptionsGridSkeleton,
} from "@/components/recipe/recipe-options-grid";
import { Card, CardContent, CardHeader } from "@yeschefai/ui/components/card";
import { Skeleton } from "@yeschefai/ui/components/skeleton";
import { ChefHatIcon } from "lucide-react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  conversationId?: string;
  userName?: string;
  userImage?: string;
  isStreaming?: boolean;
  onSelectRecipeOption?: (option: RecipeOptionData) => void;
  onFindMore?: () => void;
}

const markdownComponents: Components = {
  p: ({ children }) => <p className="my-1.5 leading-relaxed">{children}</p>,
  h1: ({ children }) => (
    <h1 className="mt-3 mb-1.5 text-base font-bold">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-3 mb-1.5 text-sm font-bold">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-2 mb-1 text-sm font-semibold">{children}</h3>
  ),
  ul: ({ children }) => (
    <ul className="my-1.5 ml-4 list-disc space-y-0.5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-1.5 ml-4 list-decimal space-y-0.5">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  code: ({ children, className }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return <code className="text-xs">{children}</code>;
    }
    return (
      <code className="rounded bg-primary/10 px-1 py-0.5 text-xs">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-2 overflow-x-auto rounded-md bg-muted p-3 text-xs">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-border pl-3 text-muted-foreground">
      {children}
    </blockquote>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      className="underline underline-offset-2 break-all"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-3 border-border" />,
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto">
      <table className="w-full text-xs">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-border px-2 py-1 text-left font-semibold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-border px-2 py-1">{children}</td>
  ),
};

function parseRecipeBlocks(content: string) {
  const parts: Array<
    | { type: "text"; content: string }
    | { type: "recipe"; content: string; data: RecipeData }
    | { type: "recipe-loading" }
    | { type: "recipe-options"; data: RecipeOptionData[] }
    | { type: "recipe-options-loading" }
  > = [];
  const regex = /~~~(recipe-json|recipe-options-json)\n([\s\S]*?)~~~/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: content.slice(lastIndex, match.index),
      });
    }
    const blockType = match[1];
    const jsonStr = match[2].trim();
    try {
      if (blockType === "recipe-options-json") {
        const data = JSON.parse(jsonStr) as RecipeOptionData[];
        parts.push({ type: "recipe-options", data });
      } else {
        const data = JSON.parse(jsonStr) as RecipeData;
        parts.push({ type: "recipe", content: jsonStr, data });
      }
    } catch {
      parts.push({
        type: "text",
        content: match[0],
      });
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    const remainder = content.slice(lastIndex);
    const optionsOpeningIndex = remainder.indexOf("~~~recipe-options-json");
    const recipeOpeningIndex = remainder.indexOf("~~~recipe-json");

    // Find which delimiter appears first (if any)
    let firstOpening = -1;
    let isOptions = false;
    if (
      optionsOpeningIndex !== -1 &&
      (recipeOpeningIndex === -1 || optionsOpeningIndex < recipeOpeningIndex)
    ) {
      firstOpening = optionsOpeningIndex;
      isOptions = true;
    } else if (recipeOpeningIndex !== -1) {
      firstOpening = recipeOpeningIndex;
    }

    if (firstOpening !== -1) {
      if (firstOpening > 0) {
        parts.push({ type: "text", content: remainder.slice(0, firstOpening) });
      }
      parts.push({
        type: isOptions ? "recipe-options-loading" : "recipe-loading",
      });
    } else {
      parts.push({ type: "text", content: remainder });
    }
  }

  return parts;
}

function RecipeCardSkeleton() {
  return (
    <Card className="my-3 w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <ChefHatIcon className="size-5 animate-pulse text-primary" />
          <span className="text-sm font-medium text-muted-foreground">
            Preparing your recipe...
          </span>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-28" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </CardContent>
    </Card>
  );
}

function AssistantAvatar() {
  return (
    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
      <ChefHatIcon className="size-4 text-primary" />
    </div>
  );
}

export function ChatMessage({
  role,
  content,
  conversationId,
  userName,
  userImage,
  isStreaming,
  onSelectRecipeOption,
  onFindMore,
}: ChatMessageProps) {
  const isUser = role === "user";
  const parts = parseRecipeBlocks(content);

  const hasRecipes = parts.some(
    (p) =>
      p.type === "recipe" ||
      p.type === "recipe-loading" ||
      p.type === "recipe-options" ||
      p.type === "recipe-options-loading",
  );
  const textParts = parts.filter((p) => p.type === "text");
  const recipeParts = parts.filter(
    (p) =>
      p.type === "recipe" ||
      p.type === "recipe-loading" ||
      p.type === "recipe-options" ||
      p.type === "recipe-options-loading",
  );

  return (
    <div
      className={`flex items-start gap-2.5 mb-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ${
        isUser ? "flex-row-reverse" : ""
      }`}
    >
      {/* Avatar */}
      {isUser ? (
        <UserAvatar name={userName} image={userImage} size="sm" />
      ) : (
        <AssistantAvatar />
      )}

      {/* Message column */}
      <div
        className={`flex min-w-0 flex-1 flex-col ${isUser ? "items-end" : "items-start"}`}
      >
        {/* Text bubble */}
        {textParts.length > 0 && (
          <div
            className={`max-w-full overflow-hidden wrap-break-word rounded-lg px-3 py-2 text-sm ${
              isUser
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            }`}
          >
            {textParts.map((part, i) =>
              isUser ? (
                <div key={i} className="whitespace-pre-wrap">
                  {part.type === "text" && part.content}
                </div>
              ) : (
                <div key={i}>
                  <ReactMarkdown components={markdownComponents}>
                    {part.type === "text" ? part.content : ""}
                  </ReactMarkdown>
                </div>
              ),
            )}
            {isStreaming && !isUser && (
              <span className="inline-block h-4 w-[2px] translate-y-[3px] bg-current animate-[blink_1s_step-end_infinite]" />
            )}
          </div>
        )}

        {/* Streaming cursor when no text yet */}
        {isStreaming && !isUser && textParts.length === 0 && (
          <div className="rounded-lg bg-muted px-3 py-2 text-sm text-foreground">
            <span className="inline-block h-4 w-[2px] translate-y-[3px] bg-current animate-[blink_1s_step-end_infinite]" />
          </div>
        )}

        {/* Recipe cards / options rendered outside the bubble */}
        {recipeParts.map((part, i) =>
          part.type === "recipe" ? (
            <RecipeCard
              key={`recipe-${i}`}
              recipe={part.data}
              conversationId={conversationId}
            />
          ) : part.type === "recipe-loading" ? (
            <RecipeCardSkeleton key={`recipe-loading-${i}`} />
          ) : part.type === "recipe-options" ? (
            <RecipeOptionsGrid
              key={`recipe-options-${i}`}
              options={part.data}
              onSelect={(option) => onSelectRecipeOption?.(option)}
              onFindMore={onFindMore}
            />
          ) : part.type === "recipe-options-loading" ? (
            <RecipeOptionsGridSkeleton key={`recipe-options-loading-${i}`} />
          ) : null,
        )}
      </div>
    </div>
  );
}
