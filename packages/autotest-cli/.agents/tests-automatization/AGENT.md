---
name: tests-automatization
description: "Автоматизирует полный цикл работы с тестами из TestIt: извлекает тест-кейсы через testit-extractor, классифицирует их через test-classificator по типам тестирования, проверяет выбранный тип через playwright-test-precheck, генерирует Playwright тесты через playwright-test-generator, затем запускает и чинит тесты через playwright-test-healer. Используй этот скилл каждый раз, когда пользователь просит автоматизировать тесты, сгенерировать тесты из TestIt и прогнать, полный флоу TestIt -> Playwright, достать тест-кейсы, создать тесты и запустить, или хочет минимального участия пользователя в тестовой автоматизации."
---

# Tests Automatization

Скилл оркестрирует цепочку:

1. `testit-extractor` - выгрузить тест-кейсы из TestIt в `autotest-cli-data/test-cases/testit/`.
2. `test-classificator` - разложить TestIt-кейсы по типам тестирования.
3. `playwright-test-precheck` - проверить кейсы выбранного типа на противоречия и соответствие приложению.
4. `playwright-test-generator` - создать Playwright тесты в `autotest-cli-data/tests/`.
5. `playwright-test-healer` - запустить тесты, проанализировать падения и исправить тесты.

Главная цель - доводить процесс до рабочего результата с минимальным участием пользователя. Не запрашивай подтверждения планов, промежуточных шагов, дефолтных параметров или очевидных исправлений. Спрашивай пользователя только когда без его данных невозможно продолжить, например когда отсутствует обязательный числовой ID проекта TestIt.

Перед генерацией и запуском тестов вызывай `playwright-test-precheck`. Несоответствия не блокируют
флоу: продолжай генерацию, запуск и исправление тестов, но передавай отчет pre-check в следующие
этапы и обязательно выводи его в итоговом отчете.

## Compatibility

- Локальные скиллы:
  - `.agents/skills/testit-extractor/SKILL.md`
  - `.agents/skills/test-classificator/SKILL.md`
  - `.agents/skills/playwright-test-precheck/SKILL.md`
  - `.agents/skills/playwright-test-generator/SKILL.md`
  - `.agents/skills/playwright-test-healer/playwright-test-healer.md`
- Playwright проект с `npm test`
- Директории проекта:
  - `autotest-cli-data/test-cases/<source-system>/`
  - `autotest-cli-data/tests/`
  - `autotest-cli-data/reports/`

## Storage Layout

Используй единый корень `autotest-cli-data/` для всех артефактов автоматизации:

```text
autotest-cli-data/
├── test-cases/
│   ├── testit/
│   └── youtrack/
├── tests/
└── reports/
```

Нормализуй название системы-источника в lowercase filesystem slug: `TestIt` → `testit`,
`YouTrack` → `youtrack`. Для текущего TestIt flow используй `source-system=testit` и
`source-cases-dir=autotest-cli-data/test-cases/testit`.

Эти пути являются контрактом оркестратора:

- исходные и классифицированные кейсы хранятся внутри `source-cases-dir`;
- все generated `.spec.ts`, независимо от источника кейсов, хранятся в `autotest-cli-data/tests`;
- все отчеты запуска хранятся в `autotest-cli-data/reports/<run-timestamp>`.

Создавай только отсутствующие директории. Если директория уже существует, используй ее без
пересоздания и не очищай существующее содержимое. Если в `autotest-cli-data/tests` уже есть spec с тем же
именем от другой системы-источника, не перезаписывай его молча: добавь к новому имени slug источника
и зафиксируй разрешение конфликта в отчете.

## Single Report Rule

При инициализации каждого нового запуска создай отдельную директорию текущей итерации внутри
`autotest-cli-data/reports/`. Имя директории формируй один раз по локальному времени запуска в формате
`YYYY.MM.DD:HH:MM` и сохраняй как `run-report-dir`:

