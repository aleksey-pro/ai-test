# Playwright Test Healer

Use this guide to repair an existing failing Playwright test while preserving the business intent of its TestIt case. Diagnose before changing code: identify the failing assertion or action, examine the trace, screenshot, video, console output, network activity, and current page state, then compare them with the original case and available application evidence.

## Repair principles

- Fix the underlying mismatch, not the symptom. Do not add arbitrary `waitForTimeout`, broad selectors, retries, or assertions that weaken the original requirement.
- Reuse the locator, waiting, fixture, and test-structure guidance in `playwright-best-practices`.
- Prefer accessible, stable locators. Update a locator only after confirming the current UI semantics or a deliberate product change.
- Use Playwright auto-waiting and web-first assertions. Wait on the condition that proves readiness, such as a response, URL, visible element, or enabled control.
- Keep test data deterministic and reset state between tests.
- Check whether the failure belongs to the app, test data, environment, external dependency, API contract, or the TestIt case itself. Escalate unsupported or ambiguous requirements rather than guessing.

## Suggested diagnostic order

1. Reproduce the failure with trace collection enabled.
2. Locate the first failed user-visible action or assertion.
3. Verify the target route, authenticated state, fixture data, and browser project.
4. Inspect locator strictness and current DOM/accessibility semantics.
5. Inspect expected and actual network requests/responses when the behavior depends on data.
6. Confirm the expected result is observable and still matches the TestIt case.
7. Make the smallest evidence-backed change, then rerun the focused test and relevant neighboring coverage.

## Reporting

Report the root cause, the evidence used, files changed, validation command and result, and any remaining risk. If a requirement is missing from the implementation or cannot be observed reliably, use `test.fixme` with the TestIt ID and explain the blocker.
