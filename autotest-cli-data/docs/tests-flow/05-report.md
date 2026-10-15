# Итерация 5. Единый отчёт и завершение

[← Предыдущая: healing и прогоны](04-heal-run.md) · [К обзору](../tests-flow.md)

```mermaid
flowchart TD
    START([Все доступные этапы завершены]) --> COLLECT[Собрать результаты extractor, classificator,<br/>pre-check, generator и healer]
    COLLECT --> GROUP[Сгруппировать таблицы по test-type;<br/>сохранить Entity как дополнительный контекст]
    GROUP --> RISKS[Включить статусы, допущения,<br/>риски валидности и повторы]
    RISKS --> TESTS[Указать created/modified specs,<br/>snapshot-артефакты и команды запусков]
    TESTS --> DEFECTS[Записать blockers, test.fixme<br/>и требуемые исправления приложения]
    DEFECTS --> WRITE[Обновить только один файл<br/>отчёта текущего запуска]
    WRITE --> REPORT[(autotest-cli-data/reports/&lt;timestamp&gt;/<br/>tests-automatization-report.md)]
    REPORT --> SUMMARY[Сообщить пользователю краткий итог<br/>и ссылку на единый отчёт]
    SUMMARY --> END([Flow завершён])
```

**Результат итерации:** один отчёт текущего запуска содержит все обязательные разделы,
сгруппированные по типам тестирования; отдельные отчёты подскиллов не создаются.

[← Предыдущая: healing и прогоны](04-heal-run.md) · [К обзору](../tests-flow.md)
