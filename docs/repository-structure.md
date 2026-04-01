# Repository Structure

This repository now keeps two independent projects in a single Git repository:

```text
admin-air/
├── web/       # Vue 3 + TypeScript + Vite frontend
├── server/    # Hono + TypeScript mock/backend service
├── docs/      # project documentation
├── AGENTS.md
└── AGENTS.zh-CN.md
```

## Development

- Frontend: run commands from `web/`
- Backend: run commands from `server/`
- The root directory no longer provides `pnpm` scripts or workspace orchestration

## Deployment

- `web/` is expected to build and deploy as a standalone frontend project
- `server/` is expected to run and deploy as a standalone backend service
- The two projects communicate only through HTTP APIs
