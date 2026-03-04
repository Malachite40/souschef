'use client';

import { useChatStore } from '@/stores/chat-store';
import { api } from '@/trpc/react';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useSidebarData(options?: { onNavigate?: () => void }) {
    const { conversationId, setConversationId, setModel } = useChatStore();
    const utils = api.useUtils();
    const router = useRouter();
    const pathname = usePathname();

    const { data: conversations, isLoading: conversationsLoading } =
        api.chat.listConversations.useQuery();
    const { data: conversationRecipes } =
        api.chat.listConversationRecipes.useQuery();
    const { data: savedRecipes, isLoading: savedRecipesLoading } =
        api.recipes.list.useQuery();

    const activeRecipeId = pathname.startsWith('/recipes/')
        ? (pathname.split('/')[2] ?? null)
        : null;

    const deleteConversation = api.chat.deleteConversation.useMutation({
        onSuccess: () => {
            utils.chat.listConversations.invalidate();
            utils.chat.listConversationRecipes.invalidate();
            if (conversationId) {
                setConversationId(null);
            }
        },
    });

    const loadConversation = useCallback(
        (id: string) => {
            setConversationId(id);
            const conv = conversations?.find((c) => c.id === id);
            if (conv?.model) {
                setModel(conv.model);
            }
            options?.onNavigate?.();
            router.push('/chat');
        },
        [
            setConversationId,
            setModel,
            conversations,
            router,
            options?.onNavigate,
        ],
    );

    const handleNewConversation = useCallback(() => {
        setConversationId(null);
        options?.onNavigate?.();
        router.push('/chat');
    }, [setConversationId, router, options?.onNavigate]);

    return {
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
    };
}
