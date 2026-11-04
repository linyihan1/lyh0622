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

## Code Annotations（新建文件必须遵守）

### 新建 HTML 文件的头部注释
每次新建 `.html` 文件，在 `<head>` 标签**第一行**必须插入如下格式的 HTML 注释块：

```html
<!--
  作者: 林奕含
  学号: 24002120622
  创建时间: YYYY-MM-DD HH:mm
  使用模型: Trae proprietary model
  功能: <页面功能一句话描述，例如"Font Awesome 字体图标艺术品牌展示页">
-->
```

字段说明：
- **创建时间**：取文件实际创建的日期（执行时动态生成，不允许留占位符）。
- **使用模型**：固定写 `Trae proprietary model`（本项目统一）。
- **功能**：必须一句话说清这个页面做什么、用了什么技术或组件，不能只写"作业""测试"等空泛词。

### JS 函数注释
新建或修改任何 JS 函数时，在函数定义的**紧上方**必须加一条 `//` 注释，说明该函数的**主要实现功能**。格式：

```js
// 获取指定月份的课程列表并渲染到卡片容器
function renderMonthLessons(month) { ... }

// 切换 Tab 高亮态并显示对应内容区
function changeTab(el) { ... }

// 用 lucide.createIcons() 扫描 DOM 中所有 [data-lucide] 节点并替换为 SVG
function lyhRenderLucide() { ... }
```

要求：
- 注释写"做什么"（行为 + 对象），不要抄代码直译；
- 每个函数一条注释，多个函数各自独立注释；
- 内部私有小函数（仅 1-2 行的辅助函数）可以例外，但主逻辑函数必须覆盖。

### 命名约定（项目全局）
- **强制 `lyh_` 下划线前缀**（lyh 后跟下划线，不能驼峰也不能连字符）。
- CSS 类名 → `.lyh_xxx_yyy`（例 `.lyh_rank_card`、`.lyh_tab_active`）。
- HTML id → `id="lyh_xxx"`（例 `id="lyh_rank_tabs"`、`id="lyh_panel_realtime"`）。
- JS 变量 / 函数 → 同样下划线（例 `lyh_rank_items`、`lyh_clear_all_tabs()`）。
- JS 常量 → 全大写下划线（例 `LYH_CONFIG`）。
- CSS / HTML / JS 注释里也必须出现 `lyh` 关键字（例 `/* lyh_reset */`、`// lyh_rank_click`、`<!-- lyh_html_head_comment -->`）。
- 唯一例外：**文件名**允许 kebab-case（例 `js/lyh-tabs.js`、`js/lyh-news.js`），不强制下划线。

### 提示词日志（项目全局）
- 每次执行任务前，将**当前提示词原文**追加写入项目根目录的 `lyh_prompt.md`（UTF-8 追加模式，不覆盖）。
- 写入格式必须包含：时间戳、使用的模型、提示词内容。模板：

```
========================================
时间: YYYY-MM-DD HH:mm:ss
模型: Trae proprietary model
提示词:
<用户原话>
========================================
```
