'use client';

import {
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    NativeAwareDrawer,
} from '@/components/native-aware-drawer';
import { Button } from '@yeschefai/ui/components/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@yeschefai/ui/components/dropdown-menu';
import { useIsMobile } from '@yeschefai/ui/hooks/use-mobile';
import { CheckIcon, FolderIcon } from 'lucide-react';
import { useState } from 'react';

export interface FolderOption {
    id: string;
    name: string;
}

interface MoveToFolderMenuProps {
    currentFolderId: string | null;
    folders: FolderOption[];
    onSelect: (folderId: string | null) => void;
    onCreateNew: () => void;
}

export function MoveToFolderMenu({
    currentFolderId,
    folders,
    onSelect,
    onCreateNew,
}: MoveToFolderMenuProps) {
    const isMobile = useIsMobile();
    const [open, setOpen] = useState(false);

    const handleSelect = (folderId: string | null) => {
        onSelect(folderId);
        setOpen(false);
    };

    const handleCreate = () => {
        onCreateNew();
        setOpen(false);
    };

    const triggerClassName =
        'bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background text-muted-foreground hover:text-primary';

    if (isMobile) {
        return (
            <>
                <Button
                    variant="ghost"
                    size="icon-xs"
                    className={triggerClassName}
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setOpen(true);
                    }}
                >
                    <FolderIcon className="size-4" />
                </Button>
                <NativeAwareDrawer open={open} onOpenChange={setOpen}>
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle>Move to folder</DrawerTitle>
                        </DrawerHeader>
                        <div className="flex flex-col px-2 pb-2">
                            <FolderRow
                                label="Uncategorized"
                                active={currentFolderId == null}
                                onClick={() => handleSelect(null)}
                            />
                            {folders.length > 0 && (
                                <div className="my-1 border-t" />
                            )}
                            {folders.map((folder) => (
                                <FolderRow
                                    key={folder.id}
                                    label={folder.name}
                                    active={currentFolderId === folder.id}
                                    onClick={() => handleSelect(folder.id)}
                                />
                            ))}
                            <div className="my-1 border-t" />
                            <FolderRow
                                label="+ New folder"
                                active={false}
                                onClick={handleCreate}
                            />
                        </div>
                    </DrawerContent>
                </NativeAwareDrawer>
            </>
        );
    }

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon-xs"
                    className={triggerClassName}
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                >
                    <FolderIcon className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleSelect(null)}>
                    {currentFolderId == null && (
                        <CheckIcon className="size-3.5" />
                    )}
                    <span className={currentFolderId == null ? '' : 'ml-[1.125rem]'}>
                        Uncategorized
                    </span>
                </DropdownMenuItem>
                {folders.length > 0 && <DropdownMenuSeparator />}
                {folders.map((folder) => (
                    <DropdownMenuItem
                        key={folder.id}
                        onClick={() => handleSelect(folder.id)}
                    >
                        {currentFolderId === folder.id && (
                            <CheckIcon className="size-3.5" />
                        )}
                        <span
                            className={
                                currentFolderId === folder.id
                                    ? ''
                                    : 'ml-[1.125rem]'
                            }
                        >
                            {folder.name}
                        </span>
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleCreate}>
                    <span className="ml-[1.125rem]">+ New folder</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

interface FolderRowProps {
    label: string;
    active: boolean;
    onClick: () => void;
}

function FolderRow({ label, active, onClick }: FolderRowProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex items-center gap-2 rounded-md px-3 py-3 text-left text-base hover:bg-accent active:bg-accent"
        >
            {active ? (
                <CheckIcon className="size-4 text-primary" />
            ) : (
                <span className="size-4" />
            )}
            <span>{label}</span>
        </button>
    );
}
