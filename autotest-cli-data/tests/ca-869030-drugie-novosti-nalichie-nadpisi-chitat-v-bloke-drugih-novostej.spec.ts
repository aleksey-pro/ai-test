import { expect, test } from '@playwright/test';
import { expectThreeNewsCards, newsCards, openPrimaryNews, otherNewsSection } from './helpers';

test.describe('Страница одной новости. Другие новости - наличие надписи "Читать" в блоке других новостей', () => {
  test('TC-869030: Все блоки других новостей содержат надпись "Читать" @regress', async ({
    page,
  }) => {
    // TestIt ID: 869030, UUID: 4573b8ef-b1e1-4632-a799-a3c0b66babf9
    await openPrimaryNews(page);
    const section = otherNewsSection(page);

    await section.scrollIntoViewIfNeeded();
    await expectThreeNewsCards(section);
    await expect(newsCards(section).getByText('Читать')).toHaveCount(3);
  });
});

