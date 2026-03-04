'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@yeschefai/ui/components/select';
import { UsersIcon } from 'lucide-react';

const SERVING_OPTIONS = [2, 4, 6, 8];

interface ServingSelectorProps {
    originalServings: number;
    selectedServings: number;
    onServingsChange: (n: number) => void;
}

export function ServingSelector({
    originalServings,
    selectedServings,
    onServingsChange,
}: ServingSelectorProps) {
    // Build options list, ensuring the original value is always included
    const options = SERVING_OPTIONS.includes(originalServings)
        ? SERVING_OPTIONS
        : [...SERVING_OPTIONS, originalServings].sort((a, b) => a - b);

    return (
        <Select
            value={String(selectedServings)}
            onValueChange={(v) => onServingsChange(Number(v))}
        >
            <SelectTrigger
                size="sm"
                className="h-[22px] gap-1 rounded-full border-none bg-secondary px-2 text-xs font-medium text-secondary-foreground shadow-none"
            >
                <UsersIcon className="size-3" />
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {options.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                        {n} servings
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
