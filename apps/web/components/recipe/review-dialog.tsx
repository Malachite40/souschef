'use client';

import {
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    NativeAwareDrawer,
} from '@/components/native-aware-drawer';
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
import { StarRating } from '@yeschefai/ui/components/star-rating';
import { Textarea } from '@yeschefai/ui/components/textarea';
import { useIsMobile } from '@yeschefai/ui/hooks/use-mobile';
import { useEffect, useState } from 'react';

interface ReviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    recipeId: string;
    recipeTitle: string;
    initialRating?: number | null;
    initialNotes?: string | null;
}

export function ReviewDialog({
    open,
    onOpenChange,
    recipeId,
    recipeTitle,
    initialRating,
    initialNotes,
}: ReviewDialogProps) {
    const isMobile = useIsMobile();
    const [rating, setRating] = useState(initialRating ?? 0);
    const [notes, setNotes] = useState(initialNotes ?? '');
    const utils = api.useUtils();

    useEffect(() => {
        if (open) {
            setRating(initialRating ?? 0);
            setNotes(initialNotes ?? '');
        }
    }, [open, initialRating, initialNotes]);

    const review = api.recipes.review.useMutation({
        onSuccess: () => {
            utils.recipes.list.invalidate();
            utils.recipes.getById.invalidate({ id: recipeId });
            onOpenChange(false);
        },
    });

    const title = initialRating ? 'Edit Review' : 'Rate & Review';

    const formBody = (
        <div className="space-y-4 py-2">
            <div className="space-y-2">
                <label className="text-sm font-medium">Rating</label>
                <StarRating value={rating} onChange={setRating} size="md" />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">
                    Notes{' '}
                    <span className="font-normal text-muted-foreground">
                        (optional)
                    </span>
                </label>
                <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="How did it turn out? Any tweaks you'd make?"
                    maxLength={2000}
                    rows={3}
                />
                <p className="text-xs text-muted-foreground text-right">
                    {notes.length}/2000
                </p>
            </div>
        </div>
    );

    const handleSave = () =>
        review.mutate({
            id: recipeId,
            rating,
            notes: notes.trim() || undefined,
        });

    if (isMobile) {
        return (
            <NativeAwareDrawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>{title}</DrawerTitle>
                        <DrawerDescription className="truncate">
                            {recipeTitle}
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="px-4">{formBody}</div>

                    <DrawerFooter>
                        <Button
                            disabled={rating === 0 || review.isPending}
                            onClick={handleSave}
                        >
                            {review.isPending ? 'Saving...' : 'Save Review'}
                        </Button>
                        <DrawerClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DrawerClose>
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
                    <DialogDescription className="truncate">
                        {recipeTitle}
                    </DialogDescription>
                </DialogHeader>

                {formBody}

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={rating === 0 || review.isPending}
                        onClick={handleSave}
                    >
                        {review.isPending ? 'Saving...' : 'Save Review'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
