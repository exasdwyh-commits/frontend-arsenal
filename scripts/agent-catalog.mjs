import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { EFFECTS } from '../src/registry.js';
import { SKILLS, CATS } from '../src/skills-data.js';
import { films } from '../src/video-data.js';
import { GROUP_MAP } from '../src/groups.js';
import { sceneFor } from '../src/scenes.js';
import { validateRecipe } from './recipe-validator.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const catalogPath = path.join(root, 'agent/catalog.json');
const hash = text => createHash('sha256').update(text).digest('hex');
const read = file => readFile(path.join(root, file), 'utf8');
const commonInputs = ['scripts/agent-catalog.mjs', 'scripts/recipe-validator.mjs', 'src/registry.js', 'src/groups.js', 'src/scenes.js', 'src/skills-data.js', 'src/video-data.js'];

export async function buildCatalog() {
  const sources = new Map();
  const files = (await readdir(path.join(root, 'src/effects'))).filter(f => f.endsWith('.js')).sort();
  for (const file of files) {
    const source = `src/effects/${file}`;
    const { default: effect } = await import(new URL(`../${source}`, import.meta.url));
    if (!effect?.id) throw new Error(`效果缺少 ID: ${source}`);
    if (sources.has(effect.id)) throw new Error(`效果文件 ID 重复: ${effect.id}`);
    sources.set(effect.id, source);
  }
  const recipes = [];
  for (const file of (await readdir(path.join(root, 'agent/recipes'))).filter(f => f.endsWith('.json')).sort()) {
    const source = `agent/recipes/${file}`;
    const recipe = JSON.parse(await read(source));
    if (recipe.source !== source) throw new Error(`配方 source 不匹配: ${source}`);
    const errors = validateRecipe(recipe, new Set(EFFECTS.map(effect => `effect:${effect.id}`)));
    if (errors.length) throw new Error(`${source}: ${errors.join('; ')}`);
    recipes.push({ ...recipe, kind: 'recipe' });
  }
  const resources = [
    ...EFFECTS.map(effect => ({
      id: `effect:${effect.id}`, kind: 'effect', title: effect.name,
      description: effect.desc, category: GROUP_MAP[effect.group].name,
      source: sources.get(effect.id), preview: `index.html#${encodeURIComponent(effect.id)}`,
      implementation: 'demo-module', technology: effect.lib,
      declaredDependencies: effect.deps, notes: effect.note || '',
      scenes: sceneFor(effect), sceneEvidence: sceneFor(effect) ? (effect.scenes ? sources.get(effect.id) : 'src/scenes.js') : null,
      integration: { contract: 'default.init(element, {ensure, loadScript}) -> destroy, possibly async',
        readBeforeUse: [sources.get(effect.id), 'src/engine.js'],
        caveat: '演示 init 与 code 摘录可能不同；先读完整源文件，再适配目标项目。' },
      verification: { runtime: 'unverified', mobile: 'unknown', accessibility: 'unknown', composition: 'unknown', license: 'review-source' }
    })),
    ...SKILLS.map(skill => ({
      id: `skill:${skill.id}`, kind: 'skill', title: skill.zh || skill.name,
      description: skill.desc, category: CATS[skill.cat], aliases: [skill.name, skill.id],
      source: `skills/${skill.id}.md`, preview: `skills.html?skill=${encodeURIComponent(skill.id)}`,
      implementation: 'method-document', scenes: null,
      integration: { readBeforeUse: [`skills/${skill.id}.md`], caveat: '方法文档不等于组件；先核对所需工具、依赖和外部服务。' },
      verification: { runtime: 'not-applicable', composition: 'unknown', license: 'review-source' }
    })),
    ...films.map(([slug, title, english, tags]) => ({
      id: `video:${slug}`, kind: 'video', title, description: english,
      category: '视频风格', tags: tags.split(' '), source: 'src/video-data.js',
      preview: `video.html?q=${encodeURIComponent(title)}#films`,
      implementation: 'remote-reference', scenes: null,
      remoteSource: `https://github.com/Vincentwei1021/mg-styles-15/tree/main/demos/${slug}`,
      integration: { readBeforeUse: ['src/video-data.js'], caveat: '本地仅有索引；实现需访问原项目，核对源码与授权。' },
      verification: { runtime: 'unverified', composition: 'unknown', license: 'review-upstream' }
    })),
    ...recipes
  ];
  const ids = new Set();
  for (const resource of resources) {
    if (ids.has(resource.id)) throw new Error(`资源 ID 重复: ${resource.id}`);
    ids.add(resource.id);
    if (!resource.source) throw new Error(`资源缺少源文件: ${resource.id}`);
  }
  const inputs = [...new Set([...commonInputs, 'src/engine.js', ...resources.map(r => r.source), ...recipes.flatMap(r => r.integration.readBeforeUse)])].sort();
  const fingerprints = {};
  for (const file of inputs) fingerprints[file] = hash(await read(file));
  return { schemaVersion: 1, protocol: 'agent/README.md',
    coverage: { effects: EFFECTS.length, skills: SKILLS.length, videos: films.length,
      effectsWithScenes: resources.filter(r => r.kind === 'effect' && r.scenes).length,
      recipes: recipes.length, verifiedTemplates: 0 },
    fingerprints, resources };
}

