import { expect, test, type Page } from '@playwright/test';
import { openHome } from './helpers';

type FundType = 'С выплатой' | 'Без выплаты';
type TableAction =
  | 'date-inside'
  | 'date-outside-timeline'
  | 'date-outside-data'
  | 'period-1m'
  | 'period-3m'
  | 'period-ytd'
  | 'period-all'
  | 'date-start-after-end';

type TableCase = {
  id: string;
  source: string;
  fundType: FundType;
  action: TableAction;
};

type MissingCase = {
  id: string;
  source: string;
  entity: string;
  reason: string;
};

const withPayoutTableCases: Array<Pick<TableCase, 'id' | 'source' | 'action'>> = [
  {
    id: '748188',
    source:
      'testit-cases/03-products-with-payout-value-table/ca-748188-tip-s-vyplatoj-vkladka-stoimost-paya-rezhim-tablica-flag-otobrazhat-dinamiku-doxodnosti-fonda-vykl-izmenenie-dat-v-kalendare-v-kalendarnoj-setke-vnutr-tajm-lajna.md',
    action: 'date-inside',
  },
  {
    id: '748189',
    source:
      'testit-cases/03-products-with-payout-value-table/ca-748189-tip-s-vyplatoj-vkladka-stoimost-paya-rezhim-tablica-flag-otobrazhat-dinamiku-doxodnosti-fonda-vykl-izmenenie-dat-v-kalendare-v-kalendarnoj-setke-za-predely-tajm-lajna.md',
    action: 'date-outside-timeline',
  },
  {
    id: '748191',
    source:
      'testit-cases/03-products-with-payout-value-table/ca-748191-tip-s-vyplatoj-vkladka-stoimost-paya-rezhim-tablica-flag-otobrazhat-dinamiku-doxodnosti-fonda-vykl-izmenenie-dat-vruchnuyu-za-predely-tajm-lajna.md',
    action: 'date-outside-timeline',
  },
  {
    id: '748192',
    source:
      'testit-cases/03-products-with-payout-value-table/ca-748192-tip-s-vyplatoj-vkladka-stoimost-paya-rezhim-tablica-flag-otobrazhat-dinamiku-doxodnosti-fonda-vykl-izmenenie-dat-vruchnuyu-za-predely-dat-grafika.md',
    action: 'date-outside-data',
  },
  {
    id: '748193',
    source:
      'testit-cases/03-products-with-payout-value-table/ca-748193-tip-s-vyplatoj-vkladka-stoimost-paya-rezhim-tablica-flag-otobrazhat-dinamiku-doxodnosti-fonda-vykl-izmenenie-periodov-1-mes.md',
    action: 'period-1m',
  },
  {
    id: '748194',
    source:
      'testit-cases/03-products-with-payout-value-table/ca-748194-tip-s-vyplatoj-vkladka-stoimost-paya-rezhim-tablica-flag-otobrazhat-dinamiku-doxodnosti-fonda-vykl-izmenenie-periodov-3-mes.md',
    action: 'period-3m',
  },
  {
    id: '748195',
    source:
      'testit-cases/03-products-with-payout-value-table/ca-748195-tip-s-vyplatoj-vkladka-stoimost-paya-rezhim-tablica-flag-otobrazhat-dinamiku-doxodnosti-fonda-vykl-izmenenie-periodov-s-nachala-goda.md',
    action: 'period-ytd',
  },
  {
    id: '748196',
    source:
      'testit-cases/03-products-with-payout-value-table/ca-748196-tip-s-vyplatoj-vkladka-stoimost-paya-rezhim-tablica-flag-otobrazhat-dinamiku-doxodnosti-fonda-vykl-izmenenie-periodov-za-ves-period.md',
    action: 'period-all',
  },
  {
    id: '749289',
    source:
      'testit-cases/04-products-with-payout-date-validation/ca-749289-tip-s-vyplatoj-konechnaya-data-menshe-nachalnoj.md',
    action: 'date-start-after-end',
  },
];

