# Basis for Classifying TestIt Cases by Test Type

Classify a case by its primary risk, not by the tool name. Relevant risks are broken UI-component/state integration, a visual chart or layout change, a failed external contract/API/document/email flow, changed static content, missing UI, or the need for manual business acceptance. Mark multiple substantial risks as `hybrid`, choose an automation recommendation, and preserve the others as secondary tags.

## Frontend integration

Use when frontend components work together in a controlled environment: there is a click, text entry, tab or period selection, or form submission; the result is observable in the DOM, URL, ARIA, form state, table, or error status; and external dependencies are mocked or unnecessary. Prefer observable assertions such as `getByRole`, `getByLabel`, `getByText`, `toHaveURL`, `toHaveText`, `toHaveValue`, `toBeVisible`, `toHaveCount`, and `toHaveAttribute`.

Examples include news pagination, opening a news card, entering invalid dates, rebuilding a table, clicking a logo to return home, and checking a `tel:` link.

## Visual regression

Use when the expected result is primarily visual and cannot be proved by one DOM locator—for example, a chart renders, a second curve appears, a timeline matches dates, an element occupies a viewport area, cards are horizontal, a banner appears, a date is highlighted, or a calendar panel opens. First assert a DOM or geometric signal, then use `expect(locator).toHaveScreenshot(...)`; prefer the narrowest relevant container.

## E2E / contract

Use `e2e-contract` for an external system or a real end-to-end process: a real form submission, incoming email, request sent to an external system, file download, external document, real backend/test environment, or several systems at once. It also applies when the frontend/API request-response contract, payload, status, or schema is the primary concern and the UI is secondary.

## Content regression

Use when the main purpose is static text, legal meaning, date, heading, or marketing description. Signals include a request to verify exact text, a heading or field value, with no meaningful action beyond opening or scrolling and no component interaction. Playwright may run these tests, but they are not frontend integration tests.

## Navigation / routing

This is a frontend-integration subtype for client navigation: clicking a link, card, logo, or menu item; asserting the URL; or asserting the destination heading/page with no external-service dependency. A transition to an external document or download is `e2e-contract`.

## Validation / form state

This is a frontend-integration subtype for local form behavior: entering a value, validation error, button enabled/disabled state, local success state, and mocked network. A real email or an external-system submission makes `e2e-contract` the primary type.

## Fixme / manual until implemented

Use when the UI entity does not exist or the TestIt wording is too vague: no route, page, block, section, field, link, form, data, or calculation formula; a criterion such as “all elements are present” without listing them; or validation requires a person or product implementation. Create `test.fixme` with the TestIt ID and reason instead of a passing test for an unrelated entity.

## Useful markers

| TestIt marker | Suggested type |
| --- | --- |
| chart, curve, timeline, sliders, highlighted date, calendar panel | `visual-regression` |
| table, row, column, period, dates, error | `integration` or `validation-form-state` |
| email arrives, successful message submission, request submitted | `e2e-contract` |
| download file, open online, document | `e2e-contract` |
| correct value, text correctness, correct name, description | `content-regression` |
| clickability, navigation, page opened, back arrow, logo | `navigation-routing` or `integration` |
| banner exists, element in viewport, horizontal layout | `visual-regression` |
| “all elements are present” without an element list | `fixme-manual` |

## Manual overrides

The classifier normally derives the type from TestIt text, directories, expected results, and application code. In ambiguous cases, allow `@type: visual`, `@type: integration`, `@type: content`, `@type: contract`, `@type: e2e`, `@type: fixme`, `@requires: real-email`, `@requires: external-document`, and `@requires: implemented-ui`.
