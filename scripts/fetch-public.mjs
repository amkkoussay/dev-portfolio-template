#!/usr/bin/env node
// Fetches a GitHub user's PUBLIC data (no `gh` CLI, no token) and writes the
// data files this template renders from:
//   github-snapshot.json, site/months.json, site/stack.json, wall.json, wall.txt
//
// Usage:
//   node scripts/fetch-public.mjs                 # user from portfolio.config.json
//   node scripts/fetch-public.mjs --user <login>  # explicit user
//
// Honesty notes:
// - Stars, followers, languages and per-repo facts are exact API values.
// - The contribution calendar is rebuilt from the public events feed, which
//   GitHub only retains for ~90 days / the last 300 events. The window that
//   was actually observed is written into the data (`from`/`to`/`source`) —
//   days outside it are NOT claimed as zero-activity days.
// - Tools are counted only where a repo's own files evidence them
//   (dependency manifests, *.db files, Dockerfile, vercel.json, notebooks).
// - The code wall is real lines from the user's own repositories.
//
// Unauthenticated GitHub REST allows ~60 requests/hour per IP; this script
// uses roughly 40. If you hit the limit it stops with a clear message.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const CONFIG = JSON.parse(fs.readFileSync(path.join(ROOT, "portfolio.config.json"), "utf8"));
const argUser = process.argv.find((a) => a.startsWith("--user="))?.split("=")[1]
  || (process.argv.includes("--user") ? process.argv[process.argv.indexOf("--user") + 1] : null);
const USER = argUser || CONFIG.identity.github;
if (!USER) { console.error("fetch-public: no GitHub user given and identity.github is empty"); process.exit(1); }

const now = new Date();
const iso = now.toISOString();
const write = (file, value) => {
  fs.mkdirSync(path.dirname(path.join(ROOT, file)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, file), typeof value === "string" ? value : JSON.stringify(value, null, 1));
  console.log("wrote", file);
};

async function api(url) {
  const r = await fetch(url, { headers: { "User-Agent": "dev-portfolio-template/fetch-public", Accept: "application/vnd.github+json" } });
  if (r.status === 403 || r.status === 429) {
    console.error(`fetch-public: GitHub rate limit hit at ${url}. Unauthenticated REST is ~60 req/hour per IP — wait and retry.`);
    process.exit(2);
  }
  if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
  return r.json();
}

// ---------- icons (same approach as build-data.mjs) ----------
const ICON_SLUG = { "C#": "csharp", "C++": "cplusplus", HTML: "html5", "Jupyter Notebook": "jupyter", "Objective-C": "apple", Shell: "gnubash", Vue: "vuedotjs", "Next.js": "nextdotjs", "Node.js": "nodedotjs", "React Native": "react", "Socket.io": "socketdotio", Rails: "rubyonrails", "Three.js": "threedotjs", Vercel: "vercel", Android: "android", Flutter: "flutter", PostgreSQL: "postgresql", Prisma: "prisma", Express: "express", React: "react", "Vanilla JS": "javascript", "Canvas 2D": "html5" };
const iconCache = new Map();
async function icon(name) {
  const s = ICON_SLUG[name] || name.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (iconCache.has(s)) return iconCache.get(s);
  let out = null;
  try {
    const r = await fetch(`https://cdn.jsdelivr.net/npm/simple-icons@13.21.0/icons/${s}.svg`);
    if (r.ok) {
      const m = (await r.text()).match(/<path d="([^"]+)"/);
      if (m) out = { slug: s, path: m[1] };
    }
  } catch {}
  iconCache.set(s, out);
  return out;
}

// ---------- profile, repos, stars ----------
const user = await api(`https://api.github.com/users/${USER}`);
const repos = await api(`https://api.github.com/users/${USER}/repos?per_page=100&sort=updated`);
const own = repos.filter((r) => !r.fork).sort((a, b) => b.stargazers_count - a.stargazers_count);
const ownStars = own.reduce((s, r) => s + r.stargazers_count, 0);

