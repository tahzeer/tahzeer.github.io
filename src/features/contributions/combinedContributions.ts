import {
	fetchGitHubContributions,
	type GitHubContribution,
	type GitHubContributionSummary,
} from './githubContributions';
import { fetchGitLabContributions, type GitLabContributionCounts } from './gitlabContributions';

function computeLevel(count: number, thresholds: [number, number, number]): number {
	if (count <= 0) return 0;
	if (count <= thresholds[0]) return 1;
	if (count <= thresholds[1]) return 2;
	if (count <= thresholds[2]) return 3;
	return 4;
}

export function mergeContributions(
	githubDays: GitHubContribution[],
	gitlabCounts: GitLabContributionCounts,
): GitHubContribution[] {
	const merged = githubDays.map((day) => ({
		date: day.date,
		count: day.count + (gitlabCounts.get(day.date) ?? 0),
		level: 0,
	}));

	const activeCounts = merged
		.filter((day) => day.count > 0)
		.map((day) => day.count)
		.sort((a, b) => a - b);
	if (activeCounts.length === 0) return merged;

	const pick = (p: number) =>
		activeCounts[Math.min(activeCounts.length - 1, Math.floor(p * activeCounts.length))];
	const thresholds: [number, number, number] = [pick(0.25), pick(0.5), pick(0.75)];

	for (const day of merged) {
		day.level = computeLevel(day.count, thresholds);
	}

	return merged;
}

export async function fetchCombinedContributions(
	username: string,
): Promise<GitHubContributionSummary> {
	const [github, gitlab] = await Promise.allSettled([
		fetchGitHubContributions(username),
		fetchGitLabContributions(username),
	]);

	if (github.status === 'rejected') throw github.reason;

	const gitlabCounts = gitlab.status === 'fulfilled' ? gitlab.value : new Map<string, number>();
	const contributions = mergeContributions(github.value.contributions, gitlabCounts);
	const total = contributions.reduce((sum, day) => sum + day.count, 0);

	return { contributions, total };
}
