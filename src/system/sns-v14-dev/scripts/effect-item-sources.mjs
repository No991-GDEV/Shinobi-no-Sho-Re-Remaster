import {transformationProjection} from './transformation-core.mjs';
import {activeAptitudeView} from './active-aptitudes.mjs';

// Paid activation and transformation controllers remain authoritative for intrinsic rules.
export function virtualEffectRows(actor){
 const arms=transformationProjection(actor).grants.filter(g=>['arm','partial'].includes(g.id)&&g.row.arms?.some(a=>a.id===g.id)).map(g=>({id:g.grantId,temporaryTechnique:true,technique:g.id,name:g.name,duration:'Sustentada',sourceId:g.sourceId,sourceName:g.sourceName,hasSource:true,summary:g.range,source:g.sourcePages,description:'Braço ou cauda criado. Recolher devolve somente o Chakra pago por esta criação.',valid:true,endLabel:'Recolher'}));
 const transformations=transformationProjection(actor).active.map(({row,profile,mode,buff,size})=>({id:row.id+'~'+(buff?.id??'mode'),transformation:true,buff:buff?.id??'',sourceId:profile.source.id,sourceName:profile.source.name,hasSource:true,name:buff?.name??mode.name,duration:buff?'Sustentada':profile.control?'Uma cena':Math.max(0,1+profile.level-row.turns)+' turnos seguros',summary:[size?.name,mode?.hardness?'Dureza '+mode.hardness:'',mode?.accelerated||buff?.accelerated?'Acelerado':'',mode?.restrictTechniques?'Somente técnicas permitidas pela bijuu':''].filter(Boolean).join(' · '),description:profile.def.source,source:profile.def.source,valid:true,endLabel:'Encerrar',problems:row.problem?[row.problem]:[]}));
 return [...arms,...transformations,...activeAptitudeView(actor).filter(row=>row.active).map(row=>({
  id:row.id,sourceId:row.sourceId,rule:row.rule,img:row.sourceImg,name:row.transplanted?row.stage:row.sourceName,
  sourceName:row.sourceName,source:row.source,duration:row.duration,
  summary:row.transplanted?'Olho descoberto · '+row.upkeep+' chakra/turno':'Aptidão ativa',
  description:row.hint,note:row.note,problems:row.problems,valid:row.valid,
  endLabel:row.transplanted?'Cobrir olho':'Desativar',hasSource:row.hasSource
 }))];
}
