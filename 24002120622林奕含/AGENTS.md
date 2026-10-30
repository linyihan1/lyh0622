# AGENTS.md

Static classroom site for 《高级网页设计》 (student 24002120622 林奕含). Plain HTML/CSS/JS: no build, package manager, tests, lint, or typecheck. Verify changes by opening the file in a browser; run `python -m http.server` from the repo root if relative paths or iframes misbehave.

## Layout: two parallel versions
- `index.html` (root): gallery that iframes the per-lesson pages `flex.html`, `1.html`, `9.9.html`, `9.23.html`, `9.30.html`, `10.9.html`, `10.10.html`.
- `web/index.html`: the tracked, consolidated single-page version of the same lessons (anchor sections, not iframes).
- The two are edited independently; a change in one does not propagate. Decide which version is in scope before editing.
- Git: only `web/` and `.opencode/` are committed; the root lesson files and root `index.html` are untracked. Branch `master`, no remote.

## Conventions
- Content is Chinese; files are UTF-8 without BOM. PowerShell 5.1 `Get-Content` renders them as mojibake — use UTF-8-aware reads/edits.
- `web/` uses a dark theme via CSS variables `--bg1`, `--bg2`, `--accent`, `--muted`; the consolidated page uses `--background`, `--panel`, `--text`, `--muted`, `--accent`, `--border`.
- Sole external dependency: alicdn icon-font script (`https://at.alicdn.com/...js`) in `1.html`, `9.9.html`, `web/css/font/1.html`. Keep it; do not add other CDNs. Icons require network access.
- Keep the lesson prompt text in `web/index.html` (`.prompt-box`) and its anchor nav intact.
- Tab pages use `changeTab` + `.active`. Known bug: `web/css/font/1.html` has `onclick="changetab(this)"` (lowercase) while the function is `changeTab`, so its tabs do not switch. Do not copy the typo.

## Instructions
- `.opencode/skills/web-project/SKILL.md` covers `web/`. It is partly stale: it says `index.html` must link every page with class `prompt`, but the current page is a consolidated single page using `.prompt-box`. Follow the code, not that line.
