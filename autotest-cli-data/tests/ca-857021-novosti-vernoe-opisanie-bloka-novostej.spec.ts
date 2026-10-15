import { expect, test } from './mock-test';
import { expectThreeNewsCards, homeNewsSection, newsCards, openHome, primaryNews } from './helpers';

test.describe('Главная страница. Новости - верное описание блока новостей', () => {
  test('TC-857021: Первый блок новостей содержит ожидаемое описание @regress', async ({
    page,
  }) => {
    // TestIt ID: 857021, UUID: 99c09ef6-c7a6-4531-880b-d343b952ff8e
    await openHome(page);
    const section = homeNewsSection(page);

    await section.scrollIntoViewIfNeeded();
    await expectThreeNewsCards(section);
    await expect(newsCards(section).first()).toContainText(primaryNews.text);
  });
});
