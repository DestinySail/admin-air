# Development Workflow

## Frontend

Run these commands inside `web/`:

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm build
```

## Backend

Run these commands inside `server/`:

```bash
pnpm install
pnpm dev
pnpm lint
pnpm build
pnpm start
```

## Notes

- The frontend Vite proxy still targets `http://127.0.0.1:8787`
- The backend still defaults to port `8787`
- Root-level Node workspace commands have been removed on purpose
