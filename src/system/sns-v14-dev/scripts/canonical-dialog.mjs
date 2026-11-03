import {carryRequirementProfile,requirementProfile} from './requirement-policy.mjs';
import {loadCanonicalLibrary,canonicalEntry,canonicalCopy,canonicalTextPatch} from './canonical-content.mjs';
import {escapeHtml} from './kernel.mjs';
import {aptitudeChoiceOptions,aptitudeChoiceStatus,choiceFieldLabel} from './aptitude-choices.mjs';
export async function correctAptitudeChoice(item){
 if(!game.user.isGM||!item.isOwner)return;
 const status=aptitudeChoiceStatus(item);if(!status.required)return;
 const result=await foundry.applications.api.DialogV2.prompt({classes:['sns-editor-dialog'],window:{title:'Escolha de '+item.name},content:'<label>'+choiceFieldLabel(status.kind)+'<select name="choice" required><option value="">Selecione…</option>'+aptitudeChoiceOptions(item).map(v=>'<option value="'+escapeHtml(v.id)+'" '+(v.id===status.key?'selected':'')+'>'+escapeHtml(v.label)+'</option>').join('')+'</select></label>',ok:{label:'Escolher',callback:(e,b)=>b.form.elements.choice.value}});
 if(!result||!game.user.isGM||!item.isOwner)return;
 const choice={kind:status.kind,key:result};if(!aptitudeChoiceStatus({system:{...item.system.toObject(),choice}}).valid)return;
 if(choice.key===status.key)return;
 const history=[...(item.flags?.['sns-v14-dev']?.choiceHistory??[]),{at:new Date().toISOString(),user:game.user.id,before:item.system.toObject().choice,after:choice}];
 await item.update({'system.choice':choice,'flags.sns-v14-dev.choiceHistory':history});
}
export async function updateBookText(item){
 if(!game.user.isGM||!item.isOwner)return;
 const library=await loadCanonicalLibrary(),entry=canonicalEntry(item,library);if(!entry)return;
 const patch=canonicalTextPatch(item,entry,library,{user:game.user.id,at:new Date().toISOString()});
 if(!patch)return ui.notifications.info('Este item já usa o texto do livro.');
 const choiceLabel=patch['system.choice']?aptitudeChoiceStatus({system:{...item.system.toObject(),contentId:entry.id,ruleId:patch['system.ruleId']??item.system.ruleId,choice:patch['system.choice']}}).label:'';
 const migrationNote=patch['system.details.powerOrigin']==='common'?'<p><strong>Forma de aquisição:</strong> Poder comum. Invocações seguem a penalidade de −3 do livro.</p>':'';
 const yes=await foundry.applications.api.DialogV2.confirm({classes:['sns-editor-dialog'],position:{width:640},window:{title:'Texto do livro · '+entry.document.name},content:'<p><strong>'+escapeHtml(item.name)+'</strong> → <strong>'+escapeHtml(patch.name)+'</strong></p>'+(choiceLabel?'<p><strong>Escolha atual:</strong> '+escapeHtml(choiceLabel)+'</p>':'')+'<p>'+escapeHtml(entry.document.system.source.id+' · '+entry.document.system.source.edition+' · p.'+entry.document.system.source.pages)+'</p>'+migrationNote+'<div class="book-text-preview">'+entry.document.system.description+'</div><p>Atualizar nome, descrição e fonte? Compras e escolhas serão mantidas. O texto anterior ficará no histórico.</p>',yes:{label:'Usar texto do livro'},no:{label:'Cancelar'}});
 if(yes&&game.user.isGM&&item.isOwner)await item.update(patch);
}
export async function chooseCanonicalCopy(data,library){
 const entry=canonicalEntry(data,library);if(!entry||!entry.variants.length&&!entry.choiceType)return data;
 const options=aptitudeChoiceOptions(entry.document);
 const fields=(entry.variants.length?'<label>Escolha<select name="variant">'+entry.variants.map(v=>'<option value="'+escapeHtml(v.id)+'">'+escapeHtml(v.label)+'</option>').join('')+'</select></label>':'')+(entry.choiceType?'<label>'+choiceFieldLabel(entry.choiceType)+'<select name="choice" required><option value="">Selecione…</option>'+options.map(v=>'<option value="'+escapeHtml(v.id)+'">'+escapeHtml(v.label)+'</option>').join('')+'</select></label>':'');
 const result=await foundry.applications.api.DialogV2.prompt({classes:['sns-editor-dialog'],window:{title:entry.document.name},content:fields+'',ok:{label:'Adicionar à ficha',callback:(e,b)=>({variant:b.form.elements.variant?.value??'',choice:b.form.elements.choice?.value??''})}});
 if(!result)return null;
 const copy=carryRequirementProfile(data,canonicalCopy(entry,result.variant,result.choice));
 if(!aptitudeChoiceStatus(copy).valid){ui.notifications.warn('Selecione uma opção válida antes de adicionar à ficha.');return null;}
 return copy;
}
export async function copyDroppedCanonicalChoice(actor,item){
 if(item.actor===actor)return {handled:false};
 const library=await loadCanonicalLibrary(),entry=canonicalEntry(item,library);
 if(!entry?.choiceType&&!entry?.variants.length&&!requirementProfile(item))return {handled:false};
 if(!actor.isOwner)return {handled:true,item:null};
 const data=await chooseCanonicalCopy(carryRequirementProfile(item,item.toObject(),item.uuid),library);if(!data)return {handled:true,item:null};delete data._id;
 if(data.type==='power'&&data.system.power)data.system.power.choices=[];
 const [created]=await actor.createEmbeddedDocuments('Item',[data]);return {handled:true,item:created??null};
}
