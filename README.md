# tahzeer.github.io

Personal portfolio built with Astro and Tailwind CSS v4, deployed to GitHub Pages.

## Commands

- `npm run dev` starts the Astro dev server at `localhost:4321`.
- `npm run build` creates the static production site in `dist/`.
- `npm run preview` serves the built site locally.

## Structure

- Pages live in `src/pages/`.
- Shared layout lives in `src/layouts/Main.astro`.
- Components currently live flat in `src/components/`.
- Experience data lives in `src/data/experiences.json`; project data lives in `src/data/projects.ts`.
- Blog posts live as Markdown files in `src/content/blog/` and publish under `/blog/` when `draft: false`.
- Preferred public paths are `/`, `/blog/`, `/projects/`, `/resume/`, and `/privacy/chrome-extensions/`.

## Deployment

GitHub Actions installs with `npm ci --verbose`, exports the latest commit date as `PUBLIC_LAST_UPDATED`, builds with `npm run build`, and uploads `dist/` to GitHub Pages.
