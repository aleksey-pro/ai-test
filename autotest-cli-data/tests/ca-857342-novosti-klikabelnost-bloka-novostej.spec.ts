import { expect, test } from '@playwright/test';
import { expectThreeNewsCards, homeNewsSection, newsCards, openHome } from './helpers';

test.describe('Главная страница. Новости - кликабельность блока новостей', () => {
  test('TC-857342: Клик по первому блоку открывает страницу новости @regress', async ({
    page,
  }) => {
    // TestIt ID: 857342, UUID: 4b0f5132-7f82-49e4-a35a-76caf7faa9b1
    await openHome(page);
    const section = homeNewsSection(page);

    await section.scrollIntoViewIfNeeded();
    await expectThreeNewsCards(section);
    await newsCards(section).first().click();

    await expect(page).toHaveURL(/\/news\/SD301225$/);
    await expect(page.getByRole('heading', { name: 'Новости', level: 1 })).toBeVisible();
  });
});

