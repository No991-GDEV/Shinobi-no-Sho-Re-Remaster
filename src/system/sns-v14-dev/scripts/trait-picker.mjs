import {revealListOption} from './view-state.mjs';
import {traitSuggestions,traitLabels,derivedTraits,traitMap,fold} from './traits.mjs';
import {jutsuProjection} from './item-view.mjs';
import {jutsuTraits} from './power-core.mjs';
import {ACTOR_SIZES,actorSizeId} from './actor-defenses.mjs';
const restoreFocus=new Set();
// One controller per rendered sheet, with document writes only on explicit chip selection/removal.
export function mountTraitPicker(root,doc){
 const host=root.querySelector('[data-trait-picker]');if(!host)return;
 host.classList.add('sns-trait-picker');
 const chips=document.createElement('div');chips.className='trait-chips';host.append(chips);
 const projection=doc.documentName==='Item'?jutsuProjection(doc):null,details={...doc.system.details,...projection?.data},sizeActor=doc.documentName==='Actor'&&['npc','companion'].includes(doc.type),sizeId=sizeActor?actorSizeId(doc.system):'',locked=new Set([...derivedTraits({...doc.system,details}),...(projection?.traits??[]),...(sizeId?[sizeId]:[])]);
 const chip=(id,label,kind)=>{const span=document.createElement('span');span.className='sns-tag trait-chip '+kind;span.title=traitMap.get(id)?.description??'Tag personalizada.';span.append(document.createTextNode(label));if(doc.isOwner&&!locked.has(id)){const b=document.createElement('button');b.type='button';b.textContent='×';b.setAttribute('aria-label','Remover tag '+label);b.addEventListener('click',async()=>{if(!doc.isOwner)return;const path=kind==='legacy'?'tags':'traits';await doc.update({['system.'+path]:doc.system[path].filter(x=>x!==id)});});span.append(b);}chips.append(span);};
 const traits=sizeActor?(doc.system.traits??[]).filter(id=>!ACTOR_SIZES.some(s=>s.id===id)):doc.system.traits,customSize=sizeActor&&!sizeId?String(details.size??''):'';
 if(customSize)locked.add('porte:custom');
 for(const t of traitLabels({...doc.system,details,traits:[...new Set([...jutsuTraits(traits,projection),...locked])]}))chip(t.id,t.id==='porte:custom'?customSize:sizeActor?ACTOR_SIZES.find(s=>s.id===t.id)?.name??t.label:t.label,locked.has(t.id)?'derived':'controlled');
 for(const text of doc.system.tags??[])if(!sizeActor||!ACTOR_SIZES.some(s=>fold(s.name)===fold(text)))chip(text,text,'legacy');
 if(!doc.isOwner)return;
 const input=document.createElement('input');input.type='text';input.placeholder='Adicionar tag…';input.setAttribute('aria-label','Pesquisar tags');input.setAttribute('role','combobox');input.setAttribute('aria-autocomplete','list');input.setAttribute('autocomplete','off');input.id=doc.id+'-traits-search';host.append(input);
 const list=document.createElement('div');list.id=input.id+'-list';list.className='trait-options';list.setAttribute('role','listbox');input.setAttribute('aria-controls',list.id);list.hidden=true;host.append(list);
 let options=[],active=-1;
 const close=()=>{list.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');};
 const choose=async id=>{if(!doc.isOwner||!traitMap.has(id))return;close();restoreFocus.add(doc.uuid);await doc.update({'system.traits':[...new Set([...(doc.system.traits??[]),id])]});};
 const highlight=()=>{[...list.children].forEach((e,i)=>e.setAttribute('aria-selected',String(i===active)));if(active>=0)input.setAttribute('aria-activedescendant',list.children[active].id);else input.removeAttribute('aria-activedescendant');revealListOption(list,list.children[active]);};
 const update=()=>{options=traitSuggestions(doc.type,input.value,[...jutsuTraits(doc.system.traits,projection),...locked]).filter(t=>!sizeActor||!ACTOR_SIZES.some(s=>s.id===t.id));list.replaceChildren();active=options.length?0:-1;for(const [i,t] of options.entries()){const el=document.createElement('button');el.id=list.id+'-'+i;el.type='button';el.setAttribute('role','option');el.textContent=t.label+' · '+t.family;el.title=t.description;el.addEventListener('mousedown',e=>e.preventDefault());el.addEventListener('click',()=>choose(t.id));list.append(el);}if(!options.length){const empty=document.createElement('span');empty.textContent='Nenhuma tag pertinente encontrada.';list.append(empty);}list.hidden=false;input.setAttribute('aria-expanded','true');highlight();};
 input.addEventListener('focus',update);input.addEventListener('input',update);input.addEventListener('blur',close);
 input.addEventListener('keydown',e=>{if(['ArrowDown','ArrowUp','Enter','Escape','Backspace'].includes(e.key)){if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();return;}if(e.key==='Backspace'&&!input.value){e.preventDefault();const last=doc.system.traits.filter(id=>!locked.has(id)).at(-1);if(last){restoreFocus.add(doc.uuid);doc.update({'system.traits':doc.system.traits.filter(id=>id!==last)});}return;}if(e.key==='Enter'){e.preventDefault();e.stopPropagation();if(active>=0&&options[active])choose(options[active].id);return;}if(e.key.startsWith('Arrow')){e.preventDefault();if(list.hidden)update();active=Math.max(0,Math.min(options.length-1,active+(e.key==='ArrowDown'?1:-1)));highlight();}}});
 close();
 if(restoreFocus.delete(doc.uuid))requestAnimationFrame(()=>{if(input.isConnected)input.focus({preventScroll:true});});
}
