/**
 * Пример использования API-моков в Playwright тестах.
 *
 * @provenance
 * source: mock-generator skill
 * usage: autotest-cli-data/tests/
 */

import { test, expect } from '../mocks/handlers';

// ============================================================
// ПРИМЕР 1: Базовый тест с моками
// ============================================================

test.describe('Главная страница', () => {
  test.beforeEach(async ({ page, mockState }) => {
    // Регистрируем все API-моки
    await import('../mocks/handlers').then(({ registerApiMocks }) =>
      registerApiMocks(page, mockState)
    );
  });

  test('отображает баннер', async ({ page }) => {
    await page.goto('/');

    // Баннер из bannerFixtures
    await expect(page.getByText('Инвестируйте с уверенностью')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Наши фонды' })).toBeVisible();
  });

  test('отображает новости', async ({ page }) => {
    await page.goto('/news');

    // Новости из newsFixtures
    await expect(page.getByText('Решение о выплате дохода по ПИФ АКСИОМА')).toBeVisible();
    await expect(page.getByText('Ежемесячный отчёт за июль 2026 года')).toBeVisible();
  });
});

// ============================================================
// ПРИМЕР 2: Stateful тест (подписка)
// ============================================================

test.describe('Подписка на новости', () => {
  test.beforeEach(async ({ page, mockState }) => {
    const { registerApiMocks } = await import('../mocks/handlers');
    await registerApiMocks(page, mockState);
  });

  test('успешная подписка', async ({ page, mockState }) => {
    await page.goto('/');

    // Заполняем форму подписки
    await page.getByPlaceholder('Ваш email').fill('test@example.com');
    await page.getByRole('button', { name: 'Подписаться' }).click();

    // Проверяем успешное сообщение
    await expect(page.getByText('Вы успешно подписались на новости')).toBeVisible();

    // Проверяем stateful состояние
    expect(mockState.subscriptions.get('test@example.com')?.email).toBe('test@example.com');
  });

  test('дублирующая подписка → 409', async ({ page, mockState }) => {
    await page.goto('/');

    // Первая подписка
    await page.getByPlaceholder('Ваш email').fill('test@example.com');
    await page.getByRole('button', { name: 'Подписаться' }).click();
    await expect(page.getByText('Вы успешно подписались на новости')).toBeVisible();

    // Вторая подписка с тем же email → ошибка
    await page.getByPlaceholder('Ваш email').fill('test@example.com');
    await page.getByRole('button', { name: 'Подписаться' }).click();
    await expect(page.getByText('Подписка уже существует')).toBeVisible();
  });

  test('отписка после подписки', async ({ page, mockState }) => {
    await page.goto('/');

    // Подписка
    await page.getByPlaceholder('Ваш email').fill('test@example.com');
    await page.getByRole('button', { name: 'Подписаться' }).click();
    await expect(page.getByText('Вы успешно подписались на новости')).toBeVisible();

    // Отписка
    await page.getByRole('button', { name: 'Отписаться' }).click();
    await expect(page.getByText('Вы успешно отписались от новостей')).toBeVisible();

    // Проверяем состояние
    expect(mockState.subscriptions.has('test@example.com')).toBe(false);
  });
});

// ============================================================
// ПРИМЕР 3: Сценарии (empty, notFound)
// ============================================================

test.describe('Сценарии', () => {
  test('пустой список новостей', async ({ page, mockState }) => {
    const { registerApiMocks } = await import('../mocks/handlers');
    await registerApiMocks(page, mockState, {
      newsScenario: 'empty',
    });

    await page.goto('/news');

    // Пустое состояние
    await expect(page.getByText('Новости не найдены')).toBeVisible();
  });

  test('страница не найдена (404)', async ({ page, mockState }) => {
    const { registerApiMocks } = await import('../mocks/handlers');
    await registerApiMocks(page, mockState, {
      pageScenario: 'notFound',
    });

    await page.goto('/inform/pif/nonexistent');

    // 404 страница
    await expect(page.getByText('Страница не найдена')).toBeVisible();
  });

  test('задержка загрузки (loading state)', async ({ page, mockState }) => {
    const { registerApiMocks } = await import('../mocks/handlers');
    await registerApiMocks(page, mockState, {
      delay: 2000, // 2 секунды
    });

    await page.goto('/');

    // Loading state виден
    await expect(page.getByTestId('loading-spinner')).toBeVisible();

    // После загрузки — контент
    await expect(page.getByText('Инвестируйте с уверенностью')).toBeVisible({
      timeout: 5000,
    });
  });
});

// ============================================================
// ПРИМЕР 4: Fail-closed (незамоканный запрос)
// ============================================================

test.describe('Fail-closed', () => {
  test('незамоканный API-запрос → ошибка', async ({ page, mockState }) => {
    const { registerApiMocks } = await import('../mocks/handlers');
    await registerApiMocks(page, mockState);

    // Переходим на страницу, которая делает запрос к незамоканному эндпоинту
    await page.goto('/some-unmocked-page');

    // Fail-closed route возвращает 500
    // (зависит от того, как frontend обрабатывает ошибки)
    await expect(page.getByText(/UNMOCKED_API_REQUEST|Ошибка загрузки/)).toBeVisible({
      timeout: 5000,
    });
  });
});

// ============================================================
// ПРИМЕР 5: Тест формы обратной связи
// ============================================================

test.describe('Форма обратной связи', () => {
  test.beforeEach(async ({ page, mockState }) => {
    const { registerApiMocks } = await import('../mocks/handlers');
    await registerApiMocks(page, mockState);
  });

  test('успешная отправка формы', async ({ page, mockState }) => {
    await page.goto('/contacts');

    // Заполняем форму
    await page.getByLabel('Имя').fill('Иван');
    await page.getByLabel('Фамилия').fill('Иванов');
    await page.getByLabel('Email').fill('ivanov@example.com');
    await page.getByLabel('Телефон').fill('+7 (999) 123-45-67');
    await page.getByLabel('Сообщение').fill('Хочу узнать больше о фондах');

    await page.getByRole('button', { name: 'Отправить' }).click();

    // Успешное сообщение
    await expect(page.getByText('Спасибо! Ваше обращение принято.')).toBeVisible();

    // Проверяем stateful состояние
    expect(mockState.feedback.at(-1)?.email).toBe('ivanov@example.com');
  });

  test('валидация: пустой email', async ({ page }) => {
    await page.goto('/contacts');

    // Заполняем только имя
    await page.getByLabel('Имя').fill('Иван');
    await page.getByRole('button', { name: 'Отправить' }).click();

    // Ошибка валидации
    await expect(page.getByText(/email.*обязательно/i)).toBeVisible();
  });
});
