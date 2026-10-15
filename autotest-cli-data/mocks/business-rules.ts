/**
 * Бизнес-правила для валидации сгенерированных моков.
 *
 * @provenance
 * source: swagger.json + frontend code analysis
 * rules extracted from:
 *   - OpenAPI schema constraints
 *   - Frontend TypeScript interfaces (app/src/api/services/)
 *   - Business logic in components
 */

// ============================================================
// ДАТЫ
// ============================================================

/**
 * Правило: дата публикации <= дата окончания показа
 * @source: news_resource (start_showing_at, published_at, finish_showing_at)
 */
export function assertNewsDates(news: {
  start_showing_at: string;
  published_at: string;
  finish_showing_at: string;
}): void {
  const start = new Date(news.start_showing_at);
  const published = new Date(news.published_at);
  const finish = new Date(news.finish_showing_at);

  if (start > published) {
    throw new Error(
      `[RULE:news-dates] start_showing_at (${news.start_showing_at}) > published_at (${news.published_at})`
    );
  }
  if (published > finish) {
    throw new Error(
      `[RULE:news-dates] published_at (${news.published_at}) > finish_showing_at (${news.finish_showing_at})`
    );
  }
}

/**
 * Правило: даты в графике строго по возрастанию
 * @source: GraphPrimaryPointsResource
 */
export function assertGraphDatesAscending(points: ReadonlyArray<{ date: string }>): void {
  for (let i = 1; i < points.length; i++) {
    const previous = parseGraphDate(points[i - 1].date);
    const current = parseGraphDate(points[i].date);
    if (current <= previous) {
      throw new Error(
        `[RULE:graph-dates] Point ${i} date (${points[i].date}) <= point ${i - 1} date (${points[i - 1].date})`
      );
    }
  }
}

function parseGraphDate(value: string): number {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);
  if (!match) {
    throw new Error(`[RULE:graph-dates] Invalid DD.MM.YYYY date: "${value}"`);
  }

  const [, day, month, year] = match;
  const timestamp = Date.UTC(Number(year), Number(month) - 1, Number(day));
  const date = new Date(timestamp);
  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day)
  ) {
    throw new Error(`[RULE:graph-dates] Invalid calendar date: "${value}"`);
  }
  return timestamp;
}

// ============================================================
// ЧИСЛА
// ============================================================

/**
 * Правило: РСП (стоимость пая) — положительное число в диапазоне 5000–50000
 * @source: PifData.piePrice
 */
export function assertPiePrice(piePrice: number): void {
  if (piePrice <= 0) {
    throw new Error(`[RULE:pie-price] piePrice must be positive, got ${piePrice}`);
  }
  if (piePrice < 5000 || piePrice > 50000) {
    console.warn(`[RULE:pie-price] piePrice ${piePrice} outside typical range [5000, 50000]`);
  }
}

/**
 * Правило: СЧА (стоимость чистых активов) — положительное число
 * @source: PifData.nav
 */
export function assertNav(nav: number): void {
  if (nav <= 0) {
    throw new Error(`[RULE:nav] nav must be positive, got ${nav}`);
  }
}

/**
 * Правило: доходность в разумных пределах
 * @source: PriceByPeriodsResource
 */
export function assertYieldRanges(periods: {
  prev_day_1: number | null;
  prev_day_2: number | null;
  peer_day: number | null;
  ytd: number | null;
  year_1: number | null;
  year_2: number | null;
  year_3: number | null;
  year_5: number | null;
}): void {
  const limits: Record<string, number> = {
    prev_day_1: 10,   // ±10% за день
    prev_day_2: 10,
    peer_day: 10,
    ytd: 100,         // ±100% за год
    year_1: 100,
    year_2: 200,
    year_3: 300,
    year_5: 500,      // ±500% за 5 лет (экстремально, но возможно)
  };

  for (const [key, limit] of Object.entries(limits)) {
    const value = (periods as Record<string, number | null>)[key];
    if (value !== null && Math.abs(value) > limit) {
      console.warn(`[RULE:yield] ${key} = ${value}% exceeds typical limit ±${limit}%`);
    }
  }
}

// ============================================================
// ПАГИНАЦИЯ
// ============================================================

/**
 * Правило: пагинация согласована
 * @source: meta_resource
 */
