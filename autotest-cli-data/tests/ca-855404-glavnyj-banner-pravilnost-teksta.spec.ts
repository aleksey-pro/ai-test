import { expect, test } from './mock-test';
import { openHome } from './helpers';

test.describe('Главная страница. Главный баннер - правильность текста', () => {
  test('TC-855404: Главный баннер содержит ожидаемый текст @regress', async ({ page }) => {
    // TestIt ID: 855404, UUID: 03cfb534-89b3-4ad8-9753-84761b1fa3fe
    await test.step('Открыть главную страницу', async () => {
      await openHome(page);
    });

    await test.step('Проверить текст главного баннера', async () => {
      await expect(
        page.getByText(
          'Надежный партнёр для доступных инвестиций. 21 год на рынке коллективных инвестиций >70 млрд. ₽ в активном управлении >50 реализованных через ЗПИФ проектов',
        ),
      ).toBeVisible();
    });
  });
});