```text
autotest-cli-data/reports/<YYYY.MM.DD:HH:MM>/
```

Не пересчитывай timestamp между этапами: весь flow должен использовать один и тот же
`run-report-dir`. Если директория с таким именем уже существует из-за повторного запуска в ту же
минуту, считай это перезапуском текущего запуска: используй существующий `run-report-dir` и
перезапиши единый отчет. Не добавляй числовые суффиксы вроде `-02` или `-03`.

Все отчеты и отчетные артефакты текущей итерации записывай только в `run-report-dir`, а не напрямую
в `autotest-cli-data/reports/`.

Всегда веди один общий persisted-отчет по всему флоу:

```text
<run-report-dir>/tests-automatization-report.md
```

`tests-automatization` является единственным владельцем этого файла. Все результаты подскиллов
должны попадать в него как секции с понятными русскими названиями:

```md
# Отчет по скиллу tests-automatization

## Входные данные
## Подготовка окружения
## Результат работы скилла testit-extractor
## Результат работы скилла test-classificator
## Результат работы скилла playwright-test-precheck
## Риски валидности TestIt-кейсов
## Результат работы скилла playwright-test-generator
## Результат работы скилла playwright-test-healer
## Требуемые исправления приложения
## Итог
```

Не используй в итоговом отчете внутренние английские заголовки вроде `Preflight`,
`Extractor / Input`, `Pre-check Summary`, `Generator Result` или `Healer Result`.

Не создавай и не обновляй отдельные отчетные файлы для подскиллов, включая
`<run-report-dir>/test-healer-result.md`. Если такой файл остался от старых запусков, не используй его
как источник истины; при необходимости удали или игнорируй его. В чат выводи краткое резюме и ссылку
только на единый отчет.

## Input

Извлеки параметры из запроса пользователя:

### TestIt Parameters

| Параметр | Обязательный | Источник |
| --- | --- | --- |
| `id` | Да | Числовой ID проекта TestIt |
| `section` | Нет | Название секции TestIt |
| `include` | Нет | Ключевые слова для включения |
| `exclude` | Нет | Ключевые слова для исключения |
| `test-type` / `target-test-type` | Нет | Целевой тип тестов для классификации, генерации и запуска. По умолчанию `integration` |
| `source-system` | Нет | Система-источник кейсов. Для этого flow всегда `testit`; файловый slug — `testit`. |

ID проекта TestIt должен передаваться строго параметром `id`. Не принимай `testit-id`, `project-id`, `testit-project-id` или другие алиасы как замену `id`.

### Playwright Generator Parameters

Принимай параметры, которые влияют на `playwright-test-generator`, даже если сам generator работает через файлы:

| Параметр | Обязательный | Значение по умолчанию | Назначение |
| --- | --- | --- | --- |
| `file` / `case-file` | Нет | Все `.md` файлы из внутреннего каталога кейсов | Ограничить генерацию конкретным файлом тест-кейса |
| `overwrite` | Нет | `true` | Перезаписывать существующие generated `.spec.ts`, если входной кейс изменился |
| `base-url` | Нет | Значение из `playwright.config.*` | Контекст для корректных `page.goto()` |
| `test-scope` | Нет | Автоматически вычисляется по созданным или измененным spec-файлам | Узкий набор spec-файлов для первого запуска `playwright-test-healer` |
| `tags` | Нет | Пусто | Дополнительный контекст для группировки или аннотаций тестов |

Не спрашивай значения этих параметров. Если они не указаны, используй значения по умолчанию.
`input-dir`, `cases-dir`, `output-dir` и `tests-dir` не являются параметрами пользовательского
вызова. Игнорируй их, если они переданы. Оркестратор всегда использует внутренние контрактные пути:
`source-cases-dir=autotest-cli-data/test-cases/testit` и `generated-tests-dir=autotest-cli-data/tests`.

Если пользователь передал специальный вызов вида:

```text
[-[tests-automatization id="562468" section="Десктопная версия" include="контакты" exclude="архив"]-]
```

