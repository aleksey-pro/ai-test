# Best Practices for Generating Playwright Frontend-Test Mocks

## Core principle

Do not generate arbitrary `route.fulfill({ json })` values. Use this flow:

```text
OpenAPI / JSON Schema + business rules / TestIt / documentation
  → normalized scenarios → deterministic fixtures → Playwright route handlers
  → schema validation and contract verification
```

AI may interpret documentation and expand scenarios, but it is never the source of truth.

## Contract-first scenarios

Derive response structure from OpenAPI, JSON Schema, official API examples, business documentation, and TestIt cases—in that order. Validate every generated response against its schema. If sources conflict, fail and report the conflict rather than choosing an interpretation.

Generate named endpoint scenarios rather than isolated responses, including success, empty state, partial data, validation errors, authentication/authorization, conflict, rate-limit/server failures, network abort/offline/timeout, and data boundaries such as `null`, Unicode, long strings, and boundary numbers.

Separate structural validity (types, required fields, enums, formats) from semantic validity (relationships and business rules). Document the source for every inferred semantic rule or label it as an assumption.

## Determinism and routing

Use a fixed seed and clock, stable collection order, stable UUIDs, and locale-independent values. Store the seed in failure output. Use Playwright Clock or one centralized clock control instead of scattered global `Date` replacements.

Register a mock before `page.goto()`. Prefer `context.route()` when it must apply to popups, tabs, or the whole browser context. Match exact URL patterns and HTTP methods, and validate path/query parameters, headers, content type, and request body—especially for mutations. A broad `**/api/**` handler hides real defects.

For fully isolated frontend suites, use a fail-closed catch-all that throws on unmocked API requests, then register explicit allowed handlers. This exposes undocumented endpoints, wrong URLs, stale mocks, external calls, and accidental production traffic.

## Choosing a mocking tool

Use `context.route()` for Playwright-only mocks. Use MSW when handlers must be shared by local development, component tests, Storybook, browser tests, and Node tests; account for Service Worker behavior when combining it with Playwright routing. Use HAR as a bootstrap or recorded sequence, not as the source of truth. Use Pact or schema contract tests for frontend/backend contract verification.

Keep fixtures small, purpose-specific, versioned with the contract, and easy to inspect. Verify that each mock covers the user-visible scenario and not merely the HTTP response.
