'use client';

import {
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    NativeAwareDrawer,
} from '@/components/native-aware-drawer';
import { useRecipesStore } from '@/stores/recipes-store';
import { api } from '@/trpc/react';
import { Button } from '@yeschefai/ui/components/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@yeschefai/ui/components/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@yeschefai/ui/components/dropdown-menu';
import { Input } from '@yeschefai/ui/components/input';
import { useIsMobile } from '@yeschefai/ui/hooks/use-mobile';
import {
    FolderIcon,
    InboxIcon,
    LayersIcon,
    MoreHorizontalIcon,
    PlusIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type EditingState =
    | { mode: 'create' }
    | { mode: 'rename'; id: string; currentName: string }
    | null;

type ConfirmDelete = { id: string; name: string; recipeCount: number } | null;

export function FolderPills() {
    const { selectedFolderId, setSelectedFolderId } = useRecipesStore();
    const utils = api.useUtils();
    const isMobile = useIsMobile();

    const { data: folders = [] } = api.folders.list.useQuery();
    const { data: recipes = [] } = api.recipes.list.useQuery();

    const [editing, setEditing] = useState<EditingState>(null);
    const [name, setName] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<ConfirmDelete>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const update = () => {
            setCanScrollLeft(el.scrollLeft > 1);
            setCanScrollRight(
                el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
            );
        };
        update();
        el.addEventListener('scroll', update, { passive: true });
        const ro = new ResizeObserver(update);
        ro.observe(el);
        for (const child of Array.from(el.children)) ro.observe(child);
        return () => {
            el.removeEventListener('scroll', update);
            ro.disconnect();
        };
    }, [folders.length]);

    useEffect(() => {
        if (editing?.mode === 'create') {
            setName('');
        } else if (editing?.mode === 'rename') {
            setName(editing.currentName);
        }
        setErrorMessage(null);
    }, [editing]);

    const invalidateAll = () => {
        utils.folders.list.invalidate();
        utils.recipes.list.invalidate();
    };

    const createFolder = api.folders.create.useMutation({
        onSuccess: () => {
            invalidateAll();
            setEditing(null);
        },
        onError: (err) => setErrorMessage(err.message),
    });

    const renameFolder = api.folders.rename.useMutation({
        onSuccess: () => {
            invalidateAll();
            setEditing(null);
        },
        onError: (err) => setErrorMessage(err.message),
    });

    const deleteFolder = api.folders.delete.useMutation({
        onSuccess: (_, variables) => {
            invalidateAll();
            if (selectedFolderId === variables.id) {
                setSelectedFolderId('all');
            }
            setConfirmDelete(null);
        },
    });

    const handleSubmit = () => {
        const trimmed = name.trim();
        if (!trimmed) return;
        if (editing?.mode === 'create') {
            createFolder.mutate({ name: trimmed });
        } else if (editing?.mode === 'rename') {
            renameFolder.mutate({ id: editing.id, name: trimmed });
        }
    };

    const totalCount = recipes.length;
    const uncategorizedCount = recipes.filter((r) => !r.folderId).length;

    const dialogTitle =
        editing?.mode === 'create' ? 'New folder' : 'Rename folder';
    const submitLabel =
        editing?.mode === 'create'
            ? createFolder.isPending
                ? 'Creating...'
                : 'Create'
            : renameFolder.isPending
              ? 'Saving...'
              : 'Save';
    const submitDisabled =
        !name.trim() ||
        createFolder.isPending ||
        renameFolder.isPending ||
        (editing?.mode === 'rename' && name.trim() === editing.currentName);

    return (
        <>
            <div className="relative mb-3">
                <div
                    ref={scrollRef}
                    className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                    <div className="flex w-max items-center gap-1.5 pb-1">
                        <PillButton
                            active={selectedFolderId === 'all'}
                            onClick={() => setSelectedFolderId('all')}
                            icon={<LayersIcon className="size-3.5" />}
                            label="All"
                            count={totalCount}
                        />
                        <PillButton
                            active={selectedFolderId === 'uncategorized'}
                            onClick={() => setSelectedFolderId('uncategorized')}
                            icon={<InboxIcon className="size-3.5" />}
                            label="Uncategorized"
                            count={uncategorizedCount}
                        />
                        {folders.map((folder) => (
                            <FolderPill
                                key={folder.id}
                                id={folder.id}
                                name={folder.name}
                                count={folder.recipeCount}
                                active={selectedFolderId === folder.id}
                                onSelect={() =>
                                    setSelectedFolderId(folder.id)
                                }
                                onRename={() =>
                                    setEditing({
                                        mode: 'rename',
                                        id: folder.id,
                                        currentName: folder.name,
                                    })
                                }
                                onDelete={() =>
                                    setConfirmDelete({
                                        id: folder.id,
                                        name: folder.name,
                                        recipeCount: folder.recipeCount,
                                    })
                                }
                            />
                        ))}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 shrink-0 gap-1 text-muted-foreground hover:text-foreground"
                            onClick={() => setEditing({ mode: 'create' })}
                        >
                            <PlusIcon className="size-3.5" />
                            New folder
                        </Button>
                    </div>
                </div>
                <div
                    aria-hidden
                    className={`pointer-events-none absolute left-0 top-0 bottom-1 w-6 bg-gradient-to-r from-background to-transparent transition-opacity ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`}
                />
                <div
                    aria-hidden
                    className={`pointer-events-none absolute right-0 top-0 bottom-1 w-6 bg-gradient-to-l from-background to-transparent transition-opacity ${canScrollRight ? 'opacity-100' : 'opacity-0'}`}
                />
            </div>

            <FolderEditSurface
                isMobile={isMobile}
                open={editing !== null}
                onOpenChange={(open) => {
                    if (!open) setEditing(null);
                }}
                title={dialogTitle}
                name={name}
                errorMessage={errorMessage}
                submitDisabled={submitDisabled}
                submitLabel={submitLabel}
                onNameChange={(value) => {
                    setName(value);
                    if (errorMessage) setErrorMessage(null);
                }}
                onSubmit={handleSubmit}
                onCancel={() => setEditing(null)}
            />

            <FolderDeleteSurface
                isMobile={isMobile}
                confirmDelete={confirmDelete}
                onCancel={() => setConfirmDelete(null)}
                isPending={deleteFolder.isPending}
                onConfirm={() => {
                    if (confirmDelete) {
                        deleteFolder.mutate({ id: confirmDelete.id });
                    }
                }}
            />
        </>
    );
}

