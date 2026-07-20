export type GitLabContributionCounts = Map<string, number>;

type GitLabUser = {
	id?: unknown;
};

type GitLabEvent = {
	created_at?: unknown;
};

const GITLAB_API_ENDPOINT = "https://gitlab.com/api/v4";
const EVENTS_PER_PAGE = 100;
const MAX_EVENT_PAGES = 10;
const ONE_YEAR_MS = 366 * 24 * 60 * 60 * 1000;

async function fetchGitLabUserId(username: string): Promise<number | null> {
	const response = await fetch(
		`${GITLAB_API_ENDPOINT}/users?username=${encodeURIComponent(username)}`,
	);
	if (!response.ok) throw new Error("GitLab user lookup failed");

	const users = (await response.json()) as GitLabUser[];
	const id = Array.isArray(users) ? users[0]?.id : undefined;
	return typeof id === "number" ? id : null;
}

export async function fetchGitLabContributions(username: string): Promise<GitLabContributionCounts> {
	const counts: GitLabContributionCounts = new Map();
	const userId = await fetchGitLabUserId(username);
	if (userId === null) return counts;

	const cutoff = Date.now() - ONE_YEAR_MS;

	for (let page = 1; page <= MAX_EVENT_PAGES; page++) {
		const response = await fetch(
			`${GITLAB_API_ENDPOINT}/users/${userId}/events?per_page=${EVENTS_PER_PAGE}&page=${page}`,
		);
		if (!response.ok) throw new Error("GitLab events unavailable");

		const events = (await response.json()) as GitLabEvent[];
		if (!Array.isArray(events) || events.length === 0) break;

		let reachedCutoff = false;
		for (const event of events) {
			if (typeof event.created_at !== "string") continue;
			const timestamp = Date.parse(event.created_at);
			if (Number.isNaN(timestamp)) continue;
			if (timestamp < cutoff) {
				reachedCutoff = true;
				continue;
			}
			const date = event.created_at.slice(0, 10);
			counts.set(date, (counts.get(date) ?? 0) + 1);
		}

		if (reachedCutoff || events.length < EVENTS_PER_PAGE) break;
	}

	return counts;
}
