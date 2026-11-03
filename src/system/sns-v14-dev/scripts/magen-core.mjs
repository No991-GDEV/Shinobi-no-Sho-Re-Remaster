const condition=id=>'sns:condition:'+id;
export function magenProjection({actor,power,effect,choices,usedLevel,variant='normal',problems=[]}){
 const id=effect.id.split(':').at(-1),stage=Math.max(effect.min,...choices.filter(c=>c.effectId===effect.id&&c.stage<=usedLevel).map(c=>c.stage)),int=actor.system.attributes?.int,level=power.system.level,touch=variant==='toque'||variant.endsWith('-toque');
 const category=['amedrontar','fadigar','desequilibrar','aliviamento','atordoar'].includes(id)||variant.startsWith('aflicao')?'aflicao':'compulsao';
 const conditions=[],add=(key,extra={})=>conditions.push({conditionId:key.startsWith('sns:')?key:condition(key),degree:1,scope:'all',...extra});
 let turns=category==='aflicao'?2:0,nextTurnEnd=false,progression=null;
 if(id==='extase')add('fascinado');
 if(id==='amedrontar')add(stage>=8?'aterrorizado':stage>=5?'amedrontado':'assustado');
 if(id==='confundir')add('confuso');
 if(id==='fadigar')add(stage>=5?'exausto':'fatigado');
 if(id==='segurar')add(stage>=10?'indefeso-ou-paralisado':'agarrado');
 if(id==='adormecer'){add('fatigado');progression={phase:'end',count:stage>=9?3:stage>=6?4:5,conditionId:condition('inconsciente')};}
 if(id==='anular-sentido'){
  if(variant.startsWith('visao'))add(stage>=9?'cego':stage>=6?'sns:state:camuflagem-visual-total':'sns:state:camuflagem-visual-parcial');
  if(variant.startsWith('audicao'))add(stage>=6?'surdo':'sns:state:audicao-prejudicada');
  if(variant.startsWith('olfato'))add('sns:state:olfato-anulado');
 }
 if(id==='desequilibrar'){add('caido');turns=stage>=6?2:1;nextTurnEnd=stage<6;}
 if(id==='desorientar')add('sns:state:desorientado');
 if(id==='aliviamento'){add('desprevenido');turns=stage>=7?3:2;}
 if(id==='petrificar'){add(stage>=10?'indefeso-ou-paralisado':stage>=7?'impedido':'lento');if(stage<7)progression={phase:'start',count:2,conditionId:condition('impedido')};}
 if(id==='adoecer'){add('tonto');if(stage>=8)add(stage>=10?'exausto':'fatigado');}
 if(id==='atordoar'){add('atordoado');if(stage>=8)add('desprevenido');turns=1;nextTurnEnd=true;}
 if(id==='paralisar')add('indefeso-ou-paralisado');
 const difficulty=touch?8+2*level:9+level+Math.ceil((int??0)/2),unresistable=id==='aliviamento'&&stage>=10;
 const magen={effectId:effect.id,stage,category,cost:stage,difficulty,touch,conditions,turns,nextTurnEnd,progression,repeatable:['extase','atordoar'].includes(id),ignoreMultiplePenalty:id==='desorientar'&&stage>=6,unresistable};
 const data={action:'Padrão',duration:turns?(nextTurnEnd?'Até o final do próximo turno':turns+' turnos'):'Contínua até se libertar',range:touch?'Toque':(5+(int??0))+' m',target:'Uma ou mais criaturas · posição exata conhecida',area:'',chakraCost:String(stage),damage:'Nenhum',difficulty,size:int??0,defenses:unresistable?'Não permite resistência':touch?'Defesa ao CC; depois Inteligência':'Resistência de Inteligência',seals:'Método de transmissão conforme o personagem',test:touch?'cc':''};
 const autoBindings=conditions.map((c,i)=>({id:'book_magen_'+i,...c,trigger:touch?(unresistable?'hit':'hitFailedResistance'):unresistable?'use':'failedResistance',recipient:'targets',resistance:'attribute:int',dcMode:'jutsu',dc:0,duration:data.duration,note:effect.name+' · '+(category==='compulsao'?'Compulsão':'Aflição'),source:'Básico4.1b · '+effect.source.pages}));
 return {valid:!problems.length,problems,data,formulas:{difficulty:touch?'8 + 2 × nível total de Magen':'9 + nível total de Magen + ⌈INT/2⌉ (Ilusão Profunda inclusa)',chakraCost:'Estágio do efeito usado',range:touch?'Toque':'5 + INT',size:'INT'},provenance:Object.fromEntries(Object.keys(data).map(k=>[k,['chakraCost','difficulty','size','range'].includes(k)?'calculado':'herdado'])),traits:effect.traits,effect,power:power.system.power,cost:stage,usedLevel,magen,resistanceCast:!touch,autoBindings,combatProfile:{base:0,fixed:0,nature:'lethal',criticalAt:15,noDamage:true,attackKind:'melee',weaponClass:'Leve'},executionNotes:'Chakra pelo estágio; dificuldade pelo nível total de Magen. Múltiplos alvos: −(1 + alvos) na dificuldade, salvo Desorientar6. Alcance, transmissão, ameaças e ações continuam sujeitos ao contexto.'};
}
export const useDifficulty=(projection,count)=>Number.isFinite(projection?.data?.difficulty)?projection.data.difficulty-(projection.magen&&count>1&&!projection.magen.ignoreMultiplePenalty?count+1:0):null;
export const illusionData=item=>item?.flags?.['sns-v14-dev']?.illusion;
export const mayEditIllusion=(before,after,isGM)=>isGM||JSON.stringify(illusionData(before))===JSON.stringify(illusionData(after))&&(!illusionData(before)||JSON.stringify(before.system?.appliedCondition)===JSON.stringify(after.system?.appliedCondition));
export const mayEditMagenActor=(before,after,isGM)=>isGM||['magenScene','magenCapanga','magenKaiLedger'].every(k=>JSON.stringify(before?.flags?.['sns-v14-dev']?.[k])===JSON.stringify(after?.flags?.['sns-v14-dev']?.[k]));
export const sceneEpoch=actor=>actor?.flags?.['sns-v14-dev']?.magenScene??0;
export const targetResistanceBonus=actor=>actor?.flags?.['sns-v14-dev']?.magenCapanga===true?3:0;
export function activeIllusions(actor){return Array.from(actor?.items??[]).filter(i=>illusionData(i)?.root&&i.system.appliedCondition?.active);}
export function magenImmunity(actor,magen){
 const items=Array.from(actor?.items??[]);
 if(magen.effectId==='sns:effect:segurar'&&magen.stage<6&&items.some(i=>i.system.ruleId==='sns:apt:lutador'||i.system.contentId==='sns:apt:lutador'))return 'Lutador: imune a Segurar antes do estágio6.';
 if(magen.effectId==='sns:effect:extase'&&items.some(i=>i.system.contentId==='sns:state:imunidade-fascinio'&&i.system.appliedCondition?.active))return 'Um turno de imunidade a Êxtase / Fascinar.';
 if(!magen.repeatable&&items.some(i=>{const m=illusionData(i);return m?.root&&m.effectId===magen.effectId&&m.sceneEpoch===sceneEpoch(actor);}))return 'Este efeito já enganou o alvo nesta cena.';
 return '';
}
export function advanceIllusion(meta,event,actorUuid){
 if(event.actor?.uuid!==actorUuid||event.combatId!==meta.combatId||event.round<1)return null;
 const key=event.phase+'~'+event.round;if(meta.events?.includes(key))return null;
 const next={...meta,events:[...(meta.events??[]),key]};
 if(event.phase==='start')next.starts=(meta.starts??0)+1;
 if(event.phase==='end')next.ends=(meta.ends??0)+1;
 const p=meta.progression;if(p&&!meta.progressed&&(p.phase==='start'?next.starts:next.ends)>=p.count)next.progressed=true;
 return next;
}
export function illusionBreaksByDamage(meta,resources){return meta?.category==='compulsao'&&resources.vitalityLost+resources.temporaryLost>=2*meta.cost;}
export function noticeDifficulty(meta,attempts=meta.attempts??0){return meta.difficulty-1-attempts;}
export function senseContext(actor,key,sense='neutral'){
 const items=Array.from(actor?.items??[]).filter(i=>i.system.appliedCondition?.active),has=id=>items.some(i=>i.system.contentId===id),relevant=['skill:procurar','skill:prontidao'].includes(key);
 if(!relevant)return {required:false,blocked:'',effects:[]};
 const required=['sns:condition:cego','sns:condition:surdo','sns:state:audicao-prejudicada','sns:state:olfato-anulado'].some(has);
 const blocked=sense==='vision'&&has('sns:condition:cego')?'Cego: este teste visual não pode ser feito.':sense==='hearing'&&has('sns:condition:surdo')?'Surdo: este teste auditivo não pode ser feito.':sense==='smell'&&has('sns:state:olfato-anulado')?'Olfato anulado: este teste depende de um sentido indisponível.':'';
 const effects=sense==='hearing'&&has('sns:state:audicao-prejudicada')?[{kind:'condition',key:'debilitado',scope:key,degree:2,sourceId:'hearing',sourceName:'Anular Sentido · audição'}]:[];
 return {required,blocked,effects};
}
export function illusionActionBlock(actor,{attack=false,movement=false,kai=false,key=''}={}){
 const items=Array.from(actor?.items??[]).filter(i=>i.system.appliedCondition?.active),has=id=>items.some(i=>i.system.contentId===condition(id));
 if(kai)return '';
 if(has('atordoado')||has('aterrorizado'))return 'Atordoado: não pode realizar ações; reações continuam permitidas.';
 if(has('inconsciente')||has('morrendo')||has('indefeso-ou-paralisado'))return 'A condição impede esta ação; confira a descrição e o contexto com o mestre.';
 if(has('fascinado'))return 'Fascinado: só pode prestar atenção ao que o fascinou. Resolva ameaça ou libertação em Efeitos.';
 if(attack&&has('amedrontado'))return 'Amedrontado: não pode atacar.';
 if(movement&&has('tonto'))return 'Tonto: perdeu a ação de movimento. Para converter outra ação, consulte o mestre.';
 if(key==='skill:rastrear'&&items.some(i=>i.system.contentId==='sns:state:desorientado'))return 'Desorientar: fracasso automático em Rastrear.';
 return '';
}
