import {LEGACY_UI_COPY} from '../data/ui-copy-v1.mjs';
const replacements=new Map(LEGACY_UI_COPY);
export function cleanUiText(value){
 const text=String(value??''),trimmed=text.trim(),replacement=replacements.get(trimmed);
 return replacement===undefined?text:text.replace(trimmed,replacement);
}
export function cleanRuntimeDescription(value){
 const text=String(value??''),match=/^(\s*<p>)([^<>]*)(<\/p>\s*)$/.exec(text);
 return match?match[1]+cleanUiText(match[2])+match[3]:cleanUiText(text);
}
export function decorateLegacyUiCopy(message,element){
 // Only system-owned presentation fields, never book descriptions or notes.
 const selector='.sns-chat-modifier,.sns-activation-card > p,.sns-activation-card details > p:first-of-type,.sns-craft-card > h3,.sns-craft-card > p,.sns-technique-summary';
 for(const node of element.querySelectorAll(selector)){
  if(node.children?.length)continue;
  const text=cleanUiText(node.textContent);if(text!==node.textContent)node.textContent=text;
 }
 for(const node of element.querySelectorAll('.sns-npc-material'))node.textContent=node.textContent.replace(/ · conferir estoque\.$/,'.');
}
