# AGENTS.md

## Important Notice

- This English document is the authoritative source for repository guidance.
- `AGENTS.zh-CN.md` is a reference-only mirror for human readers.
- Tools and agents must follow this English document when executing work.
- If the English and Chinese versions ever differ, this English version wins.
- Keep both files synchronized whenever either file is updated.

## Role

Act as a pragmatic coding agent for this repository. Prefer the conventions already present in source and config over generic templates. This repo is a `pnpm` monorepo with:

- `apps/web`: a Vue 3 + TypeScript + Vite admin frontend
- `apps/mock-server`: a Hono + TypeScript mock backend used during local development

Prefer small, targeted changes. Read nearby implementation and configuration before editing so new work matches local patterns.

## Repository Snapshot

- Package manager: `pnpm`
- Workspace layout: `apps/*`
- Node requirement: `>=20.19.0`
- Frontend stack: Vue 3.5, TypeScript, Vite 8, Pinia, Vue Router, Vue i18n, Element Plus, Axios, Sass, ECharts
- Mock server stack: Hono, `@hono/node-server`, TypeScript, `tsx`
- Quality tools: ESLint flat config, Prettier, `vue-tsc`, `tsc`

Important files and directories:

- `apps/web/src/main.ts`: app bootstrap, Pinia, router, Element Plus, directives, icons, theme setup
- `apps/web/src/router/index.ts`: hash routing, auth guard, route-level language loading
- `apps/web/src/lang/index.ts`: i18n bootstrap and lazy locale loading
- `apps/web/src/stores`: Pinia stores and persisted-state usage
- `apps/web/src/utils/axios.ts`: shared Axios wrapper, token handling, duplicate request cancellation, notifications
- `apps/web/src/styles/index.scss`: global style entry
- `apps/web/vite.config.ts`: `/@` alias, proxy setup, chunk splitting
- `apps/mock-server/src/index.ts`: in-memory mock API handlers, filtering, sorting, pagination, tree helpers, unified response shape
- `apps/mock-server/src/mock-data.ts`: mock seed data and default site/layout configuration
- `docs`: supplementary documentation; treat runnable source and config as the primary truth
- `CLAUDE.md`: secondary collaboration guidance that should be checked against source before trusting it

## Tools And Commands

Prefer the existing workspace scripts:

- Use `pnpm` first for dependency management, installs, and script execution unless a task explicitly requires another tool.
- `pnpm dev`: start frontend and mock server together
- `pnpm dev:client`: start only the frontend
- `pnpm dev:server`: start only the mock server
- `pnpm build`: build the frontend and run the mock server TypeScript check
- `pnpm start`: start the mock server without watch mode
- `pnpm lint`: run ESLint
- `pnpm lint-fix`: run ESLint with autofix
- `pnpm format`: run Prettier across the repo
- `pnpm typecheck`: run `vue-tsc --noEmit` for the frontend and the mock server `build` script (`tsc --project ./tsconfig.json --noEmit`)

Useful runtime details:

- Frontend dev command: `esno ./src/utils/build.ts && vite --force`
- Mock server dev command: `tsx watch ./src/index.ts`
- Vite proxies `/api` and `/admin` to `http://127.0.0.1:8787`
- Frontend port is controlled by `VITE_PORT`
- Mock server port is controlled by `PORT`, default `8787`

## Coding Standards

Follow repo configuration instead of inventing new style rules:

- `.editorconfig`: UTF-8, LF, spaces, default 4-space indentation
- `.prettierrc.js`: no semicolons, single quotes, `printWidth: 150`, `trailingComma: 'es5'`
- `eslint.config.js`: TypeScript + Vue + Prettier flat config with relaxed Vue/TS defaults, while `@typescript-eslint/no-unused-vars` still warns

Practical conventions inferred from the codebase:

- Use TypeScript for new logic
- Use the available Vue Skills when implementing Vue-related code, and prefer those repo-compatible patterns over generic framework advice
- Keep Vue imports aligned with the existing `/@` alias style
- Preserve `createWebHashHistory()` routing unless a task explicitly requires a routing change
- Keep i18n changes inside the lazy-loading structure under `apps/web/src/lang`
- Reuse `apps/web/src/utils/axios.ts` for API requests instead of bypassing the shared wrapper
- Follow the existing Pinia store structure and `pinia-plugin-persistedstate` usage
- Keep mock API responses in the `{ code, msg, data }` shape

## Working In This Repository

Branch workflow:

- Start every task by creating a new branch from `main`; do not work directly on `main`
- Complete the task on that branch, merge it back into `main`, and delete the task branch after the merge
- Use a descriptive branch name, preferably with the `codex/` prefix unless the user requests a different naming scheme

Before editing:

- Read the root `package.json`, the relevant app `package.json`, and nearby config files
- Decide whether the change belongs to `apps/web`, `apps/mock-server`, or both
- Check existing collaboration docs such as `CLAUDE.md`, but trust source and config over prose when they disagree
- Read surrounding implementation before changing patterns, names, or architecture

When changing the frontend:

- Start from the closest route, view, store, or shared utility
- Keep the current auth flow intact: routes that require auth redirect to `adminLogin` when no token is present
- Preserve the router guard and lazy language-loading behavior in `apps/web/src/router/index.ts` and `apps/web/src/lang/index.ts`
- Keep the global style entry and Element Plus integration consistent with `apps/web/src/main.ts`
- Check `apps/web/vite.config.ts` before changing aliases, proxies, or build behavior

When changing API behavior or data contracts:

- Update both `apps/mock-server/src/index.ts` and `apps/mock-server/src/mock-data.ts` when needed
- Keep the mock server in-memory unless a task explicitly asks for persistence
- Reuse the existing search, sort, pagination, and tree helpers instead of introducing parallel implementations

## Validation

Use these checks by default:

- `pnpm lint`
- `pnpm typecheck`

Also run `pnpm build` when the change touches build behavior, proxying, or cross-app integration.

There is no dedicated automated test suite configured at the repo root right now, so linting, type-checking, and build verification are the main quality gates. When reporting results, say exactly which commands were run and note any checks that were skipped or could not be executed.

## Agent Behavior

- Prefer precise, minimal edits over large rewrites
- Do not refactor architecture, naming, or directory structure unless the task clearly calls for it
- If a one-sided change affects the frontend/backend contract, proactively verify whether the other side must change too
- When documentation conflicts with source, follow the source and update the docs if it is safe and relevant to do so
- If the user asks to initialize project instructions again, rescan the repo first and update this file incrementally instead of replacing it with a generic template
