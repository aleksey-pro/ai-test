---
name: playwright-best-practices
description: Apply reliable Playwright patterns when generating, reviewing, debugging, or healing browser tests for React, Vite, and Next.js applications. Use for locators, assertions, fixtures, isolation, visual checks, API mocking, authentication, retries, traces, and local or CI test execution.
---

# Playwright Best Practices

Apply these rules when writing or modifying Playwright tests.

## Observable behavior

- Assert behavior visible to a user or exposed through a stable public interface.
- Do not reproduce application implementation in a test.
- Keep each test independent. Create its state explicitly and do not depend on execution order.
- Use `test.describe()` for related behavior and `test.beforeEach()` only for genuinely shared setup.

## Locators

Prefer locators in this order:

1. `getByRole()` with an accessible name.
2. `getByLabel()`, `getByPlaceholder()`, or `getByText()` when semantically correct.
3. `getByTestId()` for elements without a stable user-facing identity.
4. Stable CSS only when semantic locators are impossible.

Avoid XPath, generated class names, positional selectors, and arbitrary `.nth()` unless ordering is the behavior under test. Narrow ambiguous locators to a stable region instead of forcing the first match.

## Waiting and assertions

- Use Playwright web-first assertions such as `toBeVisible()`, `toHaveText()`, `toHaveURL()`, and `toHaveCount()`.
- Never use fixed sleeps as synchronization.
- Wait for the state that proves readiness, such as a response, URL, heading, or enabled control.
- Use `expect.poll()` only for external state that cannot be represented by a locator assertion.

## Navigation

- Prefer relative routes with the configured `baseURL`.
- For React/Vite, start the configured development or preview server before tests.
- For Next.js CI, test a production build when the project provides `build` and `start` scripts.
- Treat hydration, redirects, middleware, and server-rendered states as observable behavior; do not assume that DOM presence alone means the page is interactive.

## Fixtures and data

- Put reusable setup in typed fixtures rather than helper chains with hidden global state.
- Generate unique data for mutations and clean up only data created by the test.
- Store secrets in environment variables; never commit tokens, cookies, or credentials.
- Reuse authenticated storage state only when tests do not mutate shared account state.

## Network and mocks

- Mock at the network boundary with `page.route()` when the scenario is intended to isolate frontend behavior.
- Keep response bodies aligned with the OpenAPI contract when a contract is available.
- Use stateful mocks for create/update/delete flows so subsequent requests observe the mutation.
- Do not mock the behavior that the test is meant to validate end to end.

## Visual checks

- Assert semantic content before taking a screenshot.
- Capture the smallest stable region that represents the requirement.
- Disable animations and wait for fonts, images, charts, and loading states to settle.
- Keep snapshots scoped to a browser project and operating-system baseline.
- Do not hide real regressions with broad masks or excessive screenshot thresholds.

## Failure diagnostics

- Preserve trace on first retry and screenshot on failure.
- Read the Playwright error, trace, console errors, and relevant network responses before editing a test.
- Fix the smallest proven cause. Do not weaken an assertion merely to make a run green.
- A retry may expose flakiness but is not itself a fix.

## Generated-test quality gate

Before completing generation or healing, verify:

- the test maps back to the source case;
- locators are stable and unambiguous;
- waits are state-based;
- assertions validate the stated outcome;
- setup and data are isolated;
- no secrets or environment-specific absolute paths were added;
- the narrow test scope passes before expanding the run.
