// SNS/Foundry14 — Helper puro de tabela de encontros (lote D167).
// Fonte: Livro Básico SNS 4.1b, PDF p.281–282 (regras literais em reference/regras-orcamento.md).
// Escopo: reference/escopo.md — apenas sugestões do livro; não altera ficha de NPC,
// não acessa Foundry, fs, rede, relógio nem aleatoriedade. Helper determinístico e puro.

export const ENCOUNTER_SOURCE = "Básico 4.1b · p.281–282";

const NC_MIN = 4;
const NC_MAX = 20;
const PLAYERS_MIN = 1;
const PLAYERS_MAX = 20;
const BOSS_MAX_BONUS = 4;

function describeValue(value) {
  if (typeof value === "symbol") return `symbol ${value.toString()}`;
  if (typeof value === "bigint") return `bigint ${value}`;
  if (typeof value === "function") return `function`;
  if (typeof value === "string") return `string "${value}"`;
  return `${typeof value} ${String(value)}`;
}

function requireInteger(value, fieldName, min, max) {
  // Boolean é rejeitado aqui: typeof "boolean" não é "number".
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new TypeError(
      `${fieldName} deve ser um inteiro entre ${min} e ${max}; recebido ${describeValue(value)}.`,
    );
  }
  if (value < min || value > max) {
    throw new RangeError(
      `${fieldName} deve estar entre ${min} e ${max}; recebido ${value}.`,
    );
  }
  return value;
}

function requireOptions(options) {
  if (options === null || typeof options !== "object" || Array.isArray(options)) {
    throw new TypeError(
      `opções devem ser um objeto { partyNC, players, hasArea? }; recebido ${describeValue(options)}.`,
    );
  }
  return options;
}

/**
 * Sugestões de montagem de encontro com base no Básico 4.1b, p.281–282.
 * São sugestões do livro: não garantem equilíbrio e não alteram a ficha do NPC.
 *
 * - Capangas: um por PJ (Vitalidade 1, NC abaixo do do grupo); com ataques em área
 *   ou outras formas de lidar com muitos inimigos, até o dobro.
 * - Boss: NC do grupo + número de PJs, limitado a no máximo +4 NC.
 *   Se o resultado ultrapassa o suportado pelo sistema (NC 4–20), informa
 *   supported:false e PRESERVA o cálculo, sem clamp.
 *
 * @param {{partyNC: number, players: number, hasArea?: boolean}} options
 * @returns {{partyNC: number, players: number, capangas: {min: number, max: number, ncAdvice: string}, boss: {nc: number, supported: boolean}, source: string}}
 */
export function encounterAdvice(options) {
  const opts = requireOptions(options);

  const partyNC = requireInteger(opts.partyNC, "partyNC", NC_MIN, NC_MAX);
  const players = requireInteger(opts.players, "players", PLAYERS_MIN, PLAYERS_MAX);

  // hasArea estritamente booleano; apenas "ausente" (undefined) assume false.
  const hasArea = opts.hasArea === undefined ? false : opts.hasArea;
  if (typeof hasArea !== "boolean") {
    throw new TypeError(
      `hasArea deve ser booleano (true/false) ou omitido; recebido ${describeValue(opts.hasArea)}.`,
    );
  }

  const capangaMin = players; // um capanga por PJ (Vitalidade 1, NC abaixo do grupo)
  const capangaMax = hasArea ? 2 * players : players; // até o dobro com ataques em área

  const bossNC = partyNC + Math.min(players, BOSS_MAX_BONUS); // sem clamp: cálculo preservado
  const bossSupported = bossNC >= NC_MIN && bossNC <= NC_MAX; // sistema cria NC 4–20

  return Object.freeze({
    partyNC,
    players,
    capangas: Object.freeze({
      min: capangaMin,
      max: capangaMax,
      ncAdvice: "Abaixo do NC do grupo",
    }),
    boss: Object.freeze({
      nc: bossNC,
      supported: bossSupported,
    }),
    source: ENCOUNTER_SOURCE,
  });
}

/**
 * Tabela de sugestões para 1 a 6 PJs, derivada de encounterAdvice (linha por linha).
 * Cada linha é o resultado integral de encounterAdvice para aquele número de PJs.
 *
 * @param {{partyNC: number, hasArea?: boolean}} options
 * @returns {{partyNC: number, hasArea: boolean, source: string, rows: ReturnType<typeof encounterAdvice>[]}}
 */
export function encounterTable(options) {
  const opts = requireOptions(options);

  const partyNC = requireInteger(opts.partyNC, "partyNC", NC_MIN, NC_MAX);
  const hasArea = opts.hasArea === undefined ? false : opts.hasArea;
  if (typeof hasArea !== "boolean") {
    throw new TypeError(
      `hasArea deve ser booleano (true/false) ou omitido; recebido ${describeValue(opts.hasArea)}.`,
    );
  }

  const rows = [];
  for (let players = PLAYERS_MIN; players <= 6; players += 1) {
    rows.push(encounterAdvice({ partyNC, players, hasArea }));
  }

  return Object.freeze({
    partyNC,
    hasArea,
    source: ENCOUNTER_SOURCE,
    rows: Object.freeze(rows),
  });
}
