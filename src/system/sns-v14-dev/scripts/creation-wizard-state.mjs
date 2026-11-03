// D143 · Assistente de criação de PJ — estado PURO por etapa.
// Este helper NÃO calcula economia: recebe a view produzida por sheetView
// (source, d, budgets, investment, issues, grants, skills, items) e apenas
// organiza o que cada etapa do guia exibe, quais pendências existem e se a
// ficha está pronta. Desconhecido nunca conta como validado.
// Regras: Básico19–22; decisões D025/D031/D139; vagas gratuitas restantes
// são AVISO, nunca bloqueio novo. Etapas opcionais não inventam exigências.
// Ajustes de revisão: (1) limite de poder vem de view.d.evolution.limite_
// poder_pericia, nunca número duplicado; (2) requisitos conhecidos não
// atendidos chegam em view.requirementReview (calculados pela classe com
// requirementsFor(item, actor)); equipamento não é bloqueado por requisito
// de uso; requisitos desconhecidos são aviso de conferência do mestre;
// (3) completed reflete source.phase==='evolution' — a fase é a autoridade;
// (4) sociais não usados são aviso, não pendência; (5) null/undefined/
// string vazia permanecem DESCONHECIDOS (nunca coercidos a 0); (6) zero é
// número VÁLIDO para freeUsed/ryō — exibir 0, não "—"; (7) a revisão soma
// as pendências das outras etapas MAIS requisito/limite da própria revisão;
// (8) prevStepId/nextStepId alimentam Anterior/Próximo com IDs válidos.

export const CREATION_STEPS = Object.freeze([
  { id: "points",     label: "Pontos iniciais e NC",    optional: false },
  { id: "origin",     label: "Origem, clã e hijutsu",  optional: true },
  { id: "attributes", label: "Atributos e sociais",    optional: false },
  { id: "skills",     label: "Perícias",                optional: false },
  { id: "powers",     label: "Poderes e aptidões",      optional: false },
  { id: "jutsus",     label: "Primeiros jutsus",        optional: true },
  { id: "equipment",  label: "Equipamento",             optional: true },
  { id: "review",     label: "Revisão",                 optional: false }
]);

const STEP_IDS = new Set(CREATION_STEPS.map(s => s.id));

export const isCreationStepId = id => STEP_IDS.has(String(id ?? ""));

const stepById = id => CREATION_STEPS.find(s => s.id === id);

const asArray = value => Array.isArray(value) ? value : [];
// Desconhecido permanece desconhecido: null/undefined/string vazia NÃO são
// coeridos a 0. A view real fornece números; ausência é ausência. Zero é
// válido e continua zero.
const asNumber = value => {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" && !value.trim()) return null;
  const n = Number(value);
  return Number.isSafeInteger(n) ? n : null;
};

// Orçamentos chegam prontos da view (array de {key,label,...,granted,spent,
// balance} em view.budgets, ou objeto em d.budgets). Nunca recalculamos saldo.
function budgetOf(view, key) {
  const fromList = asArray(view.budgets).find(b => b?.key === key);
  if (fromList) return fromList;
  const fromD = view.d?.budgets?.[key];
  if (fromD && typeof fromD === "object") return { key, ...fromD };
  return null;
}

function allBudgets(view) {
  if (Array.isArray(view.budgets) && view.budgets.length) return view.budgets;
  const d = view.d?.budgets;
  if (d && typeof d === "object")
    return Object.entries(d).map(([key, b]) => ({ key, ...b }));
  return [];
}

function issuesOf(view) {
  return asArray(view.issues ?? view.d?.issues);
}

function grantsOf(view) {
  const grants = asArray(view.grants ?? view.source?.budgets?.grants);
  return grants.map(g => ({
    id: g.id ?? null,
    category: g.category ?? null,
    label: g.label ?? (g.category ? String(g.category) : "Concessão"),
    amount: g.amount ?? 0
  }));
}

function investmentOf(view) {
  const investment = view.investment ?? view.d?.investment ?? null;
  return investment && typeof investment === "object" ? investment : null;
}

