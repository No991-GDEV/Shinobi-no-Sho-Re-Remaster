import {jutsuProjection} from './item-view.mjs';
import {effectDefinition} from './power-core.mjs';
import {escapeHtml as esc} from './kernel.mjs';
export function castLevels(item){
 const j=item.system.jutsu??{},p=item.actor?.items.get(item.system.details.powerId),e=effectDefinition(j.effectId);
 if(!e||!p)return [];
 const result=[];
 for(let n=e.min;n<=p.system.level;n++){const projection=jutsuProjection(item,{usedLevel:n});if(projection?.valid)result.push({level:n,projection});}
 return result;
}
export async function chooseCastLevel(item){
 const levels=castLevels(item),saved=item.system.jutsu?.usedLevel;
 if(levels.length<=1)return levels[0]?.level??saved;
 const selected=levels.some(l=>l.level===saved)?saved:levels[0].level;
 const facts=p=>[['Chakra',p.data.chakraCost],['Dano base',p.data.damage],['Alcance',p.data.range],['Área',p.data.area],['Tamanho máximo (m)',p.data.size],['Dificuldade',p.data.difficulty]].filter(([,v])=>v!==undefined&&v!=='').map(([k,v])=>'<div><strong>'+esc(k)+'</strong><span>'+esc(v)+'</span></div>').join('');
 const value=await foundry.applications.api.DialogV2.prompt({classes:['sns-editor-dialog','sns-cast-level'],window:{title:'Usar '+item.name},content:'<label>Nível usado<select name="castLevel">'+levels.map(l=>'<option value="'+l.level+'" '+(l.level===selected?'selected':'')+'>Nível '+l.level+' · Chakra '+esc(l.projection.data.chakraCost)+'</option>').join('')+'</select></label>'+levels.map(l=>'<section class="sns-cast-preview" data-level="'+l.level+'" '+(l.level!==selected?'hidden':'')+'>'+facts(l.projection)+'</section>').join(''),render:(event,dialog)=>{dialog.element.querySelector('[name=castLevel]').addEventListener('change',e=>{for(const preview of dialog.element.querySelectorAll('[data-level]'))preview.hidden=Number(preview.dataset.level)!==Number(e.target.value);});},ok:{label:'Continuar',callback:(event,button)=>Number(button.form.elements.castLevel.value)}});
 if(value===null||value===undefined||value===false)return null;
 if(!levels.some(l=>l.level===value))throw Error('Nível de uso inválido.');
 return value;
}
