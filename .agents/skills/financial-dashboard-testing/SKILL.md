---
name: financial-dashboard-testing
description: Plan, write, and review focused tests for this React, TypeScript, FastAPI, and Pydantic financial dashboard. Use when changing financial calculations, calendar dates, API filters or response contracts, data loading, alerts, or test coverage.
---

# Financial Dashboard Testing

## Goal

Catch regressions in financial calculations, calendar-month grouping, API filters, response contracts, and the front-end integration with the backend. Prefer deterministic tests that verify behavior rather than implementation details or test names.

## Project context

- Front-end: React, TypeScript, Vite, and Vitest.
- Back-end: FastAPI, Pydantic, and pytest.
- Front-end calculation tests: `frontend/src/lib/financial-utils.test.ts`.
- Back-end route tests: `backend/tests/test_routes.py`.
- The dashboard requests `GET /api/metrics`; other routes accept different parameters.
- Backend movements are generated mock data, not persisted or real financial records. The main endpoint uses seed `42`, generates 30 movements per month, and derives years from the current date.

## Workflow

1. Read the implementation, types or response models, and nearby tests for the behavior being changed.
2. Confirm the exact route contract and supported parameters. Do not infer that two endpoints share filters.
3. Inspect what existing assertions actually verify; do not rely on a test's name as evidence of coverage.
4. Identify the smallest deterministic cases that can fail if the behavior regresses.
5. Add or propose tests using existing frameworks and helpers. Avoid adding test dependencies unless necessary and approved.
6. Run the narrowest relevant test first, then the documented broader checks when the change warrants them.
7. Report the behavior covered, commands run and results, and any checks blocked by the environment.

## Coverage priorities

### Financial calculations

- Verify income, outcome, net profit, and profit percentage with representative values.
- Include empty data, no income, zero values, and relevant boundary conditions.
- Keep formulas in `frontend/src/lib/financial-utils.ts`; tests should validate their public behavior.

### Dates and periods

- Treat `create_date` as a calendar date, not a local timestamp.
- Test month and year boundaries, chronological ordering, and inclusive date-range edges.
- Include an ISO date near the start of a month under a timezone where local parsing could shift it to the previous month.
- Where generated years depend on `date.today()`, control or account for the clock rather than hard-coding the current year.

### API routes and contracts

- Test each route only with parameters it actually accepts, including invalid enum values and declared limits where relevant.
- Verify filtering and ordering in the returned records.
- For summaries, comparisons, and alerts, assert expected numeric values and edge cases, not just response keys or types.
- Keep backend response models and front-end types aligned when a contract changes.

### Front-end integration

- When `App` data loading or error handling changes, cover successful responses, non-OK responses, rejected requests, and the corresponding loading/error states.
- Mock the network boundary for component tests; do not describe mocked tests as end-to-end verification of the Compose proxy or live backend.

## Commands

Run from the repository root with Compose services available:

```bash
docker compose exec backend pytest -q
docker compose exec frontend npm test
docker compose exec frontend npm run build
docker compose exec frontend npm run lint
```

Run only the relevant test suite first when practical. A build or lint run does not replace behavioral tests.

## Boundaries

- Do not change business rules merely to make tests pass; establish expected behavior from the project contract first.
- Keep generated mock data distinct from real or persisted financial data in test descriptions and reports.
- Do not claim integration, browser, timezone-matrix, or accessibility verification unless that check was actually executed.
- Keep test changes scoped to the behavior under review and preserve existing coverage.

## Completion report

Summarize the risk addressed, the test cases added or recommended, commands executed and their results, and any verification that remains blocked or unperformed.