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
pnpm dev:raw
pnpm db:migrate
pnpm db:seed
pnpm db:setup
pnpm lint
pnpm lint-fix
pnpm format
pnpm build
pnpm start
```

Useful runtime details:

- Dev command: `tsx ./src/scripts/dev.ts`
- Raw dev command: `tsx watch ./src/index.ts`
- Default port: `8787`
- Port source: `PORT`
- Database source: `DATABASE_URL`
- Local env file: `server/.env`

## Local Startup

### First Startup Or Reset

Use this flow when setting up the project for the first time, after recreating the database, or after intentionally resetting local data:

1. Make sure the PostgreSQL service is running before `pnpm db:setup`, or start it manually with `Start-Service postgresql-x64-18`.
2. Run `pnpm db:setup` inside `server/`.
3. Run `pnpm dev` inside `server/`. This command now checks PostgreSQL first, starts `postgresql-x64-18` when needed, and then starts the backend dev server.
4. Run `pnpm dev` inside `web/`.

### Daily Startup

Use this flow for normal day-to-day development after the database has already been initialized:

1. Run `pnpm dev` inside `server/`. This command now checks PostgreSQL first, starts `postgresql-x64-18` when needed, and then starts the backend dev server.
2. Run `pnpm dev` inside `web/`.

`pnpm db:setup` is not required on every startup. It is only needed when the local database is missing, has been reset, or needs new migrations and seed data applied.

If you need to skip the PostgreSQL precheck and start the backend directly, run `pnpm dev:raw` inside `server/`.

Default local addresses:

- Frontend: `http://localhost:5173`
- Backend: `http://127.0.0.1:8787`

Default development credentials:

- Database user: `admin_air_dev`
- Database name: `admin_air`
- Admin login: `admin / AdminAir_2026`

## Local Shutdown

- If you started the frontend or backend in a terminal, stop them with `Ctrl + C` in that terminal.
- To stop background dev servers listening on the default ports, run:

```powershell
Get-NetTCPConnection -LocalPort 8787,5173 -State Listen |
Select-Object -ExpandProperty OwningProcess -Unique |
ForEach-Object { Stop-Process -Id $_ -Force }
```

- To stop PostgreSQL itself when needed, run:

```powershell
Stop-Service postgresql-x64-18
```

- To start PostgreSQL again, run:

```powershell
Start-Service postgresql-x64-18
```

## Validation Defaults

- Frontend changes: `pnpm lint` and `pnpm typecheck`
- Backend changes: `pnpm lint` and `pnpm build`
- Frontend build, proxy, or frontend-backend integration changes: also run `pnpm build` inside `web/`

## Reporting

- Record the exact commands you ran.
- Say which checks were skipped or could not be executed.
- If docs changed because source changed, mention that explicitly in the handoff.
