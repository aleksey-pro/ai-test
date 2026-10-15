/**
 * Playwright API-моки для Contrada Frontend.
 *
 * @provenance
 * source: swagger.json (https://contrada-back-test.sovcombank.ru/docs?api-docs.json)
 * generatedAt: 2026-08-28T12:00:00Z
 * seed: 481516
 *
 * АРХИТЕКТУРА:
 * - Playwright context.route() (НЕ MSW)
 * - Fail-closed: catch-all route регистрируется ПЕРВЫМ
 * - Stateful: только для мутаций (subscriptions, feedback_forms)
 * - URL patterns: /api/v1/* (server) и /client/* (client proxy)
 */

import type { Page, Route } from '@playwright/test';
import type { MockState } from './fixture';
import {
  addSubscription,
  findSubscription,
  normalizeEmail,
  recordFeedback,
  removeSubscription,
} from './stateful';
import {
  newsFixtures,
  pageFixtures,
  graphFixtures,
  subscriptionFixtures,
  feedbackFormFixtures,
  bannerFixtures,
  contactFixtures,
  settingsFixtures,
  top10Fixtures,
  aboutFixtures,
  healthcheckFixtures,
  MOCK_NOW,
} from './generated/fixtures';

export { expect, test } from './fixture';

// ============================================================
// URL PATTERNS
// ============================================================

/**
 * Паттерны URL для моков.
 *
 * Frontend использует два baseURL:
 * - serverRequest: ${API_URL}/api/v1/...  (прямой запрос к бэкенду)
 * - clientRequest: ${HOST}/client/...      (через Next.js proxy)
 *
 * В Playwright мы мокаем ОБА варианта.
 */
const URL_PATTERNS = {
  // Server (прямой запрос)
  server: {
    news: /\/api\/v1\/news(\?.*)?$/,
    newsBySlug: /\/api\/v1\/news\/([^/]+)(\?.*)?$/,
    pages: /\/api\/v1\/pages\/([^/]+)(\?.*)?$/,
    graphs: /\/api\/v1\/graphs(\?.*)?$/,
    graphsByType: /\/api\/v1\/graphs\/type\/([^/]+)(\?.*)?$/,
    subscriptions: /\/api\/v1\/subscriptions(\?.*)?$/,
    unsubscribe: /\/api\/v1\/unsubscribe(\?.*)?$/,
    feedbackForms: /\/api\/v1\/feedback_forms(\?.*)?$/,
    banners: /\/api\/v1\/banners(\?.*)?$/,
    contacts: /\/api\/v1\/contacts(\?.*)?$/,
    settings: /\/api\/v1\/settings(\?.*)?$/,
    top10: /\/api\/v1\/top10(\?.*)?$/,
    about: /\/api\/v1\/about(\?.*)?$/,
    healthcheck: /\/api\/v1\/healthcheck(\?.*)?$/,
    issuers: /\/api\/v1\/issuers(\?.*)?$/,
    licenses: /\/api\/v1\/licenses(\?.*)?$/,
    menuItems: /\/api\/v1\/menu_items(\?.*)?$/,
    sideMenu: /\/api\/v1\/side_menu(\?.*)?$/,
    textBlocks: /\/api\/v1\/text_blocks(\?.*)?$/,
    textImageBlocks: /\/api\/v1\/text_image_blocks(\?.*)?$/,
    specifications: /\/api\/v1\/specifications(\?.*)?$/,
    tables: /\/api\/v1\/tables(\?.*)?$/,
    docs: /\/api\/v1\/docs(\?.*)?$/,
    tabs: /\/api\/v1\/tabs(\?.*)?$/,
    mainPageElements: /\/api\/v1\/main_page_elements(\?.*)?$/,
    iconBlocks: /\/api\/v1\/icon_blocks(\?.*)?$/,
    requisites: /\/api\/v1\/requisites(\?.*)?$/,
    chart: /\/api\/v1\/chart(\?.*)?$/,
  },
  // Client (через Next.js proxy)
  client: {
    news: /\/client\/news(\?.*)?$/,
    newsBySlug: /\/client\/news\/([^/]+)(\?.*)?$/,
    pages: /\/client\/pages\/([^/]+)(\?.*)?$/,
    graphs: /\/client\/graphs(\?.*)?$/,
    graphsByType: /\/client\/graphs\/type\/([^/]+)(\?.*)?$/,
    subscriptions: /\/client\/subscriptions(\?.*)?$/,
    unsubscribe: /\/client\/unsubscribe(\?.*)?$/,
    feedbackForms: /\/client\/feedback_forms(\?.*)?$/,
    banners: /\/client\/banners(\?.*)?$/,
    contacts: /\/client\/contacts(\?.*)?$/,
    settings: /\/client\/settings(\?.*)?$/,
    top10: /\/client\/top10(\?.*)?$/,
    about: /\/client\/about(\?.*)?$/,
    healthcheck: /\/client\/healthcheck(\?.*)?$/,
  },
} as const;

