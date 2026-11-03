import {fold,TRAIT_FAMILIES} from './traits.mjs';
import {TRAITS} from '../data/traits-v1.mjs';
import {JUTSU_RANKS} from '../data/jutsu-ranks.mjs';
export const CATALOG_RANKS=Object.freeze(['E','D','C','B','A','S']);
export const catalogRank=row=>row.type==='jutsu'?(JUTSU_RANKS[row.contentId]??null):null;
export function catalogRating(row,tab){
 if(tab==='jutsus'&&row.type==='jutsu')return {display:catalogRank(row)??'—',title:catalogRank(row)?'Rank '+catalogRank(row):'Rank não informado na publicação'};
 return {display:Number.isFinite(row.level)?String(row.level):'—',title:'Nível'};
}
export const CATALOG_TABS=Object.freeze([
 {id:'abilities',label:'Habilidades',types:['action','attack','effect','condition','affliction','reference'],categories:['standard','reaction','free','exploration','downtime','effects']},
 {id:'bestiary',label:'Bestiário',types:['npc','companion'],gmOnly:true},
 {id:'equipment',label:'Equipamentos',types:['weapon','armor','shield','equipment','consumable','ammunition','container','treasure','kit','document','formula','service'],categories:['weapons','armor','equipment','consumables','ammunition','treasures','containers','formula']},
 {id:'features',label:'Aptidões / características',types:['aptitude','feature','clan','hijutsu','background'],categories:['aptitudes','features']},
 {id:'hazards',label:'Perigos',types:['hazard'],gmOnly:true},
 {id:'powers',label:'Poderes',types:['power','powerDefinition'],categories:['powers']},
 {id:'jutsus',label:'Efeitos/Jutsus',types:['jutsu','effectDefinition'],categories:['techniques','effectDefinitions']}
]);
export const catalogTabs=isGM=>CATALOG_TABS.filter(t=>isGM||!t.gmOnly);
const words={Absorcao:'Absorção',Acao:'Ação',Antidoto:'Antídoto',Aquatico:'Aquático',Area:'Área',Ataque:'Ataque',Automatico:'Automático',Caido:'Caído',Condicao:'Condição',Concentracao:'Concentração',Conexao:'Conexão',Constituicao:'Constituição',Contagio:'Contágio',Criacao:'Criação',Copia:'Cópia',Coracao:'Coração',Critico:'Crítico',Cura:'Cura',Destruido:'Destruído',Dispersao:'Dispersão',Dissipacao:'Dissipação',Duracao:'Duração',Escuridao:'Escuridão',Especie:'Espécie',Especifica:'Específica',Especifico:'Específico',Esquiva:'Esquiva',Explosao:'Explosão',Floresta:'Floresta',Forca:'Força',Fumaca:'Fumaça',Ilusao:'Ilusão',Invocacao:'Invocação',Invocada:'Invocada',Lamina:'Lâmina',Maos:'Mãos',Mecanica:'Mecânica',Medico:'Médico',Medio:'Médio',Miudo:'Miúdo',Multiplos:'Múltiplos',Municao:'Munição',Nevoa:'Névoa',Ocultacao:'Ocultação',Padrao:'Padrão',Percepcao:'Percepção',Perfuracao:'Perfuração',Precisao:'Precisão',Projetil:'Projétil',Protecao:'Proteção',Reacao:'Reação',Recuperacao:'Recuperação',Regeneracao:'Regeneração',Relampago:'Relâmpago',Restricao:'Restrição',Restrito:'Restrito',Subterraneo:'Subterrâneo',Tecnica:'Técnica',Transformacao:'Transformação',Unico:'Único',Visao:'Visão'};
export const catalogTraitLabel=trait=>String(trait?.label??trait??'').replace(/[A-Za-z]+/g,word=>words[word]??word);
export function catalogTabFor(row){
 if(row.documentName==='Actor'||['npc','companion','hazard'].includes(row.type))return row.type==='hazard'?'hazards':'bestiary';
 if(row.type==='reference')return CATALOG_TABS.find(t=>t.categories?.includes(row.category))?.id??'abilities';
 return CATALOG_TABS.find(t=>t.types.includes(row.type))?.id??'abilities';
}
export function mayBrowseCatalogRow(row,isGM=false){return isGM||!['bestiary','hazards'].includes(catalogTabFor(row));}
export function initialCatalogTab(category=''){return CATALOG_TABS.find(t=>t.categories?.includes(category))?.id??'equipment';}
export function catalogTraitOptions(tab,query='',selected=[]){
 const types=CATALOG_TABS.find(t=>t.id===tab)?.types??[],families=new Set(types.flatMap(type=>TRAIT_FAMILIES[type]??[])),q=fold(query);
 return TRAITS.filter(t=>families.has(t.family)&&!selected.includes(t.id)&&(!q||fold(t.label+' '+t.family+' '+t.id).includes(q))).map(t=>({...t,label:catalogTraitLabel(t)})).sort((a,b)=>a.label.localeCompare(b.label,'pt-BR')||a.family.localeCompare(b.family,'pt-BR'));
}
export function filterCatalog(rows,{query='',type='',category='',source='',sources=[],min='',max='',traits=[],excludedTraits=[],sizes=[],ranks=[],match='all',tab='',isGM=false,includeWorld=true,sort='name',direction='asc'}={}){
 const q=fold(query),book=fold(source);
 const result=rows.filter(r=>mayBrowseCatalogRow(r,isGM)&&(!tab||catalogTabFor(r)===tab)&&(includeWorld||r.origin!=='Mundo')&&(!q||fold(r.name+' '+(r.tags??[]).join(' ')+' '+(r.traits??[]).join(' ')).includes(q))&&(!type||r.type===type)&&(!category||r.category===category)&&(!book||fold(r.source).includes(book))&&(!sources.length||sources.includes(r.sourceId))&&(tab!=='jutsus'||!ranks.length||r.type==='jutsu'&&ranks.includes(catalogRank(r)??'unknown'))&&(min===''||Number.isFinite(r.level)&&r.level>=Number(min))&&(max===''||Number.isFinite(r.level)&&r.level<=Number(max))&&(!sizes.length||sizes.some(t=>(r.traits??[]).includes(t)))&&!excludedTraits.some(t=>(r.traits??[]).includes(t))&&(!traits.length||(match==='any'?traits.some(t=>(r.traits??[]).includes(t)):traits.every(t=>(r.traits??[]).includes(t)))));
 const sign=direction==='desc'?-1:1;
 return result.sort((a,b)=>{
  if(sort==='level'){
   if(tab==='jutsus'){
    const aj=a.type==='jutsu',bj=b.type==='jutsu';
    if(aj!==bj)return aj?1:-1;
    if(aj){const ar=CATALOG_RANKS.indexOf(catalogRank(a)),br=CATALOG_RANKS.indexOf(catalogRank(b));if((ar<0)!==(br<0))return ar<0?1:-1;if(ar!==br)return sign*(ar-br);}
   }
   const ak=Number.isFinite(a.level),bk=Number.isFinite(b.level);
   if(ak!==bk)return ak?-1:1;
   if(ak&&a.level!==b.level)return sign*(a.level-b.level);
  }
  return sign*a.name.localeCompare(b.name,'pt-BR');
 });
}
