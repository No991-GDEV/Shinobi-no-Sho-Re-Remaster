import {ATTRIBUTES,escapeHtml} from './kernel.mjs';
import {SKILLS} from './rules.mjs';
import {poisonProfileFields} from './poison-crafting.mjs';
const ns='sns-v14-dev';
export const CRAFT_TESTS=[...ATTRIBUTES.map(([key,,label])=>({key:'attribute:'+key,label})),...SKILLS.map(s=>({key:'skill:'+s.key,label:s.name}))];
export const CRAFT_PHYSICAL=['weapon','armor','shield','equipment','consumable','ammunition','container','treasure','kit','document'];
export const craftProfile=item=>item?.flags?.[ns]?.craftProfile??null;
export const craftJobs=actor=>actor?.flags?.[ns]?.craftJobs??{};
const same=(a,b)=>JSON.stringify(a??null)===JSON.stringify(b??null);
const integer=(value,min,max,label)=>{if(!Number.isSafeInteger(value)||value<min||value>max)throw Error(label+' deve ser um inteiro entre '+min+' e '+max+'.');return value;};
const text=(value,label)=>{if(typeof value!=='string'||!value.trim()||value.length>2000)throw Error('Informe '+label+'.');return value.trim();};

export function validateCraftProfile(p){
 if(p?.kind==='poison')p={...p,...poisonProfileFields(p)};
 if(!p||p.version!==1||!['simple','cooking','poison'].includes(p.kind)||!['all','none'].includes(p.failure))throw Error('Configuração de preparo inválida.');
 if(!Array.isArray(p.steps)||p.steps.length>4||p.kind==='cooking'&&!p.steps.length)throw Error('Defina até quatro etapas; culinária exige pelo menos uma.');
 const steps=p.steps.map(s=>{if(!CRAFT_TESTS.some(t=>t.key===s.key))throw Error('Selecione o teste da etapa.');return {label:text(s.label,'o nome da etapa'),key:s.key,dc:integer(s.dc,1,100,'Dificuldade')};});
 const rows=(entries,label)=>{if(!Array.isArray(entries)||entries.length>20)throw Error('Lista de '+label+' inválida.');const ids=new Set();return entries.map(row=>{const identity=text(row.identity,label);if(ids.has(identity))throw Error('Não repita o mesmo material ou ferramenta.');ids.add(identity);return {identity,name:text(row.name,'o nome do material'),quantity:integer(row.quantity,1,100000,'Quantidade')};});};
 if(!['formula','reference'].includes(p.output?.kind)||p.output.kind==='reference'&&!p.output.uuid?.trim())throw Error('Selecione o produto da fórmula.');
 if(p.requirementsReviewed!==true)throw Error('Confira os requisitos da fórmula antes de habilitar o preparo.');
 return {version:1,revision:integer(p.revision,1,100000,'Revisão'),kind:p.kind,source:text(p.source,'a fonte'),note:text(p.note,'o critério usado na configuração'),requirementsReviewed:true,
  minutes:integer(p.minutes,0,1000000,'Tempo'),cost:integer(p.cost,0,1000000000,'Custo'),yield:integer(p.yield,1,100000,'Rendimento'),failure:p.failure,steps,
  ingredients:rows(p.ingredients,'ingredientes'),tools:rows(p.tools,'ferramentas'),output:{kind:p.output.kind,...(p.output.kind==='reference'?{uuid:p.output.uuid.trim()}:{} )},...(p.kind==='poison'?{poison:p.poison}:{})};
}

