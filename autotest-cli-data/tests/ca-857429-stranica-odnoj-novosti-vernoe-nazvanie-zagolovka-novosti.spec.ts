import { expect, test } from '@playwright/test';
import { expectThreeNewsCards, homeNewsSection, newsCards, openHome } from './helpers';

test.describe('Страница одной новости - верное название заголовка "Новости"', () => {
  test('TC-857429: После клика по первой новости отображается заголовок "Новости" @regress', async ({
    page,
  }) => {
    // TestIt ID: 857429, UUID: 2da1d15f-d9d4-453b-9a49-144f5f990e14
    await openHome(page);
    const section = homeNewsSection(page);

    await section.scrollIntoViewIfNeeded();
    await expectThreeNewsCards(section);
    await newsCards(section).first().click();

    await expect(page).toHaveURL(/\/news\/SD301225$/);
    await expect(page.getByRole('heading', { name: 'Новости', level: 1 })).toBeVisible();
  });
});

