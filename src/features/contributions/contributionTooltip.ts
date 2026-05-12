export function createTooltip(container: HTMLElement): HTMLElement {
	const tooltip = container.querySelector('[data-tooltip]') as HTMLElement | null;
	if (!tooltip) throw new Error('Tooltip element not found in container');
	return tooltip;
}

export function hideTooltip(tooltip: HTMLElement): void {
	tooltip.classList.remove('is-visible');
}

export function showTooltip(
	tooltip: HTMLElement,
	container: HTMLElement,
	cell: HTMLElement,
	event?: MouseEvent | FocusEvent,
): void {
	const message = cell.dataset.tooltip;
	if (!message) return;

	tooltip.textContent = message;
	tooltip.classList.add('is-visible');

	const panelRect = container.getBoundingClientRect();
	const cellRect = cell.getBoundingClientRect();
	const x =
		event && 'clientX' in event
			? event.clientX
			: cellRect.left + cellRect.width / 2;
	const y =
		event && 'clientY' in event ? event.clientY : cellRect.top;

	tooltip.style.left = `${x - panelRect.left}px`;
	tooltip.style.top = `${y - panelRect.top - 12}px`;
}
