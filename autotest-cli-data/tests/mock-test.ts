import { test as base } from '../mocks/fixture';
import { registerApiMocks } from '../mocks/handlers';

/**
 * Test fixture for browser scenarios that must run with the generated API mocks.
 * Routes are installed before every test and state is isolated by mockState.
 */
export const test = base.extend<{ apiMocks: void }>({
  apiMocks: [
    async ({ page, mockState }, use) => {
      await registerApiMocks(page, mockState);
      await use();
    },
    { auto: true },
  ],
});

export { expect } from '../mocks/fixture';
