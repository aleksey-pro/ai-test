# Итерация 1. Подготовка запуска

[К обзору](../tests-flow.md) · [Следующая: извлечение и классификация →](02-extract-classify.md)

```mermaid
flowchart TD
    U[Запрос /autotest] --> PARAMS[Извлечь параметры запуска]
    PARAMS --> ID{Передан строго<br/>числовой id проекта TestIt?}
    ID -- Нет --> ASK[Запросить только корректный id]
    ASK --> PARAMS
    ID -- Да --> DEFAULTS[Нормализовать параметры<br/>section/include/exclude/test-type]
    DEFAULTS --> CHECK[Проверить проект:<br/>package.json, Playwright-конфиг,<br/>локальные инструкции и текущие изменения]
    CHECK --> READY{Обязательные инструкции<br/>доступны?}
    READY -- Нет --> STOP[Остановить flow<br/>и описать отсутствующий компонент]
    READY -- Да --> DIRS[Создать только отсутствующие<br/>каталоги autotest-cli-data/*]
    DIRS --> REPORT[Создать уникальный run-report-dir<br/>и единый отчёт запуска]
    REPORT --> NEXT([Перейти к извлечению кейсов])
    REPORT -.-> R[(autotest-cli-data/reports/&lt;timestamp&gt;/<br/>tests-automatization-report.md)]
```

**Результат итерации:** получен корректный `id`, применены значения по умолчанию,
проверены обязательные инструкции и существующее окружение, создан уникальный каталог
единого отчёта. Установка пакетов в этот flow не входит.

[К обзору](../tests-flow.md) · [Следующая: извлечение и классификация →](02-extract-classify.md)
