# Documentation Index

This `docs/` directory is the repository knowledge base for durable context that should be discoverable by both humans and agents.

The layout follows a harness-oriented documentation pattern: keep the entry point small, keep durable knowledge versioned in-repo, and let contributors drill down into the exact context they need.

## Source Of Truth Order

Use this order when information conflicts:

1. Source code, executable configuration, and package scripts
2. `AGENTS.md` for high-level repository guidance
3. The topic-specific documents in `docs/`
4. `CLAUDE.md` as secondary collaboration guidance

## Read By Task

- Start here for orientation: `AGENTS.md`
- Read structure and entry points: `docs/repository-structure.md`
- Read commands and validation expectations: `docs/development-workflow.md`
- Read repository-local documentation principles for agent work: `docs/agent-working-guide.md`
- Read backend menu search behavior and entry points: `docs/frontend-menu-search.md`

## Documentation Principles

- Keep `AGENTS.md` short and stable. It should point to deeper material instead of trying to contain everything.
- Move durable knowledge into repository-local files so it is versioned, reviewable, and available in-context.
- Prefer progressive disclosure: begin with a short map, then follow links to the specific domain, workflow, or source file you need.
- When a prose rule becomes mandatory, promote it into code, config, lint rules, or scripts where possible.
- Update documentation whenever code changes invalidate existing guidance.

## Current Coverage

- Repository structure and key entry points: covered
- Local development workflow and validation: covered
- Agent-facing documentation and maintenance rules: covered
- Frontend global menu search behavior and UX constraints: covered

Add new topic pages when recurring decisions or hidden context start appearing in chat, reviews, or tribal knowledge.
