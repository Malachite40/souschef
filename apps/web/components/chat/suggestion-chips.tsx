'use client';

import { getContextualSuggestions } from '@/lib/data/suggestion-data';
import { useEffect, useState } from 'react';

interface SuggestionChipsProps {
    onSend: (text: string) => void;
}

export function SuggestionChips({ onSend }: SuggestionChipsProps) {
    const [suggestions, setSuggestions] = useState<
        ReturnType<typeof getContextualSuggestions>
    >([]);

    useEffect(() => {
        setSuggestions(getContextualSuggestions(6));
    }, []);

    return (
        <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
            {suggestions.map((suggestion) => (
                <button
                    type="button"
                    key={suggestion.label}
                    className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-sm transition-colors hover:bg-accent hover:border-accent-foreground/20 active:scale-[0.97]"
                    onClick={() => onSend(suggestion.label)}
                >
                    <span className="text-base leading-none">
                        {suggestion.icon}
                    </span>
                    {suggestion.label}
                </button>
            ))}
        </div>
    );
}
