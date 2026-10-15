# Integration Tests — Definition

## Simple Rule

**An integration test is a test with a user action.**

A test is an integration test if it contains at least one user action:

- Clicking an element
- Entering text
- Navigating (going to another page or opening a link)
- Selecting an item from a list or menu
- Drag and drop
- Submitting a form

**A non-integration test contains checks only.**

A test is not an integration test if it only checks:

- “Check that it exists”
- “Check that it is displayed”
- “Check the text”
- “Make sure the element is visible”

## Examples

### ❌ Non-integration tests (exclude)

- “Check the full name in English”
- “Check that the heading exists”
- “Check the correct phone number”
- “Check the address”
- “Main banner: verify the text”

### ✅ Integration tests (keep)

- “Submit a request using the button”
- “Follow a link”
- “Fill in and submit a form”
- “News block is clickable”
- “Successfully submit a newsletter subscription”

## Detailed Description

Integration tests verify the interaction between system components in conditions as close as possible to the real environment. They simulate user behavior and verify that the system works as a whole.

In the Playwright context, these are tests that:

1. Run in a real browser, headless or headed.
2. Simulate user actions.
3. Verify the result of those actions.

### Indicators of an integration test

- It contains clicks, text entry, or navigation.
- It verifies the outcome of a user action.
- It tests a user scenario.

### Indicators of a non-integration test

- It only checks rendering.
- It contains no user actions.
- It tests an isolated element without context.
