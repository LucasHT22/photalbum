import type { string } from "astro:schema";

interface ImportMetaEnv {
    readonly SPOTIFY_CLIENT_ID: string;
    readonly SPOTIFY_CLIENT_SECRET: string;
}