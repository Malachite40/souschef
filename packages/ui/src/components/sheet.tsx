'use client';

import { XIcon } from 'lucide-react';
import { Dialog, VisuallyHidden } from 'radix-ui';
import type * as React from 'react';

import { cn } from '@souschef/ui/lib/utils';

function Sheet({
    ...props
}: React.ComponentProps<typeof Dialog.Root>) {
    return <Dialog.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({
    ...props
}: React.ComponentProps<typeof Dialog.Trigger>) {
    return <Dialog.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({
    ...props
}: React.ComponentProps<typeof Dialog.Close>) {
    return <Dialog.Close data-slot="sheet-close" {...props} />;
}

function SheetContent({
    className,
    children,
    side = 'right',
    ...props
}: React.ComponentProps<typeof Dialog.Content> & {
    side?: 'left' | 'right';
}) {
    return (
        <Dialog.Portal>
            <Dialog.Overlay
                data-slot="sheet-overlay"
                className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80"
            />
            <Dialog.Content
                data-slot="sheet-content"
                className={cn(
                    'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed inset-y-0 z-50 h-full w-3/4 max-w-sm p-6 shadow-lg duration-300',
                    side === 'right' &&
                        'right-0 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
                    side === 'left' &&
                        'left-0 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
                    className,
                )}
                {...props}
            >
                {children}
                <Dialog.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none">
                    <XIcon className="size-4" />
                    <span className="sr-only">Close</span>
                </Dialog.Close>
                <VisuallyHidden.Root>
                    <Dialog.Description>Navigation menu</Dialog.Description>
                </VisuallyHidden.Root>
            </Dialog.Content>
        </Dialog.Portal>
    );
}

function SheetHeader({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="sheet-header"
            className={cn('flex flex-col gap-1.5', className)}
            {...props}
        />
    );
}

function SheetTitle({
    className,
    ...props
}: React.ComponentProps<typeof Dialog.Title>) {
    return (
        <Dialog.Title
            data-slot="sheet-title"
            className={cn('text-foreground text-lg font-semibold', className)}
            {...props}
        />
    );
}

function SheetDescription({
    className,
    ...props
}: React.ComponentProps<typeof Dialog.Description>) {
    return (
        <Dialog.Description
            data-slot="sheet-description"
            className={cn('text-muted-foreground text-sm', className)}
            {...props}
        />
    );
}

export {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
};
