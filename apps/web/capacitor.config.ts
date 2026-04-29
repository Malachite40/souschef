import type { CapacitorConfig } from '@capacitor/cli';
import dotenv from 'dotenv';

const mode = process.env.CAPACITOR_MODE || 'development';
dotenv.config({ path: `.env.cap.${mode}` });

const serverUrl = process.env.CAPACITOR_SERVER_URL;

const config: CapacitorConfig = {
    appId: 'com.yeschefai.app',
    appName: 'YesChef AI',
    webDir: '.next',
    ...(serverUrl
        ? {
              server: {
                  url: serverUrl,
                  cleartext: serverUrl.startsWith('http://'),
                  allowNavigation: [
                      'accounts.google.com',
                      '*.google.com',
                      '*.googleusercontent.com',
                  ],
              },
          }
        : {}),
    plugins: {
        SplashScreen: {
            launchAutoHide: true,
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
