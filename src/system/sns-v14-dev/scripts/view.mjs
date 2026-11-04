import {legadoView} from './legado-ui.mjs';
import {originGrant,ACCESS_ORIGINS} from './restricted-access.mjs';
import {weaponDamageProfile} from './damage-source.mjs';
import {poisonRecipe} from './poison-crafting.mjs';
import {transformationView} from './transformation-service.mjs';
import {isManagedCondition} from './condition-effects.mjs';
import {itemPresentation} from './item-view.mjs';
import {isAptitudePower} from './aptitude-jutsus.mjs';
import {weaponChecks} from './weapon-checks.mjs';
import {skillColor} from './stat-editor-state.mjs';
import {groupPowers} from './power-groups.mjs';
import {specialResourceView} from './special-resources.mjs';
import {activeAptitudeView} from './active-aptitudes.mjs';
import {temporaryEffects} from './temporary-effects.mjs';
import {characteristicEffects} from './characteristic-effects.mjs';
import { ATTRIBUTES, COMBAT, TABS, calculate, displayValue } from "./kernel.mjs";
import { signed } from './roll-components.mjs';
import {itemCategory} from './sheet-profiles.mjs';
export function sheetView(actor, { activeTab = "character", actionTab = "encounter", jutsuTab = "powers", isGM = false, editable = true } = {}) {
  const source = typeof actor.system.toObject === "function" ? actor.system.toObject() : actor.system;
  const d = calculate(source,characteristicEffects(actor),actor.items??[]), basePath = "systems/sns-v14-dev";
  for(const budget of Object.values(d.budgets))budget.excess=Math.max(0,-budget.balance);
  const budgetLabels={attributes:'Atributos',skills:'Perícias',powers:'Poderes',social:'Sociais'};
  const skills=Object.values(d.skills).map(s=>({...s,signedPrecision:signed(s.precision),
    badgeColor:skillColor(s)}));
  const identityLabels = { clan: "Clã / Hijutsu · anotação", rank: "Nível shinobi", origin: "Vila de origem", village: "Vila atuante", tendency: "Tendência", gender: "Gênero", age: "Idade", size: "Tamanho", hand: "Lateralidade", nature: "Natureza principal · anotação", nature2: "Natureza secundária · anotação" };
  const items=Array.from(actor.items??[]).filter(item=>!item.flags?.['sns-v14-dev']?.craftProduct?.undone).map(item=>({...itemPresentation(item),tagsText:itemPresentation(item).tags.join(' ')}));
  const inventoryCategories = [["weapons","Armas"],["armor","Armaduras"],["equipment","Equipamentos"],["consumables","Consumíveis"],["ammunition","Munição"],["treasures","Objetos especiais"],["containers","Recipientes"]];
  const inventoryGroups = inventoryCategories.map(([id,label])=>({id,label,entries:items.filter(x=>x.category===id&&!x.temporaryFists)}));
  const actionGroups=[["standard","Ações"],["reaction","Reações"],["free","Ações livres"]].map(([id,label])=>({id,label,entries:items.filter(x=>x.category===id)}));
  return {
    mechanicalOrigins:[...new Set(Array.from(actor.items??[]).map(originGrant).filter(Boolean))].map(id=>ACCESS_ORIGINS[id]).join(' · '),mechanicalNatures:Array.from(actor.items??[]).filter(i=>i.type==='power'&&i.system.level>0&&['katon','suiton','doton','raiton','fuuton'].some(e=>i.system.contentId==='sns:power:'+e)).map(i=>i.name.replace(/ \(.*$/, '')).join(' · '),
    legado:legadoView(actor),actor, source, d, basePath, investment:d.investment,investmentRows:d.investment.rows.filter(r=>['power','aptitude'].includes(r.type)).map(r=>({...r,canChoose:r.type==='aptitude',costLabel:r.pending?'Definir aquisição':r.free?'Gratuita':r.cost+' PP'})),transformations:transformationView(actor), isGM, editable, activeTab,specialResources:specialResourceView(actor),activeAptitudes:activeAptitudeView(actor),temporaryEffects:temporaryEffects(actor),appliedEffectEntries:items.filter(i=>i.category==='effects'&&!isManagedCondition(actor.items.find(s=>s.id===i.id))),
    tabs: TABS.map(([id, label, icon]) => ({ id, label, icon, active: id === activeTab })),
    activeLabel: TABS.find(([id]) => id === activeTab)?.[1] ?? "Character",
    actionTab,jutsuTab,encounter:actionTab==="encounter",exploration:actionTab==="exploration",
    downtime:actionTab==="downtime",powers:jutsuTab==="powers",techniques:jutsuTab==="techniques",
    effects:jutsuTab==="effects",inventoryGroups,actionGroups,...groupPowers(items),languages:source.identity?.languages??"",senses:source.identity?.senses??"",
    techniqueEntries:items.filter(i=>i.category==='techniques'),
    weaponEntries:items.filter(i=>i.category==='weapons').map(i=>({...i,img:i.img==='icons/svg/item-bag.svg'?'icons/svg/sword.svg':i.img,cc:signed(d.combat.cc.precision),cd:signed(d.combat.cd.precision),weaponChecks:weaponChecks(i,Object.fromEntries(Object.entries(d.combat).map(([key,value])=>[key,value.precision])),source,actor.items).map(c=>{const p=weaponDamageProfile(actor,actor.items.get(i.id),c.key);return {...c,hasDamage:!!p,damageBase:p?.base,damageFormula:p?.formula};})})),
    featureGroups:[['features','Clãs e características'],['aptitudes','Aptidões']].map(([id,label])=>({id,label,icon:id==='aptitudes'?'fa-medal':'fa-dna',entries:items.filter(i=>i.category===id&&!isAptitudePower(i))})),
    explorationEntries:items.filter(x=>x.category==="exploration"),downtimeEntries:items.filter(x=>x.category==="downtime"),
    formulas:items.filter(x=>x.category==="formula"||poisonRecipe(actor.items.find(i=>i.id===x.id))&&!actor.items.find(i=>i.id===x.id)?.flags?.['sns-v14-dev']?.craftProduct),jutsuEntries:items.filter(x=>x.category===jutsuTab),
    load:items.filter(x=>inventoryCategories.some(([id])=>id===x.category)).length===0 ? "0" : "—",
    attributes: ATTRIBUTES.map(([key, abbr, label]) => ({ key, abbr, label, value: d.attributes[key] })),
    identity: Object.entries(identityLabels).slice(0,5).map(([key, label]) => ({ key, label, value: source.identity?.[key] ?? "" })),
    demographics: ["gender","age","size","hand"].map(key => ({key,label:identityLabels[key],value:source.identity?.[key] ?? ""})),
    natures: ["nature","nature2"].map(key => ({key,label:identityLabels[key],value:source.identity?.[key] ?? ""})),
    combat: COMBAT.map(([key, label]) => ({ key, label, ...d.combat[key],signedPrecision:signed(d.combat[key].precision), fixed: key === "esq", plain: key === "esq" || key === "lm" })),
    skills,generalSkills:skills.filter(s=>!s.special),specialSkills:skills.filter(s=>s.special),
    budgets: Object.entries(d.budgets).map(([key, v]) => ({key,label:budgetLabels[key],shortLabel:{attributes:'PA',skills:'Perícias',powers:'PP',social:'Sociais'}[key],...v})),
    biography: ["appearance", "history", "personality", "allies", "notes"].map((key, i) => ({
      key, label: ["Aparência", "História", "Personalidade", "Aliados e vínculos", "Notas de campanha"][i], value: source.biography?.[key] ?? ""
    })),
    vitality: source.resources?.vitality?.value ?? null, chakra: source.resources?.chakra?.value ?? null,
    vitalityDisplay: displayValue(source.resources?.vitality?.value), chakraDisplay: displayValue(source.resources?.chakra?.value),
    phaseLabel: source.phase === "evolution" ? "Evolução" : "Criação · rascunho",
    creation: source.phase !== "evolution",creationGuideStarted:!!actor.flags?.['sns-v14-dev']?.creationGuide?.step,
    evolutionGuideStarted:actor.flags?.['sns-v14-dev']?.evolutionGuide?.nc===source.nc&&!actor.flags?.['sns-v14-dev']?.evolutionGuide?.completed,
    movementAvailable: source.movement?.available ?? "",
    hasMovementAvailable:source.movement?.available!==null&&source.movement?.available!==undefined,
    ryo: displayValue(source.finances?.ryo),
    grants: (source.budgets?.grants ?? []).map(g=>({...g,label:budgetLabels[g.category]})),
    ncHistory:[...(actor.flags?.['sns-v14-dev']?.progressionHistory??[])].reverse().map(row=>({from:row.from,to:row.to})),
    issues:d.issues.map(i=>i.replace(/attributes|skills|powers|social|vitality|chakra/g,k=>({...budgetLabels,vitality:'Vitalidade',chakra:'Chakra'})[k])),
    issueCount:d.issues.length,
    items
  };
}
