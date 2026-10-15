---
name: mock-generator
description: Generate, update, and validate realistic deterministic stateful API mocks for Playwright from Swagger/OpenAPI documentation. Use this skill whenever a user asks for Playwright API mocks, frontend mock infrastructure, Swagger-derived fixtures, stateful mutation scenarios, offline-capable contract-based mocks, or regeneration after API documentation changes. This skill must use swagger-parser as its contract-acquisition and normalization stage.
---

# Playwright Mock Generator

Generate realistic, deterministic, traceable Playwright API mocks from a versioned Swagger/OpenAPI contract. The main agent executes this workflow; no separate generator CLI is required.

## Required mock practices

Before inspecting contracts or generating mocks, read and apply
[the mock-generation best practices](./mock-generation-best-practices.md).
Its rules are mandatory for scenario design, deterministic fixtures, schema and
business-rule validation, request matching, fail-closed routing, state isolation,
and the choice between Playwright routing, MSW, and HAR.

## Required output

Create or update:

```text
autotest-cli-data/
├── contracts/
│   ├── swagger.json
│   ├── swagger-parsed.json
│   └── contract-metadata.json
├── mocks/
│   ├── generated/
│   │   ├── fixtures.ts
│   │   ├── scenarios.ts
│   │   └── manifest.json
│   ├── handlers.ts
│   ├── stateful.ts
│   ├── validation.ts
│   ├── business-rules.ts
│   └── fixture.ts
└── tests/*.spec.ts
```

Generated mocks must be structurally valid, semantically plausible, deterministic, isolated between tests, traceable to documentation, and strict about unexpected API requests.

## Required first stage: swagger-parser

Before inspecting schemas or generating mocks, use the `swagger-parser` skill with a `swaggerUrl` argument.

Resolve the argument as follows:

1. use the Swagger/OpenAPI URL supplied in the current user request;
2. otherwise use the URL already recorded in `autotest-cli-data/contracts/contract-metadata.json`;
3. otherwise stop and request a URL—do not embed a project-specific default in this skill.

Pass:

```text
swaggerUrl: <resolved URL>
outputDir: autotest-cli-data/contracts
projectName: <current repository name>
```

The parser owns remote discovery, safe temporary download, validation, cache refresh, cache fallback, reference handling, normalization, hashing, and contract metadata. Do not duplicate those responsibilities in `mock-generator`.

Require this handoff before continuing:

```json
{
  "status": "ready",
  "contractPath": "autotest-cli-data/contracts/swagger.json",
  "parsedPath": "autotest-cli-data/contracts/swagger-parsed.json",
  "metadataPath": "autotest-cli-data/contracts/contract-metadata.json",
  "contractHash": "sha256:...",
  "contractChanged": true,
  "usedCachedContract": false,
  "warnings": []
}
```

If the parser returns `status: "blocked"`, stop mock generation. Do not infer an authoritative contract from existing fixtures, frontend code, or memory.

Use `swagger-parsed.json` for normalized operation discovery and `swagger.json` for runtime schema validation. Verify that both correspond to the handoff contract hash.

## Inspect the frontend first

Do not assume Next.js, SSR, `/client/*`, or a particular HTTP client.

Inspect the framework, Playwright configuration, `fetch`/Axios/GraphQL/generated-client calls, base URLs, proxies, request encodings, frontend types, existing routes, TestIt cases, and documented acceptance requirements.

Map observed frontend requests to OpenAPI operations. Report instead of hiding:

- documented endpoints unused by the frontend;
- frontend requests absent from OpenAPI;
- request or response type conflicts;
- requests executed outside browser routing, such as SSR;
- hardcoded features that never perform an API request.

Generate URL patterns only for request paths the application actually uses.

## Consume the normalized contract

Read operations and normalized schemas from `autotest-cli-data/contracts/swagger-parsed.json`. Use original JSON pointers to inspect `swagger.json` whenever validation semantics or source wording matter. For every relevant operation consume:

