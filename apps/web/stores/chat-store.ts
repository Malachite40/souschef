import type { ChatFilter } from '@/lib/data/filter-data';
import { create } from 'zustand';

interface ChatState {
    conversationId: string | null;
    model: string;
    activeFilters: ChatFilter[];
    filtersExpanded: boolean;
    setConversationId: (id: string | null) => void;
    setModel: (model: string) => void;
    toggleFilter: (filter: ChatFilter) => void;
    clearFilters: () => void;
    setFiltersExpanded: (expanded: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    conversationId: null,
    model: 'qwen/qwen3.5-plus-02-15',
    activeFilters: [],
    filtersExpanded: false,
    setConversationId: (id) => set({ conversationId: id }),
    setModel: (model) => set({ model }),
    toggleFilter: (filter) =>
        set((state) => {
            const exists = state.activeFilters.some((f) => f.id === filter.id);
            return {
                activeFilters: exists
                    ? state.activeFilters.filter((f) => f.id !== filter.id)
                    : [...state.activeFilters, filter],
            };
        }),
    clearFilters: () => set({ activeFilters: [] }),
    setFiltersExpanded: (expanded) => set({ filtersExpanded: expanded }),
}));
