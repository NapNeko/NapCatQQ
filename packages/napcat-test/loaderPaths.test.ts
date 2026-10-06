import { afterEach, describe, expect, test } from 'vitest';
import { copyFileSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = fileURLToPath(new URL('../', import.meta.url));
const fixtureRoots: string[] = [];

function createFixture () {
  const fixtureRoot = mkdtempSync(path.join(tmpdir(), 'napcat-loader-'));
  fixtureRoots.push(fixtureRoot);
  const installDir = path.join(fixtureRoot, '中文 space # percent%');
  mkdirSync(installDir);
  return { fixtureRoot, installDir };
}

afterEach(() => {
  for (const fixtureRoot of fixtureRoots.splice(0)) {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
});

describe('loader paths', () => {
  test('Shell loads the flat package from an unrelated working directory', () => {
    const { fixtureRoot, installDir } = createFixture();
    const loaderPath = path.join(installDir, 'loadNapCat.cjs');
    copyFileSync(path.join(packageRoot, 'napcat-shell-loader/loadNapCat.js'), loaderPath);
    writeFileSync(path.join(installDir, 'napcat.mjs'), 'console.log("SHELL_LOADED");');
    const environment = { ...process.env };
    delete environment['NAPCAT_MAIN_PATH'];
    const output = execFileSync(process.execPath, [loaderPath], { cwd: fixtureRoot, env: environment, encoding: 'utf8' });
    expect(output).toContain('SHELL_LOADED');
  });

  test('Shell uses the actual entry path when the loader is redirected into QQ', () => {
    const { fixtureRoot, installDir } = createFixture();
    const loaderPath = path.join(fixtureRoot, 'loadNapCat.cjs');
    const entryPath = path.join(installDir, 'napcat.mjs');
    copyFileSync(path.join(packageRoot, 'napcat-shell-loader/loadNapCat.js'), loaderPath);
    writeFileSync(entryPath, 'console.log("REDIRECTED_SHELL_LOADED");');
    const output = execFileSync(process.execPath, [loaderPath], {
      cwd: fixtureRoot,
      env: { ...process.env, NAPCAT_MAIN_PATH: entryPath },
      encoding: 'utf8',
    });
    expect(output).toContain('REDIRECTED_SHELL_LOADED');
  });

  test('Framework native loader preserves URL-sensitive path characters', () => {
    const { fixtureRoot, installDir } = createFixture();
    const loaderPath = path.join(installDir, 'nativeLoader.cjs');
    copyFileSync(path.join(packageRoot, 'napcat-framework/nativeLoader.cjs'), loaderPath);
    writeFileSync(path.join(installDir, 'napcat.mjs'), 'export async function NCoreInitFramework () { console.log("FRAMEWORK_LOADED"); }');
    const output = execFileSync(process.execPath, ['-e', 'require(process.argv[1]).initializeNapCat({}, {}, () => {});', loaderPath], {
      cwd: fixtureRoot,
      encoding: 'utf8',
    });
    expect(output).toContain('FRAMEWORK_LOADED');
    expect(output).not.toContain('[Error]');
  });

  test('Framework dlopen loader preserves URL-sensitive path characters', () => {
    const { fixtureRoot, installDir } = createFixture();
    const loaderPath = path.join(installDir, 'napcat.cjs');
    copyFileSync(path.join(packageRoot, 'napcat-framework/napcat.cjs'), loaderPath);
    writeFileSync(path.join(installDir, 'napcat.mjs'), 'export async function NCoreInitFramework () { console.log("DLOPEN_FRAMEWORK_LOADED"); } export function getWebUiUrl () { return ""; }');
    const script = 'process.dlopen = (module) => { module.exports = { NodeIKernelLoginService: { get: () => ({}) }, NodeIQQNTWrapperSession: { create: () => ({}) } }; }; require(process.argv[1]); process.dlopen({ exports: {} }, "wrapper.node");';
    const output = execFileSync(process.execPath, ['-e', script, loaderPath], { cwd: fixtureRoot, encoding: 'utf8' });
    expect(output).toContain('DLOPEN_FRAMEWORK_LOADED');
    expect(output).not.toContain('[Error]');
  });

  test.skipIf(process.platform !== 'win32')('Node batch uses the bundled runtime, forwards arguments and returns the exit code', () => {
    const { fixtureRoot, installDir } = createFixture();
    copyFileSync(process.execPath, path.join(installDir, 'node.exe'));
    copyFileSync(path.join(packageRoot, 'napcat-develop/napcat.bat'), path.join(installDir, 'napcat.bat'));
    writeFileSync(path.join(installDir, 'index.js'), 'console.log(JSON.stringify({ cwd: process.cwd(), args: process.argv.slice(2) })); process.exitCode = 7;');
    let exitStatus: number | null = null;
    let output = '';
    try {
      output = execFileSync('cmd.exe', ['/d', '/s', '/c', `""${path.join(installDir, 'napcat.bat')}" -q 123456"`], {
        cwd: fixtureRoot,
        encoding: 'utf8',
        windowsVerbatimArguments: true,
      });
    } catch (error) {
      const result = error as { status: number; stdout: string };
      exitStatus = result.status;
      output = result.stdout;
    }
    expect(exitStatus).toBe(7);
    expect(JSON.parse(output)).toEqual({ cwd: installDir, args: ['-q', '123456'] });
  });
});
