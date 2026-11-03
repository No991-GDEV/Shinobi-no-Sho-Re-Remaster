const ns='sns-v14-dev';
// The GM processor copies source recipes; owners still control their title,
// artwork and personal notes. Mechanical editing uses the normal custom-jutsu
// builder, not the recorded-technique executor.
export function mayEditSharedRecipe(before,after,isGM){
 if(isGM)return true;const a=before?.flags?.[ns]?.sharedRecipe,b=after?.flags?.[ns]?.sharedRecipe;
 if(!a&&!b)return true;if(!a||JSON.stringify(a)!==JSON.stringify(b))return false;
 return ['contentId','ruleId','description','details','jutsu','level','targetEffects'].every(k=>JSON.stringify(before.system?.[k])===JSON.stringify(after.system?.[k]));
}
