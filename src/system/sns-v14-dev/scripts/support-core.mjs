// Básico 4.1b pp.88,92–96,103–104; Energizar uses Guia Avançado 2026 pp.52–53.
import {unavailableFan,poisonStrengthAdjustment} from './advanced-core.mjs';
import {SUPPORT_WEAPONS} from '../data/support-weapons.mjs';
const ns='sns-v14-dev';
export const SUPPORT_IDS=['criar-arma','energizar','pele-de-pedra','afiar','lamina-de-raios','arma-eletrica'].map(id=>'sns:effect:'+id);
export const supportData=item=>item?.flags?.[ns]?.support;
export const creationData=item=>item?.flags?.[ns]?.creation;
export const supportItems=actor=>Array.from(actor?.items??[]).filter(i=>supportData(i));
export const activeSupports=actor=>supportItems(actor).filter(i=>i.system.appliedCondition?.active);
export const supportElementLabel=id=>id?String(id)[0].toUpperCase()+String(id).slice(1):'';
export const supportKind=item=>supportData(item)?.kind;
export function stoneCombo(actor){const active=activeSupports(actor),skins=active.filter(i=>supportKind(i)==='pele-de-pedra'),energy=active.filter(i=>supportKind(i)==='energizar'&&supportData(i).element==='doton'&&supportData(i).targets?.some(t=>t.fists));return !supportUnable(actor)&&skins.length&&energy.length?[...skins,...energy]:[];}
export const supportMaintenanceAction=(actor,root)=>stoneCombo(actor).includes(root)?'Livre · Soco de Pedra':'Parcial';
export const supportWeapon=id=>SUPPORT_WEAPONS[id];
export function supportProjection({actor,power,effect,choices,usedLevel,problems=[]}){
 if(['afiar','lamina-de-raios','arma-eletrica'].some(k=>effect.id==='sns:effect:'+k))return bladeProjection({actor,power,effect,choices,usedLevel,problems});
 const kind=effect.id.split(':').at(-1),element=power.system.power.definitionId.split(':').at(-1),stage=Math.max(effect.min,...choices.filter(c=>c.effectId===effect.id&&c.stage<=usedLevel).map(c=>c.stage));
 const cost=kind==='criar-arma'?1:kind==='energizar'?3:usedLevel,hardness=usedLevel+Math.ceil(actor.system.attributes.esp/2)+(element==='doton'?2:0);
 const data={action:kind==='pele-de-pedra'?'Movimento':'Parcial',range:'Pessoal',target:kind==='energizar'?'Punhos, arma empunhada ou um compartimento de projéteis':'O usuário',duration:kind==='criar-arma'?'Permanente (sólida) / Sustentada':kind==='pele-de-pedra'?'Até o fim do turno; depois Sustentada':'Sustentada',chakraCost:String(cost),damage:'Nenhum',seals:'Sem selos',test:'',defenses:kind==='pele-de-pedra'?'LM · exige ação de movimento':''};
 const summary={'criar-arma':'Cria armas ou munições com os parâmetros da versão comum. A duração depende do material.','energizar':'Energiza punhos, arma ou projéteis. Você pode usar Espírito no dano, mantendo a precisão do ataque.','pele-de-pedra':'Concede dureza corporal elevada até o fim do turno de uso; depois pode ser sustentada com dureza reduzida.'}[kind];
 return {summary,valid:!problems.length,problems,noRoll:true,cost,usedLevel,data,effect,power,traits:['arte:ninjutsu','custo:chakra',...(element==='ninpou'?[]:['elemento:'+element])],support:{kind,element,stage,usedLevel,cost,hardness,sustainedHardness:stage>=9?2:1},provenance:Object.fromEntries(Object.keys(data).map(k=>[k,'regra do efeito'])),formulas:{chakraCost:kind==='criar-arma'?'1 por criação':kind==='energizar'?'3 por arma ou compartimento':'Nível usado'}};
}
export function creationOptions(profile){return Object.entries(SUPPORT_WEAPONS).filter(([,d])=>d.creatable&&(!d.heavy||profile.stage>=6)).map(([id,d])=>({id,...d}));}
export function creationPlan(profile,{weaponId,solid,size='Médio'}={}){
 const d=creationOptions(profile).find(d=>d.id===weaponId);if(!d)throw Error('Arma ou munição não permitida por Criar Arma neste estágio.');
 if(typeof solid!=='boolean'||profile.element==='doton'&&!solid||profile.element==='suiton'&&solid)throw Error('Doton é sólido e Suiton não é sólido. Em Ninpou, informe o material.');
 const sizes=['Minúsculo','Diminuto','Miúdo','Pequeno','Médio','Grande','Enorme','Imenso','Colossal','Incrível'];
 if(!sizes.includes(size)||sizes.indexOf(size)>4&&profile.stage<6)throw Error('Criar armas acima de Médio exige a evolução6 adquirida e usada.');
 return {definition:d,quantity:d.perCompartment,solid,size,cost:1};
}
const ids=actor=>Array.from(actor?.items??[]);
export const supportUnable=actor=>ids(actor).some(i=>i.system.appliedCondition?.active&&['inconsciente','morrendo','indefeso-ou-paralisado','atordoado'].some(k=>i.system.contentId==='sns:condition:'+k));
export function creationUsable(item,key){
 if(item?.actor&&unavailableFan(item.actor,item.id))return false;
 if(item?.flags?.[ns]?.bladeHand)return !!bladeHandRoot(item.actor,item);
 const c=creationData(item);if(!c)return true;if(c.dissolved)return false;
 if(!c.solid&&(key==='cd'&&!c.ranged||!item.system.equipped||!item.actor?.items?.get(c.rootId)?.system.appliedCondition?.active))return false;
 return true;
}
export function supportHardnessRecords(actor){return supportUnable(actor)?[]:activeSupports(actor).filter(i=>supportKind(i)==='pele-de-pedra').map(i=>({rootUuid:i.uuid,sourceUuid:i.system.appliedCondition.sourceUuid,name:i.name||'Pele de Pedra',phase:supportData(i).phase,element:supportData(i).element,hardness:supportData(i).phase==='burst'?supportData(i).hardness:supportData(i).sustainedHardness}));}
export function supportHardness(actor){return Math.max(0,...supportHardnessRecords(actor).map(r=>r.hardness));}
export function compatibleLauncher(ammo,weapon){
 const a=ammo?.system.contentId,w=weapon?.system.contentId;return a==='sns:equipment:flechas-para-arcos'&&['sns:equipment:arco-curto','sns:equipment:arco-composto-longo'].includes(w)||a==='sns:equipment:virotes-para-bestas'&&['sns:equipment:besta-leve','sns:equipment:besta-pesada'].includes(w);
}
export function energyOptions(actor){
 const options=[{id:'fists',label:'Punhos',itemIds:[],fists:true}];
 for(const i of ids(actor)){
  const d=SUPPORT_WEAPONS[i.system.contentId];if(!d||i.system.quantity<=0||creationData(i)?.dissolved)continue;
  if(i.type==='ammunition'){for(const w of ids(actor).filter(w=>compatibleLauncher(i,w)&&w.system.equipped))options.push({id:i.id+'~'+w.id,label:i.name+' · '+w.name+' · '+Math.min(i.system.quantity,d.perCompartment)+' projéteis',itemIds:[i.id],launcherId:w.id,projectile:true,quantity:Math.min(i.system.quantity,d.perCompartment)});}
  else if((i.system.equipped||d.projectile)&&!d.document.system.traits.includes('arma-uso:disparo'))options.push({id:i.id,label:i.name+(d.projectile?' · lote de '+Math.min(i.system.quantity,d.perCompartment):''),itemIds:[i.id],projectile:d.projectile,quantity:Math.min(i.system.quantity,d.perCompartment)});
 }
 return options;
}
export function energyPlan(actor,selection){
 if(!Array.isArray(selection?.targets)||!selection.targets.length||new Set(selection.targets).size!==selection.targets.length)throw Error('Escolha o alvo de Energizar.');
 const list=energyOptions(actor),selected=selection.targets.map(id=>list.find(o=>o.id===id));if(selected.some(o=>!o))throw Error('Arma empunhada ou lote indisponível; armas especiais exigem permissão expressa.');
 if(selected.length>1){const ambi=ids(actor).some(i=>i.system.ruleId==='sns:apt:ambidestria'||i.system.contentId==='sns:apt:ambidestria');if(selected.length!==2||!ambi||selected.some(o=>o.fists||o.projectile||o.launcherId))throw Error('Somente Ambidestria permite duas armas empunhadas; pague3 por arma.');}
 if(selection.fistRatingAttribute!==undefined&&!['for','esp'].includes(selection.fistRatingAttribute))throw Error('Escolha Força ou Espírito original para o dano de arma do Punho de Ferro.');
 if(!['esp','original'].includes(selection.attribute))throw Error('Escolha o atributo para o dano.');
 for(const o of selected){if(activeSupports(actor).some(r=>isEnergy(r)&&supportData(r).targets.some(t=>t.id===o.id||t.launcherId&&t.launcherId===o.launcherId||t.itemIds.some(id=>o.itemIds.includes(id)))))throw Error('Este alvo já está energizado. Encerre o efeito antes de substituí-lo.');}
 if(ids(actor).some(i=>i.system.appliedCondition?.active&&/sns:(?:state|effect):(?:juuken|bisturi-de-chakra)/.test(i.system.contentId??''))||actor.system.activeAptitudes?.some(r=>r.active&&['juuken','bisturi-de-chakra'].includes(r.rule)))throw Error('Energizar não se acumula com Juuken ou Bisturi de Chakra.');
 return {targets:selected.map(o=>({...o,remaining:o.quantity??0,launched:[]})),attribute:selection.attribute,fistRatingAttribute:selection.fistRatingAttribute??(selection.attribute==='esp'?'esp':'for'),cost:selected.length*3};
}
export function energyFor(actor,item,key){
 if(supportUnable(actor))return null;
 for(const root of activeSupports(actor).filter(isEnergy)){const meta=supportData(root);for(const target of meta.targets){
  const physical=target.itemIds.map(id=>ids(actor).find(i=>i.id===id)),direct=target.fists?item?.flags?.[ns]?.supportFists===true:target.launcherId?key==='cd'&&item.id===target.launcherId:target.itemIds.includes(item?.id);
  if(!direct||physical.some(i=>!i||creationData(i)?.dissolved)||!target.fists&&!target.projectile&&!target.launcherId&&physical.some(i=>!i.system.equipped)||target.projectile&&Math.min(target.remaining,physical[0]?.system.quantity??0)<(target.shurikenCount??1))continue;
  return {root,meta,target};
 }}return null;
}
export function supportDamage(actor,item,key,ordinaryAttribute,ordinaryValue,weaponDamage){
 const energy=energyFor(actor,item,key),fists=item?.flags?.[ns]?.supportFists===true;if(fists&&!energy)return null;
 const attr=energy?.meta.attribute==='esp'?'esp':ordinaryAttribute,value=attr==='esp'?actor.system.attributes.esp:Math.max(0,ordinaryValue+(attr==='for'?poisonStrengthAdjustment(actor):0));
 let rating=weaponDamage,nature='lethal',unblockable=false;
 if(fists){const stone=energy.meta.element==='doton'&&activeSupports(actor).find(r=>supportKind(r)==='pele-de-pedra');rating=0;nature='nonlethal';if(ids(actor).some(i=>(i.system.ruleId==='sns:apt:punho-de-ferro'||i.system.contentId==='sns:apt:punho-de-ferro')&&actor.system.attributes?.for>=2)){const original=actor.system.attributes?.[energy.meta.fistRatingAttribute??attr];rating=original>=12?4:original>=10?3:original>=8?2:1;nature='lethal';}if(stone){rating=4;nature='lethal';unblockable=supportData(stone).stage>=9;}}
 if(energy?.meta.element==='fuuton'&&item?.system.contentId==='sns:equipment:leque-gigante')rating=4;
 return {attribute:attr,value,weaponDamage:rating,nature,unblockable,...(energy?{energy:{rootUuid:energy.root.uuid,targetId:energy.target.id,projectile:!!energy.target.projectile&&key==='cd',attribute:attr,element:energy.meta.element}}:{})};
}
export const mayEditSupport=(before,after,isGM)=>isGM||['support','creation','supportFists','bladeHand','brokenWeapons'].every(k=>JSON.stringify(before?.flags?.[ns]?.[k])===JSON.stringify(after?.flags?.[ns]?.[k]))&&(!supportData(before)||JSON.stringify(before.system)===JSON.stringify(after.system));
export const mayEditSupportActor=(before,after,isGM)=>isGM||['supportActivations','supportCreationChain'].every(k=>JSON.stringify(before?.flags?.[ns]?.[k])===JSON.stringify(after?.flags?.[ns]?.[k]));
export const supportNeedsMaintenance=(meta,event)=>![meta.activationTurn,meta.maintainedTurn].some(turn=>turn?.combatId===event.combatId&&turn.combatantId===event.combatantId&&turn.round===event.round);
export function supportSummary(item,actor){
 const m=supportData(item);if(!m)return '';
 if(m.kind==='pele-de-pedra')return 'Dureza '+(m.phase==='burst'?m.hardness:m.sustainedHardness)+(m.phase==='burst'?' até o fim do turno':' · sustentada')+' · prevalece a maior dureza'+(stoneCombo(actor).some(i=>supportData(i).activationUuid===m.activationUuid)?' · Soco de Pedra: sustentar como ação livre':'');
 if(m.kind==='lamina-de-raios')return (m.spent?'Ataque realizado · abate de capanga pendente':'Preparada · um ataque CC')+' · DB '+m.damage+' · '+(m.stage>=7?'dureza conforme elemento':'ignora1 de dureza')+(m.charge?' · Investida +'+(m.usedLevel-3)+' DB':'');
 if(m.kind==='afiar')return m.targets.map(t=>t.label).join(' · ')+' · crítico melhorado · ignora1 de dureza · ESP × Prontidão antes da defesa';
 if(m.kind==='arma-eletrica'&&m.createdId)return (m.mode==='projectiles'?'Projéteis elétricos · '+m.quantity+' criados':'Lâmina elétrica · alcance até5m, CC/CD')+' · '+(m.stage>=8?'destruição de armas comuns':'sustentada');
 if(m.kind==='criar-arma')return 'Criação não sólida · desfaz-se ao deixar a mão · '+m.element;
 return m.targets.map(t=>t.label+(t.projectile?' · '+Math.min(t.remaining,actor.items.get(t.itemIds[0])?.system.quantity??0)+' guardados / '+t.launched.filter(l=>!l.expired).reduce((n,l)=>n+l.quantity,0)+' lançados':'')).join(' · ')+' · dano com '+(m.attribute==='esp'?'ESP':'atributo normal')+' · '+supportElementLabel(m.element);
}

// A defensive skin is mitigation, not an evasive defense. LM grants it only if executed in time.
export function skinDefenseResolution({hit,rolled=false,attackFailed=false,visualMiss=false}){if(hit==='pending')return {pending:true,grant:false,hit};return {pending:false,grant:rolled&&hit==='miss'&&!attackFailed&&!visualMiss,hit:attackFailed||visualMiss?'miss':'hit'};}

// Básico106,109–110. No name-based eligibility or permanent attribute mutation.
export const isEnergy=root=>['energizar','afiar'].includes(supportKind(root))||supportKind(root)==='arma-eletrica'&&supportData(root).mode!=='projectiles';
export function bladeProjection({actor,power,effect,choices,usedLevel,problems=[]}){
 const kind=effect.id.split(':').at(-1),element=power.system.power.definitionId.split(':').at(-1),stage=Math.max(effect.min,...choices.filter(c=>c.effectId===effect.id&&c.stage<=usedLevel).map(c=>c.stage)),has=id=>choices.some(c=>c.effectId==='sns:effect:'+id&&c.stage<=usedLevel);
 if(kind==='afiar'&&!has('energizar'))problems.push('Afiar exige Energizar adquirido neste poder e disponível no nível usado.');
 if(kind==='lamina-de-raios'&&actor.system.attributes.esp<8)problems.push('Lâmina de Raios exige Espírito8.');
 if(kind==='arma-eletrica'&&(!has('lamina-de-raios')||actor.system.attributes.esp<8))problems.push('Arma Elétrica exige Lâmina de Raios e Espírito8.');
 const cost=kind==='arma-eletrica'?0:usedLevel,damage=usedLevel+Math.ceil(actor.system.attributes.esp/2)+1,action=kind==='lamina-de-raios'&&stage<5?'Movimento':'Parcial';
 const summary={'afiar':'Aumenta o fio de uma arma real: crítico melhorado, ignora1 de dureza e testa Espírito contra Prontidão antes da defesa.','lamina-de-raios':'Prepara uma descarga para um ataque de toque com CC. O ataque consome a preparação mesmo se errar.','arma-eletrica':'Escolha entre energizar uma arma de corte/perfuração, criar projéteis ou criar uma lâmina extensível.'}[kind];
 const data={action,range:kind==='lamina-de-raios'?'Toque':'Pessoal',target:kind==='afiar'?'Arma real de corte ou perfuração':'O usuário',duration:kind==='lamina-de-raios'?'Sustentada · um ataque':'Sustentada',chakraCost:kind==='arma-eletrica'?'1 / 3 / 4':String(cost),damage:'Nenhum',seals:'Sem selos',test:'',defenses:''};
 return {summary,valid:!problems.length,problems,noRoll:true,cost,usedLevel,data,effect,power,traits:['arte:ninjutsu','custo:chakra','elemento:'+element],support:{kind,element,stage,usedLevel,cost,damage,action},provenance:Object.fromEntries(Object.keys(data).map(k=>[k,'regra do efeito'])),formulas:{chakraCost:kind==='arma-eletrica'?'Conforme modo escolhido':'Nível usado'}};
}
const cutting=id=>SUPPORT_WEAPONS[id]?.document.system.traits.some(t=>['dano-tipo:corte','dano-tipo:perfuracao'].includes(t));
export function bladeEnergyOptions(actor,kind){return energyOptions(actor).filter(o=>!o.fists&&o.itemIds.every(id=>{const item=ids(actor).find(i=>i.id===id);return (cutting(item?.system.contentId)||kind==='afiar'&&item?.system.contentId==='sns:equipment:leque-gigante')&&(kind!=='afiar'||!creationData(item));}));}
export function electricCreationOptions(mode){return Object.entries(SUPPORT_WEAPONS).filter(([,d])=>mode==='projectiles'?d.projectile&&d.document.system.traits.includes('arma-grupo:simples'):['sns:equipment:espada-curta','sns:equipment:wakizashi'].includes(d.document.system.contentId)).map(([id,d])=>({id,...d}));}
export function bladePlan(actor,profile,selection={}){
 if(profile.kind==='lamina-de-raios'){
  if(activeSupports(actor).some(r=>supportKind(r)==='lamina-de-raios'))throw Error('Encerre a Lâmina de Raios anterior antes de preparar outra.');
  if(selection.charge&&profile.stage<5)throw Error('Investida exige evolução5 adquirida e usada.');
  return {charge:selection.charge===true,spent:false,cost:profile.cost};
 }
 const mode=profile.kind==='afiar'?'energize':selection.mode;
 if(mode==='energize'){
  if(!Array.isArray(selection.targets)||selection.targets.length!==1||!bladeEnergyOptions(actor,profile.kind).some(o=>o.id===selection.targets[0]))throw Error('Escolha uma única arma de corte/perfuração permitida; Afiar exige arma real.');
  const plan=energyPlan(actor,selection),target=plan.targets[0],item=ids(actor).find(i=>i.id===target.itemIds[0]);
  if(profile.kind==='afiar'&&item?.system.contentId==='sns:equipment:shuriken'){
   if(![1,3].includes(selection.shurikenCount??1))throw Error('Selecione uma shuriken ou o ataque conjunto de três.');
   target.shurikenCount=selection.shurikenCount??1;target.remaining=Math.min(item.system.quantity,3);target.quantity=target.remaining;target.label=item.name+' · até3 shurikens';
   if(target.remaining<target.shurikenCount)throw Error('Shurikens insuficientes para este ataque.');
  }
  if(profile.kind==='afiar'&&target.projectile&&item.system.contentId!=='sns:equipment:shuriken'){target.remaining=1;target.quantity=1;target.label=item.name+' · uma arma';}
  return {...plan,mode,cost:profile.kind==='afiar'?profile.cost:3};
 }
 if(profile.kind!=='arma-eletrica'||!['projectiles','blade'].includes(mode))throw Error('Selecione um modo de Arma Elétrica.');
 const definition=electricCreationOptions(mode).find(d=>d.id===selection.weaponId);if(!definition)throw Error('Criação elétrica não permitida neste modo.');
 return {mode,definition,quantity:definition.perCompartment,solid:false,size:'Médio',cost:mode==='blade'?4:1,attribute:'esp',targets:[]};
}
export function bladeHandRoot(actor,item){const id=item?.flags?.[ns]?.bladeHand;if(!id||supportUnable(actor))return null;return activeSupports(actor).find(r=>supportKind(r)==='lamina-de-raios'&&r.id===id&&!supportData(r).spent);}
export const lightningMastery=actor=>ids(actor).some(i=>(i.system.ruleId||i.system.contentId)==='sns:apt:dominio-do-raio')&&ids(actor).some(i=>i.type==='power'&&i.system.power?.definitionId==='sns:power:raiton'&&i.system.level>=5);
export function bladeHandDamage(actor,item,key){const root=bladeHandRoot(actor,item);if(!root||key!=='cc')return null;const m=supportData(root);return {base:m.damage+(m.charge?m.usedLevel-3:0),fixed:0,nature:'lethal',criticalAt:15-(m.stage>=9?1:0)-(lightningMastery(actor)?1:0),attackKind:'melee',weaponClass:'Desarmado',ignoreHardness:m.stage>=7?0:1,hardnessPolicy:m.stage>=7?'lightning':'',formula:'Nível usado + ⌈ESP/2⌉ + 1'+(m.charge?' + Investida':''),source:'Básico109–110 · Lâmina de Raios',blade:{kind:m.kind,rootUuid:root.uuid,stage:m.stage,charge:m.charge},attackerSize:actor.system.identity?.size||actor.system.details?.size||''};}
export function bladeWeaponBonuses(actor,item,key,criticalAt=15){const e=energyFor(actor,item,key);if(!e){const c=creationData(item),r=c?.electric&&ids(actor).find(i=>i.id===c.rootId),m=supportData(r);return r?.system.appliedCondition?.active&&m?.mode==='projectiles'?{...(lightningMastery(actor)?{criticalAt:Math.max(4,criticalAt-1)}:{}),blade:{kind:'arma-eletrica',rootUuid:r.uuid,stage:m.stage,mode:m.mode,projectileCount:1}}:{};}const m=e.meta,kind=m.kind,afiar=kind==='afiar',electric=kind==='arma-eletrica';return {ignoreHardness:afiar||electric&&m.mode==='blade'?1:0,...(m.element==='raiton'&&lightningMastery(actor)?{criticalAt:Math.max(4,criticalAt-1)}:{}),...(afiar?{criticalAt:item.system.contentId==='sns:equipment:fuuma-shuriken-kage-fusha'?criticalAt:Math.max(4,criticalAt-1),edgeContest:true}:{}),...(afiar&&e.target.shurikenCount===3?{base:m.usedLevel+Math.ceil(actor.system.attributes.esp/2)+2,formula:'Nível usado + ⌈ESP/2⌉ + 2 · três shurikens'}:{}),blade:{kind,rootUuid:e.root.uuid,stage:m.stage,mode:m.mode??'',projectileCount:e.target.shurikenCount??1}};}
// A common weapon is a canonical mundane weapon; unknown specials are never destroyed by inference.
export function bladeBreaks(blade,weapon,defender){
 if(!blade||!SUPPORT_WEAPONS[weapon?.system.contentId]||creationData(weapon))return false;
 if(!['afiar','lamina-de-raios','arma-eletrica'].includes(blade.kind)||blade.kind==='arma-eletrica'&&blade.stage<8)return false;
 const energy=energyFor(defender,weapon,'cc');if(!energy)return true;
 return blade.kind==='lamina-de-raios'?!['fuuton','raiton'].includes(energy.meta.element):energy.meta.element===(blade.kind==='afiar'?'raiton':'doton');
}