function parseArgs(args) {
  const options = {};
  for (let i = 0; i < args.length; i++) {
    if (!['--query', '--kind', '--place', '--goal', '--project', '--limit'].includes(args[i])) throw new Error(`未知参数: ${args[i]}`);
    const key = args[i].slice(2), value = args[++i];
    if (!value || value.startsWith('--')) throw new Error(`缺少参数值: --${key}`);
    options[key] = value;
  }
  if (options.kind && !['effect', 'skill', 'video', 'recipe'].includes(options.kind)) throw new Error('kind 必须为 effect / skill / video / recipe');
  if (options.limit && (!/^\d+$/.test(options.limit) || +options.limit < 1)) throw new Error('limit 必须为正整数');
  return options;
}

export function selectResources(catalog, options = {}) {
  const words = (options.query || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
  return catalog.resources.filter(resource => {
    if (options.kind && resource.kind !== options.kind) return false;
    // 使用现有场景依据做精确筛选，未标注资源不被推断为匹配。
    for (const [option, field] of [['place','places'], ['goal','goals'], ['project','projects']]) {
      if (options[option] && !resource.scenes?.[field]?.includes(options[option])) return false;
    }
    const text = [resource.title, resource.description, resource.category, resource.technology,
      ...(resource.aliases || []), ...(resource.tags || []), ...Object.values(resource.scenes || {}).flat()].join(' ').toLowerCase();
    return words.every(word => text.includes(word));
  });
}

export async function main(args) {
  const [command = 'help', ...rest] = args;
  if (command === 'build') {
    if (rest.length) throw new Error('build 不接受参数');
    const catalog = await buildCatalog();
    await mkdir(path.dirname(catalogPath), { recursive: true });
    await writeFile(catalogPath, JSON.stringify(catalog, null, 2) + '\n');
    return { status: 'built', coverage: catalog.coverage };
  }
  if (command === 'help') return { commands: [
    'node scripts/agent-catalog.mjs build',
    'node scripts/agent-catalog.mjs check',
    'node scripts/agent-catalog.mjs list --query "按钮" --kind effect --limit 5',
    'node scripts/agent-catalog.mjs list --place 按钮 --goal 交互反馈',
    'node scripts/agent-catalog.mjs show effect:magnetic-btn'
  ], protocol: 'agent/README.md' };
  if (!['check','list','show'].includes(command)) throw new Error(`未知命令: ${command}`);
  const saved = JSON.parse(await readFile(catalogPath, 'utf8'));
  const current = await buildCatalog();
  if (JSON.stringify(saved) !== JSON.stringify(current)) throw new Error('索引已过期，请运行 npm run agent:build');
  if (command === 'check') {
    if (rest.length) throw new Error('check 不接受参数');
    return { status: 'current', coverage: saved.coverage };
  }
  if (command === 'show') {
    if (rest.length !== 1) throw new Error('show 需要且仅需要一个完整资源 ID');
    const resource = saved.resources.find(r => r.id === rest[0]);
    if (!resource) throw new Error(`未找到资源: ${rest[0]}`);
    return resource;
  }
  const options = parseArgs(rest);
  const matched = selectResources(saved, options);
  return { total: matched.length, returned: Math.min(matched.length, +(options.limit || 20)),
    caveat: '结果为目录匹配，不代表业务推荐或兼容性验证；未标注场景可能漏检。',
    resources: matched.slice(0, +(options.limit || 20)).map(({id,title,kind,category,source,scenes,verification}) => ({id,title,kind,category,source,scenes,verification})) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(JSON.stringify(await main(process.argv.slice(2)), null, 2)); }
  catch (error) { console.error(JSON.stringify({ error: error.message })); process.exitCode = 1; }
}
