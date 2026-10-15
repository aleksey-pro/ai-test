import { expect, test } from '@playwright/test';
import { openNewsList } from './helpers';

test.describe('Страница новости - верное название заголовка "Новости"', () => {
  test('TC-869819: На странице списка новостей отображается заголовок "Новости" @regress', async ({
    page,
  }) => {
    // TestIt ID: 869819, UUID: d1746b71-79e0-4e94-ba37-16355f2bcfaa
    await openNewsList(page);
    await expect(page.getByRole('heading', { name: 'Новости', level: 1 })).toBeVisible();
  });
});