export function assertPagination(meta: {
  current_page: number;
  from?: number;
  to?: number;
  per_page?: number;
  total?: number;
  last_page?: number;
}): void {
  if (meta.from !== undefined && meta.per_page !== undefined && meta.to !== undefined) {
    if (meta.to > meta.from + meta.per_page - 1) {
      throw new Error(
        `[RULE:pagination] from (${meta.from}) + per_page (${meta.per_page}) < to (${meta.to})`
      );
    }
  }
  if (meta.current_page > (meta.last_page ?? Infinity)) {
    throw new Error(
      `[RULE:pagination] current_page (${meta.current_page}) > last_page (${meta.last_page})`
    );
  }
}

// ============================================================
// ФОРМАТЫ
// ============================================================

/**
 * Правило: ISIN формат — RU + 12 символов (цифры/буквы)
 * @source: isin_resource
 */
export function assertIsinFormat(isin: string): void {
  if (!/^RU[0-9A-Z]{10}$/.test(isin) || !hasValidIsinCheckDigit(isin)) {
    throw new Error(`[RULE:isin] Invalid ISIN: "${isin}" (expected 12 characters with a valid check digit)`);
  }
}

function hasValidIsinCheckDigit(isin: string): boolean {
  const expanded = isin
    .split('')
    .map((character) => (/\d/.test(character) ? character : String(character.charCodeAt(0) - 55)))
    .join('');

  let sum = 0;
  let doubleDigit = true;
  for (let index = expanded.length - 1; index >= 0; index -= 1) {
    let digit = Number(expanded[index]);
    if (doubleDigit) {
      digit *= 2;
    }
    sum += Math.floor(digit / 10) + (digit % 10);
    doubleDigit = !doubleDigit;
  }
  return sum % 10 === 0;
}

/**
 * Правило: email формат
 * @source: form_sender_resource
 */
export function assertEmailFormat(email: string): void {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error(`[RULE:email] Invalid email format: "${email}"`);
  }
}

/**
 * Правило: URL начинается с "/"
 * @source: page_resource.url
 */
export function assertUrlFormat(url: string): void {
  if (!url.startsWith('/')) {
    throw new Error(`[RULE:url] URL must start with "/": "${url}"`);
  }
}

// ============================================================
// ТИПЫ
// ============================================================

/**
 * Правило: is_active — строка "1" или "0" (НЕ boolean!)
 * @source: news_resource.is_active, feedback_forms_resource.is_active
 * NOTE: В Swagger тип "string", в frontend тоже string
 */
export function assertIsActiveString(value: unknown): void {
  if (typeof value !== 'string') {
    throw new Error(
      `[RULE:is-active] is_active must be string "1" or "0", got ${typeof value}: ${value}`
    );
  }
  if (value !== '0' && value !== '1') {
    throw new Error(`[RULE:is-active] is_active must be "0" or "1", got "${value}"`);
  }
}

/**
 * Правило: type_name — только "pif" или "du"
 * @source: GraphResource.type_name
 */
export function assertGraphTypeName(typeName: string): void {
  if (typeName !== 'pif' && typeName !== 'du') {
    throw new Error(`[RULE:graph-type] type_name must be "pif" or "du", got "${typeName}"`);
  }
}

/**
 * Правило: graph_type — "benchmark" | "with_payouts" | "without_payouts" | null
 * @source: GraphResource.graph_type
 */
export function assertGraphType(graphType: string | null): void {
  const valid = ['benchmark', 'with_payouts', 'without_payouts', null];
  if (!valid.includes(graphType)) {
    throw new Error(`[RULE:graph-type] graph_type must be one of ${valid}, got "${graphType}"`);
  }
}

// ============================================================
// СВЯЗИ МЕЖДУ ОБЪЕКТАМИ
// ============================================================

/**
 * Правило: в change_price_data rows — только "pai" и "nav"
 * @source: ChangePriceRowData
 */
export function assertChangePriceRows(rows: ReadonlyArray<{ type: string }>): void {
  for (const row of rows) {
    if (row.type !== 'pai' && row.type !== 'nav') {
      throw new Error(`[RULE:change-price] row type must be "pai" or "nav", got "${row.type}"`);
    }
  }
}

/**
 * Правило: payout=true → payoutValue должен быть определён
 * @source: PifData
 */
export function assertPayoutConsistency(data: { payout: boolean; payoutValue?: number }): void {
  if (data.payout && data.payoutValue === undefined) {
    throw new Error('[RULE:payout] payout=true but payoutValue is undefined');
  }
}
