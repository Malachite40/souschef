'use client';

import {
    useRecipesStore,
    type SortBy,
    type TimeFilter,
    type CostFilter,
    type RatingFilter,
} from '@/stores/recipes-store';
import { Button } from '@souschef/ui/components/button';
import { Input } from '@souschef/ui/components/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@souschef/ui/components/select';
import { SearchIcon, XIcon } from 'lucide-react';

export function RecipeToolbar() {
    const {
        sortBy,
        timeFilter,
        costFilter,
        ratingFilter,
        searchQuery,
        setSortBy,
        setTimeFilter,
        setCostFilter,
        setRatingFilter,
        setSearchQuery,
        resetFilters,
    } = useRecipesStore();

    const hasActiveFilters =
        timeFilter !== 'all' ||
        costFilter !== 'all' ||
        ratingFilter !== 'all' ||
        searchQuery !== '';

    return (
        <div className="mb-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px]">
                    <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Search recipes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 h-8"
                    />
                </div>

                <Select
                    value={sortBy}
                    onValueChange={(v) => setSortBy(v as SortBy)}
                >
                    <SelectTrigger size="sm">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="oldest">Oldest</SelectItem>
                        <SelectItem value="alphabetical">A–Z</SelectItem>
                        <SelectItem value="highest-rated">
                            Highest Rated
                        </SelectItem>
                        <SelectItem value="quickest">Quickest</SelectItem>
                        <SelectItem value="cheapest">Cheapest</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Select
                    value={timeFilter}
                    onValueChange={(v) => setTimeFilter(v as TimeFilter)}
                >
                    <SelectTrigger size="sm">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Any Time</SelectItem>
                        <SelectItem value="under-15">Under 15 min</SelectItem>
                        <SelectItem value="under-30">Under 30 min</SelectItem>
                        <SelectItem value="under-60">Under 1 hour</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={costFilter}
                    onValueChange={(v) => setCostFilter(v as CostFilter)}
                >
                    <SelectTrigger size="sm">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Any Cost</SelectItem>
                        <SelectItem value="under-10">Under $10</SelectItem>
                        <SelectItem value="under-20">Under $20</SelectItem>
                        <SelectItem value="under-30">Under $30</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={ratingFilter}
                    onValueChange={(v) =>
                        setRatingFilter(v as RatingFilter)
                    }
                >
                    <SelectTrigger size="sm">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Any Rating</SelectItem>
                        <SelectItem value="rated">Rated</SelectItem>
                        <SelectItem value="unrated">Unrated</SelectItem>
                        <SelectItem value="4-plus">4+ Stars</SelectItem>
                        <SelectItem value="5-only">5 Stars</SelectItem>
                    </SelectContent>
                </Select>

                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-muted-foreground"
                        onClick={resetFilters}
                    >
                        <XIcon className="size-3" />
                        Clear
                    </Button>
                )}
            </div>
        </div>
    );
}
