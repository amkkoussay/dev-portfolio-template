# dev-portfolio-template — Enhanced Edition

A Neovim-inspired developer portfolio template with an animated code-wall intro, interactive terminal-style editor, 8 built-in color themes, contribution calendar, and keyboard-first navigation (`j`/`k`, `:theme`, `enter`).

Zero build step required — pure HTML, CSS, and ES modules.

> **Enhanced edition** maintained by [Koussay Mehdouani](https://github.com/amkkoussay), based on the original template by [Pavan Joshi](https://github.com/pavanjoshi914/dev-portfolio-template) (MIT). See [CHANGELOG.md](./CHANGELOG.md) for what this edition adds.

<p align="center">
  <img src="https://raw.githubusercontent.com/pavanjoshi914/dev-portfolio-template/main/assets/demo.gif" alt="Portfolio Demo Reel" width="340" />
</p>

<p align="center">
  <a href="https://github.com/pavanjoshi914/dev-portfolio-template/blob/main/assets/demo.mp4">Watch full HD video (upstream repo)</a>
</p>

| Intro & Code Wall | Interactive Editor |
| :---: | :---: |
| <img src="https://raw.githubusercontent.com/pavanjoshi914/dev-portfolio-template/main/assets/preview-1.png" alt="Intro & Code Wall" width="420" /> | <img src="https://raw.githubusercontent.com/pavanjoshi914/dev-portfolio-template/main/assets/preview-2.png" alt="Interactive Editor" width="420" /> |
| **Projects & Stack** | **Themes & Terminal** |
| <img src="https://raw.githubusercontent.com/pavanjoshi914/dev-portfolio-template/main/assets/preview-3.png" alt="Projects & Stack" width="420" /> | <img src="https://raw.githubusercontent.com/pavanjoshi914/dev-portfolio-template/main/assets/preview-4.png" alt="Themes & Terminal" width="420" /> |

---

## What this edition adds

- **Public fetch mode — no `gh` CLI, no token.** `node scripts/build-data.mjs --fetch-public=<github-user>` (or the standalone `scripts/fetch-public.mjs`) fills every data file from the unauthenticated GitHub REST API: followers, stars, languages, per-repo facts, an honest contribution window, and a code wall made of **your own real code**. The original template could only do this with an authenticated `gh` CLI — or silently shipped the sample person's data.
- **Build-time validation.** Offline builds now validate `github-snapshot.json`, `site/stack.json` and `site/months.json` before baking anything, and fail with a clear, actionable error instead of producing a site whose `/site/` page renders blank. A stale sample-data snapshot now triggers a loud warning naming the account it belongs to.
- **Crash-proof rendering.** The editor and sidebar no longer die if a hand-edited `stack.json` is missing its `tools`/`site` arrays — the sections degrade gracefully instead of blanking the whole page.
- **No binary font files.** Archivo, IBM Plex Mono and Instrument Serif load from Google Fonts; the repo is 100% text — clone it, fork it, or push it through any text-only pipeline.
- **Honest data labels.** Where the public API can only see part of the truth (the events feed retains ~90 days), the generated data says so in its own `source` field instead of presenting a partial window as a full year.

---

## Quick Start (With One AI Prompt)

1. Click **"Use this template"** on GitHub (or clone this repo).
2. Open the folder in your AI coding assistant (Cursor, Claude Code, Antigravity, Windsurf, Copilot, etc.).
3. Copy the prompt from **[`AI_PROMPT.md`](./AI_PROMPT.md)**, paste your resume / bio / links / projects at the bottom, and send it.
4. Preview locally:
   ```sh
   python3 serve.py
   ```
   Open `http://localhost:8767/` (intro) and `http://localhost:8767/site/` (editor).

---

## Manual Setup

All personal information, links, work history, projects, and talks live in a single file:

- **`portfolio.config.json`** — edit your `identity`, `about`, `links`, `work`, `projects`, and `talks`.

Then regenerate the site files:

```sh
# Offline mode (validates and applies your config using the data files on disk)
node scripts/build-data.mjs

# Public mode (fetches your real GitHub stats, contribution window & code wall
# via the unauthenticated REST API — no gh CLI, no token)
node scripts/build-data.mjs --fetch-public=<your-github-username>

# Online mode (full-year contribution calendar via the GitHub CLI)
node scripts/build-data.mjs --fetch-github
```

> **Notes:** Public mode uses ~40 of the ~60 unauthenticated REST requests/hour GitHub allows per IP. Its contribution window is the public events feed (~90 days / last 300 events) and is labelled as such in the generated data. Online mode requires the [GitHub CLI (`gh`)](https://cli.github.com/) installed and authenticated (`gh auth login`), and produces the full-year calendar.

---

## Project Structure

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

---

## Adding Your Own Assets

- **Project Screenshots**: Drop images into `site/shots/` and reference them as `"shots/my-app.png"` in `portfolio.config.json`.
- **Talk Photos**: Drop photos into `site/photos/<event>/` and reference them in `talks[].photos` in `portfolio.config.json`.
- **Custom Logo**: Replace the SVG `<path>` in `favicon.svg`, `index.html`, `site/index.html`, and `MARK` in `site/wheel.js`.
- **Optional Face Intro Layer**: See `scripts/build-face.py` if you want to add a green-screened portrait loop to the intro. Without `face.mp4` / `face.webm` / `face-track.json`, the intro skips the face layer automatically.

---

## Deploy

This is a static site. Deploy the root directory directly to **GitHub Pages**, **Vercel**, **Netlify**, or **Cloudflare Pages** with no build command needed.

---

## License

This project is licensed under the [MIT License](./LICENSE) — you are free to use, modify, and publish it for your own personal or commercial portfolio as long as the copyright and license notice are included.

Original template © Pavan Joshi. Enhanced edition changes © Koussay Mehdouani — see [CHANGELOG.md](./CHANGELOG.md).
