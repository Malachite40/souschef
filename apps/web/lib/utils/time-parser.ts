/**
 * Converts time strings like "20 min", "1 hr 30 min", "1 hour", "45 minutes"
 * to total minutes. Returns 0 if the string can't be parsed.
 */
export function parseTimeToMinutes(time: string | null | undefined): number {
    if (!time) return 0;

    const normalized = time.toLowerCase().trim();
    let total = 0;

    const hourMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:hr|hour)s?/);
    if (hourMatch) {
        total += Number.parseFloat(hourMatch[1]!) * 60;
    }

    const minMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:min|minute)s?/);
    if (minMatch) {
        total += Number.parseFloat(minMatch[1]!);
    }

    // If no hr/min pattern matched, try parsing as a bare number (assume minutes)
    if (total === 0) {
        const bare = Number.parseFloat(normalized);
        if (!isNaN(bare)) total = bare;
    }

    return Math.round(total);
}