// ============================================================
// MOCK REGISTRATION
// ============================================================

/**
 * Регистрирует все API-моки для страницы.
 *
 * ВАЖНО: fail-closed route регистрируется ПЕРВЫМ,
 * чтобы Playwright проверял его ПОСЛЕДНИМ (reverse order).
 *
 * @param page - Playwright Page
 * @param state - stateful хранилище
 * @param options - опции моков
 */
export async function registerApiMocks(
  page: Page,
  state: MockState,
  options: {
    /** Сценарий для новостей: "success" | "empty" | "notFound" */
    newsScenario?: 'success' | 'empty' | 'notFound';
    /** Сценарий для страниц: "success" | "notFound" */
    pageScenario?: 'success' | 'notFound';
    /** Сценарий для графиков: "success" | "empty" */
    graphScenario?: 'success' | 'empty';
    /** Задержка ответа в мс (для тестирования loading states) */
    delay?: number;
    /** Код ошибки для fail-closed (по умолчанию 500) */
    failClosedStatus?: number;
  } = {}
): Promise<void> {
  const {
    newsScenario = 'success',
    pageScenario = 'success',
    graphScenario = 'success',
    delay = 0,
    failClosedStatus = 500,
  } = options;

  // ----------------------------------------------------------
  // 1. FAIL-CLOSED (регистрируется ПЕРВЫМ = проверяется ПОСЛЕДНИМ)
  // ----------------------------------------------------------
  await page.route(
    (url) => url.pathname.startsWith('/api/') || url.pathname.startsWith('/client/'),
    async (route: Route) => {
      const url = route.request().url();
      const method = route.request().method();

      // API-запрос без мока → ошибка
      return route.fulfill({
        status: failClosedStatus,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'UNMOCKED_API_REQUEST',
          message: `API request not mocked: ${method} ${url}`,
          hint: 'Add a mock for this endpoint in handlers.ts',
        }),
      });
    },
  );

  // ----------------------------------------------------------
  // 2. NEWS (Новости)
  // ----------------------------------------------------------

  // GET /api/v1/news — список новостей
  const newsPattern = new RegExp(
    `(${URL_PATTERNS.server.news.source}|${URL_PATTERNS.client.news.source})`
  );
  await page.route(newsPattern, async (route: Route) => {
    if (route.request().method() !== 'GET') return route.fallback();
    if (delay) await new Promise((r) => setTimeout(r, delay));

    const scenario = newsFixtures[newsScenario];
    return route.fulfill({
      status: newsScenario === 'notFound' ? 404 : 200,
      contentType: 'application/json',
      body: JSON.stringify(scenario),
    });
  });

  // GET /api/v1/news/:slug — новость по slug
  const newsSlugPattern = new RegExp(
    `(${URL_PATTERNS.server.newsBySlug.source}|${URL_PATTERNS.client.newsBySlug.source})`
  );
  await page.route(newsSlugPattern, async (route: Route) => {
    if (route.request().method() !== 'GET') return route.fallback();
    if (delay) await new Promise((r) => setTimeout(r, delay));

    const url = route.request().url();
    const slugMatch = url.match(/\/news\/([^/?]+)/);
    const slug = slugMatch?.[1];

    // Ищем новость по slug
    const newsItem = newsFixtures.success.data.find((n) => n.name === slug);

    if (!newsItem) {
      return route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Not Found' }),
      });
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: newsItem }),
    });
  });

  // ----------------------------------------------------------
  // 3. PAGES (Страницы)
  // ----------------------------------------------------------

  const pagePattern = new RegExp(
    `(${URL_PATTERNS.server.pages.source}|${URL_PATTERNS.client.pages.source})`
  );
  await page.route(pagePattern, async (route: Route) => {
    if (route.request().method() !== 'GET') return route.fallback();
    if (delay) await new Promise((r) => setTimeout(r, delay));

    if (pageScenario === 'notFound') {
      return route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify(pageFixtures.notFound),
      });
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(pageFixtures.success),
    });
  });

  // ----------------------------------------------------------
  // 4. GRAPHS (Графики)
  // ----------------------------------------------------------

  const graphPattern = new RegExp(
    `(${URL_PATTERNS.server.graphs.source}|${URL_PATTERNS.client.graphs.source})`
  );
  await page.route(graphPattern, async (route: Route) => {
    if (route.request().method() !== 'GET') return route.fallback();
    if (delay) await new Promise((r) => setTimeout(r, delay));

    const scenario = graphFixtures[graphScenario];
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(scenario),
    });
  });

  const graphTypePattern = new RegExp(
    `(${URL_PATTERNS.server.graphsByType.source}|${URL_PATTERNS.client.graphsByType.source})`
  );
  await page.route(graphTypePattern, async (route: Route) => {
    if (route.request().method() !== 'GET') return route.fallback();
    if (delay) await new Promise((r) => setTimeout(r, delay));

    const scenario = graphFixtures[graphScenario];
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(scenario),
    });
  });

  // ----------------------------------------------------------
  // 5. SUBSCRIPTIONS (Подписки) — STATEFUL
  // ----------------------------------------------------------

  const subPattern = new RegExp(
    `(${URL_PATTERNS.server.subscriptions.source}|${URL_PATTERNS.client.subscriptions.source})`
  );
  await page.route(subPattern, async (route: Route) => {
    if (delay) await new Promise((r) => setTimeout(r, delay));

    if (route.request().method() !== 'POST') {
      return route.fulfill({
        status: 405,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Method Not Allowed' }),
      });
    }

    const body = route.request().postDataJSON() as { email?: string };

    // Валидация
    if (!body?.email) {
      return route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify(subscriptionFixtures.validation),
      });
    }

    // Stateful: проверка на дубликат
    const normalizedEmail = normalizeEmail(body.email);
    if (findSubscription(state, normalizedEmail)) {
      return route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify(subscriptionFixtures.duplicate),
      });
    }

    // Успешная подписка
    addSubscription(state, {
      id: subscriptionFixtures.success.subscription_id,
      email: body.email,
      createdAt: MOCK_NOW,
    });

    return route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify(subscriptionFixtures.success),
    });
  });

  // POST /api/v1/unsubscribe — отписка
  const unsubPattern = new RegExp(
    `(${URL_PATTERNS.server.unsubscribe.source}|${URL_PATTERNS.client.unsubscribe.source})`
  );
  await page.route(unsubPattern, async (route: Route) => {
    if (delay) await new Promise((r) => setTimeout(r, delay));

    if (route.request().method() !== 'POST') {
      return route.fulfill({
        status: 405,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Method Not Allowed' }),
      });
    }

    const body = route.request().postDataJSON() as { email?: string };

    // Stateful: проверка, что подписка существует
    const normalizedEmail = body?.email ? normalizeEmail(body.email) : undefined;
    if (!normalizedEmail || !findSubscription(state, normalizedEmail)) {
      return route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify(subscriptionFixtures.unsubscribeNotFound),
      });
    }

    // Успешная отписка
    removeSubscription(state, normalizedEmail);

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(subscriptionFixtures.unsubscribeSuccess),
    });
  });

  // ----------------------------------------------------------
  // 6. FEEDBACK FORMS (Формы) — STATEFUL
  // ----------------------------------------------------------

  const fbPattern = new RegExp(
    `(${URL_PATTERNS.server.feedbackForms.source}|${URL_PATTERNS.client.feedbackForms.source})`
  );
  await page.route(fbPattern, async (route: Route) => {
    if (delay) await new Promise((r) => setTimeout(r, delay));

    const method = route.request().method();

    if (method === 'GET') {
      // Список форм
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(feedbackFormFixtures.list),
      });
    }

    if (method === 'POST') {
      // Отправка формы
      const body = route.request().postDataJSON() as {
        email?: string;
        name?: string;
        message?: string;
      };

      // Валидация
      if (!body?.email) {
        return route.fulfill({
          status: 422,
          contentType: 'application/json',
          body: JSON.stringify(feedbackFormFixtures.submitValidation),
        });
      }

      // Stateful: отметка об отправке
      recordFeedback(state, body.email, MOCK_NOW);

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(feedbackFormFixtures.submitSuccess),
      });
    }

    return route.fulfill({
      status: 405,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    });
  });

  // ----------------------------------------------------------
  // 7. BANNERS
  // ----------------------------------------------------------

  const bannerPattern = new RegExp(
    `(${URL_PATTERNS.server.banners.source}|${URL_PATTERNS.client.banners.source})`
  );
  await page.route(bannerPattern, async (route: Route) => {
    if (route.request().method() !== 'GET') return route.fallback();
    if (delay) await new Promise((r) => setTimeout(r, delay));

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(bannerFixtures.success),
    });
  });

  // ----------------------------------------------------------
  // 8. CONTACTS
  // ----------------------------------------------------------

  const contactPattern = new RegExp(
    `(${URL_PATTERNS.server.contacts.source}|${URL_PATTERNS.client.contacts.source})`
  );
  await page.route(contactPattern, async (route: Route) => {
    if (route.request().method() !== 'GET') return route.fallback();
    if (delay) await new Promise((r) => setTimeout(r, delay));

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(contactFixtures.success),
    });
  });

  // ----------------------------------------------------------
  // 9. SETTINGS
  // ----------------------------------------------------------

  const settingsPattern = new RegExp(
    `(${URL_PATTERNS.server.settings.source}|${URL_PATTERNS.client.settings.source})`
  );
  await page.route(settingsPattern, async (route: Route) => {
    if (route.request().method() !== 'GET') return route.fallback();
    if (delay) await new Promise((r) => setTimeout(r, delay));

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(settingsFixtures.success),
    });
  });

  // ----------------------------------------------------------
  // 10. TOP10 (Эмитенты)
  // ----------------------------------------------------------

  const top10Pattern = new RegExp(
    `(${URL_PATTERNS.server.top10.source}|${URL_PATTERNS.client.top10.source})`
  );
  await page.route(top10Pattern, async (route: Route) => {
    if (route.request().method() !== 'GET') return route.fallback();
    if (delay) await new Promise((r) => setTimeout(r, delay));

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(top10Fixtures.success),
    });
  });

  // ----------------------------------------------------------
  // 11. ABOUT
  // ----------------------------------------------------------

  const aboutPattern = new RegExp(
    `(${URL_PATTERNS.server.about.source}|${URL_PATTERNS.client.about.source})`
  );
  await page.route(aboutPattern, async (route: Route) => {
    if (route.request().method() !== 'GET') return route.fallback();
    if (delay) await new Promise((r) => setTimeout(r, delay));

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(aboutFixtures.success),
    });
  });

  // ----------------------------------------------------------
  // 12. HEALTHCHECK
  // ----------------------------------------------------------

  const healthPattern = new RegExp(
    `(${URL_PATTERNS.server.healthcheck.source}|${URL_PATTERNS.client.healthcheck.source})`
  );
  await page.route(healthPattern, async (route: Route) => {
    if (route.request().method() !== 'GET') return route.fallback();
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(healthcheckFixtures.success),
    });
  });
}