// ---------- languages ----------
const langBytes = new Map();
for (const r of own) {
  const langs = await api(`https://api.github.com/repos/${r.full_name}/languages`);
  for (const [name, bytes] of Object.entries(langs)) {
    const e = langBytes.get(name) || { name, bytes: 0, repos: 0 };
    e.bytes += bytes; e.repos += 1;
    langBytes.set(name, e);
  }
}
const totalBytes = [...langBytes.values()].reduce((s, l) => s + l.bytes, 0) || 1;
const languages = [];
for (const l of [...langBytes.values()].sort((a, b) => b.bytes - a.bytes).slice(0, 12)) {
  languages.push({ ...l, share: l.bytes / totalBytes, icon: await icon(l.name) });
}

// ---------- repo trees: tool evidence + code wall ----------
const LANG = { ts: "js", tsx: "js", js: "js", jsx: "js", mjs: "js", rs: "rust", go: "c", cs: "c", kt: "c", java: "c", rb: "ruby", py: "python" };
const toolRepos = new Map();
const bump = (name) => toolRepos.set(name, (toolRepos.get(name) || 0) + 1);
const trees = new Map();
for (const r of own) {
  const tree = await api(`https://api.github.com/repos/${r.full_name}/git/trees/${r.default_branch}?recursive=1`).catch(() => null);
  const blobs = (tree?.tree || []).filter((t) => t.type === "blob");
  trees.set(r.full_name, blobs);
  const low = blobs.map((b) => b.path.toLowerCase());
  let manifests = "";
  for (const b of blobs) {
    if (/(^|\/)(requirements\.txt|pyproject\.toml|package\.json|pipfile)$/i.test(b.path)) {
      const c = await api(`https://api.github.com/repos/${r.full_name}/contents/${b.path}`).catch(() => null);
      if (c?.content) manifests += Buffer.from(c.content, "base64").toString("utf8").toLowerCase() + "\n";
    }
  }
  if (manifests.includes("flask")) bump("Flask");
  if (manifests.includes("django")) bump("Django");
  if (low.some((p) => p.endsWith(".db") || p.endsWith(".sqlite") || p.endsWith(".sqlite3")) || manifests.includes("sqlite")) bump("SQLite");
  if (low.some((p) => p.endsWith("dockerfile") || p.includes("docker-compose"))) bump("Docker");
  if (low.some((p) => p === "vercel.json" || p.endsWith("/vercel.json"))) bump("Vercel");
  if (low.some((p) => p.endsWith(".ipynb"))) bump("Jupyter");
}
const tools = [];
for (const [name, n] of [...toolRepos].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) {
  tools.push({ name, repos: n, via: ["files"], icon: await icon(name) });
}
const site = [];
for (const s of CONFIG.siteStack || [{ name: "Vanilla JS", via: "zero-build frontend" }, { name: "Canvas 2D", via: "hand-rolled rendering" }]) {
  site.push({ ...s, icon: await icon(s.name) });
}
write("site/stack.json", { fetchedAt: iso, owner: USER, repos: own.length, languages, tools, ai: [], site, source: "GitHub REST API — languages and file evidence across public owned repos (fetch-public)" });

