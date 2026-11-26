# dev-portfolio-template

My Neovim-style developer portfolio template. An animated code-wall intro, an interactive terminal-style editor, 8 built-in color themes, a contribution calendar, and keyboard-first navigation (`j`/`k`, `:theme`, `enter`).

Pure HTML, CSS, and ES modules — no build step, no framework, no binary files. What you see in this repo is the whole site.

Live example: https://koussay-portfolio-v2.vercel.app

## What it does

- **Fills itself from your GitHub — no `gh` CLI, no token.** `node scripts/build-data.mjs --fetch-public=<your-username>` pulls your followers, stars, languages, per-repo facts, contribution window, and a code wall made of your own real code, straight from the public GitHub REST API.
- **Validates the data before building.** If a data file is missing pieces or still holds someone else's snapshot, the build stops with a clear message instead of publishing a broken, blank site.
- **Doesn't crash on bad data.** If a hand-edited data file is incomplete, the page degrades gracefully instead of going black.
- **Labels partial data honestly.** The public API only exposes ~90 days of events, so the generated contribution window says exactly that in its own `source` field. No fake full-year numbers.
- **Works on any screen.** Phone, tablet, desktop, landscape — verified with real renders at 360 / 390 / 768 / 1280 px and 800×360 landscape.
- **Fonts from Google Fonts CDN.** The repo is 100% text — clone it, fork it, push it through any text-only pipeline.

## Quick start (one AI prompt)

1. Click **"Use this template"** on GitHub (or clone this repo).
2. Open the folder in your AI coding assistant (Cursor, Claude Code, Antigravity, Windsurf, Copilot, etc.).
3. Copy the prompt from **[`AI_PROMPT.md`](./AI_PROMPT.md)**, paste your resume / bio / links / projects at the bottom, and send it.
4. Preview locally:
   ```sh
   python3 serve.py
   ```
   Open `http://localhost:8767/` (intro) and `http://localhost:8767/site/` (editor).

## Manual setup

Everything personal — identity, links, work history, projects, talks — lives in one file:

- **`portfolio.config.json`** — edit `identity`, `about`, `links`, `work`, `projects`, and `talks`.

Then regenerate the site files:

```sh
# Offline mode — validates and applies your config using the data files on disk
node scripts/build-data.mjs

# Public mode — fetches your real GitHub stats, contribution window & code wall
# via the unauthenticated REST API (no gh CLI, no token)
node scripts/build-data.mjs --fetch-public=<your-github-username>

# Online mode — full-year contribution calendar via the GitHub CLI
node scripts/build-data.mjs --fetch-github
```

> **Notes:** Public mode uses ~40 of the ~60 unauthenticated REST requests/hour GitHub allows per IP. Its contribution window is the public events feed (~90 days / last 300 events) and is labelled as such in the generated data. Online mode requires the [GitHub CLI (`gh`)](https://cli.github.com/) installed and authenticated (`gh auth login`), and produces the full-year calendar.

## Project structure

| Path | Purpose |
|---|---|
| `portfolio.config.json` | **Single source of truth** for all your personal info, projects, work, and talks |
| `AI_PROMPT.md` | One-prompt template for AI assistants to personalize the entire site |
| `scripts/build-data.mjs` | Syncs `portfolio.config.json` into HTML/JS/JSON; validates data files; `--fetch-github` / `--fetch-public` modes |
| `scripts/fetch-public.mjs` | Standalone public-API fetcher (snapshot, months, stack, code wall) — no `gh`, no token |
| `index.html`, `glimpse.js`, `glimpse.css` | Landing intro with animated code wall and `:theme` switcher |
| `site/` | Interactive Neovim/terminal-style portfolio (`/site/`) |
| `site/shots/` | Project screenshots (supports `.png`, `.jpg`, `.webp`, `.svg`) |
| `site/photos/` | Optional conference/talk photo galleries |
| `serve.py` | Local dev server with `Cache-Control: no-store` (`python3 serve.py [port]`) |
| `scripts/build-face.py` | Optional script to generate the looping face-tracking intro layer |

## Adding your own assets

- **Project screenshots**: drop images into `site/shots/` and reference them as `"shots/my-app.png"` in `portfolio.config.json`.
- **Talk photos**: drop photos into `site/photos/<event>/` and reference them in `talks[].photos` in `portfolio.config.json`.
- **Custom logo**: replace the SVG `<path>` in `favicon.svg`, `index.html`, `site/index.html`, and `MARK` in `site/wheel.js`.
- **Optional face intro layer**: see `scripts/build-face.py`. Without `face.mp4` / `face.webm` / `face-track.json`, the intro skips the face layer automatically.

## Deploy

Static site. Deploy the root directory directly to **GitHub Pages**, **Vercel**, **Netlify**, or **Cloudflare Pages** — no build command needed.

## License

[MIT](./LICENSE) — © 2026 Koussay Mehdouani. Use it, modify it, publish your own portfolio with it; keep the copyright and license notice.