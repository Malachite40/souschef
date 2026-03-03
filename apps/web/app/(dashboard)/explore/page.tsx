import type { Metadata } from 'next';
import { GlobeContainer } from './_components/globe-container';

export const metadata: Metadata = {
    title: 'Explore World Cuisines | SousChef',
    description:
        'Discover recipes from around the world on an interactive 3D globe.',
};

export default function ExplorePage() {
    return (
        <div className="h-[calc(100vh-3.5rem)]">
            <GlobeContainer />
        </div>
    );
}
