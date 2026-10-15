# Итерация 2. Извлечение и классификация кейсов

[← Предыдущая: подготовка](01-prepare.md) · [К обзору](../tests-flow.md) · [Следующая: pre-check и генерация →](03-precheck-generate.md)

```mermaid
flowchart TD
    START([Получен id проекта TestIt]) --> EXTRACT[testit-extractor:<br/>найти проект и секцию]
    EXTRACT --> TREE[Рекурсивно обойти секцию<br/>и её вложенные Front-end подразделы]
    TREE --> FILTER[Применить include / exclude<br/>и сохранить .md кейсы]
    FILTER --> CASES{Найдены<br/>подходящие .md кейсы?}
    CASES -- Нет --> EMPTY[Зафиксировать пустой результат<br/>в едином отчёте]
    EMPTY --> END_EMPTY([Завершить без генерации])
    CASES -- Да --> CLASSIFY[test-classificator:<br/>определить тип каждого кейса]
    CLASSIFY --> TYPES[Разложить копии прямо по<br/>input-dir/&lt;test-type&gt;/]
    TYPES --> SELECT[Выбрать каталог<br/>целевого test-type]
    SELECT --> SELECTED{В выбранном типе<br/>есть кейсы?}
    SELECTED -- Нет --> TYPE_EMPTY[Зафиксировать пустой тип<br/>в едином отчёте]
    TYPE_EMPTY --> END_EMPTY
    SELECTED -- Да --> HANDOFF[Передать selected-input-dir<br/>и classification-summary]
    HANDOFF --> NEXT([Перейти к pre-check])
    EXTRACT -.-> R[(Единый отчёт)]
    CLASSIFY -.-> R
```

**Результат итерации:** извлечённые кейсы классифицированы по типам тестирования;
для следующих этапов используется только непустой каталог выбранного типа, например
`autotest-cli-data/test-cases/testit/integration/`.

[← Предыдущая: подготовка](01-prepare.md) · [К обзору](../tests-flow.md) · [Следующая: pre-check и генерация →](03-precheck-generate.md)
