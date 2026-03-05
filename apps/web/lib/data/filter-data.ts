export type FilterGroup = 'dietary' | 'time' | 'difficulty';

export interface ChatFilter {
    id: string;
    label: string;
    group: FilterGroup;
    icon: string;
}

export const AVAILABLE_FILTERS: ChatFilter[] = [
    // Dietary
    { id: 'vegetarian', label: 'Vegetarian', group: 'dietary', icon: '🌿' },
    { id: 'vegan', label: 'Vegan', group: 'dietary', icon: '🌱' },
    { id: 'gluten-free', label: 'Gluten-free', group: 'dietary', icon: '🌾' },
    { id: 'dairy-free', label: 'Dairy-free', group: 'dietary', icon: '🥛' },
    { id: 'keto', label: 'Keto', group: 'dietary', icon: '🥑' },

    // Time
    { id: 'under-15', label: 'Under 15 min', group: 'time', icon: '⚡' },
    { id: 'under-30', label: 'Under 30 min', group: 'time', icon: '🕐' },
    { id: 'under-60', label: 'Under 1 hour', group: 'time', icon: '⏱️' },

    // Difficulty
    { id: 'beginner', label: 'Beginner', group: 'difficulty', icon: '👶' },
    {
        id: 'intermediate',
        label: 'Intermediate',
        group: 'difficulty',
        icon: '👨‍🍳',
    },
    { id: 'advanced', label: 'Advanced', group: 'difficulty', icon: '⭐' },
];

export const FILTER_DESCRIPTIONS: Record<string, string> = {
    vegetarian: 'Vegetarian only — no meat or fish.',
    vegan: 'Vegan only — no animal products whatsoever (no meat, fish, dairy, eggs, honey).',
    'gluten-free':
        'Gluten-free — no wheat, barley, rye, or gluten-containing ingredients.',
    'dairy-free':
        'Dairy-free — no milk, cheese, butter, cream, or other dairy products.',
    keto: 'Keto-friendly — very low carb (under 20g net carbs), high fat.',
    'under-15': 'Total time (prep + cook) must be under 15 minutes.',
    'under-30': 'Total time (prep + cook) must be under 30 minutes.',
    'under-60': 'Total time (prep + cook) must be under 1 hour.',
    beginner:
        'Beginner-friendly — simple techniques, common ingredients, minimal equipment.',
    intermediate: 'Intermediate difficulty — some cooking experience expected.',
    advanced:
        'Advanced recipe — complex techniques or specialized equipment welcome.',
};

export const FILTER_GROUP_LABELS: Record<FilterGroup, string> = {
    dietary: 'Dietary',
    time: 'Time',
    difficulty: 'Difficulty',
};
