import { expect, type Locator, type Page } from '@playwright/test';

export const primaryNews = {
  date: '23.12.2025 17:10',
  title:
    'Информация для владельцев инвестиционных паев Открытого паевого инвестиционного фонда рыночных финансовых инструментов «Сила Дохода».',
  text: 'Управляющая компания сообщает о предстоящей, ежеквартальной выплате дохода владельцам инвестиционных паев Открытого паевого инвестиционного фонда рыночных финансовых инструментов «Сила Дохода».',
};

export const firstOtherNews = {
  date: '05.11.2025 17:42',
  title: 'Контрада Капитал запустила биржевой ПИФ «Сила Ликвидности»',
  text: 'Управляющая компания «Контрада Капитал» запустила свой первый биржевой ПИФ рыночных финансовых инструментов «Сила Ликвидности» (SILA) (далее – Фонд) и объявляет о старте торгов. Стратегия Фонда ориентирована на инструменты денежного рынка.',
};

export async function openHome(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'РОКОКО.' })).toBeVisible();
}

export async function openNewsList(page: Page) {
  await page.goto('/news/page/1');
  await expect(page.getByRole('heading', { name: 'Новости', level: 1 })).toBeVisible();
}

export async function openPrimaryNews(page: Page) {
  await page.goto('/news/SD301225');
  await expect(page.getByRole('heading', { name: 'Новости', level: 1 })).toBeVisible();
}

export function homeNewsSection(page: Page) {
  return page.locator('section[aria-labelledby="home-news-title"]');
}

export function otherNewsSection(page: Page) {
  return page.locator('section[aria-labelledby="other-news-title"]');
}

export function newsCards(section: Locator) {
  return section.locator('.news-card');
}

export async function expectThreeNewsCards(section: Locator) {
  const grid = section.locator('.news-grid');
  const cards = newsCards(section);

  await expect(grid).toHaveCSS('display', 'grid');
  await expect
    .poll(async () =>
      grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length),
    )
    .toBe(3);
  await expect(cards).toHaveCount(3);
  await expect(cards.first()).toBeVisible();
}

export async function subscribe(page: Page) {
  await page.getByLabel('Ваше имя').fill('Евгений');
  await expect(page.getByLabel('Ваше имя')).toHaveValue('Евгений');

  await page.getByLabel('Email').fill('ew@bk.ru');
  await expect(page.getByLabel('Email')).toHaveValue('ew@bk.ru');

  await page
    .getByRole('checkbox', { name: 'Я даю согласие на обработку персональных данных' })
    .check();
  await expect(
    page.getByRole('checkbox', { name: 'Я даю согласие на обработку персональных данных' }),
  ).toBeChecked();

  await page.getByRole('button', { name: 'Подписаться', exact: true }).click();
  await expect(page.getByRole('status')).toContainText(
    'Данные пользователя Имя: Евгений Фамилия: Email: ew@bk.ru Телефон: Дата: 2026-03-27 09:46:22 Комментарий:',
  );
}
