// SNS MF1 · Contabilidade PURA de investimento de pontos de poder (PP).
// Referências literais: Básico pp.19–22 (Criação Genin), pp.56–57 (Adquirindo aptidões),
// pp.85–86 (Comprando poderes); decisões D025/D031/D139 e conferência do supervisor.
// Regra adotada: poder custa 1PP por nível inteiro (desde zero, sem dobrar clã/hijutsu);
// aptidão adicional custa 2PP; as 3 escolhas gratuitas são APTIDÕES (nunca poderes).
//
// PUREZA E LIMITES DE RESPONSABILIDADE:
// - Este módulo não importa Foundry, não lê `game`, não grava e não altera a entrada.
// - Ele apenas CALCULA o investimento declarado na lista de itens e produz pendências.
// - Saldo/concessão de pontos é responsabilidade do kernel (budgets), não daqui.
// - O registro `flags['sns-v14-dev'].acquisition` é um registro FUTURO de aquisição:
//   este helper lê, mas NÃO escreve, NÃO valida permissões de escrita e NÃO aplica
//   exceções. A camada futura do mestre decidirá o que pode ser registrado.
// - O modo `granted` aqui verifica apenas a existência estrutural da origem
//   (sourceId presente, sem autorreferência, sem ciclo). A AUTORIZAÇÃO SEMÂNTICA
//   da concessão (se aquele poder/aptidão realmente concede aquilo) é
//   responsabilidade EXCLUSIVA da futura camada de aquisição; este helper não a valida.
// - `legacySpent` é INFORMATIVO: ecoado, nunca somado aos itens, nunca apagado.
//   A migração de registros legados será decidida pela camada futura.
// - Aritmética segura: custos são inteiros seguros (>= 0). Infinity, NaN,
//   inteiros fora de Number.isSafeInteger e coerção de string NÃO são custos.
//   Se a soma ultrapassa o limite de inteiro seguro, o total é limitado
//   tecnicamente a Number.MAX_SAFE_INTEGER e sinalizado em `issues`/`pending`/`overflow`:
//   nunca Infinity/NaN e nunca um zero silencioso disfarçado de total conhecido.

const FLAGS_SCOPE = "sns-v14-dev";
const MODES = new Set(["free", "paid", "granted", "manual"]);
const MAX_SPENT = Number.MAX_SAFE_INTEGER;

// Custo/nível válido: number, inteiro SEGURO, >= 0. Sem coerção de string,
// sem arredondamento, sem NaN, sem Infinity, sem negativos.
const isCostInteger = value =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;

const systemOf = item => {
  const sys = item?.system;
  if (sys && typeof sys.toObject === "function") return sys.toObject();
  return sys ?? {};
};

const acquisitionOf = item => {
  const acquisition = item?.flags?.[FLAGS_SCOPE]?.acquisition;
  return acquisition && typeof acquisition === "object" ? acquisition : null;
};

// Identidade vem de contentId/ruleId/definitionId, nunca do nome.
const identityOf = sys =>
  String(sys?.contentId || sys?.ruleId || sys?.power?.definitionId || "");

const choiceKeyOf = sys =>
  String(sys?.choice?.kind ?? "") + "|" + String(sys?.choice?.key ?? "");

// Ciclo de concessões: percorre a cadeia granted item -> origem -> origem da origem...
const hasGrantCycle = (grants, startId) => {
  const visited = new Set();
  let current = startId;
  while (grants.has(current)) {
    if (visited.has(current)) return true;
    visited.add(current);
    current = grants.get(current);
    if (!current) return false;
  }
  return false;
};

