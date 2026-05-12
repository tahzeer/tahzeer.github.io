/**
 * Parses a date-only ISO string (YYYY-MM-DD) into a Date object.
 * Appends T00:00:00 to prevent timezone-induced date rollback
 * (e.g. "2026-04-27" parsed as UTC midnight becomes Apr 26 in UTC-5).
 */
export function parseDateOnly(value: string): Date {
	return new Date(`${value}T00:00:00`);
}

export function formatDateOnly(value: string) {
	return formatDisplayDate(parseDateOnly(value));
}

export function formatDisplayDate(date: Date) {
	const day = String(date.getDate()).padStart(2, "0");
	const month = new Intl.DateTimeFormat("en", { month: "short" }).format(date);

	return `${day} ${month} ${date.getFullYear()}`;
}
