import { expect, test } from '@playwright/test';
import { openNewsList, subscribe } from './helpers';

test.describe('Страница новости. Подписаться на новости - успешная отправка сообщения на подписку', () => {
  test('TC-869827: Модальная форма подписки отправляет сообщение @regress', async ({ page }) => {
    // TestIt ID: 869827, UUID: 0d5f7757-8ce8-401d-a8b7-0f4c17664a6c
    await openNewsList(page);

    await page.getByRole('button', { name: 'Подписаться на новости' }).click();
    await expect(page.getByLabel('Ваше имя')).toBeVisible();
    await subscribe(page);
  });
});

