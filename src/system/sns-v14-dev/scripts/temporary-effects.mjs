import {conditionViews} from './condition-effects.mjs';
import {effectPresentation} from './effect-presentation.mjs';
import {virtualEffectRows} from './effect-item-sources.mjs';
import {effectBinding} from './effect-item-rules.mjs';
import {bindingKey} from './effect-item-service.mjs';
export function temporaryEffects(actor){
 const items=Array.from(actor.items??[]),allBound=new Set(items.filter(effectBinding).map(i=>effectBinding(i).key)),bound=new Set(items.filter(i=>effectBinding(i)&&i.system.appliedCondition.active).map(i=>effectBinding(i).key));
 const rows=conditionViews(actor).map(row=>{const item=items.find(i=>i.id===row.id),binding=effectBinding(item);return binding?{...row,sourceId:binding.sourceId,hasSource:items.some(i=>i.id===binding.sourceId),sourceName:binding.snapshot.sourceName,summary:binding.snapshot.summary,endLabel:binding.snapshot.endLabel,problems:binding.snapshot.problems??[],boundEffect:true}:row;});
 return effectPresentation(actor,[...rows,...virtualEffectRows(actor).filter(row=>!bound.has(bindingKey(row))&&(row.hasSource||!allBound.has(bindingKey(row))))]);
}