// ---------- contributions from the public events feed ----------
const events = [];
for (let page = 1; page <= 3; page++) {
  const batch = await api(`https://api.github.com/users/${USER}/events/public?per_page=100&page=${page}`);
  events.push(...batch);
  if (batch.length < 100) break;
}
const dayCounts = new Map();
const monthRepo = new Map();
for (const e of events) {
  const day = e.created_at.slice(0, 10);
  const month = day.slice(0, 7);
  const repo = e.repo.name.split("/").pop();
  if (e.type === "PushEvent") {
    const n = e.payload?.size || 1;
    dayCounts.set(day, (dayCounts.get(day) || 0) + n);
    if (!monthRepo.has(month)) monthRepo.set(month, new Map());
    const mr = monthRepo.get(month);
    mr.set(repo, (mr.get(repo) || 0) + n);
  } else if (["PullRequestEvent", "IssuesEvent", "PullRequestReviewEvent", "IssueCommentEvent", "CreateEvent", "ForkEvent", "ReleaseEvent"].includes(e.type)) {
    dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
  }
}
if (!dayCounts.size) { console.error("fetch-public: no public events found — cannot build an honest contribution window"); process.exit(1); }
const firstDay = [...dayCounts.keys()].sort()[0];
const lastDay = iso.slice(0, 10);
const level = (c) => (c === 0 ? 0 : c <= 2 ? 1 : c <= 5 ? 2 : c <= 9 ? 3 : 4);
const days = [];
for (let d = new Date(firstDay + "T00:00:00Z"); d <= new Date(lastDay + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + 1)) {
  const ds = d.toISOString().slice(0, 10);
  const c = dayCounts.get(ds) || 0;
  days.push({ date: ds, count: c, level: level(c) });
}
const total = [...dayCounts.values()].reduce((s, n) => s + n, 0);
write("github-snapshot.json", {
  account: USER,
  followers: user.followers,
  profile: `https://github.com/${USER}`,
  stars: {
    total: ownStars, own: ownStars, marketplace: 0,
    repositoryCount: own.length,
    scope: "Public owned non-fork repositories",
    repositories: own.map((r) => ({ name: r.full_name, url: r.html_url, stars: r.stargazers_count, extra: false })),
  },
  contributions: {
    from: firstDay, to: lastDay, year: Number(lastDay.slice(0, 4)), total,
    source: "Public GitHub events via REST API (events window only — GitHub retains ~90 days / 300 events)",
    days,
  },
  sources: ["GitHub REST API — public profile, repositories, languages, events (fetch-public)"],
  fetchedAt: iso,
});
const months = [];
for (let cur = firstDay.slice(0, 7); cur <= lastDay.slice(0, 7);) {
  const top = [...(monthRepo.get(cur) || new Map())].sort((a, b) => b[1] - a[1]).slice(0, 3)
    .map(([repo, commits]) => ({ repo, owner: USER, commits }));
  months.push({ month: cur, top });
  const [y, m] = cur.split("-").map(Number);
  cur = `${y + (m === 12)}-${String((m % 12) + 1).padStart(2, "0")}`;
}
write("site/months.json", { from: firstDay, to: lastDay, fetchedAt: iso, scope: "Monthly commits from public push events (REST API window)", months });

// ---------- code wall: real lines from the user's own repos ----------
const wallRepos = CONFIG.wallRepos?.length ? CONFIG.wallRepos : own.slice(0, 5).map((r) => [r.full_name, 2]);
const files = [];
for (const [full, n] of wallRepos) {
  const blobs = (trees.get(full) || []).filter((b) => LANG[b.path.split(".").pop()] && b.size > 3000 && b.size < 60000 && !/test|spec|mock|node_modules|dist|vendor|\.min\.|generated/i.test(b.path));
  blobs.sort((a, b) => b.size - a.size);
  let added = 0;
  for (const b of blobs) {
    if (added >= n) break;
    const c = await api(`https://api.github.com/repos/${full}/contents/${b.path}`).catch(() => null);
    if (!c?.content) continue;
    const lines = Buffer.from(c.content, "base64").toString("utf8").replace(/\t/g, "  ").split("\n");
    let best = null;
    for (let i = 0; i + 14 <= lines.length; i++) {
      const window = lines.slice(i, i + 14);
      const code = window.filter((ln) => ln.trim() && !ln.trim().startsWith("#")).length;
      if (!best || code > best.code) best = { code, i, window };
    }
    if (!best || best.code < 10) continue;
    files.push({
      repo: full.split("/")[1], path: b.path, sha: b.sha,
      lang: LANG[b.path.split(".").pop()], firstLine: best.i + 1,
      url: `https://github.com/${full}`,
      lines: best.window.map((l) => l.replace(/\s+$/, "").slice(0, 90)),
    });
    added++;
  }
}
if (files.length) {
  let themes = [];
  try { themes = JSON.parse(fs.readFileSync(path.join(ROOT, "wall.json"), "utf8")).themes || []; } catch {}
  write("wall.json", { files, themes });
  write("wall.txt", files.flatMap((f) => f.lines).filter(Boolean).join("\n"));
} else {
  console.error("fetch-public: warning — no suitable code-wall files found; wall.json left unchanged");
}
console.log(`fetch-public done: ${USER} — ${own.length} repos, ${ownStars} stars, ${total} contributions in ${firstDay}..${lastDay}`);
