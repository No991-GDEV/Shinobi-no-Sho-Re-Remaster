import {assertCastActive} from './cast-undo-core.mjs';
import {regionShape} from './area-core.mjs';
import {escapeHtml as esc} from './kernel.mjs';
const ns='sns-v14-dev';let placing=false;
export function areaAvailable(message){const npc=message.getFlag(ns,'npcJutsuCast'),env=message.getFlag(ns,'environmentUse'),support=message.getFlag(ns,'supportUse');return (!npc||npc.status!=='pending')&&(!env||env.status==='active')&&(!support||support.status==='active');}
export async function placeArea(message,choiceId='0',index=0){
 assertCastActive(message);
 if(placing)throw Error('Conclua ou cancele a área que está sendo posicionada.');
 const area=message.getFlag(ns,'areaUse'),actor=await fromUuid(area?.actorUuid),source=area?.choices?.find(c=>c.id===choiceId);
 if(!actor||!(actor.isOwner||game.user.isGM)||!areaAvailable(message)||!source)throw Error('Área indisponível para este uso.');
 if(!Number.isInteger(index)||index<0||index>=(source.count??1))throw Error('Parte da área inválida.');
 if(!canvas?.ready)throw Error('Abra uma cena antes de posicionar a área.');
 let choice={...source};
 if(choice.missing?.length){
  const fields=(choice.missing.includes('shape')?'<label>Formato<select name="shape" required><option value="">Escolher conforme a regra</option><option value="circle">Círculo / esfera</option><option value="cone">Cone</option><option value="line">Linha / onda</option><option value="rectangle">Retângulo</option></select></label>':'')+['length','width','diameter'].map(k=>'<label>'+({length:'Comprimento (m)',width:'Largura (m)',diameter:'Diâmetro (m)'}[k])+'<input name="'+k+'" type="number" min="0.01" step="any" value="'+(choice[k]??'')+'"></label>').join('');
  const custom=await foundry.applications.api.DialogV2.prompt({classes:['sns-editor-dialog'],window:{title:area.name+' · medidas da área'},content:'<p>'+esc(area.rule??choice.note??'Confira a descrição da técnica.')+'</p>'+fields,ok:{label:'Posicionar',callback:(e,b)=>{const f=b.form.elements;return {shape:f.shape?.value||choice.shape,...Object.fromEntries(['length','width','diameter'].filter(k=>f[k].value).map(k=>[k,Number(f[k].value)]))};}}});
  if(!custom)return null;choice={...choice,...custom};
 }
 const units=canvas.scene.grid.units,pixelsPerUnit=canvas.scene.grid.size/canvas.scene.grid.distance;
 // Region shapes are native in v14. Flat cone curvature is per template, so
 // the SNS width does not depend on a global round/flat preference.
 const make=(x,y,direction)=>regionShape(choice,{units,pixelsPerUnit,x,y,direction});make(0,0,0);
 const prior=canvas.activeLayer;
 const regionData={name:area.name+' · '+choice.label+((source.count??1)>1?' '+(index+1)+'/'+source.count:''),color:game.user.color?.css??String(game.user.color??'#a93c22'),shapes:[make(0,0,0)],visibility:CONST.REGION_VISIBILITY?.ALWAYS??0,highlightMode:'coverage',displayMeasurements:true,ownership:{default:0,[game.user.id]:3},flags:{[ns]:{areaTemplate:{messageUuid:message.uuid,choiceId,index,usedLevel:area.usedLevel,dimensions:choice}}}};
 const doc=new CONFIG.Region.documentClass(regionData,{parent:canvas.scene}),preview=new CONFIG.Region.objectClass(doc);placing=true;
 try{await preview.draw();canvas.regions.activate();canvas.regions.preview.addChild(preview);}catch(error){placing=false;preview.destroy({children:true});prior?.activate();throw error;}
 return new Promise((resolve,reject)=>{
  let x=0,y=0,direction=0,finished=false;
  const refresh=()=>{doc.updateSource({shapes:[make(x,y,direction)]});preview.renderFlags.set({refreshShapes:true});};
  const cleanup=()=>{finished=true;canvas.stage.off('pointermove',move);canvas.stage.off('pointerdowncapture',down);window.removeEventListener('keydown',key,true);preview.destroy({children:true});placing=false;prior?.activate();};
  const move=e=>{const p=e.getLocalPosition(canvas.stage);x=p.x;y=p.y;refresh();};
  const key=e=>{if(['Escape','r','R'].includes(e.key)){e.preventDefault?.();e.stopImmediatePropagation?.();}if(e.key==='Escape'){cleanup();resolve(null);}else if(e.key==='r'||e.key==='R'){direction=(direction+(e.shiftKey?-15:15)+360)%360;refresh();}};
  const down=async e=>{if(finished)return;e.stopPropagation();if(e.button===2){cleanup();return resolve(null);}if(e.button!==0)return;if(e.getLocalPosition){const p=e.getLocalPosition(canvas.stage);x=p.x;y=p.y;refresh();}const data=doc.toObject();cleanup();try{
   assertCastActive(message);const old=Array.from(canvas.scene.regions??[]).find(r=>{const f=r.getFlag(ns,'areaTemplate');return f?.messageUuid===message.uuid&&f.choiceId===choiceId&&f.index===index;});
   if(old){if(!old.isOwner&&!game.user.isGM)throw Error('Você não controla a área já posicionada.');resolve(await old.update({shapes:data.shapes}));}
   else resolve((await canvas.scene.createEmbeddedDocuments('Region',[data]))[0]);
  }catch(error){reject(error);}};
  canvas.stage.on('pointermove',move);canvas.stage.on('pointerdowncapture',down);window.addEventListener('keydown',key,true);ui.notifications.info('Clique para posicionar '+choice.label+'. R: girar · Esc: cancelar.');
 });
}
export async function decorateAreaMessage(message,element){
 const area=message.getFlag(ns,'areaUse');if(!area||!areaAvailable(message)||element.querySelector('[data-sns-area]'))return;
 const actor=await fromUuid(area.actorUuid);if(!actor||!(actor.isOwner||game.user.isGM))return;
 const box=document.createElement('section');box.className='sns-npc-jutsu-controls sns-area-controls';box.dataset.snsArea='';
 for(const c of area.choices){
  const facts=document.createElement('small');facts.textContent=c.label+' · '+(c.missing?.length?'completar medidas ao posicionar':c.shape==='circle'?c.diameter+' m de diâmetro':c.length+' × '+c.width+' m')+(c.height?' · altura '+c.height+' m':'');box.append(facts);
  for(let index=0;index<(c.count??1);index++){
  const b=document.createElement('button');b.type='button';b.textContent='Posicionar '+(area.choices.length===1&&(c.count??1)===1?'área':c.label+((c.count??1)>1?' '+(index+1)+'/'+c.count:''));
  b.title=[c.shape==='circle'?c.diameter+' m de diâmetro':c.length+' × '+c.width+' m',c.height?c.height+' m de altura':'',c.note??'','Clique para posicionar ou mover.'].filter(Boolean).join(' · ');
  b.addEventListener('click',async()=>{b.disabled=true;try{await placeArea(message,c.id,index);}catch(error){ui.notifications.warn(error.message);}finally{b.disabled=false;}});box.append(b);
  }
 }
 if(!element.querySelector('[data-sns-area]'))(element.querySelector('.message-content')??element).append(box);
}
