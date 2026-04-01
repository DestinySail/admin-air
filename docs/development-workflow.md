# Development Workflow

This document captures the default local workflow for this repository. For structure and file entry points, read `docs/repository-structure.md`.

## Before Editing

- Create a task branch from `main`. Do not work directly on `main`.
- Read the relevant `package.json` and nearby config before changing behavior.
- Decide whether the task belongs to `web`, `server`, or both.
- Read surrounding implementation before changing naming, structure, or patterns.

## Frontend

Run these commands inside `web/`:

```bash
pnpm install
pnpm dev
pnpm lint
pnpm lint-fix
pnpm format
pnpm typecheck
pnpm build
```

Useful runtime details:

- Dev command: `esno ./src/utils/build.ts && vite --force`
- Proxy target: `http://127.0.0.1:8787`
- Port source: `VITE_PORT`

## Backend

Run these commands inside `server/`:

```bash
pnpm install
pnpm dev
pnpm lint
pnpm lint-fix
pnpm format
pnpm build
pnpm start
```

Useful runtime details:

- Dev command: `tsx watch ./src/index.ts`
- Default port: `8787`
- Port source: `PORT`

## Validation Defaults

- Frontend changes: `pnpm lint` and `pnpm typecheck`
- Backend changes: `pnpm lint` and `pnpm build`
- Frontend build, proxy, or frontend-backend integration changes: also run `pnpm build` inside `web/`

## Reporting

- Record the exact commands you ran.
- Say which checks were skipped or could not be executed.
- If docs changed because source changed, mention that explicitly in the handoff.
