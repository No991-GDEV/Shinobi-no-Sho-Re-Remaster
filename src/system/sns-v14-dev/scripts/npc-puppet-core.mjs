import {PUPPET_DEVICES} from '../data/npc-puppet-devices.mjs';
import {canonicalCopy} from './canonical-content.mjs';
import {WEAPON_DAMAGE_PROFILES} from '../data/damage-profiles.mjs';
const ns='sns-v14-dev',has=(actor,id)=>Array.from(actor.items??[]).some(i=>(i.system.ruleId||i.system.contentId)===id);
export function puppetControl(actor){
 if(!has(actor,'sns:apt:kugutsu'))throw Error('A construção exige Kugutsu.');
 const m=actor.system.skillLevels?.mecanismos??0,p=actor.system.skillLevels?.prestidigitacao??0,k=has(actor,'sns:apt:kurohigi')?(m>=12&&p>=14?4:m>=12&&p>=12?3:p>=10?2:m>=6&&p>=6?1:0):0;
 return {mechanisms:m,prest:p,stage:k,count:k||1,actions:k===4?3:k>=2?2:1,weaponBonus:Math.max(0,k-1),sizes:k>=3?['Pequeno','Médio','Grande']:k>=1?['Pequeno','Médio']:['Pequeno']};
}
export function fitPuppetSlots(base,need){
 const queue=[base],seen=new Set();while(queue.length){const state=queue.shift(),key=state.join(',');if(seen.has(key))continue;seen.add(key);if(state.every((n,i)=>n>=need[i]))return true;
  const [l,p,g]=state;if(g){queue.push([l+1,p,g-1],[l,p+1,g-1]);}if(p)queue.push([l+1,p-1,g]);if(p>=3)queue.push([l,p-3,g+1]);
 }return false;
}
export function puppetConstruction(actor,draft){
 const control=puppetControl(actor),size=draft.puppetSize==='auto'?control.sizes.at(-1):draft.puppetSize,count=draft.puppetCount??1;
 if(!control.sizes.includes(size))throw Error('Este tamanho exige um estágio superior de Kurohigi.');
 if(!Number.isInteger(count)||count<1||count>control.count||size==='Grande'&&count>1)throw Error(size==='Grande'?'Somente uma marionete Grande pode ser controlada.':'Quantidade acima do controle de Kurohigi.');
 let devices=draft.puppetDevices??[];
 if(draft.puppetPreset!=='custom')devices=draft.puppetPreset==='defense'?[{slug:'escudo-de-chakra',slot:'p'},{slug:'projeteis',slot:'l'}]:draft.puppetPreset==='capture'&&control.mechanisms>=10?[{slug:'bau',slot:'g'},{slug:'facas-ocultas',slot:'p'}]:[{slug:'projeteis',slot:'l'},{slug:'facas-ocultas',slot:'p'},{slug:'armadura',slot:'g'}];
 if(devices.some(d=>PUPPET_DEVICES[d.slug]?.armed)&&devices.length!==1)throw Error('Marionete Armada substitui todos os encaixes de dispositivos.');
 const need=[0,0,0],seen=new Set();for(const d of devices){const def=PUPPET_DEVICES[d.slug];if(!def)throw Error('Dispositivo desconhecido.');if(def.armed)continue;if(!def.slots.includes(d.slot))throw Error('Encaixe incompatível com o dispositivo.');if((def.minimum??0)>control.mechanisms)throw Error('O dispositivo exige Mecanismos '+def.minimum+'.');if(def.large&&size!=='Grande')throw Error('Parede exige marionete Grande.');if(def.pair&&count<2)throw Error('Kousen Dupla exige duas marionetes equipadas com o dispositivo.');if(d.slot==='g'&&seen.has(d.slug))throw Error('Não é permitido repetir um dispositivo Grande.');seen.add(d.slug);need[['l','p','g'].indexOf(d.slot)]++;}
 const base=[1,{Pequeno:1,Médio:2,Grande:3}[size],1];if(!fitPuppetSlots(base,need))throw Error('Os dispositivos não cabem nos encaixes da marionete.');
 const esp=actor.system.attributes.esp,m=control.mechanisms;
 return {...control,size,count,devices:structuredClone(devices),slots:base,used:need,price:({Pequeno:300,Médio:600,Grande:900}[size]+need[0]*10+need[1]*20+need[2]*30)*count,absorption:5*m+(size==='Pequeno'?-5:size==='Grande'?5:0),hardness:devices.some(d=>d.slug==='armadura')?(m>=14?3:2):1,controlRange:devices.some(d=>d.slug==='armadura')?5+esp:10+2*esp,attackRange:5+esp,movement:10+Math.ceil(control.prest/2)};
}
export function materializePuppets(data,draft,library){
 if(!data.items.some(i=>i.system.contentId==='sns:apt:kugutsu'))return null;
 const actor={system:data.system,items:data.items},build=puppetConstruction(actor,draft),entries=library.entries??library,get=id=>{const entry=entries.find(e=>e.id===id);if(!entry)throw Error('Construção ausente do compêndio: '+id);return canonicalCopy(entry);};
 const skeleton=get('sns:equipment:esqueleto-de-marionete-'+({Pequeno:'pequena',Médio:'media',Grande:'grande'}[build.size]));skeleton._id='pu00000000000001';skeleton.name='Marionete · '+build.size;skeleton.system.quantity=build.count;skeleton.flags[ns].puppetConstruction=build;data.items.push(skeleton);
 for(let puppetIndex=0;puppetIndex<build.count;puppetIndex++)for(const [deviceIndex,d]of build.devices.entries()){
  const index=puppetIndex*20+deviceIndex,equipment=get('sns:equipment:dispositivo-'+d.slug);equipment._id='pd'+String(index).padStart(14,'0');equipment.system.quantity=1;equipment.flags[ns].puppetDevice={skeletonId:skeleton._id,puppetIndex,...d};data.items.push(equipment);
  const row=structuredClone(equipment);row._id='pt'+String(index).padStart(14,'0');row.type='jutsu';row.name=equipment.name.replace(/^Dispositivo:\s*/,'')+(build.count>1?' · Marionete '+(puppetIndex+1):'');row.system.category='techniques';row.system.details.powerId='';row.system.description=row.system.description.split(/<h3>ESTRANGULAR/i)[0];row.flags[ns].puppetUse={skeletonId:skeleton._id,deviceId:equipment._id,puppetIndex,...d};data.items.push(row);
 }
 // Connecting is an actual chakra use, distinct from firing a device.
 const connection=get('sns:apt:kugutsu');connection._id='pt99999999999999';connection.type='jutsu';connection.system.category='techniques';connection.name='Conectar marionetes';connection.system.details.powerId='';connection.flags[ns].puppetUse={skeletonId:skeleton._id,connect:true};data.items.push(connection);
 return build;
}
export function puppetUsePlan(item){
 const use=item.flags?.[ns]?.puppetUse;if(!use)return null;
 const master=item.actor,control=puppetControl(master),skeleton=master.items.get(use.skeletonId),stored=skeleton?.flags?.[ns]?.puppetConstruction;if(!stored)throw Error('A marionete de origem está ausente.');
 const build=puppetConstruction(master,{puppetSize:stored.size,puppetCount:stored.count,puppetPreset:'custom',puppetDevices:stored.devices});
 if(use.connect)return {min:1,max:1,level:1,mode:'none',base:null,cost:build.count,action:'Parcial',range:build.controlRange+' m',duration:'Sustentada',shape:'',size:null,useNote:'Enquanto controla as marionetes, use suas ações para movê-las e atacar. Somente os jutsus aplicáveis de Kugutsu podem ser usados.'};
 const device=master.items.get(use.deviceId),def=PUPPET_DEVICES[use.slug];if(!device||!def)throw Error('O dispositivo de origem está ausente.');
 const remaining=master.flags?.[ns]?.puppetUses?.[device.id]??def.uses;
 if(def.uses&&(!Number.isInteger(remaining)||remaining<1))throw Error('Dispositivo sem usos. Recarregue antes de atacar.');
 const held=Array.from(master.items).find(i=>i.type==='weapon'&&i.system.contentId===master.flags?.[ns]?.npcGenerator?.draft?.weapon),armed=def.armed?WEAPON_DAMAGE_PROFILES[held?.system.contentId]??(!master.flags?.[ns]?.npcGenerator?.draft?.weapon?{weaponDamage:0}:null):null;
 if(def.armed&&!armed)throw Error('Escolha uma arma com dano definido para a Marionete Armada.');
 const weapon=armed?.weaponDamage??(use.slug==='chakra-cortante'&&control.mechanisms>=8?3:def.weapon);
 const m=control.mechanisms,attack=!!def.armed||Number.isFinite(weapon),shape=use.slug==='lanca-chamas'&&use.slot==='p'&&m>=8?'cone':use.slug==='jato-dagua-cortante'&&m>=10?'ray':use.slug==='projeteis'&&use.slot==='p'&&m>=8?'circle':'',size=shape?m:null;
 const robust=build.devices.some(d=>d.slug==='dispositivo-robusto')&&use.slug===build.devices.find(d=>PUPPET_DEVICES[d.slug].weapon)?.slug,base=attack?Math.ceil(m/2)+(use.slug==='projeteis'&&shape?2:weapon)+control.weaponBonus:null;
 return {min:1,max:1,level:1,mode:attack?'attack:cd':'none',base:base===null?null:robust?Math.min(m+3,base+3):base,cost:use.slug==='maquinario-avancado'?2:use.slug==='parede'?Math.ceil(m/2):0,action:use.slug==='parede'||use.slug==='maquinario-avancado'?'Movimento':robust?'Completa':'Padrão',range:build.attackRange+' m',duration:attack?'Instantânea':'Conforme descrição',shape,size,attackKind:shape?'area':'projectile',...(def.uses?{deviceUse:{itemId:device.id,before:remaining,after:remaining-1}}:{}),useNote:'Precisão à distância do marionetista; dano por Mecanismos. '+(def.uses?'Capacidade: '+def.uses+' usos por dispositivo. ':'')+(robust?'Dispositivo Robusto: recarga de 2 rodadas; não use as outras marionetes durante este ataque. ':'')+'Ações simultâneas, munição, manobras e benefícios específicos seguem a descrição.'};
}
export function puppetActorData(master,build,index=0){
 const skillKeys=['acrobacia','escapar','furtividade','prestidigitacao'];
 return {name:'Marionete '+(index+1)+' · '+master.name,type:'npc',img:'icons/svg/clockwork.svg',ownership:{default:0},system:{nc:master.system.nc,attributes:{for:null,des:null,agi:null,per:null,int:null,vig:null,esp:null,car:null,man:null},stats:{...master.system.stats,movement:build.movement},statsOriginal:{...master.system.statsOriginal},resources:{vitality:{value:build.absorption,max:build.absorption},chakra:{value:0,baseMax:0}},damageState:{hardness:build.hardness,hardnessSource:'Kugutsu · construção'},details:{size:build.size,master:master.uuid,rank:'Marionete',role:'Kugutsu · objeto controlado'},description:'<p>Absorção '+build.absorption+' · Dureza '+build.hardness+'.</p><p>Controle '+build.controlRange+' m; ataques '+build.attackRange+' m. Ações e dispositivos são usados pela ficha do marionetista. Sem controle, a marionete é indefesa.</p>',recordedSkillsConfigured:true,recordedSkills:skillKeys.map(key=>({key,precision:build.prest,untrained:false}))},flags:{[ns]:{puppetMaster:{actorUuid:master.uuid,index,construction:build}}}};
}
