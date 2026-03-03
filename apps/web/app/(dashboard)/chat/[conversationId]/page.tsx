'use client';

import { ChatPanel } from '@/components/chat/chat-panel';
import { useChatStore } from '@/stores/chat-store';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';

export default function ConversationPage() {
    const params = useParams();
    const setConversationId = useChatStore((s) => s.setConversationId);

    useEffect(() => {
        if (params.conversationId) {
            setConversationId(params.conversationId as string);
        }
    }, [params.conversationId, setConversationId]);

    return <ChatPanel />;
}
