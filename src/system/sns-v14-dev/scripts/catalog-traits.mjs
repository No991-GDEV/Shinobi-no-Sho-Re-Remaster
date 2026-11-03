import {revealListOption} from './view-state.mjs';
import {catalogTraitOptions} from './catalog-core.mjs';
// Filter state only: selecting a trait never changes a document or grants a rule.
export function mountCatalogTraits(root,{tab,selected,onSelect}){
 const input=root.querySelector('[data-catalog-trait-input]'),list=root.querySelector('[data-catalog-trait-list]'),toggle=root.querySelector('[data-trait-toggle]');
 if(!input||!list)return ()=>{};
 const controller=new AbortController(),signal=controller.signal;
 let options=[],active=0,opened=false;
 const close=()=>{if(list.matches(':popover-open'))list.hidePopover();opened=false;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');toggle?.setAttribute('aria-expanded','false');};
 const position=()=>{
  const r=root.querySelector('[data-trait-field]').getBoundingClientRect(),below=window.innerHeight-r.bottom-12,above=r.top-12,up=below<180&&above>below;
  Object.assign(list.style,{left:Math.max(8,Math.min(r.left,window.innerWidth-r.width-8))+'px',width:r.width+'px',maxHeight:Math.max(80,Math.min(300,up?above:below))+'px',top:up?'auto':r.bottom+3+'px',bottom:up?window.innerHeight-r.top+3+'px':'auto'});
 };
 const highlight=()=>{
  Array.from(list.querySelectorAll('[role="option"]')).forEach((el,n)=>el.setAttribute('aria-selected',String(n===active)));
  const el=list.querySelectorAll('[role="option"]')[active];
  if(el){input.setAttribute('aria-activedescendant',el.id);revealListOption(list,el);}else input.removeAttribute('aria-activedescendant');
 };
 const choose=id=>{close();input.value='';onSelect(id);};
 const open=()=>{
  options=catalogTraitOptions(tab,input.value,selected);active=0;list.replaceChildren();
  for(const [n,t] of options.entries()){
   const button=document.createElement('button');button.type='button';button.id=list.id+'-'+n;button.setAttribute('role','option');button.setAttribute('aria-selected','false');button.dataset.traitId=t.id;button.title=t.description;
   const label=document.createElement('span');label.textContent=t.label;const family=document.createElement('small');family.textContent=t.family;button.append(label,family);
   button.addEventListener('mousedown',event=>event.preventDefault(),{signal});button.addEventListener('click',()=>choose(t.id),{signal});list.append(button);
  }
  if(!options.length){const empty=document.createElement('p');empty.textContent='Nenhum trait corresponde à busca.';list.append(empty);}
  position();if(!list.matches(':popover-open'))list.showPopover();opened=true;input.setAttribute('aria-expanded','true');toggle?.setAttribute('aria-expanded','true');highlight();
 };
 input.addEventListener('focus',open,{signal});input.addEventListener('input',open,{signal});input.addEventListener('blur',close,{signal});
 input.addEventListener('keydown',event=>{
  if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();return;}
  if(event.key==='Enter'){event.preventDefault();event.stopPropagation();if(opened&&options[active])choose(options[active].id);else open();return;}
  if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();if(!opened){open();return;}active=Math.max(0,Math.min(options.length-1,active+(event.key==='ArrowDown'?1:-1)));highlight();}
 },{signal});
 toggle?.addEventListener('mousedown',event=>event.preventDefault(),{signal});toggle?.addEventListener('click',()=>{if(opened)close();else{input.focus({preventScroll:true});open();}},{signal});
 root.addEventListener('pointerdown',event=>{if(!event.target.closest('[data-trait-field]')&&!list.contains(event.target))close();},{signal});
 root.querySelector('.catalog-filters')?.addEventListener('scroll',()=>{if(opened)position();},{signal});window.addEventListener('resize',()=>{if(opened)position();},{signal});
 close();return ()=>{close();controller.abort();};
}
