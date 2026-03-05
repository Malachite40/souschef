import { storeToken } from '@/lib/auth-store';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const exchange = request.nextUrl.searchParams.get('exchange');
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('better-auth.session_token')?.value;

    if (exchange && sessionToken) {
        storeToken(exchange, sessionToken);
    }

    return new Response(
        `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family:system-ui;display:flex;justify-content:center;align-items:center;height:100vh;margin:0">
<p style="font-size:18px;color:#333">Sign-in complete! You can close this window.</p>
</body>
</html>`,
        { headers: { 'Content-Type': 'text/html' } },
    );
}
