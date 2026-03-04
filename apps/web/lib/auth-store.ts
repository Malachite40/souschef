// In-memory store for OAuth session exchange codes.
// Maps exchange code → session token (one-time use, 60s TTL).
const store = new Map<string, { token: string; expires: number }>();

export function storeToken(code: string, token: string) {
    store.set(code, { token, expires: Date.now() + 60_000 });
}

export function claimToken(code: string): string | null {
    const entry = store.get(code);
    if (!entry || entry.expires < Date.now()) {
        store.delete(code);
        return null;
    }
    store.delete(code);
    return entry.token;
}
