export type GitHubContribution = {
	date: string;
	count: number;
	level: number;
};

export type GitHubContributionSummary = {
	contributions: GitHubContribution[];
	total: number;
};

type GitHubContributionsApiDay = {
	date?: unknown;
	count?: unknown;
	level?: unknown;
};

type GitHubContributionsApiResponse = {
	contributions?: GitHubContributionsApiDay[];
	total?: {
		lastYear?: unknown;
	};
};

const CONTRIBUTIONS_ENDPOINT = "https://github-contributions-api.jogruber.de/v4";

export const contributionLevelLabels = [
	"no contributions",
	"low activity",
	"steady activity",
	"high activity",
	"very high activity",
];

function normalizeContribution(day: GitHubContributionsApiDay): GitHubContribution | null {
	if (typeof day.date !== "string") return null;

	return {
		date: day.date,
		count: Number(day.count || 0),
		level: Math.max(0, Math.min(4, Number(day.level || 0))),
	};
}

export async function fetchGitHubContributions(username: string): Promise<GitHubContributionSummary> {
	const response = await fetch(`${CONTRIBUTIONS_ENDPOINT}/${encodeURIComponent(username)}?y=last`);
	if (!response.ok) throw new Error("Contribution service unavailable");

	const data = (await response.json()) as GitHubContributionsApiResponse;
	const contributions = Array.isArray(data.contributions)
		? data.contributions.map(normalizeContribution).filter((day): day is GitHubContribution => day !== null)
		: [];
	const fallbackTotal = contributions.reduce((sum, day) => sum + day.count, 0);
	const total = Number(data.total?.lastYear ?? fallbackTotal);

	return {
		contributions,
		total: Number.isFinite(total) ? total : fallbackTotal,
	};
}
