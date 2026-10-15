import { expect, test } from '@playwright/test';
import { openPrimaryNews } from './helpers';

test.describe('Страница одной новости - переход по стрелке "Назад"', () => {
  test('TC-868364: Стрелка назад ведет на страницу списка новостей @regress', async ({ page }) => {
    // TestIt ID: 868364, UUID: f9085e53-e1a3-4b96-b932-9c460f5cad50
    await openPrimaryNews(page);
    const backLink = page.getByRole('link', { name: 'Стрелка назад' });

    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL(/\/news\/page\/1$/);
    await expect(page.getByRole('heading', { name: 'Новости', level: 1 })).toBeVisible();
  });
});
