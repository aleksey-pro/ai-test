import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { expect, test, type Locator, type Page } from '@playwright/test';

type FundType = 'С выплатой' | 'Без выплаты' | 'Бенчмарк';
type TabName = 'Стоимость пая' | 'График СЧА';
type CaseAction =
  | 'base-range'
  | 'date-inside'
  | 'date-outside-timeline'
  | 'date-outside-data'
  | 'period-1m'
  | 'period-3m'
  | 'period-ytd'
  | 'period-all'
  | 'date-start-after-end'
  | 'weekend-dates';

type GraphCase = {
  id: string;
  source: string;
  fundType: FundType;
  tab: TabName;
  action: CaseAction;
};

const projectRoot = process.cwd();
const graphCaseDirs = [
  'testit-cases/01-products-with-payout-value-chart',
  'testit-cases/02-products-with-payout-nav-chart',
  'testit-cases/05-products-benchmark',
  'testit-cases/06-products-without-payout-value-chart',
  'testit-cases/07-products-without-payout-nav-chart',
  'testit-cases/09-products-without-payout-date-validation',
];

const coveredByRepresentativeSuite = new Set([
  '745604',
  '747983',
  '748054',
  '748068',
  '748071',
  '748072',
  '748093',
  '759053',
  '760183',
]);

function listMarkdownFiles(relativeDir: string) {
  const absoluteDir = path.join(projectRoot, relativeDir);
  if (!existsSync(absoluteDir)) return [];

  return readdirSync(absoluteDir)
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => path.join(relativeDir, fileName))
    .sort();
}

function parseCaseId(source: string) {
  const match = path.basename(source).match(/^ca-(\d+)-/);
  if (!match) {
    throw new Error(`Cannot parse TestIt case ID from ${source}`);
  }

  return match[1];
}

function inferAction(source: string): CaseAction {
  if (source.includes('za-predely-dat-grafika')) return 'date-outside-data';
  if (
    source.includes('konechnaya-data-menshe-nachalnoj') ||
    source.includes('nachalnaya-data-bolshe-konechnoj')
  ) {
    return 'date-start-after-end';
  }
  if (source.includes('vyxodnyx')) return 'weekend-dates';
  if (source.includes('periodov-1-mes') || source.includes('periodov-1-mec')) return 'period-1m';
  if (source.includes('periodov-3-mes') || source.includes('periodov-3-mec')) return 'period-3m';
  if (source.includes('periodov-s-nachala-goda')) return 'period-ytd';
  if (source.includes('periodov-za-ves-period')) return 'period-all';
  if (source.includes('vnutr-tajm-lajna') || source.includes('vnutri-tajm-lajna')) return 'date-inside';
  if (source.includes('za-predely-tajm-lajna')) return 'date-outside-timeline';
  return 'base-range';
}

function inferGraphCase(source: string): GraphCase {
  const id = parseCaseId(source);
  const isBenchmark = source.includes('/05-products-benchmark/');
  const isWithoutPayout = source.includes('/06-') || source.includes('/07-') || source.includes('/09-');
  const isNav = source.includes('/02-') || source.includes('/07-') || source.includes('grafik-scha');

  return {
    id,
    source,
    fundType: isBenchmark ? 'Бенчмарк' : isWithoutPayout ? 'Без выплаты' : 'С выплатой',
    tab: isNav ? 'График СЧА' : 'Стоимость пая',
    action: inferAction(source),
  };
}

const remainingGraphCases = graphCaseDirs
  .flatMap(listMarkdownFiles)
  .map(inferGraphCase)
  .filter((graphCase) => !coveredByRepresentativeSuite.has(graphCase.id));

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

async function setTab(page: Page, tab: TabName) {
  await graphSection(page).getByLabel('Вкладка').selectOption({ label: tab });
  await expect(graphSection(page).getByLabel('Вкладка')).toHaveValue(
    tab === 'Стоимость пая' ? 'unitPrice' : 'nav',
  );
}

async function setFundType(page: Page, type: FundType) {
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

async function applyDates(page: Page, from: string, to: string) {
  await graphSection(page).getByLabel('Начальная дата').fill(from);
  await graphSection(page).getByLabel('Конечная дата').fill(to);
  await graphSection(page).getByRole('button', { name: 'Применить даты' }).click();
}

async function expectChartSnapshot(target: Locator, name: string) {
  await expect(target.locator('.highcharts-series')).not.toHaveCount(0);
  await expect(target).toHaveScreenshot(name, {
    animations: 'disabled',
    caret: 'hide',
  });
}

async function performCaseAction(page: Page, graphCase: GraphCase) {
  switch (graphCase.action) {
    case 'period-1m':
      await clickPeriod(page, '1 мес');
      break;
    case 'period-3m':
      await clickPeriod(page, '3 мес');
      break;
    case 'period-ytd':
      await clickPeriod(page, 'С начала года');
      break;
    case 'period-all':
      await clickPeriod(page, 'За весь период');
      break;
    case 'date-inside':
      await applyDates(page, '2024-09-02', '2024-12-02');
      await expect(graphSection(page).getByRole('status')).toBeEmpty();
      break;
    case 'date-outside-timeline':
      await applyDates(page, '2023-04-03', '2025-01-10');
      await expect(graphSection(page).getByRole('status')).toBeEmpty();
      break;
    case 'date-outside-data':
      await applyDates(page, '2022-01-01', '2026-12-31');
      await expect(graphSection(page).getByRole('status')).toContainText('Введена некорректная дата');
      break;
    case 'date-start-after-end':
      await applyDates(page, '2025-01-10', '2024-01-10');
      await expect(graphSection(page).getByRole('status')).toContainText(
        'Начальная дата больше конечной',
      );
      break;
    case 'weekend-dates':
      await applyDates(page, '2024-09-07', '2024-12-08');
      await expect(graphSection(page).getByRole('status')).toBeEmpty();
      break;
    case 'base-range':
      await clickPeriod(page, '3 мес');
      break;
  }
}

function snapshotTarget(page: Page, action: CaseAction) {
  return action === 'date-outside-data' || action === 'date-start-after-end'
    ? graphSection(page)
    : chartArea(page);
}

function snapshotName(graphCase: GraphCase) {
  return `tc-${graphCase.id}-${graphCase.action}.png`;
}

test.describe('Remaining graph TestIt cases with Playwright snapshots', () => {
  test.describe.configure({ mode: 'serial' });
  test.use({ viewport: { width: 1440, height: 1100 } });

  for (const graphCase of remainingGraphCases) {
    test(`TC-${graphCase.id}: ${graphCase.action} визуально проверяет график (${graphCase.source})`, async ({
      page,
    }) => {
      await openGraph(page);
      await setFundType(page, graphCase.fundType);
      await setTab(page, graphCase.tab);
      await performCaseAction(page, graphCase);

      await expectChartSnapshot(snapshotTarget(page, graphCase.action), snapshotName(graphCase));
    });
  }
});
