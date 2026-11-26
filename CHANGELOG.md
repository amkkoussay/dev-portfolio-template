# Changelog

## 1.2.0 — 2026-11-26

### Fixed — responsive pass (verified with real renders at 360 / 768 / 1280 px and 800×360 landscape)
- The decorative "eye" on `/site/` shrank to ~72 px of illegible micro-text
  parked over the header on phones. It is now hidden on viewports ≤700 px
  wide and ≤500 px tall: `editor.css` sets `visibility: hidden` and
  `watch.js` respects it (the eye is drawn on the overlay canvas, so CSS
  alone could not hide it). Desktop rendering is unchanged.
- Landscape phones squeezed the editor between the fixed stage rows; the
  desk row and eye now drop out on short screens (`max-height: 500px`) so
  the editor keeps a usable height.
- The intro stage's 560 px minimum height pushed its bottom bar below the
  fold on short screens; the floor is relaxed under `max-height: 560px`.
- The full-screen overlay now uses `100dvh` (with `100vh` fallback) so it
  tracks mobile browser chrome.

## 1.1.0 — 2026-11-26


### Added
- `scripts/fetch-public.mjs` + `node scripts/build-data.mjs --fetch-public=<user>`:
  fills `github-snapshot.json`, `site/months.json`, `site/stack.json`,
  `wall.json` and `wall.txt` from the **unauthenticated GitHub REST API** —
  no `gh` CLI, no token. Stars/followers/languages are exact API values;
  tools are counted only where a repo's own files evidence them; the code
  wall is real lines from the user's own repositories.
- Build-time validation in offline mode: structural problems in the data
  files (e.g. a `stack.json` missing its `tools`/`site` arrays) now fail the
  build with a clear error, and a snapshot belonging to a different account
  produces a loud warning instead of silently shipping the wrong person's
  stats.

### Fixed
- `/site/` could render completely blank when `site/stack.json` lacked the
  `tools` or `site` arrays: `site/wheel.js` spread them at startup and
  `site/editor.js` mapped them unguarded. Both now degrade gracefully.

### Changed
- Fonts (Archivo, IBM Plex Mono, Instrument Serif) load from Google Fonts
  instead of bundled `.ttf` files; the local family name "Plex Mono" was
  renamed to "IBM Plex Mono" throughout. The repository is now 100% text.
- The contribution data generated in public mode is labelled with the exact
  window the public events feed covers (~90 days / 300 events), instead of
  presenting a partial window as a full year.
