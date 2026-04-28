# AGENTS Guide

- **Dev server**: `npm run dev` → http://localhost:4321 (default Astro dev server).
- **Build**: `npm run build` creates production files in `./dist/`.
- **Preview**: `npm run preview` serves the built site locally.
- **CI install**: GitHub workflow uses `npm ci --verbose`; mirrors `package-lock.json`.
- **Node version**: Workflow pins **Node 20** – use the same locally to avoid version mismatches.
- **Vite watch**: `astro.config.mjs` enables `usePolling: true`; required when file changes aren't detected (e.g., Docker, WSLFS).
- **Tailwind**: Integrated via Vite plugin (`@tailwindcss/vite`). No extra postcss config needed.
- **Entry points**: All pages are `.astro` files under `src/pages/`. Shared shell is `src/layouts/Main.astro`.
- **Blog content**: Markdown posts live in `src/content/blog/`; set `draft: false` in frontmatter to publish at `/blog/<slug>/`.
- **Content data**: Experience content is in `src/data/experiences.json`; project content is in `src/data/projects.ts`; most profile/social copy is still component-local.
- **Visual constraint**: Preserve the existing minimalist Geist/Tailwind look unless the user explicitly asks for a redesign.
- **Components**: Existing components are flat under `src/components/`; avoid moving files unless there is a concrete payoff.
- **Preferred URLs**: Use `/blog/` for writing and `/blog/<slug>/` for posts.
- **Policy route**: Chrome extension privacy policy is intentionally public but not in primary nav. Preferred URL is `/privacy/chrome-extensions/`; `/policies/chrome-extensions/` and `/crx-privacy-policy/` are kept as compatibility aliases.
- **Build metadata**: GitHub Actions exports `PUBLIC_LAST_UPDATED` from the latest commit date; `src/data/site.ts` has the local fallback.
- **TypeScript**: Extends `astro/tsconfigs/strict`; includes generated `.astro/types.d.ts`.
- **Deploy**: GitHub Actions `pages.yml` runs `npm ci` → `npm run build` → uploads `./dist` as Pages artifact.
- **README**: Placeholder starter‑kit file – safe to delete or replace.
