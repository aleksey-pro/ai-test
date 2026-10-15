# Этап 1. Инициализация, зависимости и диагностика

Запуск из корня проекта:

```bash
npx --yes @invest-fund/autotest-cli@0.0.1 init
```

CLI определяет React/Vite или Next.js по `package.json`; при необходимости фреймворк задаётся через `--framework`. Создаются `.agents`, структура `autotest-cli-data`, `playwright.config.ts`, а в `package.json` добавляются Playwright-зависимость и тестовые скрипты. Существующий `playwright.config.ts` сохраняется; его замена допускается только с `--force`.

После инициализации устанавливаются зависимости и Chromium, затем проверяется окружение:

```bash
npm install
npx playwright install chromium
npx @invest-fund/autotest-cli doctor
```

`@playwright/cli` можно установить отдельно для дополнительной runtime-диагностики UI, но он не обязателен для тестов и CI.
