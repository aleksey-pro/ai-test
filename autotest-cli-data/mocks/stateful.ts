import type { MockState, Subscription } from './fixture';

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function findSubscription(state: MockState, email: string): Subscription | undefined {
  return state.subscriptions.get(normalizeEmail(email));
}

export function addSubscription(state: MockState, subscription: Subscription): void {
  state.subscriptions.set(normalizeEmail(subscription.email), subscription);
}

export function removeSubscription(state: MockState, email: string): boolean {
  return state.subscriptions.delete(normalizeEmail(email));
}

export function recordFeedback(state: MockState, email: string, submittedAt: string): void {
  state.feedback.push({ email, submittedAt });
}
