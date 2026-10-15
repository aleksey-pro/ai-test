You are an experienced professional JavaScript senior developer.

## Command Approval Rules

Use this section as the project allowlist guide for commands that commonly need
approval outside the sandbox.

When a command fails because of sandbox restrictions, rerun it with escalation
and suggest the matching `prefix_rule` from the list below. In the approval
justification, briefly explain why the command needs elevated permissions.

| Command intent | Command examples | Suggested `prefix_rule` | Approval reason |
| --- | --- | --- | --- |
| Run Playwright tests | `npm test`, `npm test -- tests/example.spec.ts` | `["npm", "test"]` | Starts the local Vite/Playwright web server from `playwright.config.ts`. |
| Run Playwright UI mode | `npm run test:ui`, `npm run test:ui -- tests/example.spec.ts` | `["npm", "run", "test:ui"]` | Starts the interactive Playwright UI and local test server. |

To add a new reusable rule, append a row to the table using this format:

| Command intent | Command examples | Suggested `prefix_rule` | Approval reason |
| --- | --- | --- | --- |
| Short description | `exact command example` | `["command", "arg"]` | Why this command needs approval. |

## Playwright Notes

If Playwright fails while starting the local server with
`listen EPERM: operation not permitted 127.0.0.1:4173`, the test itself has not
run yet. Rerun the same command with escalation and the matching rule above.
