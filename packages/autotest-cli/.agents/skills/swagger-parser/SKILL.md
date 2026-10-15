---
name: swagger-parser
description: Fetch, cache, validate, and normalize Swagger/OpenAPI documentation from a required URL for downstream mock generation and contract analysis. Use this skill whenever a user provides a Swagger/OpenAPI URL, asks to inspect API operations or schemas, or when mock-generator needs its required contract-acquisition and parsing stage.
argument-hint: "[swagger-url]"
---

# Swagger/OpenAPI Parser

Fetch and normalize a Swagger/OpenAPI document supplied through the required `swaggerUrl` argument. The main agent executes this workflow and produces a stable handoff for `mock-generator`.

## Inputs

| Input | Required | Default | Purpose |
| --- | --- | --- | --- |
| `swaggerUrl` | Yes | none | Direct specification URL or Swagger UI URL |
| `outputDir` | No | `autotest-cli-data/contracts` | Contract cache and normalized output |
| `projectName` | No | repository name | Provenance only |

If `swaggerUrl` is missing, stop and request it. Do not silently use a project-specific URL inside this skill.

## Output contract

Produce:

```text
autotest-cli-data/contracts/
├── swagger.json
├── swagger-parsed.json
└── contract-metadata.json
```

- `swagger.json` is the validated canonical source used by runtime schema validation.
- `swagger-parsed.json` is a normalized index used by `mock-generator`.
- `contract-metadata.json` records refresh, hash, parsing, and fallback provenance.

Never treat `swagger-parsed.json` as a replacement for the original contract.

## Required flow

### 1. Resolve the specification URL

If `swaggerUrl` already returns JSON or YAML OpenAPI content, use it directly.

If it points to Swagger UI:

1. fetch the UI without executing arbitrary page scripts;
2. inspect same-origin configuration such as `url`, `urls`, `configUrl`, or embedded Swagger UI initialization;
3. resolve relative URLs against the UI URL;
4. if configuration is unavailable, try conservative same-origin candidates such as `/openapi.json`, `/swagger.json`, `/api-docs`, and `/v3/api-docs`;
5. report all attempted URLs if resolution fails.

Do not follow a discovered cross-origin specification URL unless the user supplied or explicitly approved that origin. Do not send repository credentials, cookies, or authorization headers unless the user explicitly placed them in scope.

### 2. Fetch into a temporary file

Do not download directly over `autotest-cli-data/contracts/swagger.json`.

- use a bounded timeout and redirect count;
- require a successful HTTP status;
- apply a reasonable response-size limit;
- record final URL, status, content type, ETag, and Last-Modified when available;
- reject empty responses and HTML login/error pages.

If network access is blocked, follow the environment approval flow once. A repeated network failure is a normal cache-fallback condition, not a reason to fabricate a contract.

### 3. Parse and validate the candidate

Support JSON and YAML input, but write canonical JSON to `swagger.json`.

Accept:

- Swagger 2.0 through root `swagger: "2.0"`;
- OpenAPI 3.0 and 3.1 through root `openapi`.

Require:

- an object root;
- `info` object;
- a non-empty `paths` object;
- recognized operation methods;
- structurally valid path items and responses.

Validate the document with a compatible OpenAPI parser/validator already installed when possible. If a new dependency is needed, explain it and follow dependency-installation approval rules.

Report JSON/YAML line, column, or JSON pointer for parse failures. Never overwrite a valid cache with an invalid candidate.

### 4. Handle references safely

Index local references under:

- OpenAPI 3.x: `components.schemas`, `components.parameters`, `components.responses`, `components.requestBodies`, `components.headers`, and `components.securitySchemes`;
- Swagger 2.0: `definitions`, `parameters`, `responses`, and `securityDefinitions`.

Resolve local `$ref` values recursively with cycle detection. Preserve the original `$ref` next to any resolved representation so provenance is not lost.

For external references:

- resolve same-origin references when safe and needed;
- require explicit approval for cross-origin references;
- detect cycles and depth/size explosions;
- record unresolved references instead of silently dropping them.

### 5. Refresh the cache or fall back

Hash the canonical candidate content with SHA-256.

If the candidate is valid:

1. compare it with the existing `swagger.json` hash;
2. update `swagger.json` safely only after validation;
3. regenerate `swagger-parsed.json` when the hash changed or normalized output is missing;
4. update metadata even when content is unchanged, so the refresh attempt is traceable.

If remote resolution, fetch, or validation fails:

1. preserve all existing files;
2. validate the cached `swagger.json` using the same rules;
3. regenerate `swagger-parsed.json` from the cache if it is missing or stale;
4. return a successful cached handoff only when the cache is valid;
5. stop if both remote candidate and cache are invalid or absent.

There are no user-selectable execution modes. Remote refresh followed by validated cache fallback is the single flow.

## Normalize operations

For every recognized operation, preserve and normalize:

- path and uppercase method;
- operation ID, summary, description, tags, and deprecation status;
- merged path-level and operation-level parameters;
- parameter location, required flag, serialization style, schema, and examples;
- request body content types and schemas;
- every documented response status, including `default` and wildcard statuses;
- response headers, links, and content schemas;
- security requirements and servers/base URL;
- original JSON pointers.

Handle OpenAPI 3.x and Swagger 2.0 differences explicitly. Do not assume `application/json`; preserve every documented media type.

## Normalize schemas without weakening them

Preserve:

- type, format, title, description, and defaults;
- required, nullable, readOnly, writeOnly, and deprecated;
- enum, const, examples, and discriminator;
- minimum/maximum and exclusive bounds;
- min/max length, items, properties, pattern, and additional properties;
- `allOf`, `oneOf`, `anyOf`, and `not`;
- original `$ref` and source JSON pointer.

Do not flatten composition in a way that changes validation semantics.

## Extract constraints, not invented business rules

Create normalized constraints only from explicit evidence:

- schema formats, enums, patterns, bounds, required fields, and types;
- parameter requirements and serialization;
- response status documentation;
- unambiguous statements in descriptions.

Classify extracted knowledge as:

- `confirmed`: directly represented by schema or explicit prose;
- `derived`: mechanically derived without adding domain meaning;
- `assumption`: proposed for downstream review;
- `conflict`: sources inside the contract disagree.

Do not infer cross-field rules such as date ordering, email uniqueness, or mutation idempotency merely because related fields exist. `mock-generator` may combine confirmed contract constraints with project business documentation later.

## Identify mutation candidates carefully

Classify `PUT`, `PATCH`, and `DELETE` as mutation candidates.

Classify `POST` as a mutation candidate only when operation semantics indicate creation, update, deletion, submission, command execution, or another state change. A POST search/query endpoint is not automatically stateful.

Record:

- `mutationCandidate: boolean`;
- `statefulConfidence: confirmed | derived | assumption`;
- evidence such as operation ID, description, response status, or resource semantics.

The parser identifies candidates; `mock-generator` decides whether a stateful Playwright mock is useful.

## Normalized output shape

Write `swagger-parsed.json` with this top-level structure:

```json
{
  "meta": {
    "sourceUrl": "https://example.test/openapi.json",
    "finalUrl": "https://example.test/openapi.json",
    "contractHash": "sha256:...",
    "specification": "openapi",
    "specificationVersion": "3.1.0",
    "apiTitle": "Example API",
    "apiVersion": "1.0.0",
    "pathCount": 12,
    "operationCount": 18,
    "schemaCount": 24,
    "usedCachedContract": false
  },
  "servers": [],
  "tags": [],
  "operations": [],
  "schemas": {},
  "mutationCandidates": [],
  "constraints": [],
  "conflicts": [],
  "unresolvedReferences": []
}
```

Use arrays or maps consistently and keep ordering deterministic: path, then method, then schema name.

## Handoff to mock-generator

Return a handoff containing:

```json
{
  "status": "ready",
  "contractPath": "autotest-cli-data/contracts/swagger.json",
  "parsedPath": "autotest-cli-data/contracts/swagger-parsed.json",
  "metadataPath": "autotest-cli-data/contracts/contract-metadata.json",
  "contractHash": "sha256:...",
  "contractChanged": true,
  "usedCachedContract": false,
  "operationCount": 18,
  "unresolvedReferenceCount": 0,
  "warnings": []
}
```

Use `status: "blocked"` when no valid contract is available. `mock-generator` must not generate or claim schema-valid mocks from a blocked handoff.

## Completion checks

- [ ] `swaggerUrl` was explicitly provided by the user or caller.
- [ ] Remote content was fetched into a temporary location.
- [ ] Invalid or HTML content did not overwrite the cache.
- [ ] Swagger 2.0 or OpenAPI 3.x structure was validated.
- [ ] Cache fallback was validated before use.
- [ ] Canonical contract and normalized output hashes correspond.
- [ ] Local references were resolved with cycle detection.
- [ ] Unresolved external references were reported.
- [ ] Operations preserve all media types and documented responses.
- [ ] Constraints are sourced and classified.
- [ ] POST operations were not blindly marked stateful.
- [ ] Output ordering is deterministic.
- [ ] Handoff status and paths were reported.

## Final report

Report:

1. requested, resolved, and final specification URLs;
2. whether remote refresh succeeded or validated cache was used;
3. specification version, API version, and contract hash;
4. path, operation, schema, and mutation-candidate counts;
5. conflicts, warnings, and unresolved references;
6. generated file paths;
7. handoff status for `mock-generator`.
