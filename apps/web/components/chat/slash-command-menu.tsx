'use client';

import {
    type SlashCommand,
    filterSlashCommands,
} from '@/lib/data/slash-commands';
import { useEffect, useRef, useState } from 'react';

interface SlashCommandMenuProps {
    query: string; // text after "/" (e.g. "ran" from "/ran")
    onSelect: (command: SlashCommand, subCommand?: string) => void;
    onClose: () => void;
}

export function SlashCommandMenu({
    query,
    onSelect,
    onClose,
}: SlashCommandMenuProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [expandedCommand, setExpandedCommand] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const filtered = filterSlashCommands(query);

    // Reset index when query changes
    useEffect(() => {
        setActiveIndex(0);
        setExpandedCommand(null);
    }, [query]);

    // Keyboard navigation
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (expandedCommand) {
                const cmd = filtered.find((c) => c.name === expandedCommand);
                const subs = cmd?.subCommands ?? [];

                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setActiveIndex((i) => Math.min(i + 1, subs.length - 1));
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setActiveIndex((i) => Math.max(i - 1, 0));
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (cmd && subs[activeIndex]) {
                        onSelect(cmd, subs[activeIndex].label);
                    }
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    setExpandedCommand(null);
                    setActiveIndex(
                        filtered.findIndex((c) => c.name === expandedCommand),
                    );
                }
                return;
            }

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex((i) => Math.max(i - 1, 0));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const cmd = filtered[activeIndex];
                if (cmd) {
                    if (cmd.subCommands && cmd.subCommands.length > 0) {
                        setExpandedCommand(cmd.name);
                        setActiveIndex(0);
                    } else {
                        onSelect(cmd);
                    }
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [filtered, activeIndex, expandedCommand, onSelect, onClose]);

    // Scroll active item into view
    useEffect(() => {
        const menu = menuRef.current;
        if (!menu) return;
        const active = menu.querySelector('[data-active="true"]');
        active?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex]);

    if (filtered.length === 0) {
        return (
            <div
                ref={menuRef}
                className="absolute bottom-full left-0 right-0 mb-1 rounded-lg border bg-popover p-2 shadow-lg"
            >
                <p className="px-2 py-1.5 text-xs text-muted-foreground">
                    No commands found
                </p>
            </div>
        );
    }

    // Show sub-commands for expanded command
    if (expandedCommand) {
        const cmd = filtered.find((c) => c.name === expandedCommand)!;
        const subs = cmd.subCommands ?? [];

        return (
            <div
                ref={menuRef}
                className="absolute bottom-full left-0 right-0 mb-1 max-h-64 overflow-y-auto rounded-lg border bg-popover shadow-lg"
            >
                <div className="border-b px-3 py-1.5">
                    <button
                        type="button"
                        className="text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => {
                            setExpandedCommand(null);
                            setActiveIndex(
                                filtered.findIndex(
                                    (c) => c.name === expandedCommand,
                                ),
                            );
                        }}
                    >
                        &larr; /{cmd.name}
                    </button>
                </div>
                {subs.map((sub, i) => (
                    <button
                        type="button"
                        key={sub.label}
                        data-active={i === activeIndex}
                        className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                            i === activeIndex
                                ? 'bg-accent text-accent-foreground'
                                : 'hover:bg-accent/50'
                        }`}
                        onClick={() => onSelect(cmd, sub.label)}
                        onMouseEnter={() => setActiveIndex(i)}
                    >
                        {sub.label}
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div
            ref={menuRef}
            className="absolute bottom-full left-0 right-0 mb-1 max-h-64 overflow-y-auto rounded-lg border bg-popover shadow-lg"
        >
            {filtered.map((cmd, i) => (
                <button
                    type="button"
                    key={cmd.name}
                    data-active={i === activeIndex}
                    className={`flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                        i === activeIndex
                            ? 'bg-accent text-accent-foreground'
                            : 'hover:bg-accent/50'
                    }`}
                    onClick={() => {
                        if (cmd.subCommands && cmd.subCommands.length > 0) {
                            setExpandedCommand(cmd.name);
                            setActiveIndex(0);
                        } else {
                            onSelect(cmd);
                        }
                    }}
                    onMouseEnter={() => setActiveIndex(i)}
                >
                    <span className="text-base leading-none">{cmd.icon}</span>
                    <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium">/{cmd.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                            {cmd.description}
                        </span>
                    </div>
                    {cmd.subCommands && (
                        <span className="text-xs text-muted-foreground">
                            &rsaquo;
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}
