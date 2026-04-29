#!/usr/bin/env node
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const webDir = resolve(__dirname, '..');

const mode = process.env.CAPACITOR_MODE || 'development';
const envPath = resolve(webDir, `.env.cap.${mode}`);

const env = {};
for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    env[key] = rest.join('=').replace(/^["']|["']$/g, '');
}

const googleClientId = env.GOOGLE_IOS_CLIENT_ID;
if (!googleClientId) {
    console.error(`GOOGLE_IOS_CLIENT_ID not set in .env.cap.${mode}`);
    process.exit(1);
}

const rawId = googleClientId.replace('.apps.googleusercontent.com', '');
const reversedId = `com.googleusercontent.apps.${rawId}`;

const plistPath = resolve(webDir, 'ios/App/App/Info.plist');
let plist = readFileSync(plistPath, 'utf-8');

plist = plist.replace(
    /(<key>GIDClientID<\/key>\s*<string>)[^<]+(\.apps\.googleusercontent\.com<\/string>)/,
    `$1${googleClientId}</string>`,
);

plist = plist.replace(
    /(<string>com\.googleusercontent\.apps\.)[^<]+(<\/string>)/,
    `<string>${reversedId}</string>`,
);

writeFileSync(plistPath, plist);
console.log(
    `[cap-sync] Patched Info.plist with ${mode} Google client ID (${rawId})`,
);

console.log(`[cap-sync] Running cap sync (${mode})...`);
execSync('npx cap sync', { cwd: webDir, stdio: 'inherit' });
