/**
 * Детерминированные fixtures для API-моков.
 *
 * @provenance
 * source: swagger.json (https://contrada-back-test.sovcombank.ru/docs?api-docs.json)
 * generatedAt: 2026-08-28T12:00:00Z
 * seed: 481516
 *
 * ПРАВИЛА:
 * - Все данные детерминированы (фиксированный seed, фиксированное время)
 * - Данные реалистичны (русские названия, корректные диапазоны)
 * - Семантические правила соблюдены (см. business-rules.ts)
 */

// ============================================================
// КОНСТАНТЫ
// ============================================================

/** Фиксированное "текущее время" для всех моков */
export const MOCK_NOW = '2026-08-28T12:00:00Z';

/** Фиксированная дата для графиков (DD.MM.YYYY) */
export const MOCK_GRAPH_DATE = '28.08.2026';

/** Базовый URL для пагинации */
const BASE_URL = 'https://contrada-back-test.sovcombank.ru';

// ============================================================
// УТИЛИТЫ
// ============================================================

/**
 * Детерминированный hash строки в число (для seed)
 */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Детерминированный UUID из seed
 */
export function stableUUID(seed: number, index: number = 0): string {
  const hex = Array.from({ length: 32 }, (_, position) =>
    (hashString(`${seed}:${index}:${position}`) % 16).toString(16),
  );

  // RFC 4122 version 4 shape with deterministic version and variant bits.
  hex[12] = '4';
  hex[16] = ((Number.parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);

  return [
    hex.slice(0, 8).join(''),
    hex.slice(8, 12).join(''),
    hex.slice(12, 16).join(''),
    hex.slice(16, 20).join(''),
    hex.slice(20, 32).join(''),
  ].join('-');
}

/**
 * Генерация детерминированного числа в диапазоне [min, max]
 */
export function seededNumber(seed: number, index: number, min: number, max: number, decimals: number = 2): number {
  const h = hashString(`${seed}-${index}-${min}-${max}`);
  const ratio = (h % 10000) / 10000;
  const value = min + ratio * (max - min);
  return parseFloat(value.toFixed(decimals));
}

// ============================================================
// NEWS (Новости)
// ============================================================

/**
 * @provenance
 * source: openapi#/paths/~1api~1v1~1news/get
 * schema: news_resource
 * rules: news-dates, is-active-string
 */
export const newsFixtures = {
  success: {
    data: [
      {
        id: stableUUID(481516, 1),
        name: 'reshenie-o-vyplate-dohoda',
        title: 'Решение о выплате дохода по ПИФ АКСИОМА',
        start_showing_at: '2026-08-28T06:00:00Z',
        finish_showing_at: '2026-09-28T06:00:00Z',
        published_at: '2026-08-28T09:00:00Z',
        is_active: '1',
        content: '<p>Управляющая компания «Контрада Капитал» приняла решение о выплате дохода по паевому инвестиционному фонду «АКСИОМА» в размере 2,5% от стоимости пая.</p><p>Выплата будет произведена в течение 5 рабочих дней.</p>',
        description: 'Управляющая компания приняла решение о выплате дохода по ПИФ АКСИОМА',
      },
      {
        id: stableUUID(481516, 2),
        name: 'mezhyachnyy-otchyot-za-iyul-2026',
        title: 'Ежемесячный отчёт за июль 2026 года',
        start_showing_at: '2026-08-05T06:00:00Z',
        finish_showing_at: '2026-09-05T06:00:00Z',
        published_at: '2026-08-05T10:00:00Z',
        is_active: '1',
        content: '<p>Представляем ежемесячный отчёт о деятельности паевых инвестиционных фондов за июль 2026 года.</p>',
        description: 'Ежемесячный отчёт о деятельности ПИФов за июль 2026',
      },
      {
        id: stableUUID(481516, 3),
        name: 'obnovlenie-uslovij-dogovora',
        title: 'Обновление условий договора доверительного управления',
        start_showing_at: '2026-08-01T06:00:00Z',
        finish_showing_at: '2026-08-31T06:00:00Z',
        published_at: '2026-08-01T08:00:00Z',
        is_active: '1',
        content: '<p>С 1 сентября 2026 года вступают в силу обновлённые условия договора доверительного управления.</p>',
        description: 'Обновление условий договора ДУ с 1 сентября 2026',
      },
    ],
    links: {
      first: `${BASE_URL}/api/v1/news?page=1`,
      last: `${BASE_URL}/api/v1/news?page=3`,
      prev: null,
      next: `${BASE_URL}/api/v1/news?page=2`,
    },
    meta: {
      current_page: 1,
      from: 1,
      last_page: 3,
      path: `${BASE_URL}/api/v1/news`,
      per_page: 10,
      to: 3,
      total: 27,
    },
  },

  empty: {
    data: [],
    links: {
      first: `${BASE_URL}/api/v1/news?page=1`,
      last: `${BASE_URL}/api/v1/news?page=1`,
      prev: null,
      next: null,
    },
    meta: {
      current_page: 1,
      from: null,
      last_page: 1,
      path: `${BASE_URL}/api/v1/news`,
      per_page: 10,
      to: null,
      total: 0,
    },
  },

  notFound: {
    message: 'Not Found',
  },
} as const;

// ============================================================
// PAGES (Страницы)
// ============================================================

/**
 * @provenance
 * source: openapi#/paths/~1api~1v1~1pages~1{id_or_name}/get
 * schema: PageResourceNew
 * rules: url-format
 */
export const pageFixtures = {
  success: {
    data: {
      id: stableUUID(481516, 10),
      parent_id: '0',
      name: 'bpif',
      title: 'ПИФ АКСИОМА',
      is_active: true,
      is_show_title: true,
      content: '<p>Паевой инвестиционный фонд «АКСИОМА» — фонд акций с выплатой дохода.</p>',
      start_showing_at: '2024-01-01T00:00:00Z',
      updated_at: '2026-08-20T10:00:00Z',
      finish_showing_at: '2099-12-31T00:00:00Z',
      product_type: 'pif',
      left_menu_off: false,
      url: '/inform/pif/bpif',
      show_in_main_menu: true,
      main_menu_order: 1,
      hide_url_sidebar: false,
      is_main: false,
      is_inform: true,
      is_report: false,
      seo_title: 'ПИФ АКСИОМА — паевой инвестиционный фонд акций',
      seo_description: 'Инвестиционный фонд акций с выплатой дохода. Доходность за 5 лет — 156%.',
      seo_keywords: 'ПИФ, акции, инвестиции, АКСИОМА, Контрада',
      seo_image: '/images/og_image.png',
      product_image: null,
      order_in_left_menu: 1,
      text_blocks: [
        {
          id: stableUUID(481516, 11),
          name: 'about-fund',
          title: 'О фонде',
          is_active: true,
          is_show_title: true,
          content: '<p>Фонд «АКСИОМА» инвестирует в акции российских компаний с устойчивой бизнес-моделью.</p>',
        },
      ],
      text_image_blocks: [],
      icon_blocks: [],
      profit_blocks: [
        {
          id: stableUUID(481516, 12),
          name: 'profit-5y',
          title: 'Доходность за 5 лет',
          is_active: '1',
          is_show_title: true,
          text: 'С 2021 по 2026 год',
          text_more: 'Подробнее о стратегии',
          url_more: '/inform/pif/bpif#strategy',
          text_button: 'Узнать больше',
          url_button: '/inform/pif/bpif#strategy',
          profit_value: 156.4,
          profit_text: '%',
        },
      ],
      doc_blocks: [
        {
          id: stableUUID(481516, 13),
          name: 'fund-docs',
          title: 'Документы фонда',
          is_active: true,
          is_show_title: true,
          documents: [
            {
              id: stableUUID(481516, 14),
              name: 'prospectus',
              title: 'Перспектива фонда',
              url: '/docs/prospectus-aksioma.pdf',
              file_size: '2.4 МБ',
            },
            {
              id: stableUUID(481516, 15),
              name: 'regulation',
              title: 'Правила доверительного управления',
              url: '/docs/regulation-aksioma.pdf',
              file_size: '1.8 МБ',
            },
          ],
        },
      ],
      top10: [],
      tabs: [],
      tab_blocks: [],
      tables: [],
      feedback_forms: [],
      banners: [],
      graphs: [
        {
          id: stableUUID(481516, 20),
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2026-08-28T06:00:00Z',
          name: 'aksioma-pie-price',
          type_name: 'pif',
          type_id: '1',
          type: { id: '1', name: 'pif', title: 'Паевой инвестиционный фонд' },
          is_active: true,
          title: 'Динамика стоимости пая',
          is_show_title: true,
          primary: {
            legend: 'Фонд акций с выплатой дохода (динамика стоимости пая)',
            points: [
              { date: '25.08.2026', nav: 2450000000, changePriceOfActive: 0.3, piePrice: 12450.5, prevPriceOfPie: 0.15, payout: false, piePriceTotal: 156.4, workday: true },
              { date: '26.08.2026', nav: 2457000000, changePriceOfActive: 0.29, piePrice: 12480.2, prevPriceOfPie: 0.24, payout: false, piePriceTotal: 156.7, workday: true },
              { date: '27.08.2026', nav: 2462000000, changePriceOfActive: 0.2, piePrice: 12510.8, prevPriceOfPie: 0.24, payout: false, piePriceTotal: 157.1, workday: true },
              { date: '28.08.2026', nav: 2465000000, changePriceOfActive: 0.12, piePrice: 12525.3, prevPriceOfPie: 0.12, payout: false, piePriceTotal: 157.3, workday: true },
            ],
          },
          secondary: {
            legend: 'Фонд акций с выплатой дохода (доходность с учётом выплат)',
            points: [
              { date: '25.08.2026', value: 155.2 },
              { date: '26.08.2026', value: 155.5 },
              { date: '27.08.2026', value: 155.8 },
              { date: '28.08.2026', value: 156.0 },
            ],
          },
          graph_type: 'with_payouts',
          change_price_data: {
            date: '28.08.2026',
            prev_workday_1: '27.08.2026',
            prev_workday_2: '26.08.2026',
            rows: [
              {
                type: 'pai',
                price_by_periods: {
                  prev_day_1: 0.24,
                  prev_day_2: 0.24,
                  peer_day: 0.12,
                  ytd: 8.5,
                  year_1: 12.3,
                  year_2: 25.7,
                  year_3: 45.2,
                  year_5: 156.4,
                },
              },
              {
                type: 'nav',
                price_by_periods: {
                  prev_day_1: 0.2,
                  prev_day_2: 0.29,
                  peer_day: 0.12,
                  ytd: 7.8,
                  year_1: 11.5,
                  year_2: 24.1,
                  year_3: 43.8,
                  year_5: 148.2,
                },
              },
            ],
          },
        },
      ],
      charts: [],
      specification_blocks: [
        {
          id: stableUUID(481516, 30),
          name: 'fund-spec',
          title: 'Спецификация фонда',
          is_active: true,
          is_show_title: true,
          specifications: [
            { label: 'Тип фонда', value: 'Фонд акций' },
            { label: 'ISIN', value: 'RU000A106752' },
            { label: 'Минимальная сумма вклада', value: '1 000 ₽' },
            { label: 'Комиссия за управление', value: '1,5% годовых' },
            { label: 'Дата создания', value: '15.03.2019' },
          ],
        },
      ],
      faq_blocks: [],
      deviations: [],
    },
  },

  notFound: {
    message: 'Not Found',
  },
} as const;

// ============================================================
// GRAPHS (Графики)
// ============================================================

/**
 * @provenance
 * source: openapi#/paths/~1api~1v1~1graphs/get
 * schema: GraphResource
 * rules: graph-dates, pie-price, yield-ranges, graph-type
 */
export const graphFixtures = {
  success: {
    data: [
      {
        id: stableUUID(481516, 20),
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2026-08-28T06:00:00Z',
        name: 'aksioma-pie-price',
        type_name: 'pif',
        type_id: '1',
        type: { id: '1', name: 'pif', title: 'Паевой инвестиционный фонд' },
        is_active: true,
        title: 'Динамика стоимости пая',
        is_show_title: true,
        primary: {
          legend: 'Фонд акций с выплатой дохода (динамика стоимости пая)',
          points: [
            { date: '25.08.2026', nav: 2450000000, changePriceOfActive: 0.3, piePrice: 12450.5, prevPriceOfPie: 0.15, payout: false, piePriceTotal: 156.4, workday: true },
            { date: '26.08.2026', nav: 2457000000, changePriceOfActive: 0.29, piePrice: 12480.2, prevPriceOfPie: 0.24, payout: false, piePriceTotal: 156.7, workday: true },
            { date: '27.08.2026', nav: 2462000000, changePriceOfActive: 0.2, piePrice: 12510.8, prevPriceOfPie: 0.24, payout: false, piePriceTotal: 157.1, workday: true },
            { date: '28.08.2026', nav: 2465000000, changePriceOfActive: 0.12, piePrice: 12525.3, prevPriceOfPie: 0.12, payout: false, piePriceTotal: 157.3, workday: true },
          ],
        },
        secondary: {
          legend: 'Фонд акций с выплатой дохода (доходность с учётом выплат)',
          points: [
            { date: '25.08.2026', value: 155.2 },
            { date: '26.08.2026', value: 155.5 },
            { date: '27.08.2026', value: 155.8 },
            { date: '28.08.2026', value: 156.0 },
          ],
        },
        graph_type: 'with_payouts',
        change_price_data: {
          date: '28.08.2026',
          prev_workday_1: '27.08.2026',
          prev_workday_2: '26.08.2026',
          rows: [
            {
              type: 'pai',
              price_by_periods: {
                prev_day_1: 0.24, prev_day_2: 0.24, peer_day: 0.12,
                ytd: 8.5, year_1: 12.3, year_2: 25.7, year_3: 45.2, year_5: 156.4,
              },
            },
            {
              type: 'nav',
              price_by_periods: {
                prev_day_1: 0.2, prev_day_2: 0.29, peer_day: 0.12,
                ytd: 7.8, year_1: 11.5, year_2: 24.1, year_3: 43.8, year_5: 148.2,
              },
            },
          ],
        },
      },
    ],
    links: {
      first: `${BASE_URL}/api/v1/graphs?page=1`,
      last: `${BASE_URL}/api/v1/graphs?page=1`,
      prev: null,
      next: null,
    },
    meta: {
      current_page: 1,
      from: 1,
      last_page: 1,
      path: `${BASE_URL}/api/v1/graphs`,
      per_page: 10,
      to: 1,
      total: 1,
    },
  },

  empty: {
    data: [],
    links: { first: null, last: null, prev: null, next: null },
    meta: { current_page: 1, from: null, last_page: 1, per_page: 10, to: null, total: 0 },
  },
} as const;

// ============================================================
// SUBSCRIPTIONS (Подписки) — STATEFUL
// ============================================================

/**
 * @provenance
 * source: openapi#/paths/~1api~1v1~1subscriptions/post
 * schema: form_sender_resource
 * rules: email-format, email-unique
 */
export const subscriptionFixtures = {
  success: {
    status: 'success',
    message: 'Вы успешно подписались на новости',
    subscription_id: stableUUID(481516, 100),
    created_at: MOCK_NOW,
  },

  duplicate: {
    status: 'error',
    message: 'Подписка уже существует',
  },

  validation: {
    message: 'Email is required',
  },

  unsubscribeSuccess: {
    status: 'success',
    message: 'Вы успешно отписались от новостей',
  },

  unsubscribeNotFound: {
    status: 'error',
    message: 'Подписка не найдена',
  },
} as const;

// ============================================================
// FEEDBACK FORMS (Формы) — STATEFUL
// ============================================================

/**
 * @provenance
 * source: openapi#/paths/~1api~1v1~1feedback_forms/get
 * schema: feedback_forms_resource
 */
export const feedbackFormFixtures = {
  list: {
    data: [
      {
        id: stableUUID(481516, 200),
        name: 'feedback',
        title: 'Обратная связь',
        text: 'Заполните форму, и мы свяжемся с вами в течение 2 рабочих дней.',
        is_active: '1',
        is_show_title: true,
        theme: 'default',
        template: 'standard',
        sender_email: 'info@contrada-capital.ru',
        text_button: 'Отправить',
        fields: [
          { fieldType: 'firstName' },
          { fieldType: 'lastName' },
          { fieldType: 'email' },
          { fieldType: 'tel' },
          { fieldType: 'comment' },
        ],
        recipient_email: 'feedback@contrada-capital.ru',
        image: null,
      },
    ],
    links: { first: null, last: null, prev: null, next: null },
    meta: { current_page: 1, from: 1, last_page: 1, per_page: 10, to: 1, total: 1 },
  },

  submitSuccess: {
    data: {
      message: 'Спасибо! Ваше обращение принято.',
      description: 'Мы свяжемся с вами в течение 2 рабочих дней.',
    },
  },

  submitValidation: {
    message: 'Поле "email" обязательно для заполнения',
  },
} as const;

// ============================================================
// BANNERS
// ============================================================

export const bannerFixtures = {
  success: {
    data: [
      {
        id: stableUUID(481516, 300),
        name: 'main-banner',
        title: 'Инвестируйте с уверенностью',
        is_active: '1',
        is_show_title: true,
        image: '/images/bg-1x.jpg',
        image_mobile: '/images/bg-sm-1x.jpg',
        url: '/inform/pif',
        text_button: 'Наши фонды',
      },
    ],
    links: { first: null, last: null, prev: null, next: null },
    meta: { current_page: 1, from: 1, last_page: 1, per_page: 10, to: 1, total: 1 },
  },
} as const;

// ============================================================
// CONTACTS
// ============================================================

export const contactFixtures = {
  success: {
    data: {
      address: '121099, г. Москва, ул. Лужнецкая наб., д. 2, стр. 1',
      phone: '+7 (495) 123-45-67',
      email: 'info@contrada-capital.ru',
      work_hours: 'Пн–Пт: 9:00–18:00',
      map_coords: { lat: 55.7386, lng: 37.5738 },
    },
  },
} as const;

// ============================================================
// SETTINGS
// ============================================================

export const settingsFixtures = {
  success: {
    data: {
      company_name: 'Контрада Капитал',
      logo: '/logo.svg',
      logo_dark: '/logo-dark.svg',
      footer_text: '© 2026 Контрада Капитал. Все права защищены.',
      social_links: [
        { name: 'Telegram', url: 'https://t.me/contrada_capital' },
        { name: 'VK', url: 'https://vk.com/contrada_capital' },
      ],
    },
  },
} as const;

// ============================================================
// TOP10 (Эмитенты)
// ============================================================

export const top10Fixtures = {
  success: {
    data: [
      {
        id: stableUUID(481516, 400),
        name: 'sberbank',
        title: 'ПАО Сбербанк',
        is_active: true,
        isin: 'RU000A0JQ005',
        weight: 8.5,
        sector: 'Финансы',
      },
      {
        id: stableUUID(481516, 401),
        name: 'gazprom',
        title: 'ПАО «Газпром»',
        is_active: true,
        isin: 'RU000A0JH063',
        weight: 7.2,
        sector: 'Энергетика',
      },
      {
        id: stableUUID(481516, 402),
        name: 'rosneft',
        title: 'ПАО «НК «Роснефть»',
        is_active: true,
        isin: 'RU000A0JH077',
        weight: 6.8,
        sector: 'Нефтегаз',
      },
    ],
    links: { first: null, last: null, prev: null, next: null },
    meta: { current_page: 1, from: 1, last_page: 1, per_page: 10, to: 3, total: 3 },
  },
} as const;

// ============================================================
// ABOUT
// ============================================================

export const aboutFixtures = {
  success: {
    data: {
      name: 'about',
      title: 'О компании',
      content: '<p>«Контрада Капитал» — управляющая компания, специализирующаяся на управлении паевыми инвестиционными фондами.</p><p>Лицензия ЦБ РФ № 0451-00000-000112 от 15.03.2019.</p>',
      is_active: true,
    },
  },
} as const;

// ============================================================
// HEALTHCHECK
// ============================================================

export const healthcheckFixtures = {
  success: {
    status: 'ok',
    timestamp: MOCK_NOW,
  },
} as const;
