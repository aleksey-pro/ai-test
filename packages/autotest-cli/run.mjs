import { access, cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.dirname(fileURLToPath(import.meta.url));
const PLAYWRIGHT_VERSION = '1.60.0';

function parseArguments(args) {
  const [command = 'init', ...rest] = args;
  const options = { command, cwd: process.cwd(), force: false };

  for (let index = 0; index < rest.length; index += 1) {
    const value = rest[index];
    if (value === '--force') options.force = true;
    else if (value === '--cwd') options.cwd = path.resolve(rest[++index] ?? '');
    else if (value.startsWith('--cwd=')) options.cwd = path.resolve(value.slice(6));
    else if (value === '--framework') options.framework = rest[++index];
    else if (value.startsWith('--framework=')) options.framework = value.slice(12);
    else throw new Error(`unknown argument: ${value}`);
  }

  return options;
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function commandAvailable(command) {
  return new Promise((resolve) => {
    const child = spawn(command, ['--version'], { stdio: 'ignore' });
    child.once('error', () => resolve(false));
    child.once('exit', (code) => resolve(code === 0));
  });
}

async function playwrightCliAvailable(projectRoot) {
  const localBinary = path.join(
    projectRoot,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'playwright-cli.cmd' : 'playwright-cli',
  );
  return (await exists(localBinary)) || commandAvailable('playwright-cli');
}

async function readPackageJson(projectRoot) {
  const packagePath = path.join(projectRoot, 'package.json');
  if (!(await exists(packagePath))) throw new Error(`package.json not found in ${projectRoot}`);
  return { packagePath, value: JSON.parse(await readFile(packagePath, 'utf8')) };
}

function detectFramework(packageJson, explicitFramework) {
  if (explicitFramework) {
    if (!['nextjs', 'react-vite'].includes(explicitFramework)) {
      throw new Error('--framework must be nextjs or react-vite');
    }
    return explicitFramework;
  }

  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  if (dependencies.next) return 'nextjs';
  if (dependencies.vite && (dependencies.react || dependencies['react-dom'])) return 'react-vite';
  throw new Error('cannot detect framework; pass --framework=nextjs or --framework=react-vite');
}

function playwrightConfig(framework) {
  const command = framework === 'nextjs'
    ? "process.env.CI ? 'npm run build && npm run start -- -p 4173' : 'npm run dev -- -p 4173'"
    : "'npm run dev -- --host 127.0.0.1 --port 4173'";

  return `import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4173';

export default defineConfig({
  testDir: './autotest-cli-data/tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.BASE_URL ? undefined : {
    command: ${command},
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: ${framework === 'nextjs' ? '180_000' : '120_000'},
  },
});
`;
}

async function writeIfMissing(filePath, contents, force) {
  if ((await exists(filePath)) && !force) return false;
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, contents, 'utf8');
  return true;
}

async function updatePackageJson(packagePath, packageJson) {
  packageJson.scripts ??= {};
  packageJson.scripts.test ??= 'playwright test';
  packageJson.scripts['test:ui'] ??= 'playwright test --ui';
  packageJson.devDependencies ??= {};
  packageJson.devDependencies['@playwright/test'] ??= PLAYWRIGHT_VERSION;
  await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8');
}

async function updateGitignore(projectRoot) {
  const filePath = path.join(projectRoot, '.gitignore');
  const current = (await exists(filePath)) ? await readFile(filePath, 'utf8') : '';
  const required = ['playwright-report/', 'test-results/', 'autotest-cli-data/reports/'];
  const additions = required.filter((entry) => !current.split(/\r?\n/).includes(entry));
  if (!additions.length) return;
  const separator = current && !current.endsWith('\n') ? '\n' : '';
  await writeFile(filePath, `${current}${separator}${additions.join('\n')}\n`, 'utf8');
}

async function init(options) {
  const { packagePath, value: packageJson } = await readPackageJson(options.cwd);
  const framework = detectFramework(packageJson, options.framework);

  await cp(path.join(packageRoot, '.agents'), path.join(options.cwd, '.agents'), {
    recursive: true,
    force: options.force,
    errorOnExist: false,
  });
  for (const directory of ['autotest-cli-data/tests', 'autotest-cli-data/test-cases/testit', 'autotest-cli-data/mocks', 'autotest-cli-data/reports']) {
    await mkdir(path.join(options.cwd, directory), { recursive: true });
  }
  const configWritten = await writeIfMissing(
    path.join(options.cwd, 'playwright.config.ts'),
    playwrightConfig(framework),
    options.force,
  );
  await updatePackageJson(packagePath, packageJson);
  await updateGitignore(options.cwd);

  console.log(`Autotest initialized for ${framework} in ${options.cwd}`);
  if (!configWritten) console.log('playwright.config.ts already exists; left unchanged (use --force to replace)');
  console.log('Next: npm install && npx playwright install chromium');
}

async function doctor(options) {
  const { value } = await readPackageJson(options.cwd);
  const checks = [
    ['.agents', await exists(path.join(options.cwd, '.agents'))],
    ['autotest-cli-data/tests', await exists(path.join(options.cwd, 'autotest-cli-data/tests'))],
    ['playwright.config.ts', await exists(path.join(options.cwd, 'playwright.config.ts'))],
    ['@playwright/test', Boolean(value.devDependencies?.['@playwright/test'])],
    ['playwright-cli (optional, runtime evidence)', await playwrightCliAvailable(options.cwd)],
  ];
  for (const [name, passed] of checks) console.log(`${passed ? 'ok' : 'missing'}  ${name}`);
  if (checks.slice(0, -1).some(([, passed]) => !passed)) process.exitCode = 1;
}

export async function run(args) {
  const options = parseArguments(args);
  if (['--help', '-h', 'help'].includes(options.command)) {
    console.log('Usage: autotest <init|doctor> [--cwd <path>] [--framework nextjs|react-vite] [--force]');
    return;
  }
  if (options.command === 'init') return init(options);
  if (options.command === 'doctor') return doctor(options);
  throw new Error(`unknown command: ${options.command}`);
}
