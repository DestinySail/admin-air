# CLAUDE.md

This file provides secondary guidance for repository work. Prefer `AGENTS.md` and the source tree when instructions conflict.

## Project Overview

This repository now contains two independent projects inside one Git repository:

- `web/`: Vue 3 + TypeScript + Vite admin frontend
- `server/`: Hono + TypeScript backend project
- `docs/`: project documentation

The root directory no longer acts as a `pnpm` workspace and no longer provides shared Node scripts.

## Commands

Run frontend commands inside `web/`:

- `pnpm install`
- `pnpm dev`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`

Run backend commands inside `server/`:

- `pnpm install`
- `pnpm dev`
- `pnpm lint`
- `pnpm build`
- `pnpm start`

## Architecture Notes

- Frontend routing uses `createWebHashHistory()`
- Frontend API requests go through `web/src/utils/axios.ts`
- Backend bootstrap seed data lives in `server/src/bootstrap/bootstrap-data.ts`
- Vite still proxies `/api` and `/admin` to `http://127.0.0.1:8787`
- Backend uses PostgreSQL + Drizzle for persistence
