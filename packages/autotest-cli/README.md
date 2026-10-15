# @invest-fund/autotest-cli

Установщик flow автоматизации TestIt → Playwright для проектов React/Vite и Next.js.
Он добавляет Playwright-конфигурацию, структуру `autotest-cli-data` и инструкции для Codex,
после чего команда `/autotest` проводит полный цикл: выгрузка кейсов из TestIt,
классификация, pre-check, генерация, запуск и исправление тестов.

## 1. Инициализировать проект

Выполните команду в корне целевого проекта:

```bash
npx --yes @invest-fund/autotest-cli@0.0.1 init
```

Или укажите целевой проект явно:

```bash
npx @invest-fund/autotest-cli init --cwd /path/to/project
```

CLI определяет Next.js или React/Vite по `package.json`. При необходимости выбор
можно задать вручную:

```bash
npx @invest-fund/autotest-cli init --framework=nextjs
npx @invest-fund/autotest-cli init --framework=react-vite
```

Будут созданы `.agents`, каталоги `autotest-cli-data` и `playwright.config.ts`, а в
`package.json` добавятся зависимость `@playwright/test` и скрипты тестов.
Существующий `playwright.config.ts` не перезаписывается; для его замены
используйте `--force`.

Проверить, что проект подготовлен, можно так:

```bash
npx @invest-fund/autotest-cli doctor
```

Для разработки самого CLI предусмотрен `scripts/cli.test.mjs`. Он во временных
проектах проверяет, что `init` распознаёт React/Vite и Next.js, создаёт нужные
файлы и генерирует корректную команду запуска Playwright. Запуск:

```bash
npm test
```

## 2. Установить зависимости и браузер

После инициализации проекта выполните:

```bash
npm install
npx playwright install chromium
```

### Необязательная диагностика runtime UI

Flow умеет использовать `@playwright/cli` как дополнительный источник фактических
данных: accessibility snapshot, URL и состояние UI. Пакет не устанавливается автоматически
и не нужен для запуска тестов или CI. `autotest doctor` показывает его доступность.

Если политика registry разрешает пакет, его можно установить вручную в целевой проект:

```bash
npm install --save-dev @playwright/cli
```

После этого CLI доступен как `playwright-cli`. Если пакет недоступен в private registry,
flow продолжает работу со стандартными Playwright trace, screenshot, кодом и TestIt-кейсами.

## 3. Запустить автоматизацию в Codex

Следующий шаг — вызов команды `/autotest` в чате Codex. Она использует
инструкции, добавленные в `.agents`, и запускает полный flow автоматизации.

```text
/autotest id=562468
```

Рекомендуемый вызов с выбором секции и типа тестов:

```text
/autotest id=562468 section="Контакты" test-type=integration
```

Полный пример:

```text
/autotest id=562468 section="Десктопная версия" include="контакты" exclude="архив" test-type=integration
```

`id` — единственный обязательный аргумент: числовой ID проекта TestIt. Его имя
должно быть строго `id`; алиасы `project-id`, `testit-id` и
`testit-project-id` не поддерживаются. Значения с пробелами заключайте в
кавычки.

### Аргументы `/autotest`

| Аргумент | Обязательный | По умолчанию | Назначение |
| --- | --- | --- | --- |
| `id` | Да | — | Числовой ID проекта TestIt |
| `section` | Нет | Корневая секция | Название секции TestIt |
| `include` | Нет | Без фильтра | Ключевые слова для включения кейсов |
| `exclude` | Нет | Без фильтра | Ключевые слова для исключения кейсов |
| `test-type` / `target-test-type` | Нет | `integration` | Тип тестов для классификации, генерации и запуска |
| `file` / `case-file` | Нет | Все `.md` | Обработать конкретный файл тест-кейса |
| `overwrite` | Нет | `true` | Перезаписывать тесты при изменении входного кейса |
| `base-url` | Нет | Из `playwright.config.*` | Базовый URL приложения |
| `test-scope` | Нет | Вычисляется автоматически | Узкий набор тестов для первого прогона и исправления |
| `tags` | Нет | Пусто | Дополнительные Playwright-теги или аннотации |

Пути `input-dir`, `cases-dir`, `output-dir` и `tests-dir` не принимаются: они
закреплены во flow.

### Дополнительные параметры

`test-scope` ограничивает первый запуск одним spec-файлом или узким набором
тестов, который передаётся в `playwright-test-healer`. Обычно его задавать не
нужно: flow использует созданные или изменённые spec-файлы, а после их успешного
выполнения расширяет прогон до релевантного набора. Пример:

```text
test-scope="autotest-cli-data/tests/contacts.spec.ts"
```

`tags` передаёт generator дополнительный контекст для меток и аннотаций,
например `tags="@smoke,@contacts"`. Этот параметр не фильтрует TestIt-кейсы и
не задаёт отдельного гарантированного запуска по тегам. У flow нет строгого
формата `tags`, поэтому без принятого в проекте соглашения этот параметр лучше
не передавать.

`base-url` позволяет запускать тесты на уже работающей среде — локальной,
стендовой или preview. Например:

```text
base-url="http://127.0.0.1:4173"
```

Без него используется значение из `playwright.config.*` (по умолчанию
`http://127.0.0.1:4173`), а Playwright запускает локальный сервер. При передаче
другого URL он предполагает, что среда уже доступна, и локальный сервер не
поднимает. Значение используется при генерации `page.goto()` и передаётся в
запуск через переменную окружения `BASE_URL`.

Поддерживаемые значения `test-type`:

```text
integration
visual-regression
e2e-contract
content-regression
validation-form-state
navigation-routing
fixme-manual
hybrid
```

Внутренний протокол также поддерживает форму:

```text
[-[tests-automatization id="562468" section="Контакты" test-type="integration"]-]
```

Для обычной работы используйте короткую команду `/autotest`.

## Результаты

| Результат | Расположение |
| --- | --- |
| Кейсы TestIt и классифицированные кейсы | `autotest-cli-data/test-cases/testit/` и `autotest-cli-data/test-cases/testit/<test-type>/` |
| Playwright-тесты | `autotest-cli-data/tests/` |
| API-моки | `autotest-cli-data/mocks/` |
| Единый отчёт | `autotest-cli-data/reports/<YYYY.MM.DD:HH:MM>/tests-automatization-report.md` |
| HTML-отчёт Playwright | `playwright-report/` |
| Результаты запуска | `test-results/` |

Если запуск повторяется в ту же минуту, к папке отчёта добавляется суффикс
`-02`, `-03` и далее.

Инструкции flow находятся в `.agents/prompts/autotest.md` и
`.agents/tests-automatization/AGENT.md` созданного проекта.

## Nexus и публикация

```ini
@invest-fund:registry=https://nexus.sovcombank.group/repository/invest-fund/
//nexus.sovcombank.group/repository/invest-fund/:_authToken=${NPM_TOKEN}
always-auth=true
```

```bash
export NPM_TOKEN="ваш-токен"
npm run release
```