используй параметры из него.

Если пользователь написал обычным языком, извлеки параметры из текста. Например:

```text
Автоматизируй тесты из TestIt проекта 562468 по секции Контакты
```

означает `id="562468"`, `section="Контакты"`, `source-system="testit"` и
`test-type="integration"`. Внутренние пути оркестратор определяет сам.

## Autonomy Rules

1. Не спрашивай подтверждение перед запуском следующего этапа цепочки.
2. Не спрашивай значения параметров с дефолтами:
   - если `section` не указан, работай с корневой секцией проекта;
   - если `include` не указан, не применяй include-фильтр;
   - если `exclude` не указан, не применяй exclude-фильтр;
   - если `test-type` не указан, используй `integration`;
   - если `overwrite` не указан, используй `true`;
   - если `test-scope` не указан, вычисли его по созданным или измененным spec-файлам, затем по
     spec-файлам, сопоставленным с выбранными `.md` кейсами.
3. Не останавливайся после генерации файлов. Сразу переходи к запуску и лечению тестов.
4. Не проси пользователя вручную проверить файлы, если это можно сделать локально командами и чтением проекта.
5. Не задавай уточняющие вопросы о селекторах, URL, роутинге, моках или тестовых данных, пока не выполнен самостоятельный поиск в коде.
6. Если команда падает из-за sandbox или `listen EPERM: operation not permitted 127.0.0.1:4173`, сразу перезапусти ту же команду с escalation и `prefix_rule: ["npm", "test"]`.
7. Запрашивай пользователя только в двух случаях:
   - не найден обязательный числовой параметр `id` проекта TestIt;
   - после анализа кода и логов тестов остался внешний секрет, учетная запись, недоступная среда или бизнес-данные, которых нет в проекте.

## Workflow

### Step 0: Подготовка окружения

1. Подготовь структуру каталогов. Если каталог уже существует, оставь его как есть: не удаляй,
   не очищай и не пересоздавай:
   - `autotest-cli-data/`;
   - `autotest-cli-data/test-cases/`;
   - `autotest-cli-data/test-cases/testit/`;
   - `autotest-cli-data/tests/`;
   - `autotest-cli-data/reports/`.
2. Зафиксируй timestamp запуска и создай уникальный `run-report-dir` по правилам раздела
   `Single Report Rule`.
3. Проверь наличие локальных скиллов:
   - `.agents/skills/testit-extractor/SKILL.md`
   - `.agents/skills/test-classificator/SKILL.md`
   - `.agents/skills/playwright-test-precheck/SKILL.md`
   - `.agents/skills/playwright-test-generator/SKILL.md`
   - `.agents/skills/playwright-test-healer/playwright-test-healer.md`
4. Если `playwright-test-precheck/SKILL.md` отсутствует, остановись и сообщи, что pre-check этап невозможен без precheck-инструкции.
5. Если `test-classificator/SKILL.md` отсутствует, остановись и сообщи, что классификация по типам невозможна без classificator-инструкции.
6. Если `playwright-test-healer/playwright-test-healer.md` отсутствует, остановись и сообщи, что этап запуска и исправления невозможен без healer-инструкции.
7. Проверь наличие `package.json` и Playwright конфигурации.
8. Проверь текущие изменения через `git status --short`, чтобы не перезаписать чужую работу.

Отсутствие директорий `autotest-cli-data/` не является ошибкой: создай только недостающие директории.

### Step 1: Validate TestIt Parameters

1. Найди параметр `id`.
2. Если `id` отсутствует, приостанови выполнение и спроси только одно:

```text
Нужен числовой параметр id проекта TestIt, чтобы запустить автоматизацию.
```

3. Если пользователь передал `testit-id`, `project-id`, `testit-project-id` или другой алиас вместо `id`, не нормализуй его автоматически. Приостанови выполнение и попроси указать именно `id`:

