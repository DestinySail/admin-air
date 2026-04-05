# Frontend Menu Search

This page records the global menu search feature that was added to the admin frontend. Use it when you need to adjust the search trigger, dialog UX, menu matching behavior, or keyboard navigation.

## Scope

The feature adds a command-palette-style menu search to the backend layout:

- Triggered from the top-right header search entry
- Opened by click or `Ctrl/Cmd + K`
- Searches navigable backend menus only
- Shows the parent menu path for context
- Supports keyboard navigation and enter-to-open
- Adapts to the existing light and dark themes

## Source Of Truth

Read these files first before changing behavior:

- Trigger button and header placement: `web/src/layouts/backend/components/navMenus.vue`
- Dialog UI and transitions: `web/src/layouts/backend/components/search/menuSearch.vue`
- Search indexing and scoring: `web/src/layouts/backend/components/search/useMenuSearch.ts`
- Open/close state: `web/src/stores/menuSearch.ts`
- Menu source and route click behavior: `web/src/stores/navTabs.ts`, `web/src/utils/router.ts`

## Behavior Summary

- The dialog opens into an empty state that only shows the search field and footer hints. It does not show default recommendations.
- Menu results appear only after the user types a query.
- Search matches menu title, parent menu titles, and route path keywords.
- Results only include navigable menu items (`tab`, `iframe`, `link`). Directory menus are used as path context but are not direct results.
- Parent context is shown as a `Location` row above the menu title so the relationship reads clearly.
- The result area uses animated height and content transitions so expansion feels continuous instead of jumping.

## UX Constraints

Keep these choices unless there is a deliberate product decision to change them:

- Keep the trigger visually aligned with the existing top bar instead of making it look like a separate design system.
- Keep the dialog chrome minimal: search field first, results only when needed, shortcut hints at the bottom.
- Keep corner radius restrained. The current implementation intentionally uses small radii to match the existing admin theme.
- Keep the dialog background limited to the inner card content only. Do not reintroduce a second outer visual shell around it.
- Keep the close button feedback obvious. Hover needs visible background and icon-color change.
- Keep the idle state reserved space between the search bar and footer so the panel does not collapse too tightly before search results appear.

## Validation History

The feature was validated with both static checks and interactive browser testing:

- `pnpm lint` in `web/`
- `pnpm typecheck` in `web/`
- MCP browser checks for:
  - login and layout load
  - click trigger open
  - `Ctrl/Cmd + K` open
  - parent-path search recall
  - child-menu search recall
  - keyboard navigation
  - enter-to-open behavior
  - mouse selection
  - dark-mode rendering

## Known Follow-Up

- The repository still has an existing Vue Router deprecation warning in `web/src/router/index.ts` caused by `next()` usage in guards. That warning is not introduced by the menu search feature.
