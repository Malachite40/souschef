// Average USD prices per common unit for ingredient cost estimation.
// Used as a fallback when the AI doesn't provide an estimatedPrice.

const PRICE_LOOKUP: Record<string, number> = {
    // Proteins
    'chicken breast': 4.0,
    'chicken thigh': 3.0,
    'chicken thighs': 3.0,
    'ground beef': 5.0,
    'ground turkey': 4.5,
    'beef steak': 8.0,
    steak: 8.0,
    salmon: 7.0,
    'salmon fillet': 7.0,
    shrimp: 6.0,
    tuna: 5.0,
    pork: 4.0,
    'pork chops': 4.5,
    'pork tenderloin': 5.0,
    bacon: 4.0,
    sausage: 3.5,
    tofu: 2.5,
    eggs: 3.0,
    egg: 0.4,

    // Dairy
    butter: 3.5,
    milk: 3.0,
    'heavy cream': 3.5,
    cream: 3.0,
    'sour cream': 2.5,
    'cream cheese': 2.5,
    cheese: 3.5,
    'parmesan cheese': 4.0,
    parmesan: 4.0,
    'mozzarella cheese': 3.5,
    mozzarella: 3.5,
    'cheddar cheese': 3.5,
    yogurt: 3.0,
    'greek yogurt': 4.0,

    // Grains & Pasta
    rice: 2.0,
    pasta: 1.5,
    spaghetti: 1.5,
    bread: 3.0,
    'bread crumbs': 2.0,
    flour: 2.5,
    'all-purpose flour': 2.5,
    tortillas: 3.0,
    noodles: 2.0,

    // Vegetables
    onion: 0.75,
    garlic: 0.5,
    tomato: 1.0,
    tomatoes: 2.0,
    potato: 0.75,
    potatoes: 2.5,
    carrot: 0.5,
    carrots: 1.5,
    celery: 1.5,
    'bell pepper': 1.0,
    broccoli: 2.0,
    spinach: 2.5,
    lettuce: 2.0,
    mushrooms: 2.5,
    corn: 1.0,
    'green beans': 2.0,
    zucchini: 1.5,
    cucumber: 1.0,
    avocado: 1.5,
    'sweet potato': 1.5,
    kale: 2.5,
    cabbage: 2.0,
    peas: 1.5,
    asparagus: 3.0,
    cauliflower: 2.5,
    jalapeño: 0.5,

    // Fruits
    lemon: 0.5,
    lime: 0.5,
    'lemon juice': 2.5,
    'lime juice': 2.5,
    banana: 0.25,
    apple: 1.0,
    berries: 3.5,
    blueberries: 3.5,
    strawberries: 3.0,

    // Oils & Vinegars
    'olive oil': 5.0,
    'vegetable oil': 3.0,
    'coconut oil': 5.0,
    'sesame oil': 4.0,
    vinegar: 2.5,
    'balsamic vinegar': 4.0,
    'apple cider vinegar': 3.0,
    'soy sauce': 2.5,
    'fish sauce': 3.0,

    // Canned & Jarred
    'tomato sauce': 1.5,
    'tomato paste': 1.0,
    'canned tomatoes': 1.5,
    'diced tomatoes': 1.5,
    'crushed tomatoes': 1.5,
    'coconut milk': 2.0,
    'chicken broth': 2.5,
    'chicken stock': 2.5,
    'beef broth': 2.5,
    'vegetable broth': 2.5,

    // Spices & Seasonings
    salt: 1.0,
    pepper: 2.0,
    'black pepper': 3.0,
    paprika: 3.0,
    cumin: 3.0,
    'chili powder': 3.0,
    oregano: 2.5,
    basil: 2.5,
    thyme: 2.5,
    rosemary: 2.5,
    'garlic powder': 2.5,
    'onion powder': 2.5,
    cinnamon: 3.0,
    'red pepper flakes': 2.5,
    'bay leaves': 3.0,
    ginger: 1.5,

    // Condiments & Sauces
    ketchup: 2.5,
    mustard: 2.0,
    mayonnaise: 3.0,
    'hot sauce': 2.5,
    'worcestershire sauce': 3.0,
    honey: 4.0,
    'maple syrup': 5.0,

    // Nuts & Seeds
    almonds: 5.0,
    walnuts: 5.0,
    'peanut butter': 3.5,
    'sesame seeds': 3.0,

    // Baking
    sugar: 2.0,
    'brown sugar': 2.5,
    'powdered sugar': 2.5,
    'baking powder': 2.0,
    'baking soda': 1.5,
    'vanilla extract': 4.0,
    'chocolate chips': 3.0,
    cocoa: 3.5,
};

// Unit multipliers to normalize per-recipe usage cost.
// Most lookup prices assume a "typical purchase" amount.
// Small-unit ingredients (tsp, tbsp, cloves) get a fraction of the full price.
const UNIT_MULTIPLIERS: Record<string, number> = {
    tsp: 0.05,
    teaspoon: 0.05,
    teaspoons: 0.05,
    tbsp: 0.1,
    tablespoon: 0.1,
    tablespoons: 0.1,
    cup: 0.25,
    cups: 0.25,
    oz: 0.15,
    ounce: 0.15,
    ounces: 0.15,
    lb: 1.0,
    lbs: 1.0,
    pound: 1.0,
    pounds: 1.0,
    clove: 0.1,
    cloves: 0.1,
    pinch: 0.02,
    dash: 0.02,
    slice: 0.1,
    slices: 0.1,
    can: 1.0,
    bunch: 1.0,
    head: 1.0,
    piece: 0.5,
    pieces: 0.5,
    whole: 1.0,
    large: 1.0,
    medium: 0.8,
    small: 0.6,
    '': 1.0,
};

interface Ingredient {
    item: string;
    quantity: string;
    unit: string;
    estimatedPrice?: number;
}

function normalizeItem(item: string): string {
    return item.toLowerCase().trim();
}

function getUnitMultiplier(unit: string): number {
    const normalized = unit.toLowerCase().trim();
    return UNIT_MULTIPLIERS[normalized] ?? 0.5;
}

function getQuantityMultiplier(quantity: string): number {
    const num = parseFloat(quantity);
    if (isNaN(num) || num <= 0) return 1;
    return num;
}

export function estimateIngredientPrice(ingredient: Ingredient): number {
    // Use AI-provided price if available
    if (ingredient.estimatedPrice != null && ingredient.estimatedPrice > 0) {
        return ingredient.estimatedPrice;
    }

    // Fallback to lookup table
    const item = normalizeItem(ingredient.item);
    const basePrice = PRICE_LOOKUP[item];
    if (basePrice == null) {
        // Try partial match
        const partialMatch = Object.keys(PRICE_LOOKUP).find(
            (key) => item.includes(key) || key.includes(item),
        );
        const price = partialMatch ? PRICE_LOOKUP[partialMatch]! : 1.5; // default fallback
        return price * getUnitMultiplier(ingredient.unit) * getQuantityMultiplier(ingredient.quantity);
    }

    return basePrice * getUnitMultiplier(ingredient.unit) * getQuantityMultiplier(ingredient.quantity);
}

export function estimateTotalCost(ingredients: Ingredient[]): number {
    return ingredients.reduce(
        (sum, ingredient) => sum + estimateIngredientPrice(ingredient),
        0,
    );
}

export function formatPrice(amount: number): string {
    return `$${amount.toFixed(2)}`;
}
