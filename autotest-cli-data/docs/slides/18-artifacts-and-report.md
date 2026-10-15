# Этап 16. Артефакты и единый отчёт

Единый отчёт запуска собирает результаты extractor, classificator, pre-check, generator и healer: статусы, риски, допущения, созданные и изменённые тесты, команды запусков, blockers и `test.fixme`.

Дополнительные результаты:

- TestIt-кейсы — `autotest-cli-data/test-cases/testit/`;
- тесты — `autotest-cli-data/tests/`, моки — `autotest-cli-data/mocks/`;
- HTML-отчёт — `playwright-report/`, результаты — `test-results/`.

При совпадении минуты для отчёта добавляется суффикс `-02`, `-03` и далее.
