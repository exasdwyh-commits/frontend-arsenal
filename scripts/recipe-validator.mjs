export function validateRecipe(recipe, knownEffects) {
  const errors = [];
  if (!recipe.id?.startsWith('recipe:')) errors.push('配方 ID 必须以 recipe: 开头');
  if (!Array.isArray(recipe.slots) || !recipe.slots.length) return [...errors, '配方必须包含 slots'];
  const slotIds = new Set();
  for (const slot of recipe.slots) {
    if (!slot.id || slotIds.has(slot.id)) errors.push(`槽位 ID 缺失或重复: ${slot.id}`);
    slotIds.add(slot.id);
    const controls = new Set();
    if (!Array.isArray(slot.effects) || slot.effects.length === 0) {
      errors.push(`${slot.id} 缺少 effects`);
      continue;
    }
    for (const effect of slot.effects) {
      if (!knownEffects.has(effect.id)) errors.push(`未知效果: ${effect.id}`);
      if (typeof effect.reducedMotion !== 'string' || !effect.reducedMotion.trim()) errors.push(`${effect.id} 缺少 reducedMotion`);
      if (!Array.isArray(effect.controls) || !effect.controls.length || effect.controls.some(property => typeof property !== 'string' || !property.trim())) {
        errors.push(`${effect.id} 缺少有效 controls`);
        continue;
      }
      for (const property of effect.controls) {
        if (controls.has(property)) errors.push(`${slot.id} 的 ${property} 存在冲突`);
        controls.add(property);
      }
    }
  }
  return errors;
}
