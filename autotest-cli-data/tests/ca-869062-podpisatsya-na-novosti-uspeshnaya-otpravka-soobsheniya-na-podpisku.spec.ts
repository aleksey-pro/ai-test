import { expect, test } from '@playwright/test';
import { openPrimaryNews, subscribe } from './helpers';

test.describe('Страница одной новости. Подписаться на новости - успешная отправка сообщения на подписку', () => {
  test('TC-869062: Инлайн-форма подписки отправляет сообщение @regress', async ({ page }) => {
    // TestIt ID: 869062, UUID: 8dec25ea-78bd-43ea-a755-8a117d2da5bf
    await openPrimaryNews(page);

    await page.getByRole('heading', { name: 'Подписаться на новости' }).scrollIntoViewIfNeeded();
    await expect(page.getByRole('heading', { name: 'Подписаться на новости' })).toBeVisible();
    await subscribe(page);
  });
});

