# Repository Structure

This repository keeps two independent projects in a single Git repository. Use this document as the layout map, then move into the closest source files for exact behavior.

```text
admin-air
|- web/                # Vue 3 + TypeScript + Vite frontend
|- server/             # Hono + TypeScript backend project
|- docs/               # repository knowledge base
|- AGENTS.md           # authoritative agent-facing entry point
|- AGENTS.zh-CN.md     # human-readable Chinese mirror
`- CLAUDE.md           # secondary collaboration guidance
```

## Key Entry Points

- Frontend bootstrap: `web/src/main.ts`
- Frontend routing and auth guard: `web/src/router/index.ts`
- Frontend state management: `web/src/stores/`
- Frontend request wrapper: `web/src/utils/axios.ts`
- Frontend global styles: `web/src/styles/index.scss`
- Frontend build and proxy config: `web/vite.config.ts`
- Backend server entry: `server/src/index.ts`
- Backend app wiring: `server/src/app.ts`
- Backend route modules: `server/src/modules/`
- Backend database schema: `server/src/db/schema/`
- Backend bootstrap seed data: `server/src/bootstrap/bootstrap-data.ts`

## Read Path By Change Type

- Frontend UI or routing change: start in `web/src/router/`, the target view, store, or shared utility
- API client change: start in `web/src/utils/axios.ts` and the consuming feature
- Backend API or response-shape change: start in `server/src/modules/`, `server/src/db/schema/`, and `server/src/bootstrap/bootstrap-data.ts`
- Build or proxy change: start in `web/vite.config.ts`
- Workflow or repository guidance change: start in `AGENTS.md` and the matching page in `docs/`

## Development Shape

- Frontend commands run from `web/`
- Backend commands run from `server/`
- The root directory does not provide shared `pnpm` scripts or workspace orchestration
- The frontend and backend communicate through HTTP APIs only

## Maintenance Notes

- Keep this document structural. Put detailed command and validation steps in `docs/development-workflow.md`.
- When you add a new durable subsystem or important directory, update this page so both humans and agents can discover it quickly.
