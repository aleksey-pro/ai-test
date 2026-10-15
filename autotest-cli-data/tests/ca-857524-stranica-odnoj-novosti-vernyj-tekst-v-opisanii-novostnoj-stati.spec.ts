import { expect, test } from '@playwright/test';
import { openPrimaryNews, primaryNews } from './helpers';

test.describe('Страница одной новости - верный текст в описании новостной статьи', () => {
  test('TC-857524: Страница одной новости содержит ожидаемый текст статьи @regress', async ({
    page,
  }) => {
    // TestIt ID: 857524, UUID: c068101e-3b36-4632-8cb7-57cafcddad0f
    await openPrimaryNews(page);
    await expect(page.locator('article')).toContainText(primaryNews.text);
  });
});
