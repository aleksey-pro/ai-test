import { expect, test } from '@playwright/test';
import { newsCards, openNewsList } from './helpers';

test.describe('Страница новости - кликабельность блока новостей', () => {
  test('TC-869825: Клик по первому блоку списка открывает страницу новости @regress', async ({
    page,
  }) => {
    // TestIt ID: 869825, UUID: 2c30e927-84d6-4102-9e48-5aafa5555b7d
    await openNewsList(page);
    await newsCards(page.locator('section[aria-labelledby="news-list-title"]')).first().click();
    await expect(page).toHaveURL(/\/news\/SD301225$/);
    await expect(page.getByRole('heading', { name: 'Новости', level: 1 })).toBeVisible();
  });
});

