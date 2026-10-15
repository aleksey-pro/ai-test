import { expect, test } from '@playwright/test';
import { openHome } from './helpers';

test.describe('Реквизиты - верное Полное наименование на русском языке', () => {
  test('TC-869923: Реквизиты содержат полное наименование на русском языке @regress', async ({
    page,
  }) => {
    // TestIt ID: 869923, UUID: 327d80b1-0dc4-4d2f-a710-ed031afdae46
    await openHome(page);

    const section = page.locator('section[aria-labelledby="requisites-title"]');
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByRole('heading', { name: 'Реквизиты' })).toBeVisible();
    const fullNameRow = section
      .locator('dt', { hasText: 'Полное наименование на русском языке' })
      .locator('..');
    await expect(fullNameRow.locator('dt')).toBeVisible();
    await expect(fullNameRow.locator('dd')).toHaveText('Акционерное общество «Контрада Капитал»');
  });
});
