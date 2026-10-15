import { expect, test } from '@playwright/test';
import { openHome } from './helpers';

test.describe('Главная страница. Навигация - успешный переход на страницу "Контакты"', () => {
  test('TC-900001: Главная страница. Навигация - успешный переход на страницу "Контакты" @regress', async ({
    page,
  }) => {
    // TestIt ID: 900001, UUID: 2ac0b643-191b-4c01-a04b-6b207c65ef9a

    await test.step('Открыть главную страницу', async () => {
      await openHome(page);
    });

    await test.step('Проверить заголовок главной страницы', async () => {
      await expect(
        page.getByRole('heading', { name: 'РОКОКО.' }),
      ).toBeVisible();
    });

    await test.step('Проверить активный пункт навигации "Главная"', async () => {
      await expect(page.getByRole('link', { name: 'Главная' })).toHaveAttribute(
        'aria-current',
        'page',
      );
    });

    await test.step('Перейти на страницу "Контакты" через пункт "Связаться"', async () => {
      await page.getByRole('link', { name: 'Связаться' }).click();
      await expect(page).toHaveURL(/\/contacts$/);
    });

    await test.step('Проверить заголовок страницы "Контакты"', async () => {
      await expect(
        page.getByRole('heading', { name: 'Обсудим вашу следующую историю.' }),
      ).toBeVisible();
    });

    await test.step('Проверить активный пункт навигации "Связаться"', async () => {
      await expect(page.getByRole('link', { name: 'Связаться' })).toHaveAttribute(
        'aria-current',
        'page',
      );
    });
  });
});