// Desconhecido nunca conta como validado: só `complete === true` valida.
const investmentComplete = investment =>
  !!investment && investment.complete === true;

function freeRemaining(investment) {
  if (!investment) return null;
  const limit = asNumber(investment.freeLimit);
  const used = asNumber(investment.freeUsed);
  return Number.isSafeInteger(limit) && Number.isSafeInteger(used)
    ? Math.max(0, limit - used)
    : null;
}

// Zero é conhecido: freeUsed=0 e freeLimit=3 são exibidos como "0 / 3".
function freeKnown(investment) {
  return !!investment && asNumber(investment.freeUsed) !== null && asNumber(investment.freeLimit) !== null;
}

const CATEGORY_LABELS = {
  features: "Origem, clã e hijutsu", powers: "Poderes",
  aptitudes: "Aptidões", techniques: "Jutsus"
};
const EQUIPMENT_CATEGORIES = ["weapons", "armor", "equipment", "consumables", "ammunition", "treasures", "containers"];

function itemsOf(view) {
  return asArray(view.items).map(i => ({
    id: i.id ?? null, name: String(i.name ?? ""), img: i.img ?? "",
    category: i.category ?? null, level: i.level ?? null
  }));
}

const skillsOf = view => asArray(view.skills ?? Object.values(view.d?.skills ?? {}))
  .map(s => ({
    key: s.key ?? null, name: String(s.name ?? ""), bought: s.bought ?? 0,
    level: s.level ?? null, available: s.available !== false, trained: !!s.trained
  }));

// Limite de nível de poder/perícia: SEMPRE da view (d.evolution), sem duplicar.
const powerLimitOf = view => asNumber(view.d?.evolution?.limite_poder_pericia);

// Requisitos conferidos pela classe via requirementsFor(item, actor).
// Cada linha: { name, status: 'ok'|'unmet'|'unknown', problems: [] }.
// status ausente ou irreconhecível é tratado como desconhecido (aviso).
function requirementRowsOf(view) {
  return asArray(view.requirementReview).map(r => ({
    name: String(r?.name ?? ""),
    status: ["ok", "unmet", "unknown"].includes(r?.status) ? r.status : "unknown",
    problems: asArray(r?.problems).map(p => String(p))
  }));
}

// Poderes acima do limite do NC. Sem limite conhecido ou sem nível declarado
// não validamos automaticamente: viram aviso, nunca aprovação silenciosa.
function powerLimitFindings(view) {
  const limit = powerLimitOf(view);
  const powers = itemsOf(view).filter(i => i.category === "powers");
  if (limit === null) return { limit: null, over: [], unchecked: powers.map(p => p.name) };
  const over = [], unchecked = [];
  for (const power of powers) {
    const level = asNumber(power.level);
    if (level === null) unchecked.push(power.name);
    else if (level > limit) over.push({ name: power.name, level, limit });
  }
  return { limit, over, unchecked };
}

