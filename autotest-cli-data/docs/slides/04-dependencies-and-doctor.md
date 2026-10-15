# Этап 2. Запуск `/autotest` и управление областью

Минимальный вызов содержит строго числовой ID TestIt-проекта:

```text
/autotest id=562468
```

Типичный целевой вызов:

```text
/autotest id=562468 section="Контакты" test-type=integration
```

Доступные параметры: `section`, `include`, `exclude`, `test-type`, `file`, `overwrite`, `base-url`, `test-scope`, `tags`. По умолчанию используются корневая секция, все Markdown-кейсы и `integration`.

`base-url` направляет запуск на готовую среду; `test-scope` обычно рассчитывается flow автоматически. Имя обязательного параметра фиксировано — только `id`.