- method, normalized path, operation ID, and tags;
- path, query, header, and cookie parameters;
- request schemas and content types;
- documented response statuses, schemas, and content types;
- required fields, formats, enums, nullable fields, and composition keywords;
- examples, defaults, descriptions, discriminators, and read/write semantics;
- security requirements and referenced component schemas.

Do not present undocumented statuses as contract facts. Additional robustness scenarios are allowed only when recorded as assumptions.

## Detect conflicts and assumptions

Compare OpenAPI with frontend types and behavior, TestIt cases, and business documentation. Classify findings as:

- `confirmed`: directly supported by the contract;
- `derived`: logically derived from documented rules;
- `assumption`: plausible but unconfirmed;
- `conflict`: sources disagree;
- `missing`: required information is absent.

Do not silently resolve conflicts. Record both sources and the resolution. Ask the user only when a conflict materially changes visible behavior and project evidence cannot resolve it.

## Generate scenario catalogs

Generate explicit named scenarios appropriate to the operation:

```ts
type NewsScenario =
  | 'news.success'
  | 'news.empty'
  | 'news.pagination-edge'
  | 'news.unauthorized'
  | 'news.server-error'
  | 'news.slow'
  | 'news.network-failure';
```

For mutations consider success, validation, authentication/authorization, documented conflict, not-found, server-error, slow, and network-failure scenarios. Avoid magic inputs such as `email === "error@example.com"` unless requirements demand them.

## Generate deterministic realistic fixtures

Derive structure from OpenAPI and enrich values using examples, descriptions, enums, business documentation, and domain relationships.

- Derive a stable seed from scenario name and contract hash.
- Store a fixed mock clock in the manifest.
- Produce stable identifiers and ordering.
- Avoid `crypto.randomUUID()`, unseeded randomness, and runtime `new Date()`.
- Generate a valid RFC 4122-shaped UUID when the field requires a UUID.
- Include required fields and fields consumed by the frontend.
- Preserve relationships among identifiers, slugs, dates, pagination, and related objects.
- Put boundary values in dedicated scenarios.
- Never include real secrets, tokens, cookies, or personal data.

## Business-rule validation

OpenAPI validates structure, not all domain semantics. Store project-specific semantic validators in `autotest-cli-data/mocks/business-rules.ts`.

Examples include date ordering, exclusion of the current item from related content, strictly ascending parsed graph dates, positive financial values, consistent pagination, valid 12-character ISIN including its check digit, and payout/value consistency.

Compare parsed dates, not formatted date strings. Distinguish strict failures from plausibility warnings. Every rule outside OpenAPI must cite its source or be recorded as an assumption.

## Runtime schema validation

Generate `autotest-cli-data/mocks/validation.ts`. Validate fixtures before serving them using `autotest-cli-data/contracts/swagger.json`, never a handwritten duplicate schema.

Reuse a compatible validator already installed. If a dependency is required, explain it and follow dependency-installation approval rules.

Validate at least:

- mutation request bodies;
- selected response status, content type, and body;
- required path and query parameters;
- scenario business rules.

Do not serve an invalid fixture. Diagnostics must include operation, status, scenario, JSON/schema pointer, invalid-value summary, and contract hash.

## Playwright routing

Use Playwright `browserContext.route()` or `page.route()` for Playwright-only mocks. Add MSW only when the user also needs shared development, Storybook, component-test, or non-Playwright mocks.

Register routes before navigation. Prefer context routing for popups or multiple pages and page routing for local overrides.

Each handler must narrowly match URLs, verify the method, validate relevant parameters/body, return explicit status/content type, support only declared scenarios, and preserve behaviorally relevant headers.

Register fail-closed before specific handlers because Playwright evaluates matching routes in reverse registration order:

```ts
export async function registerFailClosed(context: BrowserContext) {
  await context.route('**/api/**', async (route) => {
    throw new Error(
      `[MOCK] Unhandled request: ${route.request().method()} ${route.request().url()}`,
    );
  });
}
```

