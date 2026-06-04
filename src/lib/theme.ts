export const THEME_KEY = 'theme';
export const THEME_ATTR = 'data-theme';

export const themeInitScript = `(function(){var s=localStorage.getItem('${THEME_KEY}');var p=window.matchMedia('(prefers-color-scheme:dark)').matches;var t=s||(p?'dark':'light');document.documentElement.setAttribute('${THEME_ATTR}',t);})()`;

export type Theme = 'dark' | 'light';

export function resolveTheme(stored: Theme | null, system: Theme): Theme {
	return stored ?? system;
}

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
	return resolveTheme(getStoredTheme(), getSystemTheme());
}

export function applyTheme(theme: Theme): void {
	if (typeof document === 'undefined') return;
	document.documentElement.setAttribute(THEME_ATTR, theme);
}

export function persistTheme(theme: Theme): void {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem(THEME_KEY, theme);
}

export function getNextTheme(): Theme {
	return getCurrentTheme() === 'dark' ? 'light' : 'dark';
}

export interface MountThemeToggleDeps {
	getCurrentTheme: () => Theme;
	persistTheme: (theme: Theme) => void;
	applyTheme: (theme: Theme) => void;
}

export function mountThemeToggle(
	buttonId: string,
	deps?: Partial<MountThemeToggleDeps>,
): void {
	const btn = document.getElementById(buttonId);
	if (!btn) return;

	const getCurrent = deps?.getCurrentTheme ?? getCurrentTheme;
	const persist = deps?.persistTheme ?? persistTheme;
	const apply = deps?.applyTheme ?? applyTheme;

	btn.addEventListener('click', (e) => {
		const next = getCurrent() === 'dark' ? 'light' : 'dark';
		const enableVT =
			document.startViewTransition &&
			window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

		const doApply = () => {
			apply(next);
			persist(next);
		};

		if (enableVT) {
			const clickX = (e as MouseEvent).clientX;
			const clickY = (e as MouseEvent).clientY;
			const maxX = Math.max(clickX, innerWidth - clickX);
			const maxY = Math.max(clickY, innerHeight - clickY);
			const endRadius = Math.hypot(maxX, maxY);

			const vt = document.startViewTransition(() => {
				doApply();
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
			doApply();
		}
	});
}
