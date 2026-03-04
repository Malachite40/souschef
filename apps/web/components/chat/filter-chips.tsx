'use client';

import { useChatStore } from '@/stores/chat-store';
import {
    AVAILABLE_FILTERS,
    FILTER_GROUP_LABELS,
    type FilterGroup,
} from '@/lib/data/filter-data';
import { Button } from '@yeschefai/ui/components/button';
import { FilterIcon, XIcon } from 'lucide-react';

const GROUPS: FilterGroup[] = ['dietary', 'time', 'difficulty'];

export function FilterChips() {
    const { activeFilters, filtersExpanded, toggleFilter, clearFilters, setFiltersExpanded } =
        useChatStore();

    return (
        <div className="space-y-2">
            {/* Toggle row */}
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs text-muted-foreground"
                    onClick={() => setFiltersExpanded(!filtersExpanded)}
                >
                    <FilterIcon className="size-3.5" />
                    Filters
                    {activeFilters.length > 0 && (
                        <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                            {activeFilters.length}
                        </span>
                    )}
                </Button>
                {activeFilters.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs text-muted-foreground hover:text-destructive"
                        onClick={clearFilters}
                    >
                        <XIcon className="size-3" />
                        Clear all
                    </Button>
                )}
            </div>

            {/* Expanded filter groups */}
            {filtersExpanded && (
                <div className="animate-in fade-in-0 slide-in-from-top-1 duration-200 space-y-2 rounded-lg border bg-card/50 p-3">
                    {GROUPS.map((group) => (
                        <div key={group}>
                            <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                                {FILTER_GROUP_LABELS[group]}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {AVAILABLE_FILTERS.filter((f) => f.group === group).map(
                                    (filter) => {
                                        const isActive = activeFilters.some(
                                            (f) => f.id === filter.id,
                                        );
                                        return (
                                            <button
                                                type="button"
                                                key={filter.id}
                                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition-colors ${
                                                    isActive
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'border bg-background hover:bg-accent'
                                                }`}
                                                onClick={() => toggleFilter(filter)}
                                            >
                                                <span className="text-xs leading-none">
                                                    {filter.icon}
                                                </span>
                                                {filter.label}
                                            </button>
                                        );
                                    },
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