interface PillButtonProps {
    active: boolean;
    onClick: () => void;
    icon?: React.ReactNode;
    label: string;
    count: number;
}

function PillButton({ active, onClick, icon, label, count }: PillButtonProps) {
    return (
        <Button
            variant={active ? 'default' : 'outline'}
            size="sm"
            onClick={onClick}
            className="h-8 shrink-0 gap-1.5 rounded-full"
        >
            {icon}
            {label}
            <span
                className={`ml-0.5 text-xs ${active ? 'opacity-80' : 'text-muted-foreground'}`}
            >
                {count}
            </span>
        </Button>
    );
}

interface FolderPillProps {
    id: string;
    name: string;
    count: number;
    active: boolean;
    onSelect: () => void;
    onRename: () => void;
    onDelete: () => void;
}

function FolderPill({
    name,
    count,
    active,
    onSelect,
    onRename,
    onDelete,
}: FolderPillProps) {
    const isMobile = useIsMobile();
    const [menuOpen, setMenuOpen] = useState(false);

    const triggerButton = (
        <Button
            variant="ghost"
            size="icon-xs"
            className={`mr-1 size-6 rounded-full ${active ? 'hover:bg-primary/80 text-primary-foreground' : 'text-muted-foreground'}`}
            onClick={
                isMobile
                    ? (e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setMenuOpen(true);
                      }
                    : undefined
            }
        >
            <MoreHorizontalIcon className="size-3.5" />
        </Button>
    );

    return (
        <div
            className={`group flex h-8 shrink-0 items-center rounded-full border ${
                active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-input bg-background hover:bg-accent'
            }`}
        >
            <button
                type="button"
                onClick={onSelect}
                className="flex h-full items-center gap-1.5 pl-3 pr-1 text-sm font-medium"
            >
                <FolderIcon className="size-3.5" />
                {name}
                <span
                    className={`text-xs ${active ? 'opacity-80' : 'text-muted-foreground'}`}
                >
                    {count}
                </span>
            </button>
            {isMobile ? (
                <>
                    {triggerButton}
                    <NativeAwareDrawer
                        open={menuOpen}
                        onOpenChange={setMenuOpen}
                    >
                        <DrawerContent>
                            <DrawerHeader>
                                <DrawerTitle>{name}</DrawerTitle>
                            </DrawerHeader>
                            <div className="flex flex-col px-2 pb-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        onRename();
                                    }}
                                    className="rounded-md px-3 py-3 text-left text-base hover:bg-accent active:bg-accent"
                                >
                                    Rename
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        onDelete();
                                    }}
                                    className="rounded-md px-3 py-3 text-left text-base text-destructive hover:bg-accent active:bg-accent"
                                >
                                    Delete
                                </button>
                            </div>
                        </DrawerContent>
                    </NativeAwareDrawer>
                </>
            ) : (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        {triggerButton}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onRename}>
                            Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={onDelete}
                            className="text-destructive focus:text-destructive"
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );
}

