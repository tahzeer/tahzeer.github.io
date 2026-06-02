# AGENTS Guide

## Project
Astro 6 + Tailwind CSS v4 static portfolio deployed to GitHub Pages (`tahzeer.github.io`). No SSR — all pages pre-rendered at build time.

## Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Dev server → http://localhost:4321 |
| `npm run build` | Production build → `./dist/` |
| `npm run preview` | Serve the built `./dist/` locally |
| `npm run astro` | Raw Astro CLI |

- **Node**: `>=22.12.0` (engines in package.json, CI pins 22)
- **CI install**: `npm ci --verbose` (not plain `npm install`)

## Build / Config
- **Tailwind v4** via Vite plugin (`@tailwindcss/vite`) in `astro.config.mjs` — no `tailwind.config.*`, no PostCSS config
- **Typography**: `@tailwindcss/typography` lives in `devDependencies` and is loaded as `@plugin` inside `src/styles/global.css` (not in astro.config)
- **Vite**: `usePolling: true` — required on Docker/WSL filesystems for file change detection
- **Site URL**: `https://tahzeer.github.io` (set in astro.config, used by `absoluteUrl()` in `src/data/site.ts`)
- **TypeScript**: extends `astro/tsconfigs/strict`, includes `.astro/types.d.ts` (auto-generated content types), excludes `dist/`
- **No linter or formatter configs** exist (no `.prettierrc`, `.eslintrc`, etc.)

## Content Layer API
Blog collection defined in `src/content.config.ts` using the `glob` loader:

```
pattern: '**/*.{md,mdx}'  →  base: './src/content/blog'
```

**Frontmatter schema**: `title`, `description`, `pubDate` (date), `updatedDate?` (date), `draft` (boolean, default `false`), `tags` (string[], default `[]`).

- `draft: false` must be set to publish — `getPublishedBlogPosts()` filters on this
- Only one post currently: `testing-ai-is-a-different-problem.md`
- Images live in `src/content/blog/images/`
- Types auto-generated into `.astro/types.d.ts` at build time

## Route Map
| File | Route |
|------|-------|
| `src/pages/index.astro` | `/` |
| `src/pages/blog.astro` | `/blog/` |
| `src/pages/blog/[slug].astro` | `/blog/<slug>/` |
| `src/pages/projects.astro` | `/projects/` |
| `src/pages/resume.astro` | `/resume/` |
| `src/pages/privacy/chrome-extensions.astro` | `/privacy/chrome-extensions/` |
| `src/pages/rss.xml.js` | `/rss.xml` |

## Layouts
- **`Main.astro`** — used by every page. Sets up `<html>`, `<head>` (meta, favicon, canonical, RSS link), runs blocking theme init script, renders `<Header />`, `<slot />`, `<Footer />`. Props: `title?`, `description?`, `canonicalPath?`.
- **`BlogPostLayout.astro`** — wraps `Main.astro`. Shows back-link, title, date, tags, reading time, and `<slot />` wrapped in `prose` classes. Props: `post: BlogPost`, `readingTime?: number`.

## Key Data Files
- **`src/data/site.ts`** — site name/URL/email, nav links, `lastUpdated` (from `PUBLIC_LAST_UPDATED` env var injected by CI, falls back to `"2026-04-27"`)
- **`src/data/experiences.json`** — work history (mapped by `Experience.astro` on homepage)
- **`src/data/projects.ts`** — project entries are **all commented out**; uncomment to populate `/projects/`
- **`src/data/techStack.ts`** — two arrays of `simple-icons` SVG imports, shown as dual marquees in `About.astro`
- **`src/data/social.ts`** — social links with inline SVG paths

## Theme System
- Controlled by `data-theme` attribute on `<html>` (values: `"dark"` / `"light"`)
- Blocking inline script in `Main.astro` runs before first paint to prevent flash
- Theme toggle in `Header.astro` uses View Transitions API with manual `clip-path` circle reveal animation (falls back to instant toggle if unsupported or `prefers-reduced-motion`)
- Persisted to `localStorage` under key `theme`
- Dark variant in CSS: `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *))`
- `html` has `view-transition-name: root` and `scrollbar-gutter: stable`

## Spotify / Environment Variables
Three env vars used by `SpotifyNowPlaying.astro`: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN`. These are `.env` / GitHub Secrets.

**Security note**: `SpotifyNowPlaying.astro` embeds these as `data-*` attributes in the HTML — they are visible in page source. The module `src/features/spotify/spotify.ts` is an unused server-side alternative.

## CI/CD (`.github/workflows/pages.yml`)
- Trigger: push to `master`, manual `workflow_dispatch`
- Build step passes `PUBLIC_LAST_UPDATED` (from `git log -1 --format=%cs`) and all three `SPOTIFY_*` secrets as env vars
- Permissions: `contents: read`, `pages: write`, `id-token: write`

## Styling Conventions
- **Font**: JetBrains Mono (400, 500, 600) — monospace, `0.9375rem` body, lowercase text-transform, `select-none`
- **Layout**: `max-w-2xl` centered
- **Markdown**: styled via Tailwind Typography `prose` classes (exported from `src/lib/prose.ts`), not manual `:global()` CSS
- **Dark mode**: `#121212` bg / white text; **light mode**: white bg / near-black text; 1s ease-out transitions
- **Design**: Minimalist Geist/Tailwind — preserve unless explicitly asked to redesign
- **No emojis** in UI text

## Gotchas
- `src/data/projects.ts` has all entries commented out — `/projects/` renders empty until uncommented
- No linter, formatter, or typecheck scripts exist — `npm run build` is the only verification step
- `npm ci --verbose` is the CI install command, not plain `npm ci`
- `.nojekyll` at root tells GitHub Pages to skip Jekyll
- `PUBLIC_LAST_UPDATED` env var is set by CI, not in `.env` — has a hardcoded fallback in `site.ts`
- `src/features/spotify/spotify.ts` is dead code; the real Spotify logic is client-side JavaScript in `SpotifyNowPlaying.astro`
