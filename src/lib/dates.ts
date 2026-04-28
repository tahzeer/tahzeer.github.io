export function formatDate(value: string) {
	const date = new Date(`${value}T00:00:00`);
	return formatDisplayDate(date);
}

export function formatDisplayDate(date: Date) {
	const day = String(date.getDate()).padStart(2, "0");
	const month = new Intl.DateTimeFormat("en", { month: "short" }).format(date);

	return `${day} ${month} ${date.getFullYear()}`;
}
