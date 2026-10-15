import { expect, test } from '@playwright/test';
import { firstOtherNews, newsCards, openPrimaryNews, otherNewsSection } from './helpers';

test.describe('Страница одной новости. Другие новости - верное описание блока других новостей', () => {
  test('TC-869028: Первый блок других новостей содержит ожидаемое описание @regress', async ({
    page,
  }) => {
    // TestIt ID: 869028, UUID: a8076691-0096-4294-b782-833e1d1ed99c
    await openPrimaryNews(page);
    const section = otherNewsSection(page);

    await section.scrollIntoViewIfNeeded();
    await expect(newsCards(section).first()).toContainText(firstOtherNews.text);
  });
});

