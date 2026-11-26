# Changelog

## Enhanced Edition 1.1.0 — 2026-11-26 (Koussay Mehdouani)

Based on the original template by Pavan Joshi (MIT).

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