const withoutPayoutTableCases: Array<Pick<TableCase, 'id' | 'source' | 'action'>> = [
  [
    '759073',
    'date-inside',
    'ca-759073-tip-bez-vyplaty-vkladka-stoimost-paya-rezhim-tablica-izmenenie-dat-v-kalendare-v-kalendarnoj-setke-vnutr-tajm-lajna.md',
  ],
  [
    '759074',
    'date-outside-timeline',
    'ca-759074-tip-bez-vyplaty-vkladka-stoimost-paya-rezhim-tablica-izmenenie-dat-v-kalendare-v-kalendarnoj-setke-za-predely-tajm-lajna.md',
  ],
  [
    '759076',
    'date-outside-timeline',
    'ca-759076-tip-bez-vyplaty-vkladka-stoimost-paya-rezhim-tablica-izmenenie-dat-vruchnuyu-za-predely-tajm-lajna.md',
  ],
  [
    '937253',
    'date-inside',
    'ca-937253-tip-bez-vyplaty-vkladka-stoimost-paya-rezhim-tablica-izmenenie-dat-v-kalendare-v-kalendarnoj-setke-vnutr-tajm-lajna.md',
  ],
  [
    '937254',
    'date-outside-timeline',
    'ca-937254-tip-bez-vyplaty-vkladka-stoimost-paya-rezhim-tablica-izmenenie-dat-v-kalendare-v-kalendarnoj-setke-za-predely-tajm-lajna.md',
  ],
  [
    '937256',
    'date-outside-timeline',
    'ca-937256-tip-bez-vyplaty-vkladka-stoimost-paya-rezhim-tablica-izmenenie-dat-vruchnuyu-za-predely-tajm-lajna.md',
  ],
  [
    '937257',
    'date-outside-data',
    'ca-937257-tip-bez-vyplaty-vkladka-stoimost-paya-rezhim-tablica-izmenenie-dat-vruchnuyu-za-predely-dat-grafika.md',
  ],
  [
    '937258',
    'period-1m',
    'ca-937258-tip-bez-vyplaty-vkladka-stoimost-paya-rezhim-tablica-izmenenie-periodov-1-mes.md',
  ],
  [
    '937259',
    'period-3m',
    'ca-937259-tip-bez-vyplaty-vkladka-stoimost-paya-rezhim-tablica-izmenenie-periodov-3-mes.md',
  ],
  [
    '937260',
    'period-ytd',
    'ca-937260-tip-bez-vyplaty-vkladka-stoimost-paya-rezhim-tablica-izmenenie-periodov-s-nachala-goda.md',
  ],
  [
    '937261',
    'period-all',
    'ca-937261-tip-bez-vyplaty-vkladka-stoimost-paya-rezhim-tablica-izmenenie-periodov-za-ves-period.md',
  ],
  [
    '937485',
    'date-inside',
    'ca-937485-tip-bez-vyplaty-vkladka-stoimost-paya-rezhim-tablica-izmenenie-dat-v-kalendare-v-kalendarnoj-setke-vnutri-tajm-lajna.md',
  ],
  [
    '937486',
    'date-outside-timeline',
    'ca-937486-tip-bez-vyplaty-vkladka-stoimost-paya-rezhim-tablica-izmenenie-dat-v-kalendare-v-kalendarnoj-setke-za-predely-tajm-lajna.md',
  ],
  [
    '937488',
    'date-outside-timeline',
    'ca-937488-tip-bez-vyplaty-vkladka-stoimost-paya-rezhim-tablica-izmenenie-dat-vruchnuyu-za-predely-tajm-lajna.md',
  ],
  [
    '937489',
    'date-outside-data',
    'ca-937489-tip-bez-vyplaty-vkladka-stoimost-paya-rezhim-tablica-izmenenie-dat-vruchnuyu-za-predely-dat-grafika.md',
  ],
  [
    '937490',
    'period-1m',
    'ca-937490-tip-bez-vyplaty-vkladka-stoimost-paya-rezhim-tablica-izmenenie-periodov-1-mes.md',
  ],
  [
    '937491',
    'period-3m',
    'ca-937491-tip-bez-vyplaty-vkladka-stoimost-paya-rezhim-tablica-izmenenie-periodov-3-mes.md',
  ],
  [
    '937492',
    'period-ytd',
    'ca-937492-tip-bez-vyplaty-vkladka-stoimost-paya-rezhim-tablica-izmenenie-periodov-s-nachala-goda.md',
  ],
  [
    '937493',
    'period-all',
    'ca-937493-tip-bez-vyplaty-vkladka-stoimost-paya-rezhim-tablica-izmenenie-periodov-za-ves-period.md',
  ],
  ['937495', 'period-3m', 'ca-937495-tip-bez-vyplaty-perestrojka-tablicy-pri-nazhatii-na-period.md'],
].map(([id, action, fileName]) => ({
  id,
  action: action as TableAction,
  source: `testit-cases/08-products-without-payout-value-table/${fileName}`,
}));

