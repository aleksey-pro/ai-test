import { expect, test } from '@playwright/test';
import { openPrimaryNews, primaryNews } from './helpers';

test.describe('Страница одной новости - верные дата/время новости', () => {
  test('TC-857522: Страница одной новости содержит ожидаемые дату и время @regress', async ({
    page,
  }) => {
    // TestIt ID: 857522, UUID: c16eab04-9d98-48d0-923c-0b5b1af46baf
    await openPrimaryNews(page);
    await expect(page.locator('article > time')).toHaveText(primaryNews.date);
  });
});
