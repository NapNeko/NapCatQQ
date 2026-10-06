import { afterEach, expect, test } from 'vitest';
import { copyFileSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const packageRoot = fileURLToPath(new URL('../', import.meta.url));
const fixtures: string[] = [];

afterEach(() => {
  for (const fixture of fixtures.splice(0)) {
    rmSync(fixture, { recursive: true, force: true });
  }
});

test('type post-build replaces complete nested generic and import types', () => {
  const fixture = mkdtempSync(path.join(packageRoot, 'napcat-types/post-build-test-'));
  fixtures.push(fixture);
  mkdirSync(path.join(fixture, 'scripts'));
  mkdirSync(path.join(fixture, 'dist'));
  const script = path.join(fixture, 'scripts/post-build.mjs');
  copyFileSync(path.join(packageRoot, 'napcat-types/scripts/post-build.mjs'), script);
  writeFileSync(path.join(fixture, 'dist/fixture.d.ts'), `
import { NapProtoDecodeStructType } from 'napcat-protobuf';
export declare class Example {
  parse(): import('napcat-protobuf').NapProtoDecodeStructType<() => { nested: Map<string, Array<number>> }>;
  encode(): NapProtoEncodeStructType<{ fn: () => Promise<Array<string>> }>;
  validate: ValidateFunction<Map<string, Array<number>>>;
  unrelated: Promise<Array<string>>;
}
export declare enum ExampleKind { First = 1 }
`);
  execFileSync(process.execPath, [script], { encoding: 'utf8' });
  const output = readFileSync(path.join(fixture, 'dist/fixture.ts'), 'utf8');
  const parsed = ts.transpileModule(output, { reportDiagnostics: true, compilerOptions: { target: ts.ScriptTarget.Latest } });
  expect(parsed.diagnostics).toHaveLength(0);
  expect(output).toContain('parse(): any;');
  expect(output).toContain('encode(): any;');
  expect(output).toContain('validate: any;');
  expect(output).toContain('unrelated: Promise<Array<string>>;');
  expect(output).toContain('export enum ExampleKind');
  expect(output).not.toContain("import('napcat-protobuf').any");
});
