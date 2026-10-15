import { expect, test as base } from '@playwright/test';

export type Subscription = {
  id: string;
  email: string;
  createdAt: string;
};

export type FeedbackSubmission = {
  email: string;
  submittedAt: string;
};

export type MockState = {
  subscriptions: Map<string, Subscription>;
  feedback: FeedbackSubmission[];
};

export const test = base.extend<{ mockState: MockState }>({
  mockState: async ({}, use) => {
    const state: MockState = {
      subscriptions: new Map(),
      feedback: [],
    };
    await use(state);
    state.subscriptions.clear();
    state.feedback.length = 0;
  },
});

export { expect };
