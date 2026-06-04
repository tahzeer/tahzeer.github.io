import { fetchGitHubContributions, type GitHubContributionSummary } from './githubContributions';
import { renderContributionGrid, renderContributionError } from './renderContributionGrid';
import { createTooltip, showTooltip, hideTooltip } from './contributionTooltip';

export interface MountContributionsDeps {
	fetchContributions: (username: string) => Promise<GitHubContributionSummary>;
	renderGrid: typeof renderContributionGrid;
	renderError: typeof renderContributionError;
	buildTooltip: typeof createTooltip;
	showTooltipFn: typeof showTooltip;
	hideTooltipFn: typeof hideTooltip;
}

const defaults: MountContributionsDeps = {
	fetchContributions: fetchGitHubContributions,
	renderGrid: renderContributionGrid,
	renderError: renderContributionError,
	buildTooltip: createTooltip,
	showTooltipFn: showTooltip,
	hideTooltipFn: hideTooltip,
};

export function mountContributions(
	container: HTMLElement,
	deps: Partial<MountContributionsDeps> = {},
): void {
	const {
		fetchContributions,
		renderGrid,
		renderError,
		buildTooltip,
		showTooltipFn,
		hideTooltipFn,
	} = { ...defaults, ...deps };

	const username = container.dataset.username;
	const grid = container.querySelector('[data-grid]') as HTMLElement | null;
	const summary = container.querySelector('[data-summary]') as HTMLElement | null;

	if (!username || !grid || !summary) return;

	const tooltipEl = buildTooltip(container);

	const handleShow = (cell: HTMLElement, event?: MouseEvent | FocusEvent) =>
		showTooltipFn(tooltipEl, container, cell, event);
	const handleHide = () => hideTooltipFn(tooltipEl);

	fetchContributions(username)
		.then(({ contributions, total }) => {
			renderGrid(grid, contributions, total, handleShow, handleHide);
			summary.textContent = `${total.toLocaleString()} contributions in the last year`;
		})
		.catch(() => {
			renderError(grid, summary, username);
		});
}
