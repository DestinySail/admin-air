# AGENTS.md

## Important Notice

- This English document is the authoritative source for repository guidance.
- `AGENTS.zh-CN.md` is a reference-only mirror for human readers.
- Tools and agents must follow this English document when executing work.
- If the English and Chinese versions ever differ, this English version wins.
- Keep both files synchronized whenever either file is updated.

## Role

Act as a pragmatic coding agent for this repository. Prefer the conventions already present in source and config over generic templates. This repository contains two independent `pnpm` projects in a single Git repository:

- `web`: a Vue 3 + TypeScript + Vite admin frontend
- `server`: a Hono + TypeScript backend project for local development and frontend integration

Prefer small, targeted changes. Read nearby implementation and configuration before editing so new work matches local patterns.

## Documentation System

- Treat this file as a quick map, not the full encyclopedia.
- Treat source code and executable config as the primary truth for behavior.
- Treat `docs/` as the repository knowledge base for durable context that should be discoverable by both humans and agents.
- Treat `CLAUDE.md` as secondary guidance that must be checked against source before trusting it.
- When a rule becomes important enough to enforce mechanically, prefer encoding it in config, scripts, linters, or build checks instead of relying on prose alone.

Read these documents before making broad changes:

- `docs/index.md`: documentation map and source-of-truth order
- `docs/repository-structure.md`: repository layout, key files, and change-entry points
- `docs/development-workflow.md`: commands, validation, and delivery expectations
- `docs/agent-working-guide.md`: repository-local guidance for keeping docs and agent context legible

## Repository Snapshot

- Package manager: `pnpm`
- Repository layout: independent `web/` and `server/` projects plus root-level shared docs
- Node requirement: `>=20.19.0`
- Frontend stack: Vue 3.5, TypeScript, Vite 8, Pinia, Vue Router, Element Plus, Axios, Sass, ECharts
- Backend stack: Hono, `@hono/node-server`, TypeScript, `tsx`
- Quality tools: ESLint flat config, Prettier, `vue-tsc`, `tsc`

## Working In This Repository

Branch workflow:

- Start every task by creating a new branch from `main`; do not work directly on `main`.
- Complete the task on that branch, merge it back into `main`, and delete the task branch after the merge.
- Use a descriptive branch name, preferably with the `codex/` prefix unless the user requests a different naming scheme.

Before editing:

- Read the relevant project `package.json` and nearby config files inside `web/` or `server/`.
- Decide whether the change belongs to `web`, `server`, or both.
- Read the closest implementation files before changing patterns, names, or structure.
- Check collaboration docs, but follow source and config when prose disagrees.
- If you update durable behavior or workflow guidance, update the matching files in `docs/` instead of only editing this file.

When changing the frontend:

- Start from the closest route, view, store, or shared utility.
- Keep Vue imports aligned with the existing `/@` alias style.
- Preserve `createWebHashHistory()` routing unless a task explicitly requires a routing change.
- Reuse `web/src/utils/axios.ts` for API requests instead of bypassing the shared wrapper.
- Follow the existing Pinia store structure and `pinia-plugin-persistedstate` usage.
- Keep the current auth flow intact: routes that require auth redirect to `adminLogin` when no token is present.

When changing API behavior or data contracts:

- Update the relevant Hono route modules, database schema, and bootstrap seed data together when needed.
- Keep API responses in the `{ code, msg, data }` shape unless the task explicitly changes the contract.
- Prefer the existing PostgreSQL + Drizzle persistence flow over ad-hoc in-memory state.
- Reuse the existing search, sort, pagination, and tree helpers instead of introducing parallel implementations.

## Tools And Commands

Use `pnpm` first for dependency management, installs, and script execution unless a task explicitly requires another tool.

Frontend commands run inside `web/`:

- `pnpm install`
- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm lint-fix`
- `pnpm format`
- `pnpm typecheck`

Backend commands run inside `server/`:

- `pnpm install`
- `pnpm dev`
- `pnpm start`
- `pnpm db:migrate`
- `pnpm db:seed`
- `pnpm db:setup`
- `pnpm build`
- `pnpm lint`
- `pnpm lint-fix`
- `pnpm format`

Useful runtime details:

- Frontend dev command: `esno ./src/utils/build.ts && vite --force`
- Backend dev command: `tsx watch ./src/index.ts`
- Vite proxies `/api` and `/admin` to `http://127.0.0.1:8787`
- Frontend port is controlled by `VITE_PORT`
- Backend port is controlled by `PORT`, default `8787`
- Backend environment lives in `server/.env`
- Database migrations live in `server/drizzle/`
- Local development expects PostgreSQL via `DATABASE_URL`

## Coding Standards

Follow project configuration instead of inventing new style rules:

- `.editorconfig`: UTF-8, LF, spaces, default 4-space indentation
- `web/.prettierrc.js` and `server/.prettierrc.js`: no semicolons, single quotes, `printWidth: 150`, `trailingComma: 'es5'`
- `web/eslint.config.js` and `server/eslint.config.js`: TypeScript + Prettier flat config; the frontend config also includes Vue rules
- Use TypeScript for new logic.
- Use the available Vue skills when implementing Vue-related code, and prefer repository-compatible patterns over generic framework advice.

## Validation

Use these checks by default in the affected project directories:

- Frontend: `pnpm lint`, `pnpm typecheck`
- Backend: `pnpm lint`, `pnpm build`
- Also run `pnpm build` in `web/` when the change touches build behavior, proxying, or frontend/backend integration.
- For user-visible frontend changes, route/auth changes, or frontend/backend integration changes, run browser-based MCP E2E validation before considering the task complete.
- Prefer the currently available browser MCP tooling (for example Chrome DevTools MCP) and validate the affected user journey, not just a page load.
- If MCP E2E cannot be completed because of environment or dependency blockers, report the blocker explicitly and do not describe the task as fully validated.

There is no repository-owned automated E2E suite configured right now, so linting, type-checking, build verification, and required browser-based MCP E2E checks are the main quality gates. When reporting results, say exactly which commands were run, which MCP E2E scenarios were exercised, and note any checks that were skipped or could not be executed.

## Agent Behavior

- Prefer precise, minimal edits over large rewrites.
- Do not refactor architecture, naming, or directory structure unless the task clearly calls for it.
- If a one-sided change affects the frontend/backend contract, proactively verify whether the other side must change too.
- Keep durable knowledge discoverable inside the repository instead of leaving it only in chat or memory.
- When documentation conflicts with source, follow the source and update the docs if it is safe and relevant to do so.
- If the user asks to initialize project instructions again, rescan the repo first and update this file incrementally instead of replacing it with a generic template.