const tableCases: TableCase[] = [
  ...withPayoutTableCases.map((tableCase) => ({ ...tableCase, fundType: 'С выплатой' as const })),
  ...withoutPayoutTableCases.map((tableCase) => ({
    ...tableCase,
    fundType: 'Без выплаты' as const,
  })),
];

const missingCases: MissingCase[] = [
  {
    id: '846883',
    source: 'testit-cases/10-product-sila-balansa/ca-846883-elementy-stranicy-sila-balansa-nalichie-na-stranice.md',
    entity: 'Страница продукта "Сила баланса"',
    reason: 'в текущем приложении нет маршрута или секции продукта "Сила баланса"',
  },
  {
    id: '847393',
    source:
      'testit-cases/10-product-sila-balansa/ca-847393-element-tablica-raschetnyx-pokazatelej-na-stranice-sila-balansa-raschet-dinamiki-paya.md',
    entity: 'Страница продукта "Сила баланса"',
    reason: 'нет таблицы расчетных показателей продукта "Сила баланса"',
  },
  {
    id: '847641',
    source:
      'testit-cases/10-product-sila-balansa/ca-847641-element-tablica-raschetnyx-pokazatelej-na-stranice-sila-balansa-raschet-dinamiki-scha.md',
    entity: 'Страница продукта "Сила баланса"',
    reason: 'нет таблицы расчетных показателей СЧА продукта "Сила баланса"',
  },
  {
    id: '869946',
    source:
      'testit-cases/12-company-requisites/ca-869946-rekvizity-vernoe-sokrashhennoe-naimenovanie-na-russkom-yazyke.md',
    entity: 'Реквизиты компании',
    reason: 'в блоке реквизитов нет сокращенного наименования на русском языке',
  },
  {
    id: '869947',
    source:
      'testit-cases/12-company-requisites/ca-869947-rekvizity-vernoe-polnoe-naimenovanie-na-anglijskom-yazyke.md',
    entity: 'Реквизиты компании',
    reason: 'в блоке реквизитов нет полного наименования на английском языке',
  },
  {
    id: '871882',
    source:
      'testit-cases/12-company-requisites/ca-871882-rekvizity-vernoe-sokrashhennoe-naimenovanie-na-anglijskom-yazyke.md',
    entity: 'Реквизиты компании',
    reason: 'в блоке реквизитов нет сокращенного наименования на английском языке',
  },
  {
    id: '871884',
    source: 'testit-cases/12-company-requisites/ca-871884-rekvizity-vernoe-pochtovyj-adres.md',
    entity: 'Реквизиты компании',
    reason: 'в блоке реквизитов нет отдельного поля "Почтовый адрес"',
  },
  {
    id: '871886',
    source:
      'testit-cases/12-company-requisites/ca-871886-rekvizity-vernoe-znachenie-rekvizita-telefon.md',
    entity: 'Реквизиты компании',
    reason: 'телефон есть на странице контактов, но не в блоке реквизитов',
  },
  {
    id: '871887',
    source:
      'testit-cases/12-company-requisites/ca-871887-rekvizity-vernoe-znachenie-rekvizita-inn-kpp.md',
    entity: 'Реквизиты компании',
    reason: 'в блоке реквизитов нет ИНН/КПП',
  },
  {
    id: '871889',
    source: 'testit-cases/12-company-requisites/ca-871889-rekvizity-vernoe-znachenie-rekvizita-ogrn.md',
    entity: 'Реквизиты компании',
    reason: 'в блоке реквизитов нет ОГРН',
  },
  {
    id: '871891',
    source:
      'testit-cases/12-company-requisites/ca-871891-rekvizity-vernoe-znachenie-rekvizita-e-mail.md',
    entity: 'Реквизиты компании',
    reason: 'email есть на странице контактов, но не в блоке реквизитов',
  },
  {
    id: '872476',
    source:
      'testit-cases/13-company-information/ca-872476-informaciya-pravilnost-teksta-opisaniya-bloka-informaciya.md',
    entity: 'Информация о компании',
    reason: 'нет отдельного раздела "Информация"',
  },
  {
    id: '872477',
    source:
      'testit-cases/13-company-information/ca-872477-informaciya-nalichie-elementa-ves-kompleks-uslug-po-upravleniyu-aktivami.md',
    entity: 'Информация о компании',
    reason: 'нет блока преимуществ компании',
  },
  {
    id: '872479',
    source:
      'testit-cases/13-company-information/ca-872479-informaciya-shirokij-diapazon-investicionnyx-reshenij.md',
    entity: 'Информация о компании',
    reason: 'нет блока преимуществ компании',
  },
  {
    id: '872480',
    source:
      'testit-cases/13-company-information/ca-872480-informaciya-nalichie-elementa-sobstvennaya-ekspertiza-i-pervoklassnaya-analitika-nezavisimyx-providjerov.md',
    entity: 'Информация о компании',
    reason: 'нет блока преимуществ компании',
  },
  {
    id: '872481',
    source:
      'testit-cases/13-company-information/ca-872481-informaciya-nalichie-elementa-portfeli-krupnyx-chastnyx-i-korporativnyx-klientov.md',
    entity: 'Информация о компании',
    reason: 'нет блока преимуществ компании',
  },
  {
    id: '872482',
    source: 'testit-cases/13-company-information/ca-872482-informaciya-nalichie-bannera-s-tekstom.md',
    entity: 'Информация о компании',
    reason: 'нет баннера раздела "Информация"',
  },
  {
    id: '872507',
    source:
      'testit-cases/13-company-information/ca-872507-kontakty-vernoe-nazvanie-zagolovka-kontaktnaya-informaciya.md',
    entity: 'Информация о компании',
    reason: 'на странице контактов заголовок "Контакты", а не "Контактная информация"',
  },
  {
    id: '872484',
    source: 'testit-cases/14-company-licenses/ca-872484-licenzii-vernoe-nazvanie-zagolovka-licenzii.md',
    entity: 'Лицензии компании',
    reason: 'нет страницы или секции лицензий',
  },
  {
    id: '872485',
    source: 'testit-cases/14-company-licenses/ca-872485-licenzii-vernyj-tekst-pervoj-licenzii.md',
    entity: 'Лицензии компании',
    reason: 'нет списка лицензий',
  },
  {
    id: '872486',
    source:
      'testit-cases/14-company-licenses/ca-872486-licenzii-otkrytie-stranicy-s-dokumentom-po-knopke-otkryt-onlajn-pervoj-licenzii.md',
    entity: 'Лицензии компании',
    reason: 'нет кнопок открытия документов лицензий',
  },
  {
    id: '872487',
    source:
      'testit-cases/14-company-licenses/ca-872487-licenzii-otkrytie-stranicy-s-dokumentom-po-knopke-skachat-fajl-pervoj-licenzii.md',
    entity: 'Лицензии компании',
    reason: 'нет кнопок скачивания документов лицензий',
  },
  {
    id: '872488',
    source: 'testit-cases/14-company-licenses/ca-872488-licenzii-vernyj-tekst-vtoroj-licenzii.md',
    entity: 'Лицензии компании',
    reason: 'нет списка лицензий',
  },
  {
    id: '872491',
    source:
      'testit-cases/14-company-licenses/ca-872491-licenzii-otkrytie-stranicy-s-dokumentom-po-knopke-otkryt-onlajn-vtoroj-licenzii.md',
    entity: 'Лицензии компании',
    reason: 'нет кнопок открытия документов лицензий',
  },
  {
    id: '872492',
    source:
      'testit-cases/14-company-licenses/ca-872492-licenzii-otkrytie-stranicy-s-dokumentom-po-knopke-skachat-fajl-vtoroj-licenzii.md',
    entity: 'Лицензии компании',
    reason: 'нет кнопок скачивания документов лицензий',
  },
  {
    id: '872516',
    source: 'testit-cases/14-company-licenses/ca-872516-kontakty-vernaya-ssylka-na-stranicu-licenzij.md',
    entity: 'Лицензии компании',
    reason: 'на странице контактов нет ссылки на лицензии',
  },
  {
    id: '872493',
    source: 'testit-cases/15-company-history/ca-872493-istoriya-vernoe-nazvanie-zagolovka-istoriya-kompanii.md',
    entity: 'История компании',
    reason: 'нет страницы или секции истории компании',
  },
  {
    id: '872495',
    source: 'testit-cases/15-company-history/ca-872495-istoriya-pravilnost-teksta-1-na-stranice.md',
    entity: 'История компании',
    reason: 'нет текстового блока истории компании',
  },
  {
    id: '872505',
    source: 'testit-cases/15-company-history/ca-872505-istoriya-pravilnost-teksta-2-na-stranice.md',
    entity: 'История компании',
    reason: 'нет текстового блока истории компании',
  },
  {
    id: '872513',
    source: 'testit-cases/16-company-contacts/ca-872513-kontakty-vernaya-ssylka-na-stranicu-informacii-o-kompanii.md',
    entity: 'Контакты компании',
    reason: 'на странице контактов нет ссылки на информацию о компании',
  },
  {
    id: '872514',
    source: 'testit-cases/16-company-contacts/ca-872514-kontakty-vernaya-ssylka-na-stranicu-vakansij.md',
    entity: 'Контакты компании',
    reason: 'на странице контактов нет ссылки на вакансии',
  },
  {
    id: '872515',
    source: 'testit-cases/16-company-contacts/ca-872515-kontakty-vernaya-ssylka-na-stranicu-dokumentov.md',
    entity: 'Контакты компании',
    reason: 'на странице контактов нет ссылки на документы',
  },
  {
    id: '872517',
    source: 'testit-cases/16-company-contacts/ca-872517-kontakty-vernaya-ssylka-na-stranicu-istorii-kompanii.md',
    entity: 'Контакты компании',
    reason: 'на странице контактов нет ссылки на историю компании',
  },
  {
    id: '855334',
    source:
      'testit-cases/17-forms-and-widgets/ca-855334-otpravka-obrasheniya-po-knopke-obratitsya-v-uk-uspeshnaya-otpravka-soobsheniya.md',
    entity: 'Формы и виджеты',
    reason: 'нет формы "Обратиться в УК"',
  },
  {
    id: '872580',
    source: 'testit-cases/17-forms-and-widgets/ca-872580-vidzhety-otpravka-formy-obratitsya-v-uk.md',
    entity: 'Формы и виджеты',
    reason: 'нет виджета формы "Обратиться в УК"',
  },
  {
    id: '572511',
    source:
      'testit-cases/18-navigation/ca-572511-razvodyashaya-stranica-produktov-element-otkrytye-paevye-investicionnye-fondy-uspeshnaya-zagruzka-stranic.md',
    entity: 'Навигация',
    reason: 'нет разводящей страницы продуктов',
  },
  {
    id: '828452',
    source:
      'testit-cases/18-navigation/ca-828452-perehody-mezhdu-razdelami-top-menyu-produky-uspeshnaya-zagruzka-stranic.md',
    entity: 'Навигация',
    reason: 'в верхнем меню нет раздела "Продукты"',
  },
  {
    id: '828732',
    source:
      'testit-cases/18-navigation/ca-828732-perehody-mezhdu-razdelami-top-menyu-raskrytie-informacii-uspeshnaya-zagruzka-stranic.md',
    entity: 'Навигация',
    reason: 'в верхнем меню нет раздела "Раскрытие информации"',
  },
];

