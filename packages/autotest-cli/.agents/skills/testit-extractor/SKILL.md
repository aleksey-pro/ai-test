---
name: testit-extractor
description: Extract TestIt cases for a numeric project ID, optionally selecting a section and include/exclude keywords. Use to export project cases into the local test-case structure before classification and Playwright automation.
---

# TestIt Extractor

Extract TestIt cases without an interactive parameter-collection phase. The skill runs only when `id` is provided and is a numeric project ID.

## Parameters

| Parameter | Required | Meaning |
| --- | --- | --- |
| `id` | yes | Numeric TestIt project ID, for example `562468`. |
| `section` | no | Section name to search. Without it, use the project root section. |
| `sectionId` | no | UUID of a specific section when supported by the invocation. |
| `include` | no | Comma-separated inclusion keywords; any match includes a case. |
| `exclude` | no | Comma-separated exclusion keywords; any match excludes a case. |

Do not ask for omitted optional parameters: leave filters inactive and use the root section by default. Split multiple `include` and `exclude` values on commas and apply OR logic within each filter.

## Input validation

If `id` is missing, stop with an error explaining that a numeric project ID is required and show `[-[testit-extractor id="562468"]-]`. If `id` contains hyphens, treat it as an invalid project ID (likely a section UUID), explain that a numeric project ID is required, and show `sectionId` usage. Do not continue after either error.

## Extraction process

1. Read parameters before any other work.
2. Use `mcp--testit___corporate--get_project_by_id` with the project ID and retain the project name for reports.
3. If `section` is supplied, search it with `mcp--testit___corporate--search_sections`, `limit: 200`. If the direct query is empty, list all project sections with an empty query and find it among nested sections. If still absent, use the root section.
4. Never search the `Back-end` section or any of its descendants. If it is selected or discovered, stop with an error and request another section.
5. List TestIt cases in the chosen section and recursively traverse every descendant section. Always check the selected section itself first. Use `limit: 200` while searching sections so large projects are complete.
6. Apply include/exclude filters and preserve case metadata, steps, expected results, tags, IDs, UUIDs, and section context.
7. Export cases as Markdown into the local TestIt test-case directory used by the automation pipeline, preserving deterministic names and avoiding duplicate exports.

## Result

Return the project and selected section, discovered/excluded case counts, active filters, output directory, and any skipped cases or access/data risks. The resulting Markdown cases are intended for `test-classificator`, then `playwright-test-precheck`, then `playwright-test-generator`.
