import type { APIRoute } from "astro";
import SpotifyAPI from "../../../utils/spotify";
import { error } from "console";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
    try {
        const { genre } = params;

        if (!genre) {
            return new Response(JSON.stringify({ error: 'Genre parameter is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const clientId = import.meta.env.SPOTIFY_CLIENT_ID;
        const clientSecret = import.meta.env.SPOTIFY_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            return new Response(JSON.stringify({ error: 'Spotify credentials not configured'}), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const spotify = new SpotifyAPI(clientId, clientSecret);
        const tracks = await spotify.getTracksByGenre(genre);

        return new Response(JSON.stringify({ tracks }), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'max-age=600'
            }
        });
    } catch (error) {
        console.error('Genre API Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to get genre tracks' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}