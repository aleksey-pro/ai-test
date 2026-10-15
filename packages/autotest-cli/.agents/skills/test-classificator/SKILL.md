---
name: test-classificator
description: Classify TestIt Markdown test cases by frontend testing type and move them into integration, visual-regression, e2e-contract, content-regression, validation-form-state, navigation-routing, fixme-manual, or hybrid directories. Use after exporting TestIt cases and before playwright-test-precheck or playwright-test-generator, especially when the user selects a test type to generate or run.
---

# Test Classificator

Sort TestIt `.md` files by testing type rather than business entity to prepare the input directory for Playwright test generation.

## Reference

Before classifying, read [test-classification-basis.md](references/test-classification-basis.md). It defines the signals for each type and hybrid cases.

## When to run

Run after TestIt cases appear in the source directory (normally after `testit-extractor`) and before:

1. `playwright-test-precheck`;
2. `playwright-test-generator`;
3. `playwright-test-healer`.

Classify the whole set before selecting one type for downstream generation.

## Inputs and move semantics

| Parameter | Default | Purpose |
| --- | --- | --- |
| `input-dir` / `cases-dir` | `autotest-cli-data/test-cases/testit` | Source directory with TestIt `.md` files. |
| `test-type` / `target-test-type` | `integration` | Type that will be generated and run next. |
| `file` / `case-file` | none | Limit classification to one file. |

Always move, never copy, a source case. Resolve source and destination paths before moving so each case exists in exactly one type directory. Create type directories directly under `input-dir`; do not create `.classified`.

| Canonical type | Directory |
| --- | --- |
| `integration` | `integration/` |
| `visual-regression` | `visual-regression/` |
| `e2e-contract` | `e2e-contract/` |
| `content-regression` | `content-regression/` |
| `validation-form-state` | `validation-form-state/` |
| `navigation-routing` | `navigation-routing/` |
| `fixme-manual` | `fixme-manual/` |
| `hybrid` | `hybrid/` |

Exclude all top-level type directories while discovering source `.md` files; otherwise repeated runs can create paths such as `integration/integration/`.

Normalize aliases: `frontend`, `frontend-integration`, and `front-integration` → `integration`; `visual`, `snapshot`, `snapshots`, and `visual-snapshot` → `visual-regression`; `e2e`, `contract`, `api-contract`, and `download` → `e2e-contract`; `content`, `texts`, and `static-content` → `content-regression`; `validation`, `forms`, and `form-state` → `validation-form-state`; `navigation`, `routing`, and `routes` → `navigation-routing`; `manual`, `fixme`, and `missing-ui` → `fixme-manual`.

## Classification procedure

For every file, inspect its name, headings, TestIt ID, steps, expected results, tags, and any override markers:

- `@type: visual`, `@type: integration`, `@type: content`, `@type: contract`, `@type: e2e`, or `@type: fixme`;
- `@requires: real-email`, `@requires: external-document`, or `@requires: implemented-ui`.

Use an override as the primary type except where it conflicts with environment availability or safety; report that conflict. Without an override, use the primary risk from the reference. Put cases with equally important risks in `hybrid/` and report a primary recommendation. Do not split a file containing cases of different types; preserve its source relationship by placing it in `hybrid/`.

Choose primary risk in this order:

1. External system, real email, download, external document, or API contract → `e2e-contract`.
2. Visual result such as a chart, line, layout, highlighting, or viewport area → `visual-regression`.
3. Static legal, marketing, or news text → `content-regression`.
4. Local form validation, disabled/enabled state, or local success/error state → `validation-form-state`.
5. Internal navigation, URL, or page state after a click → `navigation-routing`.
6. Ordinary frontend interaction with DOM, URL, tables, or state → `integration`.
7. Missing UI/data/formula or an overly vague criterion → `fixme-manual`.

Treat `navigation-routing` and `validation-form-state` as specialized integration subtypes, but keep their physical directories separate for targeted runs.

## Result and handoff

Move each selected file to `<input-dir>/<type>/<relative-source-path>`. Do not create a separate report file. Return a concise summary to the caller with the input directory, counts by type, the directory for the selected type, and skipped files, conflicts, or hybrid/fixme/manual risks.

Return:

```text
selected-input-dir: <input-dir>/<target-test-type>
classification-summary: <type/count table>
classification-risks: <short risk list or none>
```

`playwright-test-precheck` and `playwright-test-generator` should then use only `selected-input-dir`, unless the user requests a different type or the entire set.
