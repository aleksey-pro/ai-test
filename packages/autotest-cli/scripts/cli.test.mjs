import assert from 'node:assert/strict';
import { access, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { run } from '../run.mjs';

test('initializes a React/Vite project without project-specific artifacts', async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), 'autotest-cli-vite-'));
  await writeFile(path.join(cwd, 'package.json'), JSON.stringify({
    name: 'fixture',
    scripts: { dev: 'vite' },
    dependencies: { react: '18.3.1' },
    devDependencies: { vite: '6.0.0' },
  }));

  await run(['init', '--cwd', cwd]);
  const config = await readFile(path.join(cwd, 'playwright.config.ts'), 'utf8');
  const packageJson = JSON.parse(await readFile(path.join(cwd, 'package.json'), 'utf8'));

  assert.match(config, /npm run dev -- --host/);
  assert.equal(packageJson.devDependencies['@playwright/test'], '1.60.0');
  assert.equal(packageJson.scripts.test, 'playwright test');
  await access(path.join(cwd, '.agents', 'tests-automatization', 'AGENT.md'));
  await access(path.join(cwd, 'autotest-cli-data', 'test-cases', 'testit'));
  const precheck = await readFile(
    path.join(cwd, '.agents', 'skills', 'playwright-test-precheck', 'SKILL.md'),
    'utf8',
  );
  assert.match(precheck, /Evidence Manifest/);
  assert.match(precheck, /Do not run `npm install`/);

  const previousExitCode = process.exitCode;
  process.exitCode = undefined;
  await run(['doctor', '--cwd', cwd]);
  assert.equal(process.exitCode, undefined, 'missing optional Playwright CLI must not fail doctor');
  process.exitCode = previousExitCode;
});

test('initializes a Next.js project with a production CI command', async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), 'autotest-cli-next-'));
  await writeFile(path.join(cwd, 'package.json'), JSON.stringify({
    name: 'fixture',
    scripts: { dev: 'next dev', build: 'next build', start: 'next start' },
    dependencies: { next: '16.0.0', react: '19.0.0' },
  }));

  await run(['init', '--cwd', cwd]);
  const config = await readFile(path.join(cwd, 'playwright.config.ts'), 'utf8');
  assert.match(config, /npm run build && npm run start -- -p 4173/);
});