function graphSection(page: Page) {
  return page.locator('section[aria-labelledby="fund-chart-title"]');
}

function chartTable(page: Page) {
  return graphSection(page).locator('.chart-table');
}

async function openChartTable(page: Page, fundType: FundType) {
  await openHome(page);
  await graphSection(page).scrollIntoViewIfNeeded();
  await expect(page.locator('.highcharts-container')).toBeVisible({ timeout: 15_000 });
  await graphSection(page).getByLabel('Тип графика').selectOption({ label: fundType });
  await graphSection(page).getByLabel('Вкладка').selectOption({ label: 'Стоимость пая' });
  await graphSection(page).getByRole('checkbox', { name: 'Режим Таблица' }).check();
  await expect(chartTable(page)).toBeVisible();
}

async function applyDates(page: Page, from: string, to: string) {
  await graphSection(page).getByLabel('Начальная дата').fill(from);
  await graphSection(page).getByLabel('Конечная дата').fill(to);
  await graphSection(page).getByRole('button', { name: 'Применить даты' }).click();
}

async function performTableAction(page: Page, action: TableAction) {
  switch (action) {
    case 'period-1m':
      await graphSection(page).getByRole('button', { name: '1 мес' }).click();
      break;
    case 'period-3m':
      await graphSection(page).getByRole('button', { name: '3 мес' }).click();
      break;
    case 'period-ytd':
      await graphSection(page).getByRole('button', { name: 'С начала года' }).click();
      break;
    case 'period-all':
      await graphSection(page).getByRole('button', { name: 'За весь период' }).click();
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
  }
}

