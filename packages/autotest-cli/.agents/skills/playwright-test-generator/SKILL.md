---
name: playwright-test-generator
description: Generate Playwright tests from TestIt test cases. Use when the user wants Playwright tests generated from TestIt Markdown cases in an input directory, including classified directories such as autotest-cli-data/test-cases/testit/integration. Require a playwright-test-precheck report first; use its report and assumptions without rerunning the pre-check. Always use playwright-best-practices while writing tests.
---

# Playwright Test Generator

Generate Playwright tests from TestIt cases.

## Required prerequisite

Before writing tests, read and apply `playwright-best-practices`, especially its guidance on [locators](../playwright-best-practices/core/locators.md), [assertions and waiting](../playwright-best-practices/core/assertions-waiting.md), [test-suite structure](../playwright-best-practices/core/test-suite-structure.md), [annotations](../playwright-best-practices/core/annotations.md), and [tags](../playwright-best-practices/core/test-tags.md). Use appropriate timeouts.

`playwright-test-precheck` must have produced `precheck-summary` and an Evidence manifest before any `.spec.ts` file is created or updated. If either is unavailable, return to pre-check. Do not perform an independent contradiction analysis or invent locators, URLs, API fields, or observable states not supported by the manifest.

## Inputs and outputs

Read `.md` files from the supplied `input-dir`, or from `autotest-cli-data/test-cases/testit` by default. Files normally follow `ca-{number}-{description}.md` and contain TestIt IDs, UUIDs, titles, status, priority, type, duration, table-form steps, and tags. Treat each input file as the cases for one task.

Create one corresponding test file per input file in `autotest-cli-data/tests/`, preserving the stem and using `.spec.ts`, for example `ca-624-download-excel-button.spec.ts`. Report pre-check risks to the orchestrator for the consolidated final report.

## Generation process

1. List all `.md` files in `input-dir`. When invoked by `tests-automatization`, it is typically a classified type directory such as `autotest-cli-data/test-cases/testit/integration`.
2. Parse every case and its steps.
3. Load `precheck-summary` and the Evidence manifest.
4. For each test step, find the matching manifest record. For `grounded` evidence, generate only its documented action and assertion. For noted or invalid evidence, follow the pre-check status and assumptions rather than guessing.
5. Generate one `.spec.ts` file per input file and save it in `autotest-cli-data/tests/`.
6. Process large batches in small groups and clear accumulated context when `clear-context` is available.

## Test-writing guidance

Use `test.describe()` for a TestIt suite and one `test()` for each TestIt case. Keep the TestIt ID in the test title. Prefer `data-testid`, role, label, and text locators; avoid positional selectors. Use `await expect()` with meaningful assertions and wait for asynchronous work without fixed sleeps. Parameterize cases that differ only by data. Reset state between tests when needed and use `beforeEach()` for shared setup.

Use Playwright facilities appropriate to the evidence: `toHaveScreenshot()` for visual checks, routing/interception for API behavior, the download API for files, and `page.on('dialog')` for dialogs. Respect `playwright.config.ts`, including `baseURL`, supported browser projects, and desktop/tablet/mobile viewports.

Keep any unresolved or non-observable TestIt requirement visible as a risk or `test.fixme`; never silently replace it with a different assertion.
