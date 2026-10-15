import { expect, test } from '@playwright/test';
import { firstOtherNews, newsCards, openPrimaryNews, otherNewsSection } from './helpers';

test.describe('Страница одной новости. Другие новости - кликабельность блока других новостей', () => {
  test('TC-869031: Клик по первому блоку других новостей открывает страницу новости @regress', async ({
    page,
  }) => {
    // TestIt ID: 869031, UUID: b783a063-7bf5-4354-b527-0ca5635c2078
    await openPrimaryNews(page);
    const section = otherNewsSection(page);

    await section.scrollIntoViewIfNeeded();
    await newsCards(section).first().click();

    await expect(page).toHaveURL(/\/news\/SILA051125$/);
    await expect(page.getByRole('heading', { name: firstOtherNews.title, level: 2 })).toBeVisible();
  });
});