// Pendências de uma etapa. Etapas opcionais nunca recebem pendência inventada:
// ausência de origem, jutsus ou equipamento não bloqueia a criação. Sociais não
// usados NÃO são pendência (aviso); apenas gasto acima da concessão bloqueia.
function stepPending(view, grants, investment, stepId, findings, requirements) {
  const pending = [];
  const push = message => pending.push(String(message));
  const overspent = (budget, what) => {
    if (!budget) return;
    const balance = asNumber(budget.balance);
    if (Number.isSafeInteger(balance) && balance < 0)
      push("Distribuição acima da concessão: " + (budget.label ?? what) + " (" + balance + ").");
  };
  const remaining = (budget, what) => {
    if(view.source?.phase==='evolution')return;
    if (!budget) return;
    const balance = asNumber(budget.balance);
    if (Number.isSafeInteger(balance) && balance > 0)
      push("Ainda há " + balance + " ponto(s) para distribuir: " + (budget.label ?? what) + ".");
  };

  if (stepId === "points") {
    if (!grants.length)
      push("Escolha o NC e comece a distribuição para registrar os pontos iniciais da tabela.");
    else for (const b of allBudgets(view)) overspent(b, b.label ?? b.key);
  } else if (stepId === "attributes") {
    remaining(budgetOf(view, "attributes"), "Atributos");
    overspent(budgetOf(view, "attributes"), "Atributos");
    // Sociais: saldo positivo é AVISO (stepWarnings); só o negativo bloqueia.
    overspent(budgetOf(view, "social"), "Sociais");
  } else if (stepId === "skills") {
    remaining(budgetOf(view, "skills"), "Perícias");
    overspent(budgetOf(view, "skills"), "Perícias");
  } else if (stepId === "powers") {
    for (const message of asArray(investment?.pending)) push(message);
    remaining(budgetOf(view, "powers"), "Poderes");
    overspent(budgetOf(view, "powers"), "Poderes");
  } else if (stepId === "review") {
    for (const s of findings.over)
      push("Poder " + s.name + " (nível " + s.level + ") acima do limite do NC (limite " + s.limit + "); confira antes de concluir.");
    for (const r of requirements.filter(r => r.status === "unmet"))
      push("Requisitos não atendidos em " + (r.name || "item") + ": " + (r.problems.join(" ") || "verifique a ficha."));
  }
  return pending;
}

// Avisos não bloqueiam: são orientação/conferência, nunca regra nova.
function stepWarnings(view, investment, stepId, findings, requirements) {
  const warnings = [];
  if (stepId === "powers") {
    const rest = freeRemaining(investment);
    if (rest === null) warnings.push("Defina as vagas de aptidões gratuitas nas aquisições.");
    else if (rest > 0) warnings.push("Restam " + rest + " aptidão(ões) gratuita(s) a escolher — aviso, não bloqueio.");
  } else if (stepId === "attributes") {
    const social = budgetOf(view, "social");
    const balance = asNumber(social?.balance);
    if (Number.isSafeInteger(balance) && balance > 0)
      warnings.push("Restam " + balance + " ponto(s) sociais a distribuir — aviso, não bloqueio.");
  } else if (stepId === "review") {
    if (findings.limit === null)
      warnings.push("Limite de poder do NC desconhecido: confira os níveis dos poderes antes de concluir.");
    for (const name of findings.unchecked)
      warnings.push("Nível do poder " + (name || "sem nome") + " não informado; verifique o limite do NC.");
    for (const r of requirements.filter(r => r.status === "unknown"))
      warnings.push("Requisitos de " + (r.name || "item") + " sem verificação disponível: veja a descrição.");
  }
  return warnings;
}

function dataFor(view, stepId, grants, investment, findings, requirements) {
  const items = itemsOf(view);
  const byCategory = category => items.filter(i => i.category === category);
  if (stepId === "points")
    return { grants, budgets: allBudgets(view) };
  if (stepId === "origin")
    return { features: byCategory("features") };
  if (stepId === "attributes")
    return {
      attributeBudget: budgetOf(view, "attributes"),
      socialBudget: budgetOf(view, "social")
    };
  if (stepId === "skills")
    return { skills: skillsOf(view), skillsBudget: budgetOf(view, "skills") };
  if (stepId === "powers")
    return {
      powers: byCategory("powers"), aptitudes: byCategory("aptitudes"),
      powersBudget: budgetOf(view, "powers"),
      investmentPending: asArray(investment?.pending),
      spent: investment?.spent ?? null,
      powerSpent: investment?.powerSpent ?? null,
      aptitudeSpent: investment?.aptitudeSpent ?? null,
      freeUsed: investment?.freeUsed ?? null, freeLimit: investment?.freeLimit ?? null,
      freeKnown: freeKnown(investment)
    };
  if (stepId === "jutsus")
    return { powers: byCategory("powers"), techniques: byCategory("techniques") };
  if (stepId === "equipment") {
    // ryō zero é VÁLIDO e exibido como 0; ausência é desconhecido ("—").
    const raw = view.source?.finances?.ryo;
    const known = raw !== null && raw !== undefined;
    return {
      equipment: items.filter(i => EQUIPMENT_CATEGORIES.includes(i.category)),
      ryoDisplay: known ? String(raw) : null,
      hasRyo: known
    };
  }
  if (stepId === "review")
    return {
      requirements,
      powerLimit: findings.limit,
      powersOverLimit: findings.over,
      powersUnchecked: findings.unchecked
    };
  return {};
}