Limit fail-closed matching to API boundaries found during frontend inspection. Do not intercept all resources by default.

## Stateful mutations

Use state only when an action changes later behavior. Prefer stateless scenarios for independent UI states.

Provide test-scoped state:

```ts
type MockState = {
  subscriptions: Map<string, Subscription>;
};

export const test = base.extend<{ mockState: MockState }>({
  mockState: async ({}, use) => {
    const state: MockState = { subscriptions: new Map() };
    await use(state);
    state.subscriptions.clear();
  },
});
```

Normalize keys according to documented rules, avoid global mutable state, and parse the documented JSON, URL-encoded, or multipart encoding.

## Assertions and tests

Do not derive UI assertions from the same fixture object used to fulfill the request. Keep sources independent:

- mock structure comes from OpenAPI;
- fixture semantics come from documentation and business rules;
- assertions come from TestIt or explicit acceptance requirements;
- provider compatibility comes from contract verification.

Use deterministic delays only in dedicated loading scenarios.

## Contract verification

Mocked frontend tests do not prove that the provider implements the contract.

When provider access is available and verification is in scope, send the frontend-required requests to the real provider, validate responses against the cached contract, and record provider URL, contract hash, timestamp, and result.

When provider access is unavailable, continue offline mock generation and mocked frontend tests, record provider verification as `not-run` with a reason, and never report mocked-test success as backend compatibility.

## Manifest and provenance

For every scenario record operation, OpenAPI JSON pointer, response status, contract hash, seed, mock clock, business rules, assumptions, and conflicts.

Also record remote refresh result, cached contract path/hash, changed operations, generated/removed scenarios, validation result, and provider-verification result or `not-run` reason.

## Safe regeneration

When the swagger-parser handoff reports `contractChanged: true`:

1. read added, changed, and removed operations from parser metadata/output;
2. regenerate affected generated artifacts;
3. preserve handwritten rules and tests;
4. remove files only when clearly generated from a removed operation;
5. report breaking changes and assumptions;
6. type-check generated TypeScript;
7. run focused Playwright tests, then the relevant broader suite.

Respect user-owned changes and generated-file markers.

## Project-owned mock resources

Project-specific examples and starting points live under `autotest-cli-data/mocks/`, not inside this skill. Inspect only the resources relevant to requested endpoints and adapt them to the cached contract and actual frontend. Never copy their routes, selectors, timestamps, framework assumptions, or response shapes without verification. Treat `autotest-cli-data/mocks/generated/` as regenerable output and preserve handwritten files elsewhere in `autotest-cli-data/mocks/`.

## Completion checklist

- [ ] `swagger-parser` ran first with a resolved `swaggerUrl`.
- [ ] Parser handoff status is `ready`.
- [ ] `swagger.json` and `swagger-parsed.json` match the handoff hash.
- [ ] Parser refresh/cache result was propagated to mock provenance.
- [ ] Frontend requests were mapped to OpenAPI operations.
- [ ] Conflicts, assumptions, and missing operations were reported.
- [ ] Fixtures are deterministic and contain no sensitive data.
- [ ] Every served fixture passes schema and business-rule validation.
- [ ] Every handler checks method and relevant input.
- [ ] Fail-closed covers the identified API boundary.
- [ ] Stateful data is isolated per test.
- [ ] Tests do not derive assertions from fixture objects.
- [ ] Generated TypeScript passes type checking.
- [ ] Relevant Playwright tests pass.
- [ ] Provider verification is recorded or marked `not-run`.

## Final report

Report:

1. swagger-parser handoff status and whether remote refresh succeeded or cache was used;
2. cached contract path, version, and hash;
3. endpoints and scenarios generated or updated;
4. conflicts and assumptions;
5. schema and business-rule validation results;
6. type checks and tests executed;
7. provider-verification status;
8. remaining risks or unsupported frontend request paths.
