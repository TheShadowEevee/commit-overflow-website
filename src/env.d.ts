/// <reference types="astro/client" />

declare module "@vercel/config" {
    export function defineConfig(config: Record<string, unknown>): Record<string, unknown>;
}

interface ImportMetaEnv {
    readonly D1_ACCOUNT_ID: string;
    readonly D1_DATABASE_ID: string;
    readonly D1_API_TOKEN: string;
    readonly DISCORD_CLIENT_ID: string;
    readonly DISCORD_BOT_TOKEN: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
