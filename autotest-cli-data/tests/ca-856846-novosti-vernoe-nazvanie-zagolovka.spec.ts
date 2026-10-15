import { expect, test } from './mock-test';
import { homeNewsSection, openHome } from './helpers';

test.describe('Главная страница. Новости - верное название заголовка "Новости"', () => {
  test('TC-856846: В блоке новостей отображается заголовок "Новости" @regress', async ({
    page,
  }) => {
    // TestIt ID: 856846, UUID: f81761a0-0d77-4c8a-a80d-251baedabb4f
    await openHome(page);

    await test.step('Прокрутить к блоку "Новости"', async () => {
      await homeNewsSection(page).scrollIntoViewIfNeeded();
      await expect(homeNewsSection(page)).toBeVisible();
    });

    await test.step('Проверить заголовок "Новости"', async () => {
      await expect(
        homeNewsSection(page).getByRole('heading', { name: 'Новости', level: 2 }),
      ).toBeVisible();
    });
  });
});
