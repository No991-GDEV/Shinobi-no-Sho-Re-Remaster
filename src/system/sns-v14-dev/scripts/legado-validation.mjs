import {activeLegadoEffects,legadoEffect} from './legado-effects.mjs';
import {isGeneratedMinion} from './npc-minion-policy.mjs';
import {legadoState} from './legado-core.mjs';
export async function validateLegadoTargets(actor,plan,targets=[],user={}){
 const {key,mode,params}=plan.legado;if(key==='yomotsu-okami'&&mode==='absorver'&&!user.isGM)throw Error('O mestre registra a absorção de Yomi após conferir o ataque recebido.');
 for(const row of targets){const target=await fromUuid(row.uuid);if(!target)throw Error('Alvo indisponível. Marque o alvo novamente.');
  if(key==='hipnose-sharingan'&&mode==='controlar'&&!isGeneratedMinion(target))throw Error('Controlar Mente funciona apenas contra capangas.');
  if(key==='tsukuyomi'&&mode==='torturador'&&activeLegadoEffects(target).some(i=>{const d=legadoEffect(i);return d.immunity===actor.uuid&&d.sceneEpoch===(actor.flags?.['sns-v14-dev']?.magenScene??0);}))throw Error(target.name+' já sofreu este Tsukuyomi nesta cena.');
 }
 if(key==='mimica-sharingan'&&['memorizar','esquecer','aprender'].includes(mode)){
  const row=legadoState(actor).copies?.find(c=>c.id===params.copyId&&!c.forgotten);if(!row)throw Error('A cópia não está mais disponível.');
  if(mode==='aprender'&&(!row.memorized||row.learned))throw Error('Primeiro memorize uma técnica ainda não aprendida.');
 }
}
