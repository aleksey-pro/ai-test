# Итерация 3. Pre-check, контракты и генерация тестов

[← Предыдущая: извлечение и классификация](02-extract-classify.md) · [К обзору](../tests-flow.md) · [Следующая: healing и прогоны →](04-heal-run.md)

```mermaid
flowchart TD
    START([Выбран набор .md кейсов]) --> PRECHECK[playwright-test-precheck:<br/>кейсы, приложение, маршруты и существующие тесты]
    PRECHECK --> STATUS[Назначить valid / valid-with-note / invalid;<br/>добавить риски, допущения и повторы]
    STATUS --> CONSISTENT{Статусы, допущения<br/>и риск-таблица согласованы?}
    CONSISTENT -- Нет --> RECHECK[Уточнить противоречия<br/>и повторить pre-check]
    RECHECK --> PRECHECK
    CONSISTENT -- Да --> API{Нужны контрактные<br/>API-моки?}
    API -- Да --> CONTRACT[swagger-parser:<br/>обновить или валидировать кэш OpenAPI]
    CONTRACT --> CONTRACT_READY{Есть валидный<br/>контракт?}
    CONTRACT_READY -- Нет --> CONTRACT_BLOCK[Запросить Swagger/OpenAPI URL<br/>или зафиксировать blocker]
    CONTRACT_READY -- Да --> MOCKS[playwright-mock-generator:<br/>детерминированные fixtures, валидация,<br/>узкие routes и provenance]
    MOCKS --> SNAPSHOT
    API -- Нет --> SNAPSHOT[Снять SHA-256 snapshot<br/>существующих .spec.ts]
    SNAPSHOT --> GENERATE[playwright-test-generator:<br/>создать spec.ts с учётом pre-check]
    GENERATE --> VISUAL{Кейс требует доказать<br/>визуальное состояние?}
    VISUAL -- Да --> SCREENSHOT[Проверить DOM/CSS/геометрию<br/>и добавить container screenshot]
    VISUAL -- Нет --> DIFF
    SCREENSHOT --> DIFF[Сравнить snapshot до/после:<br/>created / modified / unchanged]
    DIFF --> MAP{Каждому выбранному .md<br/>соответствует spec.ts?}
    MAP -- Нет --> MANUAL[Создать недостающий spec.ts<br/>по правилам generator]
    MANUAL --> SCOPE
    MAP -- Да --> SCOPE[Передать created-specs + modified-specs<br/>как узкий test-scope]
    SCOPE --> NEXT([Перейти к healing])
    CONTRACT_BLOCK --> NEXT
    PRECHECK -.-> R[(Единый отчёт)]
    CONTRACT -.-> R
    MOCKS -.-> R
    GENERATE -.-> R
```

**Результат итерации:** есть согласованный pre-check со статусами и рисками; каждому
выбранному кейсу соответствует `spec.ts`, а узкий scope строится только из созданных или
изменённых тестов. Ветка Swagger/OpenAPI выполняется лишь когда для сценариев действительно
нужны контрактные моки.

[← Предыдущая: извлечение и классификация](02-extract-classify.md) · [К обзору](../tests-flow.md) · [Следующая: healing и прогоны →](04-heal-run.md)
