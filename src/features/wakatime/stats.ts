// WakaTime stats — fetched at build time in an Astro frontmatter.
// The WakaTime API docs explicitly forbid using the secret API key in
// client-side JS, so this module is server-side only. The rendered page
// bakes the normalized numbers into the HTML so nothing secret ships.

export interface WakaTimeEditorStat {
	name: string;
	totalSeconds: number;
}

export interface WakaTimeAiAgentStat {
	name: string;
	lines: number;
	cost: number;
}

export interface WakaTimeCodingRatio {
	humanReadableRange: string;
	totalSeconds: number;
	humanSeconds: number;
	aiSeconds: number;
	aiSessions: number;
	editors: WakaTimeEditorStat[];
	aiAgents: WakaTimeAiAgentStat[];
}

const API_BASE = 'https://api.wakatime.com/api/v1/users/current/stats';
const TIMEOUT_MS = 8000;

type StatCategory = { name?: string; total_seconds?: number };
type StatEditor = StatCategory;
type StatAiAgent = { name?: string; lines?: number; cost?: number };
type StatsResponse = {
	data?: {
		human_readable_range?: string;
		categories?: StatCategory[];
		editors?: StatEditor[];
		ai_agent_breakdown?: StatAiAgent[];
		ai_sessions?: number;
	};
};

function basicAuthHeader(apiKey: string): string {
	return `Basic ${Buffer.from(apiKey).toString('base64')}`;
}

function categorySeconds(categories: StatCategory[] | undefined, name: string): number {
	const hit = categories?.find((c) => c.name?.toLowerCase() === name.toLowerCase());
	return hit?.total_seconds ?? 0;
}

export async function fetchWakaTimeStats(
	apiKey: string,
	range = 'last_7_days',
): Promise<WakaTimeCodingRatio | null> {
	if (!apiKey) return null;

	const url = `${API_BASE}/${encodeURIComponent(range)}`;
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

	try {
		const res = await fetch(url, {
			headers: { Authorization: basicAuthHeader(apiKey), Accept: 'application/json' },
			signal: controller.signal,
			cache: 'no-store',
		});

		if (res.status === 202) {
			// Stats still being aggregated server-side; cached values may be empty.
			return null;
		}
		if (!res.ok) return null;

		const json = (await res.json()) as StatsResponse;
		const data = json?.data;
		if (!data) return null;

		const categories = data.categories ?? [];
		const humanSeconds = categorySeconds(categories, 'coding');
		const aiSeconds = categorySeconds(categories, 'ai coding');

		const editors = (data.editors ?? [])
			.map((e) => ({ name: e.name ?? '', totalSeconds: e.total_seconds ?? 0 }))
			.filter((e) => e.totalSeconds > 0)
			.sort((a, b) => b.totalSeconds - a.totalSeconds);

		const aiAgents = (data.ai_agent_breakdown ?? [])
			.map((a) => ({ name: a.name ?? '', lines: a.lines ?? 0, cost: a.cost ?? 0 }))
			.filter((a) => a.name)
			.sort((a, b) => b.lines - a.lines);

		const totalSeconds = categories.reduce((sum, c) => sum + (c.total_seconds ?? 0), 0);

		return {
			humanReadableRange: data.human_readable_range ?? range,
			totalSeconds,
			humanSeconds,
			aiSeconds,
			aiSessions: data.ai_sessions ?? 0,
			editors,
			aiAgents,
		};
	} catch {
		return null;
	} finally {
		clearTimeout(timeout);
	}
}

export function formatDuration(totalSeconds: number): string {
	const totalMinutes = Math.round((totalSeconds || 0) / 60);
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	if (hours > 0) {
		return minutes > 0 ? `${hours}h ${String(minutes).padStart(2, '0')}m` : `${hours}h`;
	}
	return minutes > 0 ? `${minutes}m` : '0m';
}