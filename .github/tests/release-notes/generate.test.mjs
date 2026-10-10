import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { test } from 'node:test';

const script = fileURLToPath(new URL('../../scripts/generate-release-notes.mjs', import.meta.url));

function fixture (context) {
  const root = mkdtempSync(join(tmpdir(), 'napcat-release-'));
  context.after(() => rmSync(root, { recursive: true, force: true }));
  function git (...args) {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: 'pipe' }).trim();
  }
  git('init', '--initial-branch=main');
  git('config', 'user.name', 'Release Test');
  git('config', 'user.email', 'release-test@example.invalid');
  git('config', 'commit.gpgSign', 'false');
  git('config', 'tag.gpgSign', 'false');
  function commit (subject, tag) {
    git('commit', '--allow-empty', '-m', subject);
    if (tag) git('tag', tag);
    return git('rev-parse', 'HEAD');
  }
  function generate (tag, cwd = root) {
    return spawnSync(process.execPath, [script, tag, 'NapNeko/NapCatQQ', join(root, '说明 # release.md')], {
      cwd,
      encoding: 'utf8',
    });
  }
  function notes () {
    return readFileSync(join(root, '说明 # release.md'), 'utf8');
  }
  return { root, git, commit, generate, notes };
}

test('uses numeric version order, exact tagged range, and UTF-8 output paths', context => {
  const repository = fixture(context);
  repository.commit('old release', 'v4.18.9');
  repository.commit('previous release', 'v4.18.10');
  const changeHash = repository.commit('fix: 中文 [loader] *paths* <native> `quoted` \\ newline', 'v4.18.11');
  repository.commit('unreleased change', 'v4.18.12');
  const result = repository.generate('v4.18.11');
  assert.equal(result.status, 0, result.stderr);
  const notes = repository.notes();
  assert.ok(notes.includes('fix: 中文 \\[loader\\] \\*paths\\* \\<native\\> \\`quoted\\` \\\\ newline'));
  assert.ok(notes.includes(`/commit/${changeHash}`));
  assert.ok(notes.includes('/compare/v4.18.10...v4.18.11'));
  assert.doesNotMatch(notes, /old release|previous release|unreleased change|v4\.10\.7|MacOS 暂不支持/);
});

test('ignores version tags from an unmerged branch', context => {
  const repository = fixture(context);
  repository.commit('base', 'v1.0.0');
  repository.git('checkout', '-b', 'other');
  repository.commit('unmerged change', 'v1.9.0');
  repository.git('checkout', 'main');
  repository.commit('released change', 'v2.0.0');
  const result = repository.generate('v2.0.0');
  assert.equal(result.status, 0, result.stderr);
  assert.ok(repository.notes().includes('/compare/v1.0.0...v2.0.0'));
  assert.doesNotMatch(repository.notes(), /unmerged change/);
});

test('orders prerelease identifiers using semantic version precedence', context => {
  const repository = fixture(context);
  const versions = ['v1.0.0', 'v2.0.0-alpha.1', 'v2.0.0-alpha.2', 'v2.0.0-alpha.10',
    'v2.0.0-alpha.a10', 'v2.0.0-alpha.a2', 'v2.0.0-beta', 'v2.0.0-beta.1', 'v2.0.0-rc.1', 'v2.0.0'];
  for (const version of versions) repository.commit(version, version);
  for (let index = 1; index < versions.length; index++) {
    const result = repository.generate(versions[index]);
    assert.equal(result.status, 0, result.stderr);
    assert.ok(repository.notes().includes(`/compare/${versions[index - 1]}...${versions[index]}`));
  }
});

test('accepts annotated release tags and ignores invalid version tags', context => {
  const repository = fixture(context);
  repository.commit('base', 'v1.0.0');
  repository.commit('change');
  repository.git('tag', '-a', 'v1.1.0', '-m', 'Release v1.1.0');
  for (const tag of ['v1.2.0-01', 'v1.2.0-.rc', 'v1.02.0', 'preview']) repository.git('tag', tag);
  repository.commit('current', 'v2.0.0');
  const result = repository.generate('v2.0.0');
  assert.equal(result.status, 0, result.stderr);
  assert.ok(repository.notes().includes('/compare/v1.1.0...v2.0.0'));
});

test('reports an empty tagged range without inventing changes', context => {
  const repository = fixture(context);
  repository.commit('base', 'v1.0.0');
  repository.git('tag', 'v1.0.1');
  const result = repository.generate('v1.0.1');
  assert.equal(result.status, 0, result.stderr);
  assert.ok(repository.notes().includes('此标签范围内没有新增提交。'));
});

test('fails for missing or invalid versions without replacing existing output', context => {
  const repository = fixture(context);
  repository.commit('base', 'v1.0.0');
  const output = join(repository.root, '说明 # release.md');
  writeFileSync(output, 'existing output');
  for (const tag of ['v1.0.0', 'v2.0.0', 'v2.0.0-01', '--help', 'v1.0.1;echo invalid']) {
    const result = repository.generate(tag);
    assert.notEqual(result.status, 0, tag);
    assert.equal(repository.notes(), 'existing output');
  }
});

test('rejects a shallow checkout instead of generating incomplete notes', context => {
  const repository = fixture(context);
  repository.commit('base', 'v1.0.0');
  repository.commit('current', 'v1.1.0');
  const shallow = join(repository.root, 'shallow');
  repository.git('clone', '--depth=1', '--no-local', pathToFileURL(repository.root).href, shallow);
  const result = repository.generate('v1.1.0', shallow);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /complete Git history/);
  assert.equal(existsSync(join(repository.root, '说明 # release.md')), false);
});
