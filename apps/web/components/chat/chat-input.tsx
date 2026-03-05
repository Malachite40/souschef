'use client';

import { SlashCommandMenu } from '@/components/chat/slash-command-menu';
import { UrlPill } from '@/components/chat/url-pill';
import {
    AVAILABLE_FILTERS,
    FILTER_GROUP_LABELS,
    type FilterGroup,
} from '@/lib/data/filter-data';
import type { SlashCommand } from '@/lib/data/slash-commands';
import { useChatStore } from '@/stores/chat-store';
import { Button } from '@yeschefai/ui/components/button';
import { FilterIcon, SendIcon, XIcon } from 'lucide-react';
import {
    type ClipboardEvent,
    type KeyboardEvent,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';

const URL_REGEX = /https?:\/\/[^\s]+/;
const MAX_CHARS = 2000;
const FILTER_GROUPS: FilterGroup[] = ['dietary', 'time', 'difficulty'];

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSend: (overrideText?: string) => void;
    disabled?: boolean;
    textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export function ChatInput({
    value,
    onChange,
    onSend,
    disabled,
    textareaRef: externalRef,
}: ChatInputProps) {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef = externalRef ?? internalRef;
    const [showSlashMenu, setShowSlashMenu] = useState(false);
    const [slashQuery, setSlashQuery] = useState('');
    const [detectedUrl, setDetectedUrl] = useState<string | null>(null);

    const {
        activeFilters,
        filtersExpanded,
        toggleFilter,
        clearFilters,
        setFiltersExpanded,
    } = useChatStore();

    // Detect slash command trigger
    useEffect(() => {
        if (value.startsWith('/')) {
            setShowSlashMenu(true);
            setSlashQuery(value.slice(1).split(' ')[0]);
        } else {
            setShowSlashMenu(false);
            setSlashQuery('');
        }
    }, [value]);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLTextAreaElement>) => {
            // Don't handle Enter when slash menu is open (it handles its own)
            if (showSlashMenu) return;

            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSend();
            }
        },
        [showSlashMenu, onSend],
    );

    const handlePaste = useCallback(
        (e: ClipboardEvent<HTMLTextAreaElement>) => {
            const text = e.clipboardData.getData('text');
            const match = text.match(URL_REGEX);
            if (match) {
                setDetectedUrl(match[0]);
            }
        },
        [],
    );

    const handleSlashSelect = useCallback(
        (command: SlashCommand, subCommand?: string) => {
            setShowSlashMenu(false);

            if (subCommand && command.subCommands) {
                const sub = command.subCommands.find(
                    (s) => s.label === subCommand,
                );
                if (sub) {
                    if (command.action === 'send') {
                        onChange('');
                        onSend(sub.template);
                    } else {
                        onChange(sub.template);
                        textareaRef.current?.focus();
                    }
                    return;
                }
            }

            if (command.action === 'send') {
                onChange('');
                onSend(command.template);
            } else {
                // Fill — put template in input, place cursor at {input} position
                const template = command.template;
                const placeholderIndex = template.indexOf('{input}');
                if (placeholderIndex !== -1) {
                    const filled = template.replace('{input}', '');
                    onChange(filled);
                    // Focus and place cursor at placeholder position
                    setTimeout(() => {
                        const el = textareaRef.current;
                        if (el) {
                            el.focus();
                            el.setSelectionRange(
                                placeholderIndex,
                                placeholderIndex,
                            );
                        }
                    }, 0);
                } else {
                    onChange(template);
                    textareaRef.current?.focus();
                }
            }
        },
        [onChange, onSend, textareaRef],
    );

    const handleUrlImport = useCallback(
        (url: string) => {
            setDetectedUrl(null);
            onSend(`Import this recipe: ${url}`);
        },
        [onSend],
    );

    const charCount = value.length;
    const isOverLimit = charCount > MAX_CHARS;

    return (
        <div className="space-y-2">
            {/* URL pill */}
            {detectedUrl && (
                <UrlPill
                    url={detectedUrl}
                    onImport={handleUrlImport}
                    onDismiss={() => setDetectedUrl(null)}
                />
            )}

            {/* Input container */}
            <div className="relative">
                {/* Slash command menu */}
                {showSlashMenu && (
                    <SlashCommandMenu
                        query={slashQuery}
                        onSelect={handleSlashSelect}
                        onClose={() => {
                            setShowSlashMenu(false);
                            onChange('');
                        }}
                    />
                )}

                <div className="flex flex-col rounded-2xl border bg-card shadow-sm transition-[border-color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
                    {/* Textarea area */}
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        placeholder='Ask me for a recipe... (try "/" for commands)'
                        rows={1}
                        className="field-sizing-content flex-1 resize-none bg-transparent px-3 pt-3 pb-2 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none"
                    />

                    {/* Expanded filter groups */}
                    {filtersExpanded && (
                        <div className="space-y-2 border-t px-3 py-2">
                            {FILTER_GROUPS.map((group) => (
                                <div key={group}>
                                    <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                                        {FILTER_GROUP_LABELS[group]}
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {AVAILABLE_FILTERS.filter(
                                            (f) => f.group === group,
                                        ).map((filter) => {
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
                                                    onClick={() =>
                                                        toggleFilter(filter)
                                                    }
                                                >
                                                    <span className="text-xs leading-none">
                                                        {filter.icon}
                                                    </span>
                                                    {filter.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Addon bar */}
                    <div className="flex items-center justify-between border-t px-3 py-1.5">
                        {/* Left: slash command trigger + filters */}
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                className="rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                onClick={() => {
                                    onChange('/');
                                    textareaRef.current?.focus();
                                }}
                            >
                                <kbd className="font-mono text-[11px]">/</kbd>
                            </button>
                            <button
                                type="button"
                                className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs transition-colors ${
                                    filtersExpanded
                                        ? 'bg-muted text-foreground'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                                onClick={() =>
                                    setFiltersExpanded(!filtersExpanded)
                                }
                            >
                                <FilterIcon className="size-3" />
                                Filters
                                {activeFilters.length > 0 && (
                                    <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                                        {activeFilters.length}
                                    </span>
                                )}
                            </button>
                            {activeFilters.length > 0 && (
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-0.5 rounded-md px-1 py-0.5 text-[11px] text-muted-foreground transition-colors hover:text-destructive"
                                    onClick={clearFilters}
                                >
                                    <XIcon className="size-3" />
                                </button>
                            )}
                        </div>

                        {/* Right: char count + send */}
                        <div className="flex items-center gap-2">
                            {charCount > 0 && (
                                <span
                                    className={`text-[11px] ${
                                        isOverLimit
                                            ? 'text-destructive font-medium'
                                            : 'text-muted-foreground'
                                    }`}
                                >
                                    {charCount}/{MAX_CHARS}
                                </span>
                            )}
                            <Button
                                type="button"
                                size="icon"
                                className="size-7 shrink-0 rounded-lg"
                                disabled={
                                    !value.trim() || disabled || isOverLimit
                                }
                                onClick={() => onSend()}
                            >
                                <SendIcon className="size-3.5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