```text
ID проекта TestIt должен быть передан строго параметром id. Укажи id, например: [-[tests-automatization id="562468"]-]
```

4. Если `id` содержит дефисы или похож на UUID, остановись с ошибкой:

```text
Нужен числовой ID проекта TestIt, а не UUID секции. Передай id проекта, например 562468.
```

5. Нормализуй `test-type` как целевой тип автоматизации. Используй канонические значения:
   `integration`, `visual-regression`, `e2e-contract`, `content-regression`,
   `validation-form-state`, `navigation-routing`, `fixme-manual`, `hybrid`.

6. Подготовь вызов `testit-extractor`:

```text
[-[testit-extractor id="<id>" section="<section>" include="<include>" exclude="<exclude>"]-]
```

Не включай пустые необязательные параметры в вызов.

### Step 2: Extract Test Cases

Используй скилл `testit-extractor` с подготовленными параметрами.

После извлечения:

1. Проверь, что в `input-dir` появились или обновились `.md` файлы.
2. Если файлов нет, кратко сообщи, что TestIt не вернул подходящих тест-кейсов, и заверши без запуска генерации.
3. Если файлы есть, сразу переходи к классификации.

### Step 3: Classify Test Cases By Test Type

Используй `test-classificator` по инструкции из `.agents/skills/test-classificator/SKILL.md`.

Передай классификатору:

```text
input-dir: <input-dir>
target-test-type: <test-type>
file: <file, если указан>
mode: copy
overwrite: true
report-target: <run-report-dir>/tests-automatization-report.md
```

Классификатор не должен создавать `.classified`. Он должен разложить исходные `.md` файлы
непосредственно по директориям типов внутри `input-dir`:

```text
<input-dir>/integration
<input-dir>/visual-regression
<input-dir>/e2e-contract
<input-dir>/content-regression
<input-dir>/validation-form-state
<input-dir>/navigation-routing
<input-dir>/fixme-manual
<input-dir>/hybrid
```

После классификации:

1. Выбери кейсы целевого типа тестирования: используй
   `selected-input-dir = <input-dir>/<test-type>` как вход для pre-check и generator.
2. Если пользователь просит `integration`, не читай весь `autotest-cli-data/test-cases/testit`; читай только
   `<input-dir>/integration`.
3. Если выбранная директория пуста, запиши это в единый отчет и заверши без генерации и запуска.
4. Сохрани результат классификации в секции `Результат работы скилла test-classificator` единого отчета.
5. Передай `classification-summary` в следующие этапы как контекст. Если классификатор создает
   отчетный артефакт, его путь должен находиться внутри `<run-report-dir>`.

### Step 4: Pre-check TestIt Cases

Используй `playwright-test-precheck` по инструкции из `.agents/skills/playwright-test-precheck/SKILL.md`.

Передай precheck контекст:

```text
input-dir: <selected-input-dir>
file: <file, если указан>
base-url: <base-url, если указан или найден в playwright.config.*>
output-dir: <output-dir>
existing-tests: autotest-cli-data/tests/
```

Результат pre-check должен содержать:

1. Статус по каждому TestIt-кейсу: `valid`, `valid-with-note` или `invalid`.
2. Таблицу рисков `Риски валидности TestIt-кейсов`.
3. Допущения, с которыми можно продолжить генерацию.
4. `Evidence manifest`: связь каждого TestIt действия и expected result с TestIt-источником,
   фактическим доказательством и будущим Playwright assertion.

Перед переходом к генерации выполни этап `Исправить противоречия в результатах проверки`:

1. Если статус кейса `valid-with-note` или `invalid`, таблица рисков не может быть пустой.
2. Если в `Assumption` указано что-то кроме `Не требуется`, `none` или пустого значения, кейс не
   должен оставаться `valid`.
