import { expect, test } from '@playwright/test';
import { openPrimaryNews, primaryNews } from './helpers';

test.describe('Страница одной новости - верное название заголовка новостной статьи', () => {
  test('TC-857523: Страница одной новости содержит ожидаемый заголовок статьи @regress', async ({
    page,
  }) => {
    // TestIt ID: 857523, UUID: f823061e-c117-4426-b777-60906d09f22f
    await openPrimaryNews(page);
    await expect(page.getByRole('heading', { name: primaryNews.title, level: 2 })).toBeVisible();
  });
});
