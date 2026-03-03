export type SlashCommandAction = 'send' | 'fill';

export interface SlashCommand {
    name: string;
    description: string;
    icon: string;
    action: SlashCommandAction;
    /** Text sent or filled when selected. Use {input} as placeholder for user-provided text. */
    template: string;
    /** Sub-commands (e.g. /cuisine italian) */
    subCommands?: { label: string; template: string }[];
}

export const SLASH_COMMANDS: SlashCommand[] = [
    {
        name: 'random',
        description: 'Get a random recipe suggestion',
        icon: '🎲',
        action: 'send',
        template: 'Surprise me with a random recipe!',
    },
    {
        name: 'quick',
        description: 'Find a meal under 30 minutes',
        icon: '⚡',
        action: 'send',
        template: 'Find me a quick recipe I can make in under 30 minutes',
    },
    {
        name: 'healthy',
        description: 'Search for healthy recipes',
        icon: '🥗',
        action: 'send',
        template: 'Find me a healthy, nutritious recipe',
    },
    {
        name: 'vegetarian',
        description: 'Vegetarian recipe search',
        icon: '🌿',
        action: 'send',
        template: 'Find me a vegetarian recipe',
    },
    {
        name: 'vegan',
        description: 'Vegan recipe search',
        icon: '🌱',
        action: 'send',
        template: 'Find me a vegan recipe',
    },
    {
        name: 'cuisine',
        description: 'Browse by cuisine type',
        icon: '🌍',
        action: 'fill',
        template: 'Find me a {input} recipe',
        subCommands: [
            { label: 'Italian', template: 'Find me an Italian recipe' },
            { label: 'Mexican', template: 'Find me a Mexican recipe' },
            { label: 'Japanese', template: 'Find me a Japanese recipe' },
            { label: 'Indian', template: 'Find me an Indian recipe' },
            { label: 'Thai', template: 'Find me a Thai recipe' },
            { label: 'French', template: 'Find me a French recipe' },
            { label: 'Chinese', template: 'Find me a Chinese recipe' },
            { label: 'Korean', template: 'Find me a Korean recipe' },
        ],
    },
    {
        name: 'leftover',
        description: 'Cook with what you have',
        icon: '🧊',
        action: 'fill',
        template: 'I have {input} — what can I make?',
    },
    {
        name: 'budget',
        description: 'Find affordable meals',
        icon: '💰',
        action: 'send',
        template: 'Find me a budget-friendly recipe under $10 for ingredients',
    },
];

/**
 * Fuzzy-match slash commands by name or description.
 */
export function filterSlashCommands(query: string): SlashCommand[] {
    if (!query) return SLASH_COMMANDS;
    const lower = query.toLowerCase();
    return SLASH_COMMANDS.filter(
        (cmd) =>
            cmd.name.includes(lower) ||
            cmd.description.toLowerCase().includes(lower),
    );
}
