import {sheetView} from './view.mjs';
import {requirementsFor} from './item-requirements.mjs';
import {creationWizardState} from './creation-wizard-state.mjs';

export function guideRequirements(actor,view){
 const result=[];
 for(const row of view.items??[]){
  if(!['powers','aptitudes','techniques','features'].includes(row.category))continue;
  const item=actor.items?.get?.(row.id);if(!item)continue;
  const r=requirementsFor(item,actor);
  result.push({name:row.name,status:r.configured?r.valid?'ok':'unmet':'unknown',problems:r.configured?r.problems:[]});
 }
 return result;
}
export function guideView(actor,{isGM=false}={}){
 const view=sheetView(actor,{isGM,editable:actor.isOwner});
 view.requirementReview=guideRequirements(actor,view);return view;
}
export function mayFinishCreation(actor,source){
 const candidate={name:actor.name,type:actor.type,items:actor.items,flags:actor.flags,isOwner:actor.isOwner,system:{...source,phase:'creation'}};
 return creationWizardState(guideView(candidate),'review').ready.value;
}
