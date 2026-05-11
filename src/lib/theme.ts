const THEME_KEY = 'theme';
const THEME_ATTR = 'data-theme';

export type Theme = 'dark' | 'light';

export function getStoredTheme(): Theme | null {
	if (typeof localStorage === 'undefined') return null;
	const stored = localStorage.getItem(THEME_KEY);
	if (stored === 'dark' || stored === 'light') return stored;
	return null;
}

export function getSystemTheme(): Theme {
	if (typeof window === 'undefined') return 'light';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getCurrentTheme(): Theme {
	return getStoredTheme() ?? getSystemTheme();
}

export function applyTheme(theme: Theme): void {
	if (typeof document === 'undefined') return;
	document.documentElement.setAttribute(THEME_ATTR, theme);
}

export function persistTheme(theme: Theme): void {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem(THEME_KEY, theme);
}

export function initTheme(): void {
	applyTheme(getCurrentTheme());
}

export function getNextTheme(): Theme {
	return getCurrentTheme() === 'dark' ? 'light' : 'dark';
}

export function mountThemeToggle(buttonId: string): void {
	const btn = document.getElementById(buttonId);
	if (!btn) return;

	btn.addEventListener('click', (e) => {
		const next = getNextTheme();
		const enableVT =
			document.startViewTransition &&
			window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

		const apply = () => {
			applyTheme(next);
			persistTheme(next);
		};

		if (enableVT) {
			const clickX = (e as MouseEvent).clientX;
			const clickY = (e as MouseEvent).clientY;
			const maxX = Math.max(clickX, innerWidth - clickX);
			const maxY = Math.max(clickY, innerHeight - clickY);
			const endRadius = Math.hypot(maxX, maxY);

			const vt = document.startViewTransition(() => {
				apply();
			});
			vt.ready.then(() => {
				document.documentElement.animate(
					{
						clipPath: [
							`circle(0px at ${clickX}px ${clickY}px)`,
							`circle(${endRadius}px at ${clickX}px ${clickY}px)`,
						],
					},
					{
						duration: 1000,
						easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
						pseudoElement: '::view-transition-new(root)',
					},
				);
			});
		} else {
			apply();
		}
	});
}