3. Если pre-check пишет `Риски валидности TestIt-кейсов: не обнаружены.`, но при этом generator/spec
   использует неявное допущение: синоним навигационного лейбла, выбранный технический признак
   активного состояния, уточнение generic-ожидания или маппинг page title -> route, вернись к
   `playwright-test-precheck` и зафиксируй `valid-with-note` с warning-строкой.
4. Зеленый Playwright-запуск не должен удалять или понижать риски валидности TestIt-кейса.
5. Если evidence имеет статус `unverifiable`, не считать сценарий покрытым: generator создаёт
   `test.fixme()` с причиной или явно исключает его из automated coverage.

Не останавливайся при `valid-with-note` или `invalid`. Сохрани отчет pre-check как контекст для
генерации, запуска, исправления и финального отчета.

### Step 5: Generate Playwright Tests

Перед генерацией создай снимок состояния `output-dir`: для каждого существующего `.spec.ts`
сохрани относительный путь и SHA-256 содержимого. Этот снимок нужен, чтобы после генерации точно
отличить новые и измененные тесты от файлов, которые generator не трогал. Не полагайся только на
время изменения файла или наличие Git-репозитория.

Используй скилл `playwright-test-generator` и передай ему нормализованный контекст генерации:

```text
id: <id>
input-dir: <selected-input-dir>
output-dir: <output-dir>
file: <file, если указан>
overwrite: <overwrite>
base-url: <base-url, если указан или найден в playwright.config.*>
tags: <tags, если указаны>
precheck-summary: <полный отчет playwright-test-precheck>
evidence-manifest: <раздел Evidence manifest из pre-check>
classification-summary: <результат test-classificator>
report-target: <run-report-dir>/tests-automatization-report.md
```

Если `playwright-test-generator` не поддерживает часть параметров напрямую, применяй их на уровне оркестратора:

1. Для `input-dir` читай кейсы из `selected-input-dir`, а не из корневого
   `autotest-cli-data/test-cases/testit`.
2. Для `output-dir` сохраняй или переноси итоговые `.spec.ts` в указанную директорию.
3. Для `file` генерируй тест только из выбранного `.md` файла.
4. Для `base-url` используй значение как контекст при проверке URL и `page.goto()`, а при запуске
   Playwright передай его через переменную окружения `BASE_URL`, которую читает текущий
   `playwright.config.ts`.
5. Для `id` сохраняй связь с TestIt проектом в комментариях или metadata теста, если это уместно для локального стиля.
6. Для `precheck-summary` используй допущения из отчета при генерации и сохрани риск-таблицу для
   единого финального отчета.
7. Для `evidence-manifest` сопоставь каждое generated action/assertion со строкой manifest. Не
   создавай зелёную проверку для статуса `unverifiable`.
8. Для `report-target` передай путь единого отчета как контекст. Generator не должен создавать
   отдельный отчетный файл.

После генерации:

1. Проверь, что в `output-dir` есть `.spec.ts` файлы.
2. Повтори расчет SHA-256 и сравни состояние до и после генерации:
   - `created-specs` — пути, которых не было в исходном снимке;
   - `modified-specs` — пути, чей SHA-256 изменился;
   - `unchanged-specs` — пути с прежним SHA-256.
3. Сопоставь выбранные `.md` файлы с `.spec.ts` файлами по имени и зафиксируй результат в отчете.
4. Если какой-то `.md` не получил `.spec.ts`, создай недостающий тест вручную по правилам `playwright-test-generator` и `playwright-best-practices` и добавь его в `created-specs`.
5. Передай `created-specs` и `modified-specs` в `playwright-test-healer` как начальный узкий scope.
6. Передай отчет `playwright-test-precheck` в `playwright-test-healer`, чтобы healer вернул данные
   для секции `Результат работы скилла playwright-test-healer` единого отчета даже если тесты пройдут.

Не останавливайся на этапе запроса недостающей информации из `playwright-test-generator`, если эту информацию можно найти в коде проекта. Сначала выполни самостоятельный поиск по `src/`, `tests/`, `playwright.config.*`, `package.json` и существующим тестам.

