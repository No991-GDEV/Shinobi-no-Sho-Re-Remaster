import {clientSetting} from '../data/optional-sources.mjs';
const seen=new Set();
export function vitalityChange(before,after){
 if(!Number.isSafeInteger(before)||!Number.isSafeInteger(after)||before===after)return null;
 const delta=after-before;if(!Number.isSafeInteger(delta))return null;
 return {delta,text:(delta>0?'+':'−')+Math.abs(delta),fill:delta>0?0x16883a:0xdc2525,stroke:delta>0?0xffffff:0x000000,strokeThickness:delta>0?1:2};
}
export function captureVitalityChange(actor,changes,options){
 const expanded=foundry.utils.expandObject(changes),value=expanded.system?.resources?.vitality?.value;
 const change=vitalityChange(actor.system.resources?.vitality?.value,value);
 // Replace rather than trust a caller-supplied visual delta. It never changes document data.
 delete options.snsVitalityAnimation;
 if(change)options.snsVitalityAnimation={...change,id:foundry.utils.randomID()};
}
export function animateVitality(actor,changes,options){
 const change=options.snsVitalityAnimation;if(!clientSetting('vitalityAnimation')||!change||seen.has(change.id)||!canvas.ready)return;
 seen.add(change.id);if(seen.size>500)seen.delete(seen.values().next().value);
 for(const token of actor.getActiveTokens().filter(t=>t.actor?.uuid===actor.uuid&&t.isVisible&&t.visible)){
  canvas.interface.createScrollingText({x:token.center.x,y:token.y-Math.max(30,token.h*0.4)},change.text,{duration:1600,distance:Math.max(40,token.h*0.6),fontSize:28,fontWeight:'bold',fill:change.fill,stroke:change.stroke,strokeThickness:change.strokeThickness,jitter:0}).catch(console.error);
 }
}