// ready exige concessão registrada, investimento completo, ausência de issues
// atuais, nenhum poder ACIMA do limite conhecido do NC e nenhum requisito
// CONHECIDO não atendido. Requisitos desconhecidos e limite desconhecido não
// validam, mas também não inventam bloqueio: viram aviso de conferência.
export function creationReady(view) {
  const grants = grantsOf(view);
  const investment = investmentOf(view);
  const findings = powerLimitFindings(view);
  const requirements = requirementRowsOf(view);
  const hasGrants = grants.length > 0;
  const complete = investmentComplete(investment);
  const noIssues = issuesOf(view).length === 0;
  const powersWithinLimit = findings.over.length === 0;
  const requirementsMet = !requirements.some(r => r.status === "unmet");
  return {
    hasGrants, investmentComplete: complete, noIssues,
    powersWithinLimit, requirementsMet,
    get value() { return hasGrants && complete && noIssues && powersWithinLimit && requirementsMet; }
  };
}

export function creationWizardState(view, stepId, flags = {}) {
  if (!view || typeof view !== "object") throw new Error("View ausente: o guia precisa da sheetView atual.");
  const valid = isCreationStepId(stepId) ? String(stepId) : "points";
  const grants = grantsOf(view);
  const investment = investmentOf(view);
  const issues = issuesOf(view);
  const findings = powerLimitFindings(view);
  const requirements = requirementRowsOf(view);
  const ready = creationReady(view);

  const pendingFor = id => stepPending(view, grants, investment, id, findings, requirements);
  const warningsFor = id => stepWarnings(view, investment, id, findings, requirements);
  const statusFor = id => {
    if (id === "review") return ready.value ? "done" : "pending";
    if (pendingFor(id).length) return "pending";
    return warningsFor(id).length ? "attention" : "done";
  };

  const steps = CREATION_STEPS.map(s => ({
    ...s, active: s.id === valid, status: statusFor(s.id),
    pending: pendingFor(s.id), warnings: warningsFor(s.id)
  }));
  const current = steps.find(s => s.id === valid);
  const index = CREATION_STEPS.findIndex(s => s.id === valid);

  const reviewPending = steps
    .filter(s => !s.optional && s.id !== "review")
    .flatMap(s => s.pending);

  // A FASE é a autoridade: flag de jogador não conclui a ficha. A flag
  // `completed` registrada pelo GM acompanha a fase, nunca a substitui.
  const completed = view.source?.phase === "evolution";
  const reviewRequested = flags.reviewRequested === true;

  return {
    stepId: valid,
    step: stepById(valid),
    steps, current,
    // Anterior/Próximo: IDs de etapa válidos calculados aqui (null nas bordas).
    prevStepId: index > 0 ? CREATION_STEPS[index - 1].id : null,
    nextStepId: index < CREATION_STEPS.length - 1 ? CREATION_STEPS[index + 1].id : null,
    // Revisão soma pendências das outras etapas MAIS requisito/limite da própria.
    pending: valid === "review" ? [...reviewPending, ...current.pending] : current.pending,
    warnings: current.warnings,
    showBudgets: valid === "points" || valid === "review",
    budgets: valid === "points" || valid === "review" ? allBudgets(view) : [],
    grants, issues, ready,
    grantsCount: grants.length,
    completed, reviewRequested,
    canConclude: !completed && ready.value,
    data: dataFor(view, valid, grants, investment, findings, requirements),
    categoryLabels: CATEGORY_LABELS
  };
}
