import { isNativeApp } from '@/lib/utils/platform';

export async function initCapacitor() {
    if (!isNativeApp()) return;

    const [{ StatusBar, Style }, { SplashScreen }, { Keyboard }] =
        await Promise.all([
            import('@capacitor/status-bar'),
            import('@capacitor/splash-screen'),
            import('@capacitor/keyboard'),
        ]);

    StatusBar.setStyle({ style: Style.Light }).catch(() => {});

    SplashScreen.hide().catch(() => {});

    Keyboard.addListener('keyboardWillShow', (info) => {
        document.documentElement.style.setProperty(
            '--keyboard-height',
            `${info.keyboardHeight}px`,
        );
    });

    Keyboard.addListener('keyboardWillHide', () => {
        document.documentElement.style.setProperty('--keyboard-height', '0px');
    });
}
