# Agent Working Guide

This page explains how to keep repository guidance useful for both human contributors and coding agents.

The repository uses a harness-style documentation approach: `AGENTS.md` provides the short operational map, while `docs/` stores the deeper context that should survive beyond any single chat session.

## Goal

Optimize for agent legibility, not document volume. If a contributor or agent cannot discover a rule while working in the repository, that rule is effectively missing.

## Working Principles

- Prefer a short entry document plus topic pages over one large instruction file.
- Keep durable decisions inside the repository rather than in chat threads or personal memory.
- Write documents so a task can start from a small entry point and progressively drill down into the exact context it needs.
- Keep stable guidance in docs and enforceable guidance in code or tooling.
- When repeated review feedback shows a recurring issue, update the documentation or automation that should have prevented it.

## What Belongs Where

- `AGENTS.md`: concise repository map, hard constraints, and navigation
- `docs/`: durable workflow, architecture, and maintenance context
- Source code and config: exact behavior, contracts, and runtime truth
- Tooling and lint rules: mechanical enforcement for non-negotiable invariants

## Documentation Maintenance Checklist

- If behavior changed, check whether any linked document is now stale.
- If a rule matters on every change, consider whether it should become a script, lint rule, or build check.
- If a new workflow requires more than a few sentences to explain, add or extend a `docs/` page instead of bloating `AGENTS.md`.
- Keep cross-links working so readers can move from summary to detail without guessing.
- Update `AGENTS.zh-CN.md` whenever `AGENTS.md` changes.

## Repository-Specific Notes

- Prefer repository-local guidance over generic framework advice.
- Read nearby implementation before introducing new patterns.
- Keep frontend and backend contract notes close to the code and mirror them in docs only when they are durable enough to be reused.
- Treat source and config as the final arbiter when prose drifts.
- Do not report a user-visible change as complete until browser-based MCP E2E has been run, or an explicit blocker has been documented in the handoff.
