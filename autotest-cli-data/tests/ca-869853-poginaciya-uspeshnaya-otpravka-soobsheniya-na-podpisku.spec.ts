import { expect, test } from '@playwright/test';
import { openNewsList } from './helpers';

test.describe('Страница новости. Погинация - успешная отправка сообщения на подписку', () => {
  test('TC-869853: Пагинация переключает первую и вторую страницы новостей @regress', async ({
    page,
  }) => {
    // TestIt ID: 869853, UUID: 55db1ecb-8323-4135-8e63-1ff801a9e96d
    await openNewsList(page);

    await page.getByRole('link', { name: '2', exact: true }).click();
    await expect(page).toHaveURL(/\/news\/page\/2$/);

    await page.getByRole('link', { name: '1', exact: true }).click();
    await expect(page).toHaveURL(/\/news\/page\/1$/);

    await page.getByRole('link', { name: 'Стрелка вправо' }).click();
    await expect(page).toHaveURL(/\/news\/page\/2$/);

    await page.getByRole('link', { name: 'Стрелка влево' }).click();
    await expect(page).toHaveURL(/\/news\/page\/1$/);
  });
});

