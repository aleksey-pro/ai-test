import { expect, test } from '@playwright/test';
import { firstOtherNews, newsCards, openPrimaryNews, otherNewsSection } from './helpers';

test.describe('Страница одной новости. Другие новости - верные дата/время в блоке других новостей', () => {
  test('TC-869027: Первый блок других новостей содержит ожидаемую дату @regress', async ({
    page,
  }) => {
    // TestIt ID: 869027, UUID: 0d01d4ef-0a8e-46b2-9055-b5d969d6c04c
    await openPrimaryNews(page);
    const section = otherNewsSection(page);

    await section.scrollIntoViewIfNeeded();
    await expect(newsCards(section).first().locator('time')).toHaveText(firstOtherNews.date);
  });
});
