import {conditionPenalty,conditionMovement,conditionHaste} from './condition-effects.mjs';
import {attributeEffect,flatEffect} from './transformation-core.mjs';
// SNS MF1. Pure calculations; references: F01 pp19–36,21,24,258,260; D025/D031/D032/D092.
import { SKILLS, EVOLUTION } from "./rules.mjs";
import {applyResourceMaximum} from './characteristic-effects.mjs';
import {investmentBudget} from './investment-budget.mjs';
import {progressionBudget} from './progression-budget.mjs';
export const ATTRIBUTES = [
  ["for", "FOR", "Força"], ["des", "DES", "Destreza"], ["agi", "AGI", "Agilidade"],
  ["per", "PER", "Percepção"], ["int", "INT", "Inteligência"], ["vig", "VIG", "Vigor"],
  ["esp", "ESP", "Espírito"], ["car", "CAR", "Carisma"], ["man", "MAN", "Manipulação"]
];
export const COMBAT = [
  ["cc", "Corpo a corpo", "for"], ["cd", "À distância", "des"],
  ["esq", "Esquiva", "agi"], ["lm", "Ler movimento", "per"]
];
export const TABS = [
  ["character", "Personagem", "fa-address-card"], ["actions", "Ações", "fa-diamond"],
  ["inventory", "Inventário", "fa-backpack"], ["jutsus", "Jutsus", "fa-wand-magic-sparkles"],
  ["crafting", "Produção", "fa-hammer"], ["skills", "Perícias", "fa-hand"],
  ["features", "Características", "fa-medal"], ["effects", "Efeitos", "fa-person-rays"], ["bio", "Bio", "fa-book-open"]
];
const sum = a => a.reduce((v, x) => v + x, 0);
const number = v => Number.isFinite(Number(v)) ? Number(v) : 0;
export const displayValue = value => value === null || value === undefined ? "—" : String(value);
export const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, c =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
export function calculate(system,effects=[],items=null) {
  const original = Object.fromEntries(ATTRIBUTES.map(([k]) => [k, number(system.attributes?.[k])]));
  const unsized = Object.fromEntries(ATTRIBUTES.map(([k])=>[k,original[k]+attributeEffect(effects,k)]));
  const a = Object.fromEntries(ATTRIBUTES.map(([k])=>[k,original[k]+attributeEffect(effects,k,'size')]));
  const nc = number(system.nc ?? 4), row = EVOLUTION.find(r => r.nc === nc);
  const issues = [];
  const modifier = key => {
    const m = system.modifiers?.[key] ?? {};
    const value = number(m.value);
    if (value && !m.origin?.trim()) issues.push("Identifique a origem do modificador: " + key + ".");
    return { value, origin: m.origin || "Ajuste manual" };
  };
  const combat = Object.fromEntries(COMBAT.map(([k, , attr]) => {
    const base = number(system.bases?.[k] ?? 3), normal = base + (k==='cc'?unsized[attr]:a[attr]), m = modifier(k);
    const lost=k==='esq'&&effects.some(e=>e.kind==='condition'&&e.key==='desprevenido')?Math.max(0,m.value)+effects.filter(e=>e.kind==='flatModifier'&&e.target==='esq'&&e.value>0).reduce((n,e)=>n+e.value,0):0;
    return [k, { base, normal, precision: normal + m.value + conditionPenalty(effects,k)+flatEffect(effects,k)-lost, modifier: m }];
  }));
  const skills = Object.fromEntries(SKILLS.map(s => {
    const bought = number(system.skills?.[s.key]?.bought);
    const override=effects.find(e=>e.kind==='skillOverride'&&e.target===s.key),level=override?.value??(Math.ceil(a[s.attribute]/2)+bought),m=modifier('skill_'+s.key);
    const trained = bought > 0||!!override;
    let available = !s.training || trained;
    if (s.key === "veneficio") available &&= !!system.access?.quimico||effects.some(e=>e.kind==='skillAccess'&&e.target==='veneficio');
    if (s.key === "voo") available &&= !!system.access?.voo||!!override;
    if (bought > Math.floor(nc / 2)) issues.push(s.name + ": compra acima do limite do NC.");
    return [s.key, { ...s, bought, level, precision: level + m.value + conditionPenalty(effects,"skill:"+s.key)+flatEffect(effects,'skill:'+s.key), trained, available, modifier: m }];
  }));
  const grants = { attributes: 0, skills: 0, powers: 0, social: 0 }, ids = new Set();
  let effectiveGrants=system.budgets?.grants??[];
  try{effectiveGrants=progressionBudget({...system,nc}).grants;}catch(error){issues.push(error.message);}
  for (const grant of effectiveGrants) {
    if (!grant.id || ids.has(grant.id)) { issues.push("Concessão duplicada ou sem identificação."); continue; }
    ids.add(grant.id);
    if (grant.category in grants) grants[grant.category] += number(grant.amount);
  }
  const investment=items===null?null:investmentBudget(system,items);
  if(investment)issues.push(...investment.pending,...investment.issues);
  const used = {
    attributes: sum(ATTRIBUTES.slice(0, 7).map(([k]) => original[k])),
    skills: sum(Object.values(skills).map(s => s.bought)),
    powers: investment?.spent??number(system.budgets?.powersSpent), social: original.car + original.man
  };
  const budgets = Object.fromEntries(Object.keys(grants).map(k => [k, { granted: grants[k], spent: used[k], balance: grants[k] - used[k] }]));
  for (const [k, b] of Object.entries(budgets)) {
    if (b.balance < 0) issues.push("Gasto superior à concessão: " + k + ".");
    if (system.phase === "creation" && k !== "social" && b.balance > 0)
      issues.push("Na criação, ainda há pontos para distribuir: " + k + ".");
  }
  for (const [k, abbr] of ATTRIBUTES.slice(0, 7)) {
    if (original[k] > nc) issues.push(abbr + ": acima do NC.");
    if (row && original[k] < row.minimo_atributo) issues.push(abbr + ": abaixo do mínimo do NC; revisar antes de evoluir.");
  }
  if (a.car > Math.floor(nc / 2) || a.man > Math.floor(nc / 2)) issues.push("Atributo social acima de floor(NC/2).");
  const bases = COMBAT.map(([k]) => combat[k].base);
  if (!system.access?.basesOverride && (sum(bases) !== 12 || sum(bases.map(b => Math.max(0, b - 3))) > 2))
    issues.push("Bases de combate: conservar 12 e transferir no máximo 2 pontos.");
  const vitalityMax = 10 + 3 * unsized.vig + 5 * nc, chakraBaseMax = 10 + 3 * unsized.esp,chakraMax=applyResourceMaximum(chakraBaseMax,effects);
  for (const [key, max] of [["vitality", vitalityMax], ["chakra", chakraMax]]) {
    const current = system.resources?.[key]?.value;
    if (current !== null && current !== undefined && current > max) issues.push("Atual acima do máximo: " + key + "; revise explicitamente.");
  }
  const movement = Math.min(1,...effects.filter(e=>e.kind==='movementLimit').map(e=>e.value))*conditionMovement(Math.max(1,10 + Math.ceil((a.agi+attributeEffect(effects,'agi','movement')-attributeEffect(effects,'agi'))*(conditionHaste(effects)?2:1) / 2) + modifier("movement").value+flatEffect(effects,'movement')),effects);
  const jumpMax = 5 + Math.floor(skills.atletismo.level / 2);
  const availableMovement = system.movement?.available;
  const jump = availableMovement === null || availableMovement === undefined ? jumpMax : Math.min(jumpMax, availableMovement);
  return {
    attributes: a, originalAttributes:original, combat, skills, budgets, investment, issues, evolution: row,
    vitalityMax, chakraMax, chakraBaseMax,resourceEffects:effects.filter(e=>e.kind==='resourceMaximumRatio'), movement, jumpMax, jump,
    fixedDodge: 9 + combat.esq.precision,
    initiative: a.agi + skills.prontidao.level + modifier("initiative").value + conditionPenalty(effects,"initiative")+conditionHaste(effects),
    initiativeOrigin: modifier("initiative").origin
  };
}
export function testSpec(system, key, adjustment = 0, context = "", effects = []) {
  const d = calculate(system,effects);
  let name, precision, die = "2d8", detail;
  if (key === "initiative") {
    name = "Iniciativa"; die = "1d8"; precision = d.initiative;
    detail = "AGI " + d.attributes.agi + " + Prontidão nível " + d.skills.prontidao.level;
  } else if (["cc", "cd", "lm"].includes(key)) {
    name = COMBAT.find(([k]) => k === key)[1]; precision = d.combat[key].precision;
    detail = "Normal " + d.combat[key].normal + "; " + d.combat[key].modifier.origin + " " + d.combat[key].modifier.value;
  } else if (key.startsWith("skill:")) {
    const s = d.skills[key.slice(6)];
    if (!s || !s.available) throw new Error("Perícia indisponível: confira treinamento e acesso.");
    name = s.name; precision = s.precision; detail = "Nível " + s.level + "; " + s.modifier.origin + " " + s.modifier.value;
  } else if (key.startsWith("attribute:")) {
    const k = key.slice(10), attr = ATTRIBUTES.find(([id]) => id === k);
    if (!attr) throw new Error("Atributo inválido.");
    name = attr[2]; precision = d.originalAttributes[k]+attributeEffect(effects,k,'tests')+attributeEffect(effects,k,'size')-attributeEffect(effects,k) + conditionPenalty(effects,key)+flatEffect(effects,key); detail = "Teste direto do atributo";
  } else throw new Error(key === "esq" ? "Esquiva normal é uma reação fixa." : "Teste desconhecido.");
  const value = Number(adjustment);
  if (!Number.isInteger(value)) throw new Error("Modificador do teste deve ser inteiro.");
  if (value && !context.trim()) throw new Error("Informe a origem do modificador contextual.");
  const totalModifier = precision + value;
  return { key, name, die, precision, adjustment: value, context, detail,
    formula: die + (totalModifier < 0 ? " - " + -totalModifier : " + " + totalModifier) };
}
