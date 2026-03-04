export function DashboardHeader({ children }: { children: React.ReactNode }) {
    return (
        <header className="shrink-0 border-b bg-background pt-[var(--safe-area-inset-top)]">
            {children}
        </header>
    );
}
