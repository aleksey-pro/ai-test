import { expect, test } from './mock-test';
import { expectThreeNewsCards, homeNewsSection, newsCards, openHome } from './helpers';

test.describe('Главная страница. Новости - наличие надписи "Читать" в блоке новостей', () => {
  test('TC-857341: Все три блока новостей содержат надпись "Читать" @regress', async ({
    page,
  }) => {
    // TestIt ID: 857341, UUID: 705870ad-c8dd-432b-8c1d-a23b396ac4e1
    await openHome(page);
    const section = homeNewsSection(page);

    await section.scrollIntoViewIfNeeded();
    await expectThreeNewsCards(section);
    await expect(newsCards(section).getByText('Читать')).toHaveCount(3);
  });
});
