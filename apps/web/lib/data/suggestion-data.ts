type TimeOfDay = 'morning' | 'afternoon' | 'evening';

type SuggestionCategory =
    | 'quick'
    | 'comfort'
    | 'healthy'
    | 'dessert'
    | 'world'
    | 'classic';

interface Suggestion {
    label: string;
    icon: string;
    category: SuggestionCategory;
    timeOfDay: TimeOfDay[];
}

const SUGGESTION_POOL: Suggestion[] = [
    // Quick meals
    {
        label: '15-minute stir fry',
        icon: '🥘',
        category: 'quick',
        timeOfDay: ['afternoon', 'evening'],
    },
    {
        label: 'Easy quesadillas',
        icon: '🫔',
        category: 'quick',
        timeOfDay: ['afternoon', 'evening'],
    },
    {
        label: 'One-pot pasta',
        icon: '🍝',
        category: 'quick',
        timeOfDay: ['afternoon', 'evening'],
    },
    {
        label: 'Quick fried rice',
        icon: '🍚',
        category: 'quick',
        timeOfDay: ['afternoon', 'evening'],
    },
    {
        label: 'Sheet pan chicken',
        icon: '🍗',
        category: 'quick',
        timeOfDay: ['evening'],
    },

    // Comfort food
    {
        label: 'Homemade ramen',
        icon: '🍜',
        category: 'comfort',
        timeOfDay: ['afternoon', 'evening'],
    },
    {
        label: 'Mac and cheese',
        icon: '🧀',
        category: 'comfort',
        timeOfDay: ['afternoon', 'evening'],
    },
    {
        label: 'Beef stew',
        icon: '🥩',
        category: 'comfort',
        timeOfDay: ['evening'],
    },
    {
        label: 'Chicken pot pie',
        icon: '🥧',
        category: 'comfort',
        timeOfDay: ['evening'],
    },
    {
        label: 'Grilled cheese & tomato soup',
        icon: '🍅',
        category: 'comfort',
        timeOfDay: ['afternoon'],
    },

    // Healthy
    {
        label: 'Quinoa buddha bowl',
        icon: '🥗',
        category: 'healthy',
        timeOfDay: ['afternoon', 'evening'],
    },
    {
        label: 'Salmon with veggies',
        icon: '🐟',
        category: 'healthy',
        timeOfDay: ['evening'],
    },
    {
        label: 'Greek salad wrap',
        icon: '🥙',
        category: 'healthy',
        timeOfDay: ['afternoon'],
    },
    {
        label: 'Smoothie bowl',
        icon: '🫐',
        category: 'healthy',
        timeOfDay: ['morning'],
    },
    {
        label: 'Zucchini noodles',
        icon: '🥒',
        category: 'healthy',
        timeOfDay: ['afternoon', 'evening'],
    },

    // Desserts
    {
        label: 'Chocolate lava cake',
        icon: '🍫',
        category: 'dessert',
        timeOfDay: ['afternoon', 'evening'],
    },
    {
        label: 'Banana bread',
        icon: '🍌',
        category: 'dessert',
        timeOfDay: ['morning', 'afternoon'],
    },
    {
        label: 'Crème brûlée',
        icon: '🍮',
        category: 'dessert',
        timeOfDay: ['evening'],
    },
    {
        label: 'Apple pie',
        icon: '🥧',
        category: 'dessert',
        timeOfDay: ['afternoon', 'evening'],
    },
    {
        label: 'Pancakes from scratch',
        icon: '🥞',
        category: 'dessert',
        timeOfDay: ['morning'],
    },

    // World cuisine
    {
        label: 'Pad thai',
        icon: '🇹🇭',
        category: 'world',
        timeOfDay: ['afternoon', 'evening'],
    },
    {
        label: 'Chicken tikka masala',
        icon: '🇮🇳',
        category: 'world',
        timeOfDay: ['evening'],
    },
    {
        label: 'Tacos al pastor',
        icon: '🇲🇽',
        category: 'world',
        timeOfDay: ['afternoon', 'evening'],
    },
    {
        label: 'Japanese gyoza',
        icon: '🇯🇵',
        category: 'world',
        timeOfDay: ['afternoon', 'evening'],
    },
    {
        label: 'Shakshuka',
        icon: '🍳',
        category: 'world',
        timeOfDay: ['morning', 'afternoon'],
    },

    // Classics
    {
        label: 'Chicken parmesan',
        icon: '🍗',
        category: 'classic',
        timeOfDay: ['evening'],
    },
    {
        label: 'Spaghetti bolognese',
        icon: '🍝',
        category: 'classic',
        timeOfDay: ['evening'],
    },
    {
        label: 'Caesar salad',
        icon: '🥬',
        category: 'classic',
        timeOfDay: ['afternoon'],
    },
    {
        label: 'French omelette',
        icon: '🥚',
        category: 'classic',
        timeOfDay: ['morning'],
    },
    {
        label: 'Burgers from scratch',
        icon: '🍔',
        category: 'classic',
        timeOfDay: ['afternoon', 'evening'],
    },
];

function getCurrentTimeOfDay(): TimeOfDay {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
}

function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Returns 6 balanced contextual suggestions based on time of day.
 * Ensures variety across categories.
 */
export function getContextualSuggestions(count = 6): Suggestion[] {
    const timeOfDay = getCurrentTimeOfDay();

    // Filter to suggestions relevant for current time
    const relevant = SUGGESTION_POOL.filter((s) =>
        s.timeOfDay.includes(timeOfDay),
    );

    // Group by category
    const byCategory = new Map<SuggestionCategory, Suggestion[]>();
    for (const s of relevant) {
        const list = byCategory.get(s.category) ?? [];
        list.push(s);
        byCategory.set(s.category, list);
    }

    // Pick one from each category first for variety, then fill randomly
    const picked: Suggestion[] = [];
    const categories = shuffleArray([...byCategory.keys()]);

    for (const cat of categories) {
        if (picked.length >= count) break;
        const items = byCategory.get(cat)!;
        const shuffled = shuffleArray(items);
        picked.push(shuffled[0]);
    }

    // If we still need more, fill from remaining
    if (picked.length < count) {
        const pickedLabels = new Set(picked.map((p) => p.label));
        const remaining = shuffleArray(
            relevant.filter((s) => !pickedLabels.has(s.label)),
        );
        for (const s of remaining) {
            if (picked.length >= count) break;
            picked.push(s);
        }
    }

    return shuffleArray(picked);
}

export type { Suggestion, SuggestionCategory, TimeOfDay };
