export interface SpotifyTrack {
    albumArt: string;
    name: string;
    artist: string;
    url: string;
}

export interface SpotifyResponse {
    isPlaying: boolean;
    track: SpotifyTrack | null;
    lastPlayed: SpotifyTrack | null;
}

async function getAccessToken(): Promise<string> {
    const clientId = import.meta.env.SPOTIFY_CLIENT_ID;
    const clientSecret = import.meta.env.SPOTIFY_CLIENT_SECRET;
    const refreshToken = import.meta.env.SPOTIFY_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
        throw new Error('missing spotify credentials');
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' + btoa(`${clientId}:${clientSecret}`),
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        }),
    });

    if (!response.ok) {
        throw new Error('failed to refresh access token');
    }

    const data = await response.json();
    return data.access_token;
}

function extractTrack(item: any): SpotifyTrack {
    return {
        albumArt: item.album.images[0]?.url ?? '',
        name: item.name,
        artist: item.artists.map((a: { name: string }) => a.name).join(', '),
        url: item.external_urls.spotify,
    };
}

export async function getNowPlaying(): Promise<SpotifyResponse> {
    const accessToken = await getAccessToken();

    const [currentRes, recentRes] = await Promise.all([
        fetch('https://api.spotify.com/v1/me/player/currently-playing', {
            headers: { Authorization: `Bearer ${accessToken}` },
        }),
        fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
            headers: { Authorization: `Bearer ${accessToken}` },
        }),
    ]);

    if (currentRes.ok && currentRes.status !== 204) {
        const data = await currentRes.json();
        if (data.item) {
            return {
                isPlaying: true,
                track: extractTrack(data.item),
                lastPlayed: null,
            };
        }
    }

    let lastPlayed: SpotifyTrack | null = null;
    if (recentRes.ok) {
        const recent = await recentRes.json();
        if (recent.items?.length > 0) {
            lastPlayed = extractTrack(recent.items[0].track);
        }
    }

    return { isPlaying: false, track: null, lastPlayed };
}