### Visual Assertions And Snapshots

Во время pre-check и генерации отдельно выделяй TestIt-кейсы, где требование описывает не только
наличие DOM-элемента, но и визуально наблюдаемое состояние. Такие кейсы часто содержат формулировки:

- `элемент в зоне видимости`;
- `наличие баннера`;
- `наличие трех прямоугольных элементов`;
- `расположенных горизонтально`;
- `карточки расположены в ряд`;
- `выделена дата`;
- `открылось табло календаря`;
- `график/таблица построился`;
- `вторая кривая появилась`;
- `элемент виден на странице`.

Не подменяй такие требования слабой проверкой `toBeVisible()` по одному локатору, если она не
доказывает визуальный смысл кейса. Сначала ищи стабильный технический сигнал:

1. семантический локатор (`getByRole`, `getByText`, `getByLabel`);
2. устойчивый контейнер секции (`section[aria-labelledby=...]`, `role=region`, heading);
3. количество дочерних элементов;
4. computed CSS (`display: grid`, `grid-template-columns`, `flex-direction`);
5. координаты элементов (`getBoundingClientRect`) для проверки ряда, колонки, видимости в viewport;
6. состояние маршрута, активного таба, раскрытого блока или выбранного элемента.

Если локаторы и технические сигналы не выражают требование полностью или TestIt явно требует
визуального состояния, используй стандартные Playwright visual snapshots:

```ts
await expect(locator).toHaveScreenshot('tc-<id>-<short-name>.png');
```

Предпочитай screenshot конкретного контейнера, а не всей страницы. Это уменьшает хрупкость снимка и
лучше отражает TestIt-сущность. Перед snapshot стабилизируй состояние:

1. открой нужный route;
2. дождись heading или ключевого элемента;
3. прокрути контейнер через `scrollIntoViewIfNeeded()`;
4. проверь DOM/CSS/геометрию, которые можно проверить без пикселей;
5. только затем делай `toHaveScreenshot`.

Не используй `@playwright-cli` как обязательную часть CI-проверки. Для автоматизации сохраняй
обычные Playwright snapshots в репозитории и запускай их через `npm test`.

`@playwright-cli` используй только как диагностический инструмент и только если он уже установлен в
проекте. Подключай его после падения snapshot-теста, когда нужно вручную посмотреть страницу, DOM
или screenshot и стандартных артефактов Playwright недостаточно для понимания причины. Не добавляй
`@playwright-cli` в generated-тесты, package scripts или обязательный testing flow без отдельного
запроса пользователя.

#### Example: non-graph visual cases

Пример generated-теста для проверки горизонтального расположения карточек:

```ts
async function expectHorizontalThreeCardLayout(section: Locator) {
  const grid = section.locator('.news-grid');
  const cards = section.locator('.news-card');
  const boxes = await cards.evaluateAll((elements) =>
    elements.map((element) => {
      const box = element.getBoundingClientRect();
      return { left: box.left, top: box.top, width: box.width, height: box.height };
    }),
  );

  await expect(grid).toHaveCSS('display', 'grid');
  await expect(cards).toHaveCount(3);
  expect(Math.abs(boxes[0].top - boxes[1].top)).toBeLessThan(4);
  expect(Math.abs(boxes[1].top - boxes[2].top)).toBeLessThan(4);
  expect(boxes[0].left).toBeLessThan(boxes[1].left);
  expect(boxes[1].left).toBeLessThan(boxes[2].left);
}

await expect(section).toHaveScreenshot('tc-857341-home-news-three-horizontal-cards.png');
```

В итоговом отчете `tests-automatization` для таких кейсов явно указывай:

1. почему обычного локатора недостаточно;
2. какой технический сигнал проверяется до snapshot;
3. какие snapshot-файлы созданы или обновлены;
4. какой узкий `test-scope` запускался;
5. итог запуска visual snapshot тестов.

### Step 6: Запустить и исправить Playwright-тесты

