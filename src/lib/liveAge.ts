const YEAR_IN_MS = 365.25 * 24 * 60 * 60 * 1000;

export function mountLiveAge(elementId: string, birthdate: Date) {
	const element = document.getElementById(elementId);
	if (!element) return;

	const update = () => {
		const age = (Date.now() - birthdate.getTime()) / YEAR_IN_MS;
		element.textContent = age.toFixed(9);
	};

	update();
	window.setInterval(update, 100);
}