export function powerInvestment(items, options = {}) {
  const legacySpent = options.legacySpent ?? 0; // informativo; nunca somado
  const freeLimit = isCostInteger(options.freeLimit) ? options.freeLimit : 3;
  const eligibilityCallback =
    typeof options.isFreeEligible === "function" ? options.isFreeEligible : null;

  const pending = [];
  const issues = [];
  const rows = [];
  let powerSpent = 0;
  let aptitudeSpent = 0;
  let freeUsed = 0;
  let overflow = false;

  // Soma segura: acumula custos inteiros seguros. Se ultrapassa o limite de
  // inteiro seguro, marca overflow, limita tecnicamente o acumulador a
  // MAX_SAFE_INTEGER (valor finito) e sinaliza — o total passa a ser
  // INCOMPLETO, não um total válido.
  const safeAdd = (accumulator, cost) => {
    if (cost > MAX_SPENT - accumulator) {
      overflow = true;
      return MAX_SPENT;
    }
    return accumulator + cost;
  };

  // Deduplicação apenas da MESMA instância (mesmo id repetido na lista de entrada).
  // Dois documentos com ids diferentes nunca são mesclados aqui.
  const list = [];
  const seenIds = new Set();
  for (const item of Array.isArray(items) ? items : []) {
    if (!item || typeof item !== "object") continue;
    const id = String(item.id ?? "");
    if (id && seenIds.has(id)) continue;
    if (id) seenIds.add(id);
    list.push(item);
  }

  const presentIds = new Set(list.map(i => String(i.id ?? "")).filter(Boolean));
  const grantChains = new Map();
  for (const item of list) {
    const acquisition = acquisitionOf(item);
    if (acquisition?.mode === "granted")
      grantChains.set(String(item.id ?? ""), String(acquisition.sourceId ?? ""));
  }

  // Aviso de duplicata do MESMO poder em documentos DIFERENTES (ids distintos,
  // mesma identidade de conteúdo): registra para o supervisor revisar;
  // nenhum registro é apagado ou migrado aqui.
  const samePowerSeen = new Map();

  for (const item of list) {
    const sys = systemOf(item);
    const id = String(item.id ?? "");
    const type = String(item.type ?? "");
    const acquisition = acquisitionOf(item);
    const rawMode = acquisition ? acquisition.mode : undefined;
    const mode =
      typeof rawMode === "string" && MODES.has(rawMode) ? rawMode : null;
    const identity = identityOf(sys);

    const row = {
      id,
      name: String(item.name ?? ""),
      type,
      mode: mode,
      identity,
      choice: { kind: sys?.choice?.kind ?? null, key: sys?.choice?.key ?? null },
      cost: 0,
      known: true,
      free: false,
      grantedBy: null,
      pending: false,
      notes: []
    };
    const addPending = message => {
      row.pending = true;
      row.known = false;
      row.notes.push(message);
      pending.push((row.name || id || type) + ": " + message);
    };
    const addNote = message => row.notes.push(message);

    if (type !== "power" && type !== "aptitude") {
      // Jutsus, efeitos, clãs/origens e equipamento não consomem PP por existirem.
      // Técnicas concedidas já são excluídas pelo tipo; não contar de novo.
      addNote("Não usa PP.");
      rows.push(row);
      continue;
    }

    if (type === "power" && identity) {
      const key = identity + "|" + choiceKeyOf(sys);
      if (samePowerSeen.has(key))
        issues.push(
          "Mesmo poder em documentos diferentes (" + key + "; instâncias " +
          samePowerSeen.get(key) + " e " + (id || "sem id") +
          "). Revise os itens duplicados."
        );
      else samePowerSeen.set(key, id);
    }

    if (acquisition && mode === null) {
      addPending("modo de aquisição desconhecido: " + String(rawMode) + ".");
    } else if (mode === "granted") {
      const sourceId = String(acquisition.sourceId ?? "");
      row.grantedBy = sourceId || null;
      if (!sourceId) addPending("concessão sem origem definida.");
      else if (id && sourceId === id) addPending("concessão inválida: o item não pode conceder a si mesmo.");
      else if (!presentIds.has(sourceId))
        addPending("origem ausente da ficha: " + sourceId + ".");
      else if (hasGrantCycle(grantChains, id))
        addPending("concessões circulares: revise as origens.");
      else {
        // Custo zero, mas a autorização semântica da concessão cabe à futura
        // camada de aquisição; aqui apenas a estrutura da origem foi verificada.
        row.cost = 0;
        addNote("concedido por " + sourceId + "; sem custo em PP.");
      }
    } else if (mode === "manual") {
      const cost = acquisition.cost;
      const reason = String(acquisition.reason ?? "").trim();
      if (!isCostInteger(cost))
        addPending("custo inválido: informe um inteiro não negativo (atual: " + String(cost) + ").");
      else if (!reason) addPending("informe o motivo do custo personalizado.");
      else {
        row.cost = cost; // custo manual declarado substitui o custo normal
        addNote("custo manual " + cost + "PP; motivo: " + reason + ".");
      }
    } else if (type === "power") {
      if (mode === "free") {
        // As três gratuitas são aptidões; modo free não se aplica a poder.
        addPending("vagas gratuitas são exclusivas de aptidões.");
      } else {
        const level = sys?.level;
        if (!isCostInteger(level))
          addPending("nível inválido: informe um inteiro não negativo (atual: " + String(level) + ").");
        else {
          row.cost = level; // 1PP por nível inteiro; clã/hijutsu NÃO dobra.
          if (mode === null)
            addNote("Compra: 1 PP por nível.");
          else addNote("custo " + level + "PP por nível " + level + ".");
        }
      }
    } else {
      // type === "aptitude"
      if (mode === "paid") {
        row.cost = 2; // aptidão adicional custa 2PP; details.powerCost não decide o modo.
      } else if (mode === "free") {
        let eligible = null;
        if (eligibilityCallback) {
          try { eligible = eligibilityCallback(item); } catch { eligible = null; }
        }
        if (eligible !== true) {
          addPending(
            "aptidão gratuita: " +
            (eligible === false ? "não elegível" : "elegibilidade não definida") + "."
          );
        } else if (freeUsed >= freeLimit) {
          issues.push(
            "Alerta: limite de " + freeLimit + " aptidões gratuitas excedido na " +
            (freeUsed + 1) + "ª escolha (" + (row.name || id) + "). Revise as aquisições."
          );
          addPending("acima do limite de " + freeLimit + " aptidões gratuitas.");
        } else {
          row.free = true;
          row.cost = 0;
          freeUsed++;
          addNote("aptidão gratuita " + freeUsed + "/" + freeLimit + ".");
        }
      } else {
        // Falta de modo numa aptidão é pendência; nunca compra paga automática.
        addPending("escolha uma vaga gratuita ou o custo de 2 PP para esta aptidão.");
      }
    }

    if (!row.pending) {
      if (type === "power") powerSpent = safeAdd(powerSpent, row.cost);
      else if (type === "aptitude") aptitudeSpent = safeAdd(aptitudeSpent, row.cost);
    }
    rows.push(row);
  }

  // Total final também protegido: nunca Infinity/NaN. Se houve overflow em
  // qualquer acumulador, o total é sinalizado como incompleto.
  let spent;
  if (overflow || aptitudeSpent > MAX_SPENT - powerSpent) {
    overflow = true;
    spent = MAX_SPENT;
    issues.push(
      "A soma excede o máximo aceito, " +
      MAX_SPENT + " PP. Revise os custos dos itens."
    );
    pending.push("total de PP indisponível: a soma dos custos é excessiva.");
  } else {
    spent = powerSpent + aptitudeSpent; // soma somente custos conhecidos
  }

  return { spent, powerSpent, aptitudeSpent, freeUsed, freeLimit, rows, pending, issues, legacySpent, overflow };
}
