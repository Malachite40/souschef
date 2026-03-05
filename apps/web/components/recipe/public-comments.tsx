'use client';

import { authClient } from '@/lib/auth-client';
import { api } from '@/trpc/react';
import { Button } from '@yeschefai/ui/components/button';
import { Separator } from '@yeschefai/ui/components/separator';
import { TrashIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

function timeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString();
}

export function PublicComments({ recipeId }: { recipeId: string }) {
    const { data: session } = authClient.useSession();
    const [content, setContent] = useState('');
    const utils = api.useUtils();

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
        api.recipes.getComments.useInfiniteQuery(
            { recipeId, limit: 20 },
            {
                getNextPageParam: (lastPage) => lastPage.nextCursor,
            },
        );

    const addComment = api.recipes.addComment.useMutation({
        onSuccess: () => {
            setContent('');
            utils.recipes.getComments.invalidate({ recipeId });
        },
    });

    const deleteComment = api.recipes.deleteComment.useMutation({
        onSuccess: () => {
            utils.recipes.getComments.invalidate({ recipeId });
        },
    });

    const comments = data?.pages.flatMap((p) => p.items) ?? [];

    return (
        <section className="mt-8">
            <Separator className="mb-6" />
            <h2 className="mb-4 text-lg font-semibold">Comments</h2>

            {session?.user ? (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (content.trim()) {
                            addComment.mutate({
                                recipeId,
                                content: content.trim(),
                            });
                        }
                    }}
                    className="mb-6"
                >
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Leave a comment..."
                        maxLength={2000}
                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        rows={3}
                    />
                    <div className="mt-2 flex justify-end">
                        <Button
                            type="submit"
                            size="sm"
                            disabled={!content.trim() || addComment.isPending}
                        >
                            {addComment.isPending
                                ? 'Posting...'
                                : 'Post Comment'}
                        </Button>
                    </div>
                </form>
            ) : (
                <p className="mb-6 text-sm text-muted-foreground">
                    <Link
                        href="/login"
                        className="text-primary hover:underline"
                    >
                        Sign in
                    </Link>{' '}
                    to leave a comment.
                </p>
            )}

            {comments.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    No comments yet. Be the first!
                </p>
            )}

            <div className="space-y-4">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                        {comment.userImage ? (
                            <img
                                src={comment.userImage}
                                alt={comment.userName}
                                className="size-8 shrink-0 rounded-full"
                            />
                        ) : (
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                {comment.userName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                    {comment.userName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {timeAgo(comment.createdAt)}
                                </span>
                                {session?.user?.id === comment.userId && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            deleteComment.mutate({
                                                id: comment.id,
                                            })
                                        }
                                        className="ml-auto text-muted-foreground hover:text-destructive"
                                    >
                                        <TrashIcon className="size-3.5" />
                                    </button>
                                )}
                            </div>
                            <p className="mt-0.5 text-sm">{comment.content}</p>
                        </div>
                    </div>
                ))}
            </div>

            {hasNextPage && (
                <div className="mt-4 flex justify-center">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                    >
                        {isFetchingNextPage ? 'Loading...' : 'Load more'}
                    </Button>
                </div>
            )}
        </section>
    );
}
