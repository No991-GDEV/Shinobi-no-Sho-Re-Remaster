// A reserve is registered explicitly against an owned granting item, never inferred from tags.
import {originGrant} from './restricted-access.mjs';
import {effectiveRuleItem} from './jutsu-rule-text.mjs';
export const SPECIAL_RESOURCES={
 health:{label:'Saúde · Kujaku Myoho',type:'power',source:'Hijutsus Vol.2 · Kujaku Myoho',hint:'Cada técnica gasta 1 Saúde. Ao esgotar, aplique a lesão permanente descrita no poder e reinicie em 10. Fatigado/Exausto e tratamento são conferidos pelo mestre.'},
 bijuu:{label:'Chakra bijū',type:'power',source:'Básico4.1b · p.193, 217',hint:'Jinchūriki1: reserva adicional de 50% do chakra comum. O acesso e os modos da bijū seguem suas restrições.'},
 vision:{label:'Pontos de visão',type:'aptitude',source:'Básico4.1b · p.183–184',hint:'Somente Mangekyou Sharingan: 10 pontos para o par de olhos. Sharingan básico, Nidan e Sandan não concedem esta reserva.'}
};
export const RESOURCE_GRANTS={'Chakra bijū':'bijuu','Pontos de visão · Mangekyou original':'vision'};
export function grantedResources(actor){return Array.from(actor.items??[]).map(effectiveRuleItem).flatMap(source=>{
 const kind=source.system?.contentId==='sns:power:kujaku-myoho'?'health':source.system?.contentId==='sns:power:hb-f05-jinchuuriki-falso'?'bijuu':RESOURCE_GRANTS[source.system?.details?.resourceRule];
 if(source.system?.contentId==='sns:power:jinchuuriki'&&originGrant(source)!=='jinchuuriki')return [];
 if(!kind||!['power','aptitude','feature'].includes(source.type))return [];
 return [{id:'grant-'+source.id+'-'+kind,sourceId:source.id,kind,value:null,history:[]}];
});}
const rows=actor=>Array.from(actor.system.specialResources??[]);
export function resolveSpecialResource(actor,row){
 const rule=SPECIAL_RESOURCES[row.kind],source=Array.from(actor.items??[]).find(i=>i.id===row.sourceId),problems=[];
 if(!rule)return {...row,valid:false,problems:['Regra de recurso desconhecida.'],label:'Recurso a revisar',max:null,valueLabel:row.value??'—',maxLabel:'—'};
 if(!source||!grantedResources(actor).some(g=>g.sourceId===row.sourceId&&g.kind===row.kind))problems.push('A característica concedente está ausente ou sua regra de recurso mudou.');
 if(row.kind==='bijuu'&&(!Number.isInteger(source?.system.level)||source.system.level<1))problems.push('Chakra bijū exige Jinchūriki 1 ou superior.');
 if(row.kind==='vision'&&(!Number.isInteger(actor.system.attributes?.per)||actor.system.attributes.per<16))problems.push('Mangekyou exige Percepção16, Sandan e evento traumático; confira os requisitos.');
 const common=actor.system.resources?.chakra?.max;
 let max=['health','vision'].includes(row.kind)?10:Number.isInteger(common)&&common>=0?Math.ceil(common/2):null;
 if(max===null)problems.push('Informe o máximo de chakra comum para calcular esta reserva.');
 if(row.value!==null&&row.value!==undefined&&(!Number.isInteger(row.value)||row.value<0||max!==null&&row.value>max))problems.push('O valor atual precisa estar entre 0 e o máximo do recurso.');
 const known=Number.isInteger(row.value);
 return {...row,label:rule.label,sourceName:source?.name??'Origem indisponível',hasSource:!!source,source:rule.source,hint:rule.hint,max,valueLabel:known?row.value:'Não informado',maxLabel:max??'—',known,percent:known&&max>0?Math.max(0,Math.min(100,100*row.value/max)):0,valid:!problems.length,problems};
}
export const specialResourceView=actor=>grantedResources(actor).map(g=>resolveSpecialResource(actor,rows(actor).find(r=>r.sourceId===g.sourceId&&r.kind===g.kind)??g));
export function specialResourceChange(actor,row,value,note,{user='',at=''}={}){
 const r=resolveSpecialResource(actor,{...row,value:null});
 if(!r.valid)throw Error(r.problems.join(' '));
 if(value!==null&&(!Number.isInteger(value)||value<0||value>r.max))throw Error('Informe um inteiro entre 0 e '+r.max+', ou deixe desconhecido.');
 if(value===row.value)return row;
 if(!note?.trim())throw Error('Informe o motivo do ajuste.');
 return {...row,value,history:[...(row.history??[]),{from:row.value??null,to:value,note:note.trim(),user,at}]};
}
export function validateSpecialResourceRegistration(actor,row){
 if(rows(actor).some(r=>r.kind===row.kind))throw Error('Esta ficha já possui uma reserva desse tipo. Confira o registro existente.');
 const result=resolveSpecialResource(actor,row);if(!result.valid)throw Error(result.problems.join(' '));
 return row;
}
