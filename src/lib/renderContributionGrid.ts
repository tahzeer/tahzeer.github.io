import { contributionLevelLabels } from './githubContributions';
import type { GitHubContribution } from './githubContributions';

function formatDate(date: string): string {
	return new Intl.DateTimeFormat('en', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	}).format(new Date(`${date}T00:00:00`));
}

export function createContributionCell(
	day: GitHubContribution,
	showTooltip: (cell: HTMLElement, event?: MouseEvent | FocusEvent) => void,
	hideTooltip: () => void,
): HTMLElement {
	const cell = document.createElement('span');

	cell.className = `github-contributions-cell level-${day.level}`;
	cell.tabIndex = 0;
	cell.dataset.tooltip = `${day.count} contribution${day.count === 1 ? '' : 's'} on ${formatDate(day.date)}`;
	cell.setAttribute(
		'aria-label',
		`${contributionLevelLabels[day.level]}: ${cell.dataset.tooltip}`,
	);
	cell.addEventListener('mouseenter', (event) => showTooltip(cell, event));
	cell.addEventListener('mousemove', (event) => showTooltip(cell, event));
	cell.addEventListener('mouseleave', hideTooltip);
	cell.addEventListener('focus', () => showTooltip(cell));
	cell.addEventListener('blur', hideTooltip);

	return cell;
}

export function renderContributionGrid(
	grid: HTMLElement,
	contributions: GitHubContribution[],
	total: number,
	showTooltip: (cell: HTMLElement, event?: MouseEvent | FocusEvent) => void,
	hideTooltip: () => void,
): void {
	grid.textContent = '';
	grid.removeAttribute('aria-hidden');
	grid.setAttribute('role', 'img');
	grid.setAttribute('aria-label', `${total} github contributions in the last year`);
	grid.style.gridTemplateColumns = `repeat(${Math.ceil(contributions.length / 7)}, minmax(0, 1fr))`;

	for (const day of contributions) {
		const cell = createContributionCell(day, showTooltip, hideTooltip);
		grid.append(cell);
	}
}

export function renderContributionError(
	grid: HTMLElement,
	summary: HTMLElement,
	username: string,
): void {
	grid.textContent = '';
	grid.setAttribute('aria-hidden', 'true');

	const link = document.createElement('a');
	link.href = `https://github.com/${username}`;
	link.target = '_blank';
	link.rel = 'noopener noreferrer';
	link.textContent = 'github profile';

	summary.textContent = 'could not load the graph right now. view ';
	summary.append(link, '.');
}
