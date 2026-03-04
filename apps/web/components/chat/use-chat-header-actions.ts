import { useHeaderActionsStore } from "@/stores/header-actions-store";
import { useChatStore } from "@/stores/chat-store";
import { api } from "@/trpc/react";
import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

export function useChatHeaderActions() {
  const conversationId = useChatStore((s) => s.conversationId);
  const setConversationId = useChatStore((s) => s.setConversationId);
  const setActions = useHeaderActionsStore((s) => s.setActions);
  const clearActions = useHeaderActionsStore((s) => s.clearActions);
  const utils = api.useUtils();
  const router = useRouter();

  const deleteConversation = api.chat.deleteConversation.useMutation({
    onSuccess: () => {
      utils.chat.listConversations.invalidate();
      utils.chat.listConversationRecipes.invalidate();
      setConversationId(null);
      router.push("/chat");
    },
  });

  const handleDelete = useCallback(() => {
    const id = useChatStore.getState().conversationId;
    if (id) {
      deleteConversation.mutate({ id });
    }
  }, [deleteConversation.mutate]);

  useEffect(() => {
    if (conversationId) {
      setActions([
        {
          id: "delete-chat",
          label: "Delete chat",
          icon: Trash2Icon,
          variant: "destructive",
          onClick: handleDelete,
        },
      ]);
    } else {
      clearActions();
    }

    return () => {
      clearActions();
    };
  }, [conversationId, setActions, clearActions, handleDelete]);
}
