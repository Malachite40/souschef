import { claimToken } from '@/lib/auth-store';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const exchange = request.nextUrl.searchParams.get('exchange');
    if (!exchange) {
        return NextResponse.json(
            { error: 'missing exchange' },
            { status: 400 },
        );
    }

    const token = claimToken(exchange);
    if (!token) {
        return NextResponse.json({ error: 'not found' }, { status: 404 });
    }

    return NextResponse.json({ token });
}
