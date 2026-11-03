// D142 · filtro "Somente requisitos atendidos" do catálogo vinculado a uma ficha.
// Regra central: reutilizar requirementsFor/originGrant/packageAcquisitionProblems
// e a avaliação de equipamento existente — nenhuma regra duplicada por texto/nome.
// Desconhecido nunca conta como aprovado; nenhum builtin/Actor/componente
// arbitrário é tratado como elegível sem regra confiável.
import {requirementsFor,itemRuleId,ITEM_RULES} from './item-requirements.mjs';
import {originGrant,packageAcquisitionProblems} from './restricted-access.mjs';
import {aptitudeChoiceOptions,aptitudeChoiceStatus} from './aptitude-choices.mjs';
import {equipmentUse} from './equipment-use.mjs';
const EQUIPMENT_TYPES=['weapon','armor','shield','equipment','consumable','ammunition','container','treasure','kit','document','formula','service'];
// Escolha só conta quando ao menos uma opção CONCRETA atende TODOS os requisitos
// (requirementsFor com allowPendingChoice=false sobre um candidato temporário
// com a escolha aplicada). O item original nunca é alterado nem a escolha é
// gravada. Não há pré-teste descartando alternativas: cada opção é avaliada
// por inteiro, com seus próprios requisitos.
function choiceEligible(candidate,actor){
 const status=aptitudeChoiceStatus(candidate);
 if(!status.required)return false;
 return aptitudeChoiceOptions(candidate).some(option=>{
  const withChoice={type:candidate.type,flags:candidate.flags,system:{...candidate.system,choice:{kind:status.kind,key:option.id}}};
  return requirementsFor(withChoice,actor,[],false).valid;
 });
}
export function requirementGate(row,actor){
 // D146: o filtro segue a autonomia D145. Origem/conteúdo publicado não
 // exige aprovação individual; ownership continua no catálogo e na aquisição.
 // Estados: 'blocked' (combinação de origens inválida),
 // 'unknown' (sem regra confiável — nunca aprovado), 'choice' (exige
 // escolha e ao menos uma opção concreta atende todos os requisitos),
 // 'ok' (requisitos configurados e todos atendidos), 'missing' (não atendidos).
 if(!row||row.builtin||row.documentName==='Actor')return 'unknown';
 const candidate={type:row.type,flags:row.requirementFlags,system:row.ruleSystem};
 if(packageAcquisitionProblems(candidate,actor).length)return 'blocked';
 // Uchiha/Hatake históricos têm identidade de origem e regra cadastrada,
 // mas não gravam ruleId. Consultar essa regra explícita, sem inferir por nome.
 if(originGrant(candidate)&&!itemRuleId(candidate)&&ITEM_RULES[candidate.system?.contentId])candidate.system={...candidate.system,ruleId:candidate.system.contentId};
 // Equipamentos canônicos reutilizam equipmentUse. "Somente requisitos
 // atendidos" não afrouxa os requisitos: configured e não atendido é missing —
 // a posse segue permitida porque o filtro nunca modifica canAdd.
 if(EQUIPMENT_TYPES.includes(row.type)&&!itemRuleId(candidate)){
  const use=equipmentUse(candidate,actor?.system,actor?.items??[]);
  return use.configured?(use.valid?'ok':'missing'):'unknown';
 }
 const status=aptitudeChoiceStatus(candidate);
 // Escolha pendente: com allowPendingChoice=true a linha choice conta como
 // atendida e r.valid pode ser true; a decisão real é a avaliação de cada
 // opção concreta com allowPendingChoice=false. Escolha já publicada e válida
 // (system.choice presente) segue normalmente para a checagem de r.valid.
 if(status.required&&!status.valid){
  return choiceEligible(candidate,actor)?'choice':'missing';
 }
 const r=requirementsFor(candidate,actor,[],true);
 if(!r.configured)return 'unknown';
 if(r.valid)return 'ok';
 return 'missing';
}
