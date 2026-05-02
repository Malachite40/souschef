import { isNativeApp } from '@/lib/utils/platform';
import { Capacitor } from '@capacitor/core';

export async function initCapacitor() {
    if (!isNativeApp()) return;

    document.documentElement.classList.add('capacitor-native');
    document.documentElement.setAttribute(
        'data-cap-platform',
        Capacitor.getPlatform(),
    );
    document.documentElement.style.setProperty(
        '--safe-area-override',
        'env(safe-area-inset-bottom)',
    );

    const [{ StatusBar, Style }, { SplashScreen }, { Keyboard }, { App }] =
        await Promise.all([
            import('@capacitor/status-bar'),
            import('@capacitor/splash-screen'),
            import('@capacitor/keyboard'),
            import('@capacitor/app'),
        ]);

    StatusBar.setStyle({ style: Style.Light }).catch(() => {});

    SplashScreen.hide().catch(() => {});

    Keyboard.setScroll({ isDisabled: true }).catch(() => {});

    Keyboard.addListener('keyboardWillShow', (info) => {
        document.documentElement.style.setProperty(
            '--keyboard-height',
            `${info.keyboardHeight}px`,
        );
        document.documentElement.style.setProperty(
            '--safe-area-override',
            '0px',
        );
    });

    Keyboard.addListener('keyboardWillHide', () => {
        document.documentElement.style.setProperty('--keyboard-height', '0px');
        document.documentElement.style.setProperty(
            '--safe-area-override',
            'env(safe-area-inset-bottom)',
        );
    });

    App.addListener('appUrlOpen', (event) => {
        try {
            const url = new URL(event.url);
            let path: string | null = null;

            if (url.protocol === 'yeschefai:') {
                // yeschefai://recipe/<slug>  →  host="recipe", pathname="/<slug>"
                if (url.host === 'recipe' && url.pathname.length > 1) {
                    path = `/recipe${url.pathname}`;
                }
            } else if (url.protocol === 'https:' || url.protocol === 'http:') {
                if (url.pathname.startsWith('/recipe/')) {
                    path = url.pathname;
                }
            }

            if (path) {
                window.location.assign(path);
            }
        } catch {
            // ignore malformed urls
        }
    });
}
