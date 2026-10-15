---
name: playwright-test-precheck
description: Validate TestIt Markdown cases against available application evidence before Playwright test generation. Use after test-classificator and before playwright-test-generator to identify unsupported steps, required assumptions, and traceable assertions.
---

# Playwright Test Pre-check

Assess whether TestIt cases can be turned into reliable Playwright tests before generation. This skill does not generate the test suite.

## Inputs and evidence

Read the selected TestIt Markdown input directory, normally a type directory produced by `test-classificator`. Inspect the application code, routes, rendered UI, existing tests, configuration, APIs, and any other artifacts available in the project. Do not treat a test-case phrase as proof that an element, URL, payload, or expected state exists.

For every TestIt step and expected result, record the concrete evidence that supports it: source file and relevant symbol, route, locator, API contract, existing assertion, or explicit lack of evidence. Distinguish facts from assumptions.

## Required outcome

Return `precheck-summary` with a status for every case:

- `valid` — every required action and observable assertion is supported by evidence;
- `valid-with-note` — generation may proceed only with documented assumptions or limitations;
- `invalid` — the case lacks the UI, data, contract, or observable outcome needed for a reliable test.

Also return an Evidence manifest mapping each TestIt step and expected result to the application evidence and planned Playwright action/assertion. Include a validity-risk table with case ID, issue, evidence, impact, and recommended next action.

## Rules

- Inspect recursively and do not fabricate locators, routes, network fields, test data, or application behavior.
- Mark unavailable UI, ambiguous expected results, external systems, real mail, downloads, visual-only expectations, missing test data, and unknown environments explicitly.
- Recommend the appropriate classification or test strategy when a requirement is visual, contract/E2E, content-only, validation-focused, navigation-focused, hybrid, or manual.
- Use `test.fixme` or block generation for unsupported cases rather than producing a misleading green test.
- Keep the report concise but traceable: the generator must be able to rely on it without repeating the analysis.

## Handoff

Pass `precheck-summary`, the Evidence manifest, and the consolidated risk list to `playwright-test-generator`. The generator may proceed only for `valid` and explicitly authorized `valid-with-note` cases.
