import { SavedRecipesList } from '@/components/recipe/saved-recipes-list';

export default function RecipesPage() {
    return (
        <div className="h-full overflow-auto p-4 pb-[calc(1rem+var(--safe-area-inset-bottom))] md:p-6 md:pb-[calc(1.5rem+var(--safe-area-inset-bottom))]">
            <h1 className="mb-4 text-xl font-bold">My Recipes</h1>
            <SavedRecipesList />
        </div>
    );
}
