import {ITEM_ART} from '../data/icon-art.mjs';
// Generic Foundry markers can receive reviewed artwork. Any chosen/custom picture wins.
export const isPlaceholderArt=value=>!value||typeof value==='string'&&value.startsWith('icons/svg/');
export function assignedItemArt(item){
 const s=item?.system??{},flags=item?.flags?.['sns-v14-dev']??{};
 const ids=[s.contentId,s.ruleId,s.power?.definitionId,s.jutsu?.effectId,...[flags.environment?.kind,flags.support?.kind,flags.advancedState?.kind].filter(Boolean).map(k=>'sns:effect:'+k)];
 return ids.map(id=>ITEM_ART[id]).find(Boolean)??'';
}
export function itemArt(item){return isPlaceholderArt(item?.img)?assignedItemArt(item)||item?.img||'icons/svg/item-bag.svg':item.img;}
