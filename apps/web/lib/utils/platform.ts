import { Capacitor } from '@capacitor/core';

export function isNativeApp(): boolean {
    try {
        return Capacitor.isNativePlatform();
    } catch {
        return false;
    }
}

export function getPlatform(): 'ios' | 'android' | 'web' {
    try {
        const platform = Capacitor.getPlatform();
        if (platform === 'ios' || platform === 'android') return platform;
        return 'web';
    } catch {
        return 'web';
    }
}
