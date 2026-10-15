# Итерация 4. Healing и тестовые прогоны

[← Предыдущая: pre-check и генерация](03-precheck-generate.md) · [К обзору](../tests-flow.md) · [Следующая: отчётность →](05-report.md)

```mermaid
flowchart TD
    START([Получены created-specs / modified-specs]) --> NARROW[playwright-test-healer:<br/>запустить узкий test-scope]
    NARROW --> RESULT{Тесты прошли?}
    RESULT -- Да --> BROAD[Запустить расширенный<br/>релевантный набор]
    RESULT -- Нет --> INSPECT[Изучить spec, TestIt-кейс,<br/>pre-check, код приложения и артефакты падения]
    INSPECT --> CLASSIFY{Классификация причины}
    CLASSIFY -- App изменился / spec неверен --> FIX_TEST[Внести минимальную правку<br/>только в тест]
    FIX_TEST --> LIMIT{Не превышен лимит<br/>5 попыток на тест?}
    LIMIT -- Да --> NARROW
    LIMIT -- Нет --> BLOCK[Зафиксировать blocker<br/>и историю попыток]
    CLASSIFY -- Дефект приложения --> APP_DEFECT[Не менять src без запроса;<br/>локализовать дефект и рекомендацию]
    APP_DEFECT --> BLOCK
    CLASSIFY -- Внешний blocker --> EXTERNAL[Если тест корректен — test.fixme()<br/>с комментарием]
    EXTERNAL --> BROAD
    BROAD --> FINAL{Расширенный запуск<br/>успешен?}
    FINAL -- Нет --> INSPECT
    FINAL -- Да --> NEXT([Передать результаты в отчёт])
    BLOCK --> NEXT
    NARROW -.-> R[(Единый отчёт)]
    APP_DEFECT -.-> R
```

**Результат итерации:** сначала проверяется только scope текущей генерации, затем — релевантный
расширенный набор. Риски pre-check сохраняются независимо от результата запуска; дефекты
приложения документируются, но исходный код приложения этим flow не изменяется.

[← Предыдущая: pre-check и генерация](03-precheck-generate.md) · [К обзору](../tests-flow.md) · [Следующая: отчётность →](05-report.md)