async function expectTableBuilt(page: Page) {
  const table = chartTable(page).getByRole('table');
  await expect(table).toBeVisible();
  await expect(table.getByRole('columnheader', { name: 'Дата' })).toBeVisible();
  await expect(table.getByRole('columnheader', { name: 'Стоимость пая' })).toBeVisible();
  await expect(table.locator('tbody tr')).not.toHaveCount(0);
}

test.describe('Оставшиеся TestIt-кейсы: табличный режим графика', () => {
  test.describe.configure({ mode: 'serial' });
  test.use({ viewport: { width: 1440, height: 1100 } });

  for (const tableCase of tableCases) {
    test(`TC-${tableCase.id}: ${tableCase.fundType}, таблица, ${tableCase.action} (${tableCase.source})`, async ({
      page,
    }) => {
      await openChartTable(page, tableCase.fundType);
      await performTableAction(page, tableCase.action);
      await expectTableBuilt(page);
    });
  }
});

test.describe('Оставшиеся TestIt-кейсы: реализованные контентные проверки', () => {
  test('TC-871883: реквизиты содержат адрес юридического лица', async ({ page }) => {
    await openHome(page);
    const section = page.locator('section[aria-labelledby="requisites-title"]');
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByText('Москва, Набережная света, 24')).toBeVisible();
  });

  test('TC-871905: блок реквизитов имеет корректный заголовок', async ({ page }) => {
    await openHome(page);
    const section = page.locator('section[aria-labelledby="requisites-title"]');
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByRole('heading', { name: 'Реквизиты' })).toBeVisible();
  });

  test('TC-872512: страница контактов содержит номер телефона', async ({ page }) => {
    await page.goto('/contacts');
    await expect(page.getByRole('heading', { name: 'Контакты' })).toBeVisible();
    await expect(page.getByRole('link', { name: '+7 (495) 123-45-67' })).toHaveAttribute(
      'href',
      'tel:+74951234567',
    );
  });

  test('TC-872586: логотип из верхнего меню открывает главную страницу', async ({ page }) => {
    await page.goto('/contacts');
    await page.getByRole('link', { name: 'Контрада Капитал' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'РОКОКО.' })).toBeVisible();
  });
});

test.describe('Оставшиеся TestIt-кейсы: отсутствуют в текущем прототипе', () => {
  for (const missingCase of missingCases) {
    test(`TC-${missingCase.id}: ${missingCase.entity} (${missingCase.source})`, async () => {
      test.fixme(true, missingCase.reason);
    });
  }
});
