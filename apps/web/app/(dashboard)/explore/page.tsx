import type { Metadata } from 'next';
import { GlobeContainer } from './_components/globe-container';

export const metadata: Metadata = {
    title: 'Explore World Cuisines | YesChef AI',
    description:
        'Discover recipes from around the world on an interactive 3D globe.',
};

export default function ExplorePage() {
    return (
        <div className="flex h-full flex-col pb-[var(--safe-area-inset-bottom)]">
            <div className="min-h-0 flex-1">
                <GlobeContainer />
            </div>
        </div>
    );
}
