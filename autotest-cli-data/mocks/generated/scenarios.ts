export type NewsScenario = 'success' | 'empty' | 'notFound';
export type PageScenario = 'success' | 'notFound';
export type GraphScenario = 'success' | 'empty';

export type MockScenarioName =
  | `news.${NewsScenario}`
  | `page.${PageScenario}`
  | `graph.${GraphScenario}`
  | 'subscription.success'
  | 'subscription.duplicate'
  | 'subscription.validation'
  | 'subscription.unsubscribe-success'
  | 'subscription.unsubscribe-not-found'
  | 'feedback.list'
  | 'feedback.submit-success'
  | 'feedback.submit-validation';

export type MockOptions = {
  newsScenario?: NewsScenario;
  pageScenario?: PageScenario;
  graphScenario?: GraphScenario;
  /** Fixed delay for an explicit loading-state test. */
  delay?: number;
  /** Response status for an API request not handled by a specific route. */
  failClosedStatus?: number;
};
