// Preserve the editor the user is working in while its calculated preview changes.
const controls=['data-field','data-trauma','data-effect','data-purchase-check','data-purchase-level','data-purchase-choice','data-search'];
function focusKey(root,element){
 if(!element||!root.contains(element))return null;
 const attribute=controls.find(k=>element.hasAttribute(k));if(!attribute)return null;
 return {attribute,value:element.getAttribute(attribute),purchase:element.closest('[data-purchase]')?.dataset.purchase??'',slot:element.dataset.slot??'',start:element.selectionStart,end:element.selectionEnd};
}
export function captureGeneratorView(root){return {open:[...root.querySelectorAll('details[data-view-key]')].map(e=>({key:e.dataset.viewKey,open:e.open})),scroll:[...root.querySelectorAll('.npc-generator-preview,.npc-build-additional>.npc-build-purchases')].map(e=>({className:e.className,top:e.scrollTop,left:e.scrollLeft})),focus:focusKey(root,root.ownerDocument.activeElement)};}
export function restoreGeneratorView(root,state){
 if(!state)return;
 for(const d of root.querySelectorAll('details[data-view-key]')){const row=state.open.find(r=>r.key===d.dataset.viewKey);if(row)d.open=row.open;}
 for(const e of root.querySelectorAll('.npc-generator-preview,.npc-build-additional>.npc-build-purchases')){const row=state.scroll.find(r=>r.className===e.className);if(row){e.scrollTop=row.top;e.scrollLeft=row.left;}}
 const f=state.focus;if(!f)return;
 const target=[...root.querySelectorAll('input,select')].find(e=>e.hasAttribute(f.attribute)&&e.getAttribute(f.attribute)===f.value&&(e.closest('[data-purchase]')?.dataset.purchase??'')===f.purchase&&(e.dataset.slot??'')===f.slot);
 if(target){target.focus({preventScroll:true});if(Number.isInteger(f.start)&&['text','search'].includes(target.type))target.setSelectionRange(f.start,f.end);}
}
export function revealGeneratorSection(panel,section){
 const p=panel.getBoundingClientRect(),s=section.getBoundingClientRect();
 if(s.bottom>p.bottom)panel.scrollTop+=Math.max(0,Math.min(s.bottom-p.bottom,s.top-p.top));
}
