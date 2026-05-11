export type PolicySection = {
	heading: string;
	paragraphs: string[];
	listItems?: string[];
};

export type Policy = {
	title: string;
	canonicalPath: string;
	sections: PolicySection[];
};

export const chromeExtensionPolicy: Policy = {
	title: "Chrome Extensions Privacy Policy",
	canonicalPath: "/privacy/chrome-extensions/",
	sections: [
		{
			heading: "Overview",
			paragraphs: [
				"This privacy policy applies to all Chrome extensions developed by tahzeer",
			],
		},
		{
			heading: "Data Collection",
			paragraphs: [
				"<strong>I do not collect, store, or transmit any personal data or user information.</strong>",
			],
			listItems: [
				"Personal information",
				"Browsing history",
				"Website content",
				"User preferences or settings",
				"Analytics or usage data",
				"Any data that could identify you",
			],
		},
		{
			heading: "How my Extensions Work",
			paragraphs: [],
			listItems: [
				"All functionality runs locally in your browser",
				"No data is sent to external servers",
				"No data is stored on my servers",
				"No third-party services are used",
			],
		},
		{
			heading: "Third-Party Services",
			paragraphs: [
				"my extensions do not integrate with any third-party services, analytics platforms, or external APIs.",
			],
		},
		{
			heading: "Updates",
			paragraphs: [
				"This privacy policy may be updated from time to time. Any changes will be reflected on this page with an updated \"Last updated\" date.",
			],
		},
	],
};
