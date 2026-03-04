import type { LucideIcon } from 'lucide-react';
import { create } from 'zustand';

export interface HeaderAction {
    id: string;
    label: string;
    icon?: LucideIcon;
    variant?: 'destructive';
    onClick: () => void;
}

interface HeaderActionsState {
    actions: HeaderAction[];
    setActions: (actions: HeaderAction[]) => void;
    clearActions: () => void;
}

export const useHeaderActionsStore = create<HeaderActionsState>((set) => ({
    actions: [],
    setActions: (actions) => set({ actions }),
    clearActions: () => set({ actions: [] }),
}));
