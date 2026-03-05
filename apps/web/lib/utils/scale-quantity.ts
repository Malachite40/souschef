/**
 * Scales a quantity string by a given factor.
 * Handles decimals ("1.5"), fractions ("1/2"), and mixed numbers ("1 1/2").
 * Returns a clean string with friendly fractions where appropriate.
 */

const FRIENDLY_FRACTIONS: Record<string, string> = {
    '0.25': '1/4',
    '0.33': '1/3',
    '0.5': '1/2',
    '0.67': '2/3',
    '0.75': '3/4',
};

function parseFraction(s: string): number {
    const trimmed = s.trim();

    // Mixed number: "1 1/2"
    const mixedMatch = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (mixedMatch) {
        return (
            Number.parseInt(mixedMatch[1]) +
            Number.parseInt(mixedMatch[2]) / Number.parseInt(mixedMatch[3])
        );
    }

    // Simple fraction: "1/2"
    const fracMatch = trimmed.match(/^(\d+)\/(\d+)$/);
    if (fracMatch) {
        return Number.parseInt(fracMatch[1]) / Number.parseInt(fracMatch[2]);
    }

    // Decimal or integer
    const num = Number.parseFloat(trimmed);
    return isNaN(num) ? 0 : num;
}

function formatNumber(n: number): string {
    if (n === 0) return '0';

    const whole = Math.floor(n);
    const frac = n - whole;

    if (frac < 0.01) return String(whole);

    // Check for friendly fraction
    const fracStr = frac.toFixed(2);
    const friendly = FRIENDLY_FRACTIONS[fracStr];
    if (friendly) {
        return whole > 0 ? `${whole} ${friendly}` : friendly;
    }

    // Fall back to rounded decimal (at most 2 decimal places)
    const rounded = Math.round(n * 100) / 100;
    return String(rounded);
}

export function scaleQuantity(quantity: string, scaleFactor: number): string {
    if (!quantity || scaleFactor === 1) return quantity;

    const parsed = parseFraction(quantity);
    if (parsed === 0) return quantity;

    return formatNumber(parsed * scaleFactor);
}