export function matchingCraftItems(actor,identity){return Array.from(actor.items??[]).filter(i=>CRAFT_PHYSICAL.includes(i.type)&&!i.flags?.[ns]?.craftProduct?.undone&&(i.system.contentId===identity||i.uuid===identity||i._stats?.compendiumSource===identity)).sort((a,b)=>a.id.localeCompare(b.id));}
export function craftPlan(actor,profile,batches=1,{consume=true,checkTools=true}={}){
 const p=validateCraftProfile(profile);integer(batches,1,100,'Número de preparos');
 if(p.kind==='poison'&&p.poison.mode!=='ideal'&&batches>15)throw Error('Um teste de 10 minutos produz até 15 doses. Faça outro preparo para as doses restantes.');
 const cost=(consume?p.cost:0)*batches,ryo=actor.system.finances?.ryo;
 if(!Number.isSafeInteger(cost)||cost>0&&(!Number.isSafeInteger(ryo)||ryo<cost))throw Error(ryo===null||ryo===undefined?'Informe o saldo de Ryo antes de fabricar.':'Saldo de Ryo insuficiente.');
 const inputs=[],used=new Map();
 for(const ingredient of consume?p.ingredients:[]){let needed=ingredient.quantity*batches;
  for(const item of matchingCraftItems(actor,ingredient.identity)){const quantity=item.system.quantity,available=Number.isSafeInteger(quantity)?quantity-(used.get(item.id)??0):0,take=Math.min(needed,Math.max(0,available));if(take){used.set(item.id,(used.get(item.id)??0)+take);needed-=take;}if(!needed)break;}
  if(needed)throw Error('Falta '+ingredient.name+': '+needed+' unidade(s).');
 }
 for(const [id,amount]of used){const item=Array.from(actor.items).find(i=>i.id===id);inputs.push({id,name:item.name,before:item.system.quantity,after:item.system.quantity-amount,amount});}
 for(const tool of checkTools?p.tools:[]){const matching=matchingCraftItems(actor,tool.identity);if(matching.some(i=>used.has(i.id)))throw Error('A ferramenta também foi selecionada como ingrediente.');const available=matching.reduce((sum,i)=>sum+(Number.isSafeInteger(i.system.quantity)?i.system.quantity:0),0);if(available<tool.quantity)throw Error('Ferramenta necessária: '+tool.name+' ('+tool.quantity+').');}
 if(p.ingredients.some(i=>p.tools.some(t=>t.identity===i.identity)))throw Error('Um recurso não pode ser ingrediente e ferramenta na mesma fórmula.');
 return {batches,cost,minutes:p.minutes*(p.kind==='poison'?1:batches),quantity:p.yield*batches,inputs,money:{before:ryo??null,after:cost?ryo-cost:ryo??null}};
}

export function craftQuality(profile,steps){
 const p=validateCraftProfile(profile);
 if(steps.length!==p.steps.length)return {key:'working',label:'Em preparo',produces:false};
 const successes=steps.filter(s=>s.result==='passed').length,total=steps.length;
 if(p.kind!=='cooking')return successes===total?{key:'success',label:'Sucesso',produces:true}:{key:'failure',label:'Falha',produces:false};
 if(successes*2<total)return {key:'failure',label:'Fracasso',produces:false};
 if(successes*2===total)return {key:'edible',label:'Comestível',produces:true};
 if(successes<total)return {key:'good',label:'Bom',produces:true};
 return steps.some(s=>s.real===true&&s.natural>=15)?{key:'great',label:'Grande Sucesso',produces:true}:{key:'excellent',label:'Excelente',produces:true};
}
export const CRAFT_BENEFITS={yield:'50% mais porções',duration:'Dobrar a duração',bonus:'+1 em um bônus do prato',social:'+1 social durante a refeição',memory:'Memória gastronômica'};
export function craftCompletion(actor,job,{interrupted=false,benefit=''}={}){
 const quality=interrupted?{key:'interrupted',label:'Interrompido',produces:false}:craftQuality(job.profile,job.steps);
 if(quality.key==='working')throw Error('Conclua as etapas antes de finalizar.');
 if(quality.key==='great'&&!Object.hasOwn(CRAFT_BENEFITS,benefit))throw Error('Escolha o benefício do Grande Sucesso.');
 if(quality.key!=='great'&&benefit)throw Error('Este preparo não concede um benefício de Grande Sucesso.');
 const consume=quality.produces||job.profile.failure==='all',plan=craftPlan(actor,job.profile,job.batches,{consume,checkTools:quality.produces});
 return {...plan,quality,benefit,quantity:quality.produces?plan.quantity+(benefit==='yield'?Math.floor(plan.quantity/2):0):0};
}