Используй `playwright-test-healer` по инструкции из `.agents/skills/playwright-test-healer/playwright-test-healer.md`.

Передай healer контекст:

1. Выполнить этап `Запустить созданные или измененные тесты`: сначала запустить объединение
   `created-specs` и `modified-specs`.
2. Если списки пусты, использовать явно переданный `test-scope`; если он не передан — запускать
   spec-файлы, сопоставленные с выбранными `.md` кейсами.
3. После локального успеха расширить запуск до всего релевантного набора TestIt тестов.
4. Передать полный отчет `playwright-test-precheck`.
5. Передать `report-target: <run-report-dir>/tests-automatization-report.md`.
6. Не задавать пользователю вопросы и делать самое разумное исправление, пока blocker не является внешним.
7. При устойчивой внешней проблеме следовать правилу healer: если тест выглядит корректным, отметить его `test.fixme()` с комментарием перед проблемным шагом.
8. Получить от healer только секцию результата; записать ее в единый отчет самостоятельно.
9. Если обнаружен дефект приложения, не исправлять `src/` без отдельного запроса пользователя.
   Записать его в секцию `Требуемые исправления приложения`: проявление, доказательства, вероятную
   причину, предполагаемые файлы/компоненты/route внутри `src/`, рекомендуемое изменение и уровень
   уверенности. Если точное место не найдено, явно указать область дальнейшего поиска.

## Reporting

Перед финальным ответом обнови только один файл текущей итерации:

```text
<run-report-dir>/tests-automatization-report.md
```

Единый отчет должен содержать:

1. Какие TestIt кейсы были извлечены.
2. Как `test-classificator` разложил кейсы по типам и какая директория выбрана для генерации.
3. Какие Playwright файлы были созданы или изменены.
4. Какие тесты запускались.
5. Итог: passed/failed и оставшиеся блокеры, если есть.
6. Полный результат `playwright-test-precheck`: статусы, таблица рисков и предупреждение, если риски есть.
7. `Evidence manifest`, включая число `grounded`, `assumption` и `unverifiable` пунктов.
8. Секцию `Результат работы скилла playwright-test-healer`: начальные падения, классификация причин, выполненные healing-правки,
   финальный статус.
9. Секцию `Требуемые исправления приложения`: дефекты product-кода и предполагаемые места правки
   в `src/`. Если дефектов приложения нет, написать `Не требуются`.

Используй эти обязательные названия разделов отчета:

| Этап | Название раздела в отчете |
| --- | --- |
| Общий заголовок | `# Отчет по скиллу tests-automatization` |
| Входные параметры | `## Входные данные` |
| Подготовка окружения | `## Подготовка окружения` |
| `testit-extractor` | `## Результат работы скилла testit-extractor` |
| `test-classificator` | `## Результат работы скилла test-classificator` |
| `playwright-test-precheck` | `## Результат работы скилла playwright-test-precheck` |
| Риски pre-check | `## Риски валидности TestIt-кейсов` |
| `playwright-test-generator` | `## Результат работы скилла playwright-test-generator` |
| `playwright-test-healer` | `## Результат работы скилла playwright-test-healer` |
| Дефекты приложения | `## Требуемые исправления приложения` |
| Итог | `## Итог` |

### Group Report Tables By Test Type

Главная группировка итогового отчета должна совпадать с классификацией `test-classificator`, а не с
бизнес-сущностями исходных папок. Если кейсы были разложены в `<input-dir>/<type>`, разделяй
таблицы результатов по типам тестирования:

```md
### <Русское название типа тестирования>

| Case | Source | Entity | Spec | Status | Notes |
| --- | --- | --- | --- | --- | --- |
```

Это правило применяется к таблицам:

1. извлеченных TestIt-кейсов;
2. pre-check summary;
3. рисков валидности;
4. сгенерированных Playwright spec-файлов;
5. результатов запуска и healing.

Русские названия типов:

