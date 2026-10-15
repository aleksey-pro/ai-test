import { test } from '@playwright/test';
import { expectThreeNewsCards, openPrimaryNews, otherNewsSection } from './helpers';

test.describe('Страница одной новости - наличие раздела "Другие новости"', () => {
  test('TC-869026: В разделе "Другие новости" отображаются три блока @regress', async ({
    page,
  }) => {
    // TestIt ID: 869026, UUID: 5a70c0ea-a294-49c9-93e2-4da53469ebf1
    await openPrimaryNews(page);
    const section = otherNewsSection(page);

    await section.scrollIntoViewIfNeeded();
    await expectThreeNewsCards(section);
  });
});
