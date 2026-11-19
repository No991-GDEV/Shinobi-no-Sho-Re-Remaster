import {ITEM_ART} from '../data/icon-art.mjs';
// Generic Foundry markers can receive reviewed artwork. Any chosen/custom picture wins.
export const isPlaceholderArt=value=>!value||typeof value==='string'&&value.startsWith('icons/svg/');
export function assignedItemArt(item){
 const s=item?.system??{},flags=item?.flags?.['sns-v14-dev']??{};
 const ids=[s.contentId,s.ruleId,s.power?.definitionId,s.jutsu?.effectId,...[flags.environment?.kind,flags.support?.kind,flags.advancedState?.kind].filter(Boolean).map(k=>'sns:effect:'+k)];
 return ids.map(id=>ITEM_ART[id]).find(Boolean)??'';
}
export function itemArt(item){return isPlaceholderArt(item?.img)?assignedItemArt(item)||item?.img||'icons/svg/item-bag.svg':item.img;}
export const EXTRA_DISPLAY_ART=Object.freeze({
 'sns:equipment:colete-ninja':'systems/sns-v14-dev/assets/library/pf2e/icons/spells/stone-skin.webp',
 'sns:equipment:colete-ninja-resistente':'systems/sns-v14-dev/assets/library/pf2e/icons/spells/stone-skin.webp',
 'sns:equipment:armadura-de-batalha':'systems/sns-v14-dev/assets/library/pf2e/icons/spells/wall-of-force.webp',
 'sns:equipment:manopla':'systems/sns-v14-dev/assets/library/pf2e/icons/equipment/weapons/knuckle-duster.webp',
 'sns:equipment:bomba-fumaca':'systems/sns-v14-dev/assets/library/pf2e/icons/spells/solid-fog.webp',
 'sns:equipment:tarja-explosiva':'systems/sns-v14-dev/assets/library/pf2e/icons/spells/fireball.webp',
 'sns:equipment:tarja-especial-selos':'systems/sns-v14-dev/assets/library/pf2e/icons/equipment/held-items/summoning-handscroll.webp',
 'sns:equipment:bomba-luminosa':'systems/sns-v14-dev/assets/library/pf2e/icons/spells/blindness.webp',
 'sns:equipment:bomba-de-marcacao':'systems/sns-v14-dev/assets/library/pf2e/icons/spells/magic-missile.webp',
 'sns:equipment:bomba-som-de-trovao':'systems/sns-v14-dev/assets/library/pf2e/icons/spells/shocking-grasp.webp',
 'sns:equipment:dispositivo-bombas':'systems/sns-v14-dev/assets/library/pf2e/icons/spells/fireball.webp',
 'sns:jutsu:kawarimi-no-jutsu':'systems/sns-v14-dev/assets/library/pf2e/icons/spells/mirror-image.webp',
 'sns:jutsu:kinobori':'systems/sns-v14-dev/assets/library/pf2e/icons/spells/passwall.webp',
 'sns:jutsu:shunshin-no-jutsu':'systems/sns-v14-dev/assets/library/pf2e/icons/spells/gust-of-wind.webp',
 'sns:jutsu:shunshin-combate':'systems/sns-v14-dev/assets/library/pf2e/icons/spells/gust-of-wind.webp',
 'sns:jutsu:tadayou':'systems/sns-v14-dev/assets/library/pf2e/icons/spells/hydraulic-push.webp',
 'sns:power:kuchiyose':'systems/sns-v14-dev/assets/library/pf2e/icons/equipment/held-items/summoning-handscroll.webp',
 'sns:power:versatilidade':'systems/sns-v14-dev/assets/library/pf2e/icons/equipment/consumables/other-consumables/spell-scroll.webp',
 'sns:power:genjutsu':'systems/sns-v14-dev/assets/library/pf2e/icons/spells/mirror-image.webp',
 'sns:effect:genjutsu-miragem':'systems/sns-v14-dev/assets/library/pf2e/icons/spells/mirror-image.webp',
 'sns:effect:genjutsu-fascinar':'systems/sns-v14-dev/assets/library/pf2e/icons/spells/illusory-disguise.webp'
});
export function displayItemArt(item){
 const base=itemArt(item);
 if(isPlaceholderArt(base)){
  const s=item?.system??{},ids=[s.contentId,s.ruleId,s.power?.definitionId,s.jutsu?.effectId];
  const extra=ids.map(id=>EXTRA_DISPLAY_ART[id]).find(Boolean);
  if(extra)return extra;
  if(base==='icons/svg/shield.svg'||(/colete ninja/i.test(String(item?.name??''))&&base==='icons/svg/shield.svg'))return 'systems/sns-v14-dev/assets/library/pf2e/icons/spells/stone-skin.webp';
 }
 return base;
}
export async function openDocumentImagePicker(sheet,doc){
 if(!sheet?.isEditable||!doc)return;
 const Base=foundry.applications?.apps?.FilePicker;
 const Picker=Base?.implementation??globalThis.CONFIG?.ux?.FilePicker??globalThis.FilePicker??Base;
 if(!Picker)return;
 const current=doc.img||'';
 const defaultImg=doc.constructor?.getDefaultArtwork?.(doc._source??doc)?.img??'';
 const redirectToRoot=[...new Set([defaultImg,...(current.startsWith('icons/')||current.startsWith('systems/')||current.startsWith('modules/')?[current]:[])].filter(Boolean))];
 const fp=new Picker({
  type:'image',
  current,
  redirectToRoot,
  document:doc,
  position:sheet.position?{top:(sheet.position.top??0)+40,left:(sheet.position.left??0)+10}:undefined,
  callback:async path=>{if(sheet.isEditable&&path)await doc.update({img:path});}
 });
 if(typeof fp.browse==='function')return fp.browse();
 return fp.render({force:true});
}
