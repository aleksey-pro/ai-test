import { expect, test } from '@playwright/test';
import { homeNewsSection, newsCards, openHome, primaryNews } from './helpers';

test.describe('Главная страница. Новости - успешный переход по ссылке "Все новости"', () => {
  test('TC-857343: Ссылка "Все новости" открывает первую страницу новостей @regress', async ({
    page,
  }) => {
    // TestIt ID: 857343, UUID: e713aba4-c9a2-4e4d-9761-9c375678a005
    await openHome(page);
    const section = homeNewsSection(page);

    await section.scrollIntoViewIfNeeded();
    await expect(section.getByRole('link', { name: 'Все новости' })).toBeVisible();
    await section.getByRole('link', { name: 'Все новости' }).click();

    await expect(page).toHaveURL(/\/news\/page\/1$/);
    await expect(page.getByRole('heading', { name: 'Новости', level: 1 })).toBeVisible();

    const firstCard = newsCards(page.locator('section[aria-labelledby="news-list-title"]')).first();
    await expect(firstCard.locator('time')).toHaveText(primaryNews.date);
    await expect(firstCard).toContainText(primaryNews.title);
    await expect(firstCard).toContainText(primaryNews.text);
    await expect(page.getByRole('link', { name: 'Стрелка назад' })).toBeVisible();
  });
});