export function craftProductData(formula,job,commit,reference=null){
 let data;
 if(job.profile.output.kind==='reference'){
  if(!reference||!CRAFT_PHYSICAL.includes(reference.type)||reference.system.appliedCondition?.managed||['creation','support','environment','advancedState','illusion','phantasm','craftProduct','craftDebits','poisonBatch'].some(key=>reference.flags?.[ns]?.[key]))throw Error('Selecione uma definição de produto permanente, sem estados ou histórico de uso.');
  data=structuredClone(typeof reference.toObject==='function'?reference.toObject():reference);delete data._id;delete data._stats;delete data.ownership;delete data.folder;data.flags={[ns]:Object.fromEntries(['requirements','requirementsHistory','requirementsSource','canonicalContent'].filter(key=>reference.flags?.[ns]?.[key]!==undefined).map(key=>[key,structuredClone(reference.flags[ns][key])]))};data.system.equipped=false;
 }else data={name:formula.name,type:'consumable',img:formula.img,system:{category:'consumables',description:formula.system.description,source:structuredClone(formula.system.source),details:{action:'Consumir',effect:'Consulte a descrição e a qualidade do preparo.'},equipped:false},flags:{}};
 data.system.quantity=commit.quantity;
 const quality=commit.quality,extra=quality.key==='edible'?' Apenas alimenta; sem efeito de refeição.':job.profile.kind==='cooking'?' O efeito e seu consumo seguem a descrição da receita.':'';
 data.system.description=(data.system.description??'')+'<hr><p><strong>Preparo: '+escapeHtml(quality.label)+'</strong>.'+escapeHtml(extra)+(commit.benefit?' Benefício: '+escapeHtml(CRAFT_BENEFITS[commit.benefit])+'.':'')+'</p>';
 data.flags[ns]={...data.flags[ns],craftProduct:{jobId:job.id,formulaId:formula.id,profileRevision:job.profile.revision,quality:quality.key,benefit:commit.benefit,undone:false}};
 if(job.profile.kind==='poison'){
  if(!job.producer?.producerUuid||!Number.isInteger(job.producer.producerSkill))throw Error('O preparo precisa registrar o produtor do veneno.');
  data.flags[ns].poisonBatch={...structuredClone(job.producer),registeredBy:job.processedBy,craftJobId:job.id,uses:{}};
 }
 return data;
}

export function mayEditCraftActor(before,after,isGM){
 if(isGM)return true;if(!same(before.flags?.[ns]?.craftJobs,after.flags?.[ns]?.craftJobs))return false;
 return (after.items??[]).every(item=>{const old=(before.items??[]).find(i=>i._id===item._id);return old?mayEditCraftItem(old,item,false):!craftProfile(item)&&!protectedCraftCreation(item);});
}
export function mayEditCraftItem(before,after,isGM){return isGM||['craftProfile','craftProfileSource','craftProfileHistory','craftDebits','craftProduct'].every(key=>same(before.flags?.[ns]?.[key],after.flags?.[ns]?.[key]));}
export const protectedCraftCreation=data=>!!(data.flags?.[ns]?.craftDebits||data.flags?.[ns]?.craftProduct);
export function trustedCraftProfileCopy(copy,source){return ['craftProfile','craftProfileHistory','craftProfileSource'].every(key=>same(copy.flags?.[ns]?.[key],source.flags?.[ns]?.[key]));}
export function mayDeleteCraftItem(item,isGM){
 if(isGM)return true;const jobs=craftJobs(item.actor),ids=[item.flags?.[ns]?.craftProduct?.jobId,...Object.keys(item.flags?.[ns]?.craftDebits??{})].filter(Boolean);
 return !ids.some(id=>['committing','undoing'].includes(jobs[id]?.state));
}
