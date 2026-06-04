export interface SpotifyTrack {
	albumArt: string;
	name: string;
	artist: string;
	url: string;
}

export interface SpotifyConfig {
	clientId: string;
	clientSecret: string;
	refreshToken: string;
	pollIntervalMs?: number;
}

interface SpotifyDeps {
	fetch: typeof fetch;
	setInterval: typeof setInterval;
	clearInterval: typeof clearInterval;
}

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_CURRENTLY_PLAYING_URL = 'https://api.spotify.com/v1/me/player/currently-playing';
const SPOTIFY_RECENTLY_PLAYED_URL = 'https://api.spotify.com/v1/me/player/recently-played?limit=1';
const DEFAULT_POLL_MS = 30_000;

function escapeHtml(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderTrackLink(track: SpotifyTrack): string {
	if (track.url) {
		return `<a href="${escapeHtml(track.url)}" target="_blank" rel="noopener noreferrer" class="hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors">${escapeHtml(track.name || 'unknown')}</a>`;
	}
	return escapeHtml(track.name || 'unknown');
}

async function refreshAccessToken(
	clientId: string,
	clientSecret: string,
	refreshToken: string,
	deps: SpotifyDeps,
): Promise<string> {
	const response = await deps.fetch(SPOTIFY_TOKEN_URL, {
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
	if (!response.ok) throw new Error('token refresh failed');
	const data = await response.json();
	return data.access_token;
}

interface FetchNowPlayingParams {
	textEl: Element;
	artEl: HTMLImageElement | null;
	accessToken: string;
	clientId: string;
	clientSecret: string;
	refreshToken: string;
	deps: SpotifyDeps;
	onTokenExpired: () => Promise<string>;
}

async function fetchNowPlaying(params: FetchNowPlayingParams): Promise<void> {
	const { textEl, artEl, accessToken, deps } = params;

	function setArt(src: string | undefined) {
		if (artEl) {
			if (src) {
				artEl.src = src;
				artEl.style.display = '';
			} else {
				artEl.removeAttribute('src');
				artEl.style.display = 'none';
			}
		}
	}

	function renderNotPlaying(lastPlayed: SpotifyTrack | null) {
		if (lastPlayed?.name) {
			setArt(lastPlayed.albumArt);
			textEl.innerHTML = `last played: <span class="text-gray-600 dark:text-gray-400">${renderTrackLink(lastPlayed)}</span> &middot; ${escapeHtml(lastPlayed.artist || '')}`;
		} else {
			setArt(undefined);
			textEl.textContent = 'spotify is idle';
		}
	}

	function renderPlaying(track: SpotifyTrack) {
		setArt(track.albumArt);
		textEl.innerHTML = `<span class="text-gray-600 dark:text-gray-400">${renderTrackLink(track)}</span> &middot; ${escapeHtml(track.artist || 'unknown')}`;
	}

	try {
		const [currentRes, recentRes] = await Promise.all([
			deps.fetch(SPOTIFY_CURRENTLY_PLAYING_URL, {
				headers: { Authorization: `Bearer ${accessToken}` },
			}),
			deps.fetch(SPOTIFY_RECENTLY_PLAYED_URL, {
				headers: { Authorization: `Bearer ${accessToken}` },
			}),
		]);

		if (currentRes.status === 401) {
			const newToken = await params.onTokenExpired();
			return fetchNowPlaying({ ...params, accessToken: newToken });
		}

		if (currentRes.ok && currentRes.status !== 204) {
			const data = await currentRes.json();
			if (data.item) {
				renderPlaying({
					albumArt: data.item.album.images[0]?.url ?? '',
					name: data.item.name,
					artist: data.item.artists.map((a: { name: string }) => a.name).join(', '),
					url: data.item.external_urls.spotify,
				});
				return;
			}
		}

		if (recentRes.ok) {
			const recent = await recentRes.json();
			if (recent.items?.length > 0) {
				const t = recent.items[0].track;
				renderNotPlaying({
					albumArt: t.album.images[0]?.url ?? '',
					name: t.name,
					artist: t.artists.map((a: { name: string }) => a.name).join(', '),
					url: t.external_urls.spotify,
				});
				return;
			}
		}

		renderNotPlaying(null);
	} catch {
		renderNotPlaying(null);
	}
}

export function mountSpotify(
	container: HTMLElement,
	config: SpotifyConfig,
	deps: Partial<SpotifyDeps> = {},
): () => void {
	const { clientId, clientSecret, refreshToken, pollIntervalMs = DEFAULT_POLL_MS } = config;

	const $fetch = deps.fetch ?? globalThis.fetch.bind(globalThis);
	const $setInterval = deps.setInterval ?? globalThis.setInterval.bind(globalThis);
	const $clearInterval = deps.clearInterval ?? globalThis.clearInterval.bind(globalThis);

	const resolvedDeps: SpotifyDeps = {
		fetch: $fetch,
		setInterval: $setInterval,
		clearInterval: $clearInterval,
	};

	const textEl = container.querySelector('[data-spotify-text]');
	const artEl = container.querySelector('[data-spotify-art]') as HTMLImageElement | null;

	if (!textEl) return () => {};

	if (!clientId || !clientSecret || !refreshToken) {
		textEl.textContent = 'spotify is idle';
		return () => {};
	}

	let accessToken = '';
	let intervalId: ReturnType<typeof setInterval> | undefined;
	let active = true;

	const refreshTokenFn = () => refreshAccessToken(clientId, clientSecret, refreshToken, resolvedDeps);

	const getOrRefreshToken = async (): Promise<string> => {
		if (!accessToken) {
			accessToken = await refreshTokenFn();
		}
		return accessToken;
	};

	const poll = async () => {
		if (!active) return;
		try {
			const token = await getOrRefreshToken();
			await fetchNowPlaying({
				textEl,
				artEl,
				accessToken: token,
				clientId,
				clientSecret,
				refreshToken,
				deps: resolvedDeps,
				onTokenExpired: async () => {
					accessToken = await refreshTokenFn();
					return accessToken;
				},
			});
		} catch {
			// token refresh failed — retry next poll
		}
	};

	poll();
	intervalId = $setInterval(poll, pollIntervalMs);

	return () => {
		active = false;
		if (intervalId !== undefined) {
			$clearInterval(intervalId);
		}
	};
}
