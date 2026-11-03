import {SKILLS} from './rules.mjs';
import {escapeHtml} from './kernel.mjs';
const stats={cc:'CC original',cd:'CD original',esq:'Esquiva original',lm:'Ler Movimento original',initiative:'Iniciativa original'};
export function validatePrerequisiteData(values){
 const data={statsOriginal:{},skillLevels:{}};
 for(const [group,keys] of [['statsOriginal',Object.keys(stats)],['skillLevels',SKILLS.map(s=>s.key)]])for(const key of keys){
  const raw=values[group]?.[key],n=raw===''||raw===undefined||raw===null?null:Number(raw);
  if(n!==null&&(!Number.isInteger(n)||n<0))throw Error('Informe níveis e valores originais inteiros, sem bônus, ou deixe em branco.');
  data[group][key]=n;
 }
 return data;
}
export async function editPrerequisiteData(actor){
 if(!game.user.isGM||!actor.isOwner||!['npc','companion'].includes(actor.type))return;
 const current=()=>JSON.stringify({statsOriginal:actor.system.statsOriginal,skillLevels:actor.system.skillLevels,capanga:actor.getFlag('sns-v14-dev','magenCapanga')===true}),baseline=current();
 const fields=(group,rows)=>'<div class="field-grid">'+rows.map(([key,label])=>'<label>'+escapeHtml(label)+'<input type="number" min="0" step="1" name="'+group+'.'+key+'" value="'+(actor.system[group]?.[key]??'')+'" placeholder="Não informado"></label>').join('')+'</div>';
 const values=await foundry.applications.api.DialogV2.prompt({classes:['sns-editor-dialog'],position:{width:600},window:{title:'Requisitos · '+actor.name},content:'<p>Registre os valores originais, sem bônus de precisão. As rolagens continuam usando os valores da ficha. Deixe em branco o que não souber; o sistema não deduz níveis a partir das precisões.</p><label><input type="checkbox" name="magenCapanga" '+(actor.getFlag('sns-v14-dev','magenCapanga')===true?'checked':'')+'> Capanga · +3 na dificuldade de resistência a Magen</label><h3>Combate e iniciativa</h3>'+fields('statsOriginal',Object.entries(stats))+'<h3>Níveis de perícia</h3>'+fields('skillLevels',SKILLS.map(s=>[s.key,s.name])),ok:{label:'Salvar valores originais',callback:(e,b)=>{
  const result={statsOriginal:{},skillLevels:{}};
  for(const input of b.form.querySelectorAll('input[type="number"][name]')){const [group,key]=input.name.split('.');result[group][key]=input.value;}result.capanga=b.form.elements.magenCapanga.checked;
  return result;
 }}});
 if(!values||!game.user.isGM||!actor.isOwner)return;
 try{
  if(current()!==baseline)throw Error('Os valores mudaram. Reabra o editor.');
  const data=validatePrerequisiteData(values);
  await actor.update({'system.statsOriginal':data.statsOriginal,'system.skillLevels':data.skillLevels,'flags.sns-v14-dev.magenCapanga':values.capanga});
 }catch(error){ui.notifications.warn(error.message);}
}
