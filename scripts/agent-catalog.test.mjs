import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, cp, appendFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { selectResources } from './agent-catalog.mjs';

test('场景筛选只使用明确标签，关键词可查到未标注资源', () => {
  const catalog = { resources: [
    { id: 'a', kind: 'effect', title: '按钮', scenes: { places: ['按钮'], goals: ['交互反馈'] } },
    { id: 'b', kind: 'effect', title: '按钮', scenes: null },
    { id: 'c', kind: 'skill', title: '按钮设计', scenes: null }
  ] };
  assert.deepEqual(selectResources(catalog, { place: '按钮' }).map(r => r.id), ['a']);
  assert.equal(selectResources(catalog, { query: '按钮', kind: 'effect' }).length, 2);
  assert.equal(selectResources(catalog, { query: '按钮 不存在' }).length, 0);
});

test('CLI 检查本地源文件、返回明确错误并拒绝过期索引', async () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const workspace = await mkdtemp(path.join(tmpdir(), 'webui-agent-test-'));
  try {
    for (const name of ['package.json', 'src', 'skills', 'scripts', 'agent/recipes', 'recipes']) {
      await cp(path.join(root, name), path.join(workspace, name), { recursive: true });
    }
    const run = (...args) => spawnSync(process.execPath, ['scripts/agent-catalog.mjs', ...args], { cwd: workspace, encoding: 'utf8' });
    let result = run('build');
    assert.equal(result.status, 0, result.stderr);
    assert.equal(run('check').status, 0);
    result = run('show', 'effect:magnetic-btn');
    assert.equal(result.status, 0, result.stderr);
    assert.equal(JSON.parse(result.stdout).verification.composition, 'unknown');
    result = run('show', 'effect:missing');
    assert.equal(result.status, 1);
    assert.match(JSON.parse(result.stderr).error, /未找到资源/);
    assert.equal(run('list', '--kind', 'invalid').status, 1);
    assert.equal(run('list', '--limit', 'NaN').status, 1);
    result = run('list', '--place', '按钮', '--limit', '1');
    assert.equal(result.status, 0, result.stderr);
    assert.equal(JSON.parse(result.stdout).returned, 1);
    await appendFile(path.join(workspace, 'skills/3d-object.md'), '\nsource changed\n');
    result = run('check');
    assert.equal(result.status, 1);
    assert.match(JSON.parse(result.stderr).error, /索引已过期/);
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
});
