'use client';

import { Button } from '@yeschefai/ui/components/button';
import { CheckIcon, CopyIcon, ExternalLinkIcon, ShoppingCartIcon } from 'lucide-react';
import { useCallback, useState } from 'react';

interface Ingredient {
    item: string;
    quantity: string;
    unit: string;
    amazonQuery: string;
}

function buildAmazonFreshUrl(query: string): string {
    return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&i=amazonfresh`;
}

export function AmazonFreshLink({ ingredient }: { ingredient: Ingredient }) {
    const url = buildAmazonFreshUrl(ingredient.amazonQuery);
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            title={`Search Amazon Fresh for ${ingredient.item}`}
        >
            <ShoppingCartIcon className="size-3" />
            <span className="hidden sm:inline">Amazon Fresh</span>
        </a>
    );
}

export function OpenAllAmazonFreshButton({
    ingredients,
}: {
    ingredients: Ingredient[];
}) {
    const handleOpenAll = useCallback(() => {
        for (const ingredient of ingredients) {
            window.open(buildAmazonFreshUrl(ingredient.amazonQuery), '_blank');
        }
    }, [ingredients]);

    return (
        <Button
            size="sm"
            variant="outline"
            onClick={handleOpenAll}
            className="gap-1.5"
        >
            <ExternalLinkIcon className="size-3.5" />
            Open All in Amazon Fresh
        </Button>
    );
}

export function CopyShoppingListButton({
    ingredients,
}: {
    ingredients: Ingredient[];
}) {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(() => {
        const list = ingredients
            .map((i) => `${i.quantity} ${i.unit} ${i.item}`.trim())
            .join('\n');
        navigator.clipboard.writeText(list);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [ingredients]);

    return (
        <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="gap-1.5"
        >
            {copied ? (
                <CheckIcon className="size-3.5" />
            ) : (
                <CopyIcon className="size-3.5" />
            )}
            {copied ? 'Copied!' : 'Copy Shopping List'}
        </Button>
    );
}
