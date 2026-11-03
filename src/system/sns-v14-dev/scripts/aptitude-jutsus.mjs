import {itemRuleId,requirementsFor,RULE_GRANTS} from './item-requirements.mjs';
export const CLONE_KAGE='Clone: Kage Bunshin';
export const SHUNJUTSU='Shunjutsu · estágio 1';
export const grantRuleFor=item=>RULE_GRANTS[itemRuleId(item)]??item?.system?.details?.grantRule??'';
export const isAptitudePower=item=>item?.type==='aptitude'&&/^sns:apt:shunjutsu-[123]$/.test(itemRuleId(item));
export const isFixedGrantSource=item=>item?.type==='aptitude'&&[CLONE_KAGE,SHUNJUTSU].includes(grantRuleFor(item));
export function fixedJutsuSpec(source){
 if(grantRuleFor(source)===CLONE_KAGE)return {id:'sns:jutsu:kage-bunshin',name:'Kage Bunshin no Jutsu',action:'Padrão',duration:'Contínua',pages:'76–78',notes:'Cria 1 ou 2 clones adjacentes, a 1 chakra por clone. Máximo de 2 simultâneos, somando materiais. Clones têm Vitalidade1, Chakra0 e −3 nos testes; não usam os demais poderes ou jutsus. Dissipar é ação livre; não recrie no mesmo turno da dissipação. Controle os clones no tabuleiro. Clone Verdadeiro é uma aptidão separada.'};
 if(grantRuleFor(source)===SHUNJUTSU)return {id:'sns:jutsu:shunshin-combate',name:'Shunshin no Jutsu · combate',action:'Livre',duration:'Instantânea',pages:'83; 125–126',notes:'Use durante seu deslocamento ou sua defesa. Espírito substitui atributos/perícias no cálculo da distância e nos testes de manobras de deslocamento. Concede um Kawarimi adicional por cena. Estágio2 permite fintar com Destreza ou Inteligência; estágio3 tem seus benefícios próprios. Respeite os limites por cena de cada manobra.'};
 return null;
}
export function resolveFixedJutsu(actor,item,source){
 const spec=fixedJutsuSpec(source),j=item.system.jutsu??{},r=requirementsFor(source,actor),problems=[];
 if(!spec)return {valid:false,problems:['A origem não concede esta técnica.']};
 if(!r.configured||!r.valid)problems.push(...r.problems);
 if(j.effectId!==spec.id||j.usedLevel!==1||j.overrides?.length)problems.push('A técnica não corresponde à concessão da origem.');
 const clones=spec.id==='sns:jutsu:kage-bunshin',count=clones?Number(j.variant):1;
 if(clones&&![1,2].includes(count)||!clones&&j.variant!=='normal')problems.push('Forma de uso inválida.');
 const cost=clones?count:1,data={action:spec.action,duration:spec.duration,range:'Pessoal',target:clones?count+' clone(s) adjacente(s)':'Você',chakraCost:String(cost),damage:'—',defenses:'—',test:null};
 return {valid:!problems.length,problems,noRoll:true,data,cost,usedLevel:1,grantSourceId:source.id,grantName:source.name,effect:{id:spec.id,name:spec.name,notes:spec.notes,source:{id:'F01',pages:spec.pages}},provenance:Object.fromEntries(Object.keys(data).map(k=>[k,'regra da técnica'])),formulas:{chakraCost:clones?'1 × quantidade de clones':'1'},traits:['arte:ninjutsu','custo:chakra','prova:sem-teste']};
}
