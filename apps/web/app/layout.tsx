import { TRPCReactProvider } from '@/trpc/react';
import type { Metadata, Viewport } from 'next';
import { DM_Serif_Display, Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
});

const dmSerif = DM_Serif_Display({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-serif',
});

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
};

export const metadata: Metadata = {
    title: 'SousChef',
    description: 'AI-powered recipe assistant with web search and Amazon Fresh links',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${dmSerif.variable} font-sans`}>
                <TRPCReactProvider>{children}</TRPCReactProvider>
            </body>
        </html>
    );
}
