import { SavedRecipesList } from '@/components/recipe/saved-recipes-list';

export default function RecipesPage() {
    return (
        <div className="p-4 md:p-6">
            <h1 className="mb-4 text-xl font-bold">My Recipes</h1>
            <SavedRecipesList />
        </div>
    );
}