| Type directory | Название в отчете |
| --- | --- |
| `integration` | `Frontend integration: взаимодействие компонентов интерфейса` |
| `visual-regression` | `Visual regression: визуальные состояния и snapshots` |
| `e2e-contract` | `E2E / contract: внешние системы, документы и API-контракты` |
| `content-regression` | `Content regression: статический текст и значения` |
| `validation-form-state` | `Validation / form state: локальная валидация и состояние форм` |
| `navigation-routing` | `Navigation / routing: внутренние переходы и маршруты` |
| `fixme-manual` | `Fixme / manual: отсутствующий UI или ручная проверка` |
| `hybrid` | `Hybrid: смешанные кейсы` |

Бизнес-сущность исходной папки больше не является основной группировкой, но сохраняй ее в колонке
`Entity`, если она понятна из исходного пути. Переводи slug сущности на русский самостоятельно: убери
числовой префикс, замени дефисы пробелами, раскрой английские слова на русский смысл и сделай
название предметным. Если сущность не понятна, используй `Без отдельной сущности`.

Финальный ответ в чат должен быть коротким и конкретным:

1. Единый отчетный файл.
2. Какие тесты запускались.
3. Итог: passed/failed и оставшиеся блокеры, если есть.

Не вставляй длинные логи в ответ. Укажи ключевые ошибки и файлы.

## Examples

**Example 1**

Input:

```text
Автоматизируй тесты из TestIt id 562468 для секции Контакты
```

Behavior:

1. Запустить `testit-extractor` с `id="562468" section="Контакты"`.
2. Запустить `test-classificator` и выбрать `<input-dir>/integration`, потому что `test-type` не указан.
3. Выполнить `playwright-test-precheck` только для `<input-dir>/integration`.
4. Сгенерировать тесты через `playwright-test-generator` с учетом precheck-отчета.
5. Передать `autotest-cli-data/tests` и precheck-отчет в `playwright-test-healer`.
6. Дать healer запустить, отладить и исправить тесты до прохождения или до внешнего блокера.

**Example 2**

Input:

```text
[-[tests-automatization id="562468" include="навигация,контакты" exclude="архив"]-]
```

Behavior:

1. Использовать корневую секцию проекта.
2. Извлечь TestIt-кейсы с include/exclude фильтрами.
3. Классифицировать кейсы по типам и выбрать `<input-dir>/integration`.
4. Выполнить `playwright-test-precheck` для выбранной директории.
5. Сгенерировать Playwright тесты из `<input-dir>/integration` в `autotest-cli-data/tests`.
6. Передать сгенерированные тесты и precheck-отчет в `playwright-test-healer` без дополнительных подтверждений.

**Example 3**

Input:

```text
[-[tests-automatization id="562468" section="Front-end" file="ca-900001-glavnaya-stranica-navigaciya-perehod-na-stranicu-kontakty.md" base-url="http://localhost:3000" test-scope="autotest-cli-data/tests/ca-900001-glavnaya-stranica-navigaciya-perehod-na-stranicu-kontakty.spec.ts"]-]
```

Behavior:

1. Использовать `id` как ID проекта TestIt.
2. Извлечь кейсы из секции `Front-end`.
3. Классифицировать указанный `.md` файл и выбрать директорию целевого `test-type`.
4. Выполнить `playwright-test-precheck` только для указанного `.md` файла внутри выбранной директории.
5. Сгенерировать или обновить только указанный `.spec.ts`.
6. Передать healer узкий `test-scope` и precheck-отчет для первого запуска.

**Example 4**

Input:

```text
[-[tests-automatization id="562468" section="Front-end" test-type="visual-regression"]-]
```

Behavior:

1. Извлечь TestIt-кейсы.
2. Разложить их через `test-classificator`.
3. Передать в pre-check и generator только `autotest-cli-data/test-cases/testit/visual-regression`.
4. Сгенерировать и запустить только visual regression тесты, используя Playwright snapshots там, где локаторов недостаточно.
