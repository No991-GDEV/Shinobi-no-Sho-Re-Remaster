import {escapeHtml as esc} from './kernel.mjs';
const key=uuid=>uuid.replaceAll('.','~');
const validateProfile=p=>{if(!Number.isInteger(p.count)||p.count<1||!Number.isInteger(p.baseEach)||p.baseEach<1||!Number.isFinite(p.bonus))throw Error('Perfil de projéteis inválido.');};
export function validateProjectileAllocation(profile,targets,allocation){
 const p=profile.projectiles;if(!p)return;
 validateProfile(p);
 if(!targets.length||targets.length>p.count)throw Error('Marque de 1 a '+p.count+' alvos para distribuir os projéteis.');
 const keys=targets.map(t=>key(t.uuid));if(!allocation||Object.keys(allocation).some(k=>!keys.includes(k)))throw Error('Distribuição de projéteis não corresponde aos alvos.');
 let total=0;for(const k of keys){const n=allocation[k];if(!Number.isInteger(n)||n<1)throw Error('Cada alvo marcado precisa receber ao menos 1 projétil.');total+=n;}
 if(total>p.count)throw Error('Distribua no máximo '+p.count+' projéteis.');
 return {total,unused:p.count-total};
}
export function projectileBase(profile,targets,uuid){
 validateProjectileAllocation(profile,targets,profile.projectileAllocation);
 return profile.projectileAllocation[key(uuid)]*profile.projectiles.baseEach+profile.projectiles.bonus;
}
export async function prepareProjectilePacket(packet){
 if(!packet?.profile.projectiles)return true;
 const p=packet.profile.projectiles,targets=packet.targets;validateProfile(p);if(!targets.length)return true;if(targets.length>p.count)throw Error('Marque de 1 a '+p.count+' alvos para distribuir os projéteis. Nenhum ataque foi rolado.');
 let allocation;
 if(targets.length===1)allocation={[key(targets[0].uuid)]:p.count};
 else{
  allocation=await foundry.applications.api.DialogV2.prompt({classes:['sns-editor-dialog'],window:{title:'Distribuir projéteis · '+packet.name},position:{width:440},content:'<p>'+p.count+' projéteis · DB '+p.baseEach+' cada · bônus '+p.bonus+' uma única vez por alvo. Cada alvo faz uma defesa.</p>'+targets.map((t,i)=>'<label>'+esc(t.name)+'<input name="target'+i+'" type="number" min="1" max="'+p.count+'" step="1" value="'+(i===0?p.count-targets.length+1:1)+'"></label>').join(''),ok:{label:'Distribuir',callback:(e,b)=>{const a=Object.fromEntries(targets.map((t,i)=>[key(t.uuid),Number(b.form.elements['target'+i].value)]));validateProjectileAllocation(packet.profile,targets,a);return a;}}});
  if(!allocation)return false;
 }
 validateProjectileAllocation(packet.profile,targets,allocation);packet.profile.projectileAllocation=allocation;return true;
}
