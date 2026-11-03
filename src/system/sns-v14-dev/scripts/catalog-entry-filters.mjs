// D141 · organização dos compêndios.
// Filtros de entrada do catálogo derivados da categoria da lupa da ficha.
// Regra central: nenhuma restrição fica escondida. Ou ela é um tipo visível no
// dropdown, ou uma categoria visível no mesmo dropdown — e trocar a escolha
// sempre remove a restrição anterior.
import {ITEM_PROFILES,ACTOR_PROFILES,CATEGORIES,typeForCategory} from './sheet-profiles.mjs';
import {CATALOG_TABS} from './catalog-core.mjs';
export const entryTypeLabel=type=>({'powerDefinition':'Definição de poder','effectDefinition':'Componente de jutsu'}[type]??ITEM_PROFILES[type]?.label??ACTOR_PROFILES[type]?.label??type);
// Categorias que agrupam mais de um tipo de publicação e, por isso, entram como
// filtro de categoria visível em vez de virar um único tipo (viesaria a lista).
const ENTRY_CATEGORY_GROUPS=['standard','reaction','free','exploration','downtime','effects','features'];
export function entryFilterForCategory(category=''){
  if(!category||typeof category!=='string')return {};
  if(!CATEGORIES[category])return {};
  if(ENTRY_CATEGORY_GROUPS.includes(category))return {category};
  const type=typeForCategory(category);
  return type?{type}:{};
}
export function applyEntryTypeFilter(filters={},value=''){
  const base={...filters};
  if(typeof value!=='string'||value==='')return {...base,type:'',category:''};
  if(value.startsWith('category:')){
    const category=value.slice('category:'.length);
    return {...base,type:'',category:CATEGORIES[category]?category:''};
  }
  return {...base,type:value,category:''};
}
export function entryFilterChoices({tabId='',rows=[],type='',category=''}={}){
  const tab=CATALOG_TABS.find(t=>t.id===tabId);
  const typeIds=[...new Set([...(tab?.types??[]),...(type?[type]:[])])];
  const categoryIds=[...new Set([...(tab?.categories??[]),...(category?[category]:[])])];
  const types=typeIds
    .filter(id=>id!=='reference'||type===id||rows.some(r=>r.type===id))
    .map(id=>({value:id,name:entryTypeLabel(id),selected:type===id}));
  const categories=categoryIds
    .filter(id=>category===id||rows.some(r=>r.category===id))
    .map(id=>({value:'category:'+id,name:CATEGORIES[id]??id,selected:category===id}));
  const groups=[];
  if(types.length)groups.push({label:'Tipos',options:types});
  if(categories.length)groups.push({label:'Categorias',options:categories});
  return groups;
}
