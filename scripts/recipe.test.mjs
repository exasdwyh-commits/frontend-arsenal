import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRecipe } from './recipe-validator.mjs';

const recipe = { id:'recipe:test', slots:[{id:'list', effects:[{id:'effect:stagger-in', controls:['opacity'], reducedMotion:'static'}]}] };
test('组合配方检查资源存在性、属性冲突与降动效替代', () => {
  const known = new Set(['effect:stagger-in', 'effect:skeleton-shimmer']);
  assert.deepEqual(validateRecipe(recipe, known), []);
  const bad = { id:'recipe:bad', slots:[{id:'list', effects:[
    {id:'effect:stagger-in', controls:['opacity']},
    {id:'effect:skeleton-shimmer', controls:['opacity'], reducedMotion:'static'},
    {id:'effect:missing', controls:['transform'], reducedMotion:'static'}
  ]}] };
  const errors = validateRecipe(bad, known).join(' ');
  assert.match(errors, /effect:missing/);
  assert.match(errors, /opacity/);
  assert.match(errors, /reducedMotion/);
});

test('拒绝缺失效果、属性或降动效说明的无效配方', () => {
  const known = new Set(['effect:stagger-in']);
  const invalid = { id: 'recipe:invalid', slots: [
    { id: 'empty' },
    { id: 'list', effects: [{ id: 'effect:stagger-in', controls: [], reducedMotion: '  ' }] }
  ] };
  const errors = validateRecipe(invalid, known).join(' ');
  assert.match(errors, /effects/);
  assert.match(errors, /controls/);
  assert.match(errors, /reducedMotion/);
});
