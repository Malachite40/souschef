// Utility for generating Spoonacular CDN image URLs and emoji fallbacks.

// Words to strip from ingredient names for cleaner image lookups
const ADJECTIVES_TO_STRIP = [
    'fresh',
    'frozen',
    'dried',
    'organic',
    'large',
    'small',
    'medium',
    'boneless',
    'skinless',
    'extra-virgin',
    'extra virgin',
    'raw',
    'cooked',
    'chopped',
    'diced',
    'minced',
    'sliced',
    'crushed',
    'ground',
    'whole',
    'shredded',
    'grated',
    'canned',
    'low-sodium',
    'unsalted',
    'salted',
];

const EMOJI_MAP: Record<string, string> = {
    // Proteins
    chicken: '🍗',
    beef: '🥩',
    steak: '🥩',
    pork: '🥩',
    bacon: '🥓',
    fish: '🐟',
    salmon: '🐟',
    tuna: '🐟',
    shrimp: '🦐',
    egg: '🥚',
    eggs: '🥚',
    tofu: '🧈',
    sausage: '🌭',

    // Dairy
    milk: '🥛',
    butter: '🧈',
    cheese: '🧀',
    cream: '🥛',
    yogurt: '🥛',
    parmesan: '🧀',
    mozzarella: '🧀',
    cheddar: '🧀',

    // Vegetables
    onion: '🧅',
    garlic: '🧄',
    tomato: '🍅',
    tomatoes: '🍅',
    potato: '🥔',
    potatoes: '🥔',
    carrot: '🥕',
    carrots: '🥕',
    pepper: '🌶️',
    'bell pepper': '🫑',
    broccoli: '🥦',
    corn: '🌽',
    lettuce: '🥬',
    spinach: '🥬',
    kale: '🥬',
    mushroom: '🍄',
    mushrooms: '🍄',
    avocado: '🥑',
    cucumber: '🥒',
    zucchini: '🥒',
    celery: '🥬',
    peas: '🫛',
    beans: '🫘',
    'sweet potato': '🍠',
    eggplant: '🍆',

    // Fruits
    lemon: '🍋',
    lime: '🍋',
    apple: '🍎',
    banana: '🍌',
    orange: '🍊',
    strawberry: '🍓',
    strawberries: '🍓',
    blueberries: '🫐',
    berries: '🫐',
    coconut: '🥥',
    peach: '🍑',

    // Grains
    rice: '🍚',
    bread: '🍞',
    pasta: '🍝',
    spaghetti: '🍝',
    noodles: '🍜',
    flour: '🌾',
    tortilla: '🫓',
    tortillas: '🫓',

    // Condiments & Oils
    oil: '🫒',
    'olive oil': '🫒',
    vinegar: '🫒',
    honey: '🍯',
    'soy sauce': '🥫',
    sauce: '🥫',
    ketchup: '🥫',
    mustard: '🥫',
    'maple syrup': '🍁',

    // Spices
    salt: '🧂',
    sugar: '🍬',
    cinnamon: '🫙',
    ginger: '🫚',

    // Baking
    chocolate: '🍫',
    'chocolate chips': '🍫',
    cocoa: '🍫',
    vanilla: '🧁',

    // Nuts
    almond: '🥜',
    almonds: '🥜',
    peanut: '🥜',
    'peanut butter': '🥜',
    walnut: '🥜',
    walnuts: '🥜',

    // Liquids
    water: '💧',
    broth: '🥣',
    stock: '🥣',
    wine: '🍷',
};

/**
 * Normalize an ingredient name for use in image URLs.
 * Strips common adjectives, lowercases, and replaces spaces with hyphens.
 */
export function normalizeIngredientName(name: string): string {
    let normalized = name.toLowerCase().trim();

    for (const adj of ADJECTIVES_TO_STRIP) {
        normalized = normalized.replace(new RegExp(`\\b${adj}\\b`, 'g'), '');
    }

    // Clean up extra spaces and trim
    normalized = normalized.replace(/\s+/g, ' ').trim();

    return normalized;
}

/**
 * Generate a Spoonacular CDN URL for an ingredient image.
 */
export function getIngredientImageUrl(name: string): string {
    const normalized = normalizeIngredientName(name).replace(/\s+/g, '-');
    return `https://img.spoonacular.com/ingredients_100x100/${normalized}.jpg`;
}

/**
 * Get an emoji fallback for an ingredient.
 */
export function getIngredientEmoji(name: string): string {
    const normalized = normalizeIngredientName(name);

    // Try exact match first
    if (EMOJI_MAP[normalized]) return EMOJI_MAP[normalized];

    // Try partial match
    for (const [key, emoji] of Object.entries(EMOJI_MAP)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return emoji;
        }
    }

    // Default food emoji
    return '🥘';
}
