import { create } from 'zustand';

export type SortBy =
    | 'newest'
    | 'oldest'
    | 'alphabetical'
    | 'highest-rated'
    | 'quickest'
    | 'cheapest';

export type TimeFilter = 'all' | 'under-15' | 'under-30' | 'under-60';
export type CostFilter = 'all' | 'under-10' | 'under-20' | 'under-30';
export type RatingFilter = 'all' | 'rated' | 'unrated' | '4-plus' | '5-only';

export type SelectedFolderId = 'all' | 'uncategorized' | (string & {});

interface RecipesState {
    sortBy: SortBy;
    timeFilter: TimeFilter;
    costFilter: CostFilter;
    ratingFilter: RatingFilter;
    searchQuery: string;
    selectedFolderId: SelectedFolderId;
    setSortBy: (sortBy: SortBy) => void;
    setTimeFilter: (filter: TimeFilter) => void;
    setCostFilter: (filter: CostFilter) => void;
    setRatingFilter: (filter: RatingFilter) => void;
    setSearchQuery: (query: string) => void;
    setSelectedFolderId: (id: SelectedFolderId) => void;
    resetFilters: () => void;
}

export const useRecipesStore = create<RecipesState>((set) => ({
    sortBy: 'newest',
    timeFilter: 'all',
    costFilter: 'all',
    ratingFilter: 'all',
    searchQuery: '',
    selectedFolderId: 'all',
    setSortBy: (sortBy) => set({ sortBy }),
    setTimeFilter: (timeFilter) => set({ timeFilter }),
    setCostFilter: (costFilter) => set({ costFilter }),
    setRatingFilter: (ratingFilter) => set({ ratingFilter }),
    setSearchQuery: (searchQuery) => set({ searchQuery }),
    setSelectedFolderId: (selectedFolderId) => set({ selectedFolderId }),
    resetFilters: () =>
        set({
            sortBy: 'newest',
            timeFilter: 'all',
            costFilter: 'all',
            ratingFilter: 'all',
            searchQuery: '',
            selectedFolderId: 'all',
        }),
}));
