'use client';

import { useHeaderActionsStore } from '@/stores/header-actions-store';
import { Button } from '@yeschefai/ui/components/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@yeschefai/ui/components/dropdown-menu';
import { MoreVerticalIcon } from 'lucide-react';

export function HeaderActions() {
    const actions = useHeaderActionsStore((s) => s.actions);

    if (actions.length === 0) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-xs">
                    <MoreVerticalIcon className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {actions.map((action) => (
                    <DropdownMenuItem
                        key={action.id}
                        onClick={action.onClick}
                        className={
                            action.variant === 'destructive'
                                ? 'text-destructive focus:text-destructive'
                                : undefined
                        }
                    >
                        {action.icon && <action.icon className="size-4" />}
                        {action.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
