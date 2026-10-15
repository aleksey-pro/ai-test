import { expect, test, type Locator, type Page } from '@playwright/test';
import { homeNewsSection, newsCards, openHome, openPrimaryNews, otherNewsSection } from './helpers';

async function expectHorizontalThreeCardLayout(section: Locator) {
  const grid = section.locator('.news-grid');
  const cards = newsCards(section);
  const boxes = await cards.evaluateAll((elements) =>
    elements.map((element) => {
      const box = element.getBoundingClientRect();
      return { left: box.left, top: box.top, width: box.width, height: box.height };
    }),
  );

  await expect(grid).toHaveCSS('display', 'grid');
  await expect(cards).toHaveCount(3);
  expect(boxes).toHaveLength(3);
  expect(Math.abs(boxes[0].top - boxes[1].top)).toBeLessThan(4);
  expect(Math.abs(boxes[1].top - boxes[2].top)).toBeLessThan(4);
  expect(boxes[0].left).toBeLessThan(boxes[1].left);
  expect(boxes[1].left).toBeLessThan(boxes[2].left);
  boxes.forEach((box) => {
    expect(box.width).toBeGreaterThan(250);
    expect(box.height).toBeGreaterThan(250);
  });
}

async function expectReadMarkers(section: Locator) {
  const markers = section.locator('.news-card span', { hasText: 'Читать' });
  await expect(markers).toHaveCount(3);
  for (const marker of await markers.all()) {
    await expect(marker).toBeVisible();
  }
}

test.describe('Non-graph visual TestIt cases', () => {
  test.use({ viewport: { width: 1440, height: 1000 } });

  test('TC-855404: главный баннер визуально отображает ожидаемый текст', async ({ page }) => {
    await openHome(page);

    const hero = page.locator('.hero');
    await expect(hero).toContainText('Надежный партнёр для доступных инвестиций');
    await expect(hero).toContainText('21 год на рынке коллективных инвестиций');
    await expect(hero).toContainText('>70 млрд. ₽ в активном управлении');
    await expect(hero).toContainText('>50 реализованных через ЗПИФ проектов');
    await expect(hero).toHaveScreenshot('tc-855404-home-hero-banner.png');
  });

  test('TC-857341: блок новостей содержит три горизонтальные карточки с элементом Читать', async ({
    page,
  }) => {
    await openHome(page);

    const section = homeNewsSection(page);
    await section.scrollIntoViewIfNeeded();
    await expectHorizontalThreeCardLayout(section);
    await expectReadMarkers(section);
    await expect(section).toHaveScreenshot('tc-857341-home-news-three-horizontal-cards.png');
  });

  test('TC-869026: раздел Другие новости содержит три горизонтальные карточки', async ({ page }) => {
    await openPrimaryNews(page);

    const section = otherNewsSection(page);
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByRole('heading', { name: 'Другие новости' })).toBeVisible();
    await expectHorizontalThreeCardLayout(section);
    await expect(section).toHaveScreenshot('tc-869026-other-news-three-horizontal-cards.png');
  });

  test('TC-869030: карточки раздела Другие новости визуально содержат элемент Читать', async ({
    page,
  }) => {
    await openPrimaryNews(page);

    const section = otherNewsSection(page);
    await section.scrollIntoViewIfNeeded();
    await expectHorizontalThreeCardLayout(section);
    await expectReadMarkers(section);
    await expect(section).toHaveScreenshot('tc-869030-other-news-read-markers.png');
  });
});
