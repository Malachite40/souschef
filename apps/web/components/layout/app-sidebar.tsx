'use client';

import { useSidebarData } from '@/hooks/use-sidebar-data';
import { Button } from '@souschef/ui/components/button';
import { Skeleton } from '@souschef/ui/components/skeleton';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@souschef/ui/components/tooltip';
import {
    ChefHatIcon,
    MessageSquarePlusIcon,
    StarIcon,
    Trash2Icon,
} from 'lucide-react';
import Link from 'next/link';

export interface SidebarContentProps {
    conversations:
        | Array<{ id: string; title: string | null; model: string | null }>
        | undefined;
    conversationsLoading: boolean;
    conversationId: string | null;
    conversationRecipes: Record<string, string[]> | undefined;
    loadConversation: (id: string) => void;
    deleteConversation: { mutate: (args: { id: string }) => void };
    handleNewConversation: () => void;
    savedRecipes:
        | Array<{ id: string; title: string; rating: number | null }>
        | undefined;
    savedRecipesLoading: boolean;
    activeRecipeId: string | null;
}

export function SidebarContent({
    conversations,
    conversationsLoading,
    conversationId,
    conversationRecipes,
    loadConversation,
    deleteConversation,
    handleNewConversation,
    savedRecipes,
    savedRecipesLoading,
    activeRecipeId,
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
                                ? 'bg-accent text-accent-foreground'
                                : 'hover:bg-accent/50'
                        }`}
                    >
                        <Button
                            variant="ghost"
                            className="h-auto flex-1 justify-start truncate p-0 font-normal"
                            onClick={() => loadConversation(conv.id)}
                        >
                            {conv.title || 'Untitled'}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            className="hidden md:inline-flex shrink-0 text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100 transition-opacity"
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
                                            {
                                                conversationRecipes[conv.id]
                                                    .length
                                            }
                                        </span>
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    <ul className="list-none p-0">
                                        {conversationRecipes[conv.id].map(
                                            (title) => (
                                                <li key={title}>{title}</li>
                                            ),
                                        )}
                                    </ul>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                ))}
            </div>
            <div className="px-3 pt-4">
                <p className="mb-1 px-2 text-xs font-medium text-muted-foreground">
                    Saved Recipes
                </p>
                {savedRecipesLoading && (
                    <div className="space-y-2 p-2">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-3/4" />
                    </div>
                )}
                {!savedRecipesLoading && savedRecipes?.length === 0 && (
                    <p className="px-2 py-1.5 text-xs text-muted-foreground">
                        No saved recipes yet
                    </p>
                )}
                {savedRecipes?.map((recipe) => (
                    <Link
                        key={recipe.id}
                        href={`/recipes/${recipe.id}`}
                        className={`group flex items-center gap-1 rounded px-2 py-1.5 text-xs ${
                            recipe.id === activeRecipeId
                                ? 'bg-accent text-accent-foreground'
                                : 'hover:bg-accent/50'
                        }`}
                    >
                        <span className="flex-1 truncate">{recipe.title}</span>
                        {recipe.rating != null && (
                            <span className="flex shrink-0 items-center gap-0.5 text-muted-foreground">
                                <StarIcon className="size-3 fill-current" />
                                <span className="text-[10px]">
                                    {recipe.rating}
                                </span>
                            </span>
                        )}
                    </Link>
                ))}
                {savedRecipes && savedRecipes.length > 0 && (
                    <Link
                        href="/recipes"
                        className="block px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                    >
                        View all recipes
                    </Link>
                )}
            </div>
        </>
    );
}

export function AppSidebar() {
    const sidebarData = useSidebarData();

    return (
        <div className="hidden w-64 shrink-0 overflow-y-auto border-r bg-muted/30 md:block">
            <SidebarContent {...sidebarData} />
        </div>
    );
}
