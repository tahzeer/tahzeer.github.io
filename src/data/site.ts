export const site = {
  name: "tahzeer",
  title: "tahzeer - software engineer",
  description:
    "Personal portfolio of Tahzeer, a software engineer working across backend systems, public infrastructure, cloud deployment, and product experiments.",
  url: "https://tahzeer.github.io",
  email: "tahzeer.work@gmail.com",
  lastUpdated: import.meta.env.PUBLIC_LAST_UPDATED ?? "2026-04-27",
  feed: {
    title: "tahzeer",
    description: "Writing from tahzeer.",
  },
  navigation: [
    { label: "blog", href: "/blog" },
    { label: "projects", href: "/projects" },
    { label: "resume", href: "/resume" },
  ],
};

export function absoluteUrl(path = "/") {
  return new URL(path, site.url).toString();
}
