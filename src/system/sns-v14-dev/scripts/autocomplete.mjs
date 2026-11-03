import {revealListOption} from './view-state.mjs';
import {fold} from './traits.mjs';
export function mountAutocomplete(input,list,options,{select,onType=()=>{}}){
 let matches=[],active=0;input.setAttribute('role','combobox');input.setAttribute('aria-controls',list.id);input.setAttribute('aria-autocomplete','list');
 const close=()=>{list.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');};
 const highlight=()=>{[...list.children].forEach((b,i)=>b.setAttribute('aria-selected',String(i===active)));if(matches.length)input.setAttribute('aria-activedescendant',list.children[active].id);};
 const choose=option=>{input.value=option.label;close();select(option);};
 const show=()=>{const q=fold(input.value);matches=options.filter(o=>fold(o.label).includes(q));active=0;list.replaceChildren();for(const [i,o] of matches.entries()){const b=document.createElement('button');b.id=list.id+'-'+i;b.type='button';b.setAttribute('role','option');b.textContent=o.label;b.addEventListener('mousedown',e=>e.preventDefault());b.addEventListener('click',()=>choose(o));list.append(b);}if(!matches.length){const empty=document.createElement('span');empty.textContent='Nenhum efeito aprendido corresponde à busca.';list.append(empty);}list.hidden=false;input.setAttribute('aria-expanded','true');highlight();};
 input.addEventListener('focus',show);input.addEventListener('input',()=>{onType();show();});input.addEventListener('blur',close);
 input.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();}else if(e.key==='Enter'){e.preventDefault();if(!list.hidden&&matches[active])choose(matches[active]);}else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(list.hidden)show();active=Math.max(0,Math.min(matches.length-1,active+(e.key==='ArrowDown'?1:-1)));highlight();revealListOption(list,list.children[active]);}});close();
}