interface FolderEditSurfaceProps {
    isMobile: boolean;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    name: string;
    errorMessage: string | null;
    submitDisabled: boolean;
    submitLabel: string;
    onNameChange: (value: string) => void;
    onSubmit: () => void;
    onCancel: () => void;
}

function FolderEditSurface({
    isMobile,
    open,
    onOpenChange,
    title,
    name,
    errorMessage,
    submitDisabled,
    submitLabel,
    onNameChange,
    onSubmit,
    onCancel,
}: FolderEditSurfaceProps) {
    const formBody = (
        <div className="space-y-2 py-2">
            <Input
                autoFocus={!isMobile}
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !submitDisabled) {
                        e.preventDefault();
                        onSubmit();
                    }
                }}
                placeholder="e.g. Weeknight dinners"
                maxLength={40}
            />
            {errorMessage && (
                <p className="text-sm text-destructive">{errorMessage}</p>
            )}
        </div>
    );

    if (isMobile) {
        return (
            <NativeAwareDrawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>{title}</DrawerTitle>
                    </DrawerHeader>
                    <div className="px-4">{formBody}</div>
                    <DrawerFooter>
                        <Button disabled={submitDisabled} onClick={onSubmit}>
                            {submitLabel}
                        </Button>
                        <Button variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </NativeAwareDrawer>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                {formBody}
                <DialogFooter>
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button disabled={submitDisabled} onClick={onSubmit}>
                        {submitLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface FolderDeleteSurfaceProps {
    isMobile: boolean;
    confirmDelete: { id: string; name: string; recipeCount: number } | null;
    onCancel: () => void;
    isPending: boolean;
    onConfirm: () => void;
}

function FolderDeleteSurface({
    isMobile,
    confirmDelete,
    onCancel,
    isPending,
    onConfirm,
}: FolderDeleteSurfaceProps) {
    const open = confirmDelete !== null;
    const title = `Delete "${confirmDelete?.name ?? ''}"?`;
    const description =
        confirmDelete && confirmDelete.recipeCount > 0
            ? `${confirmDelete.recipeCount} recipe${confirmDelete.recipeCount === 1 ? '' : 's'} will be moved to Uncategorized.`
            : 'This folder is empty.';
    const confirmLabel = isPending ? 'Deleting...' : 'Delete';

    if (isMobile) {
        return (
            <NativeAwareDrawer
                open={open}
                onOpenChange={(o) => {
                    if (!o) onCancel();
                }}
            >
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>{title}</DrawerTitle>
                        <DrawerDescription>{description}</DrawerDescription>
                    </DrawerHeader>
                    <DrawerFooter>
                        <Button
                            variant="destructive"
                            disabled={isPending}
                            onClick={onConfirm}
                        >
                            {confirmLabel}
                        </Button>
                        <Button variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </NativeAwareDrawer>
        );
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(o) => {
                if (!o) onCancel();
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        disabled={isPending}
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
