export function extractRecipeTitles(text: string): string[] {
    const regex = /~~~recipe-json\n([\s\S]*?)~~~/g;
    const titles: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
        try {
            const data = JSON.parse(match[1].trim());
            if (typeof data.title === 'string') {
                titles.push(data.title);
            }
        } catch {
            // skip invalid JSON blocks
        }
    }

    return titles;
}
