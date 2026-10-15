import { expect, test, type Locator, type Page } from '@playwright/test';

const graphCases = {
  baseWithPayout: '745604',
  yieldCurve: '748054',
  navTab: '748093',
  oneMonth: '748054',
  threeMonths: '748068',
  yearToDate: '748071',
  allPeriod: '748072',
  benchmark: '760183',
  invalidOutsideData: '747983',
  withoutPayout: '759053',
};

function graphSection(page: Page) {
  return page.locator('section[aria-labelledby="fund-chart-title"]');
}

function chartArea(page: Page) {
  return graphSection(page).locator('.stock-chart');
}

async function openGraph(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'График стоимости пая и СЧА' })).toBeVisible();
  await graphSection(page).scrollIntoViewIfNeeded();
  await expect(page.locator('.highcharts-container')).toBeVisible({ timeout: 15_000 });
  await expect(chartArea(page).locator('.highcharts-series')).not.toHaveCount(0);
}

async function expectChartSnapshot(chart: Locator, name: string) {
  await expect(chart.locator('.highcharts-series')).not.toHaveCount(0);
  await expect(chart).toHaveScreenshot(name, {
    animations: 'disabled',
    caret: 'hide',
  });
}

async function expectAtLeastSeries(chart: Locator, count: number) {
  await expect
    .poll(async () => chart.locator('.highcharts-series').count())
    .toBeGreaterThanOrEqual(count);
}

async function setTab(page: Page, tab: 'Стоимость пая' | 'График СЧА') {
  await graphSection(page).getByLabel('Вкладка').selectOption({ label: tab });
  await expect(graphSection(page).getByLabel('Вкладка')).toHaveValue(
    tab === 'Стоимость пая' ? 'unitPrice' : 'nav',
  );
}

async function setFundType(page: Page, type: 'С выплатой' | 'Без выплаты' | 'Бенчмарк') {
  const valueByType = {
    'С выплатой': 'withPayout',
    'Без выплаты': 'withoutPayout',
    Бенчмарк: 'benchmark',
  };
  await graphSection(page).getByLabel('Тип графика').selectOption({ label: type });
  await expect(graphSection(page).getByLabel('Тип графика')).toHaveValue(valueByType[type]);
}

async function clickPeriod(page: Page, name: '1 мес' | '3 мес' | 'С начала года' | 'За весь период') {
  await graphSection(page).getByRole('button', { name }).click();
}

test.describe('Graph visual TestIt cases with Playwright snapshots', () => {
  test.describe.configure({ mode: 'serial' });
  test.use({ viewport: { width: 1440, height: 1100 } });

  test(`TC-${graphCases.baseWithPayout}: график стоимости пая с выплатой визуально построен`, async ({
    page,
  }) => {
    await openGraph(page);
    await setFundType(page, 'С выплатой');
    await setTab(page, 'Стоимость пая');

    await expectChartSnapshot(chartArea(page), 'tc-745604-with-payout-unit-price-base-chart.png');
  });

  test(`TC-${graphCases.yieldCurve}: включение динамики доходности добавляет вторую кривую`, async ({
    page,
  }) => {
    await openGraph(page);
    await setFundType(page, 'С выплатой');
    await setTab(page, 'Стоимость пая');
    await graphSection(page)
      .getByRole('checkbox', { name: 'Отображать динамику доходности фонда' })
      .check();
    await expectAtLeastSeries(chartArea(page), 2);

    await expectChartSnapshot(chartArea(page), 'tc-748054-yield-dynamics-second-curve.png');
  });

  test(`TC-${graphCases.navTab}: вкладка График СЧА визуально переключает ряд данных`, async ({
    page,
  }) => {
    await openGraph(page);
    await setFundType(page, 'С выплатой');
    await setTab(page, 'График СЧА');

    await expectChartSnapshot(chartArea(page), 'tc-748093-nav-chart-tab.png');
  });

  test(`TC-${graphCases.oneMonth}: период 1 мес перестраивает график`, async ({ page }) => {
    await openGraph(page);
    await setFundType(page, 'С выплатой');
    await clickPeriod(page, '1 мес');

    await expectChartSnapshot(chartArea(page), 'tc-748054-period-one-month.png');
  });

  test(`TC-${graphCases.threeMonths}: период 3 мес перестраивает график`, async ({ page }) => {
    await openGraph(page);
    await setFundType(page, 'С выплатой');
    await clickPeriod(page, '3 мес');

    await expectChartSnapshot(chartArea(page), 'tc-748068-period-three-months.png');
  });

  test(`TC-${graphCases.yearToDate}: период С начала года перестраивает график`, async ({ page }) => {
    await openGraph(page);
    await setFundType(page, 'С выплатой');
    await clickPeriod(page, 'С начала года');

    await expectChartSnapshot(chartArea(page), 'tc-748071-period-year-to-date.png');
  });

  test(`TC-${graphCases.allPeriod}: период За весь период показывает весь диапазон`, async ({
    page,
  }) => {
    await openGraph(page);
    await setFundType(page, 'С выплатой');
    await clickPeriod(page, 'За весь период');

    await expectChartSnapshot(chartArea(page), 'tc-748072-period-all-data.png');
  });

  test(`TC-${graphCases.benchmark}: тип Бенчмарк отображает benchmark-серию`, async ({ page }) => {
    await openGraph(page);
    await setFundType(page, 'Бенчмарк');
    await setTab(page, 'Стоимость пая');
    await expectAtLeastSeries(chartArea(page), 2);

    await expectChartSnapshot(chartArea(page), 'tc-760183-benchmark-series.png');
  });

  test(`TC-${graphCases.invalidOutsideData}: даты за пределами данных показывают ошибку и сохраняют график`, async ({
    page,
  }) => {
    await openGraph(page);
    await setFundType(page, 'С выплатой');
    await graphSection(page).getByLabel('Начальная дата').fill('2022-01-01');
    await graphSection(page).getByLabel('Конечная дата').fill('2026-12-31');
    await graphSection(page).getByRole('button', { name: 'Применить даты' }).click();
    await expect(graphSection(page).getByRole('status')).toContainText('Введена некорректная дата');

    await expect(graphSection(page)).toHaveScreenshot('tc-747983-invalid-outside-data-range.png', {
      animations: 'disabled',
      caret: 'hide',
    });
  });

  test(`TC-${graphCases.withoutPayout}: тип Без выплаты визуально строит график стоимости пая`, async ({
    page,
  }) => {
    await openGraph(page);
    await setFundType(page, 'Без выплаты');
    await setTab(page, 'Стоимость пая');

    await expectChartSnapshot(chartArea(page), 'tc-759053-without-payout-unit-price-chart.png');
  });
});
