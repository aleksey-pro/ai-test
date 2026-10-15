import { expect, test } from './mock-test';
import { expectThreeNewsCards, homeNewsSection, newsCards, openHome, primaryNews } from './helpers';

test.describe('Главная страница. Новости - верные дата/время блока новостей', () => {
  test('TC-857001: Первый блок новостей содержит ожидаемую дату и время @regress', async ({
    page,
  }) => {
    // TestIt ID: 857001, UUID: 2407e65f-3056-4a4a-9174-77e79bee8bb3
    await openHome(page);
    const section = homeNewsSection(page);

    await test.step('Прокрутить к блоку "Новости"', async () => {
      await section.scrollIntoViewIfNeeded();
      await expect(section).toBeVisible();
    });

    await test.step('Проверить наличие трех блоков новостей', async () => {
      await expectThreeNewsCards(section);
    });

    await test.step('Проверить дату и время первого блока', async () => {
      await expect(newsCards(section).first().locator('time')).toHaveText(primaryNews.date);
    });
  });
});
