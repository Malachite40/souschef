import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.yeschefai.app',
    appName: 'YesChef AI',
    webDir: '.next',
    server: {
        url: process.env.CAPACITOR_SERVER_URL || 'http://localhost:3020',
        cleartext: true,
        allowNavigation: [
            'accounts.google.com',
            '*.google.com',
            '*.googleusercontent.com',
        ],
    },
    plugins: {
        SplashScreen: {
            launchAutoHide: false,
            backgroundColor: '#FAF7F2',
        },
        StatusBar: {
            style: 'LIGHT',
            backgroundColor: '#FAF7F2',
        },
        Keyboard: {
            resize: 'none',
            resizeOnFullScreen: true,
        },
    },
};

export default config;
