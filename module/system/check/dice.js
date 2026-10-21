import { setupCheckDialog } from "./dialog.js";

const DOMAIN_CHECK_DIALOG_TEMPLATE = "systems/shaanworld/templates/chat/domainCheck.hbs";
const DOMAIN_CHECK_CHAT_TEMPLATE = "systems/shaanworld/templates/chat/domainCheck-chat.hbs";

/** Trihn associé à chaque domaine */
export const DOMAIN_TRIHN = {
  technique: "Esprit",
  savoir: "Esprit",
  social: "Esprit",
  arts: "Ame",
  shaan: "Ame",
  magie: "Ame",
  rituels: "Corps",
  survie: "Corps",
  combat: "Corps",
  necrose: "Necrose",
};

const toInt = (value) => Number.parseInt(value) || 0;

/* -------------------------------------------- */
/*  Test de domaine                             */
/* -------------------------------------------- */

export async function domainCheck(actor) {
  if (!actor) return;

  const options = await getRollOptions(actor);
  if (options.cancelled) return;

  const { domain } = options;
  const bonus = options.bonus;
  const malus = Math.abs(options.malus);
  const { lignee, people } = options;
  const vocations = {
    vocation1: actor.items.get(options.vocations.vocation1),
    vocation2: actor.items.get(options.vocations.vocation2),
  };

  const isNecrose = domain === "necrose";
  const rollFormula = isNecrose
    ? "{1d10[Necrose], 1d10[Ame]}"
    : "{1d10[Esprit], 1d10[Ame], 1d10[Corps], 1d10[Necrose]}";

  const rollResult = await new Roll(rollFormula, {
    actor: actor.system,
    domain,
    vocations,
    bonus,
    malus,
    lignee,
    people,
  }).roll();

  if (game.dice3d) await game.dice3d.showForRoll(rollResult, game.user, true);

  // Dés selon le type de test
  let Esprit, Ame, Corps, Necrose;
  let perte;

  if (isNecrose) {
    Necrose = rollResult.dice[0];
    Ame = rollResult.dice[1];
    perte = getPerte(Ame.total);
  } else {
    Esprit = rollResult.dice[0];
    Ame = rollResult.dice[1];
    Corps = rollResult.dice[2];
    Necrose = rollResult.dice[3];

    applySymbiose(rollResult, { Esprit, Ame, Corps, Necrose });
    perte = getPerte(Necrose.total);
  }

  const domainFlavor = DOMAIN_TRIHN[domain];
  const domainDice = { Esprit, Ame, Corps, Necrose }[domainFlavor];
  const domainLevel = actor.system.domains[domain].rank;

  // Calcul du score
  const baseScore =
    domainDice.total +
    domainLevel +
    bonus -
    malus +
    (vocations.vocation1?.system.bonus ?? 0) +
    (vocations.vocation2?.system.bonus ?? 0) +
    (lignee ? 2 : 0) +
    (people ? 2 : 0);

  let score;
  if (isNecrose) {
    score = baseScore;
  } else if (domainDice.total === 10) {
    score = 0;
  } else {
    score = baseScore + (rollResult.symbiose || rollResult.symbioseTrans ? 30 : 0);
  }

  if (rollResult.symbioseLimbe) {
    perte = `${perte ?? ""}. Le score doit être ajouté à la difficulté de l'adversité.`;
  }

  await rollToCustomMessage(actor, rollResult, DOMAIN_CHECK_CHAT_TEMPLATE, {
    domain,
    domainLevel,
    score,
    bonus,
    malus,
    vocations,
    lignee,
    people,
    actorID: actor.uuid,
    domainFlavor,
    perte,
  });
}

/* -------------------------------------------- */
/*  Helpers                                     */
/* -------------------------------------------- */

function getPerte(value) {
  if (value === 10) return game.i18n.localize("chat.domainCheck.pertes.great");
  if (value > 5 && value < 10) return game.i18n.localize("chat.domainCheck.pertes.medium");
  if (value > 0 && value < 6) return game.i18n.localize("chat.domainCheck.pertes.low");
  return undefined;
}

/**
 * Détecte les symbioses et pose les drapeaux correspondants sur le jet.
 * L'ordre des tests est celui de l'implémentation d'origine.
 */
function applySymbiose(rollResult, { Esprit, Ame, Corps, Necrose }) {
  const e = Esprit.total;
  const a = Ame.total;
  const c = Corps.total;
  const n = Necrose.total;

  if (c === a && a === e && e !== 10) {
    rollResult.symbiose = true;
  } else if (c === a && a === n) {
    rollResult.symbioseLimbe = true;
  } else if (c === a && a === e && e === 10) {
    rollResult.symbioseLimbe = true;
  } else if (c === e && e === n) {
    rollResult.symbioseLimbe = true;
  } else if (e === a && a === n) {
    rollResult.symbioseLimbe = true;
  }
  // NB : les cas symbioseTrans / symbioseTransLimbes (4 dés identiques) de l'ancien code
  // n'étaient jamais atteints, car interceptés par les tests précédents.
}

/**
 * Ouvre la boîte de dialogue du test de domaine.
 * @returns {Promise<object>} les options choisies, ou { cancelled: true }
 */
export async function getRollOptions(actor) {
  const content = await foundry.applications.handlebars.renderTemplate(DOMAIN_CHECK_DIALOG_TEMPLATE, {
    actor,
    domain: null,
    vocations: { vocation1: null, vocation2: null },
    bonus: null,
    malus: null,
    lignee: false,
    people: false,
    domains: CONFIG.shaanworld.domains,
  });

  const result = await foundry.applications.api.DialogV2.wait({
    window: { title: game.i18n.localize("chat.domainCheck.title") },
    content,
    render: (event, dialog) => setupCheckDialog(dialog, actor),
    buttons: [
      {
        action: "normal",
        label: game.i18n.localize("chat.actions.roll"),
        default: true,
        callback: (event, button) => processDomainCheckOptions(button.form),
      },
      {
        action: "cancel",
        label: game.i18n.localize("chat.actions.cancel"),
      },
    ],
    rejectClose: false,
  });

  if (!result || result === "cancel") return { cancelled: true };
  return result;
}

function processDomainCheckOptions(form) {
  return {
    domain: form.elements.domain?.value,
    vocations: {
      vocation1: form.elements.vocation1?.value,
      vocation2: form.elements.vocation2?.value,
    },
    bonus: toInt(form.elements.bonus?.value),
    malus: toInt(form.elements.malus?.value),
    lignee: form.elements.lignee?.checked ?? false,
    people: form.elements.people?.checked ?? false,
  };
}

/* -------------------------------------------- */
/*  Message de chat                             */
/* -------------------------------------------- */

export async function rollToCustomMessage(actor = null, rollResult, template, extraData) {
  const content = await foundry.applications.handlebars.renderTemplate(template, {
    ...extraData,
    roll: rollResult,
  });

  return ChatMessage.create({
    author: game.user.id,
    speaker: ChatMessage.getSpeaker({ actor }),
    content,
    sound: CONFIG.sounds.dice,
    style: CONST.CHAT_MESSAGE_STYLES.ROLL,
  });
}

// Alias conservé pour ne pas casser les imports existants
export const RollToCustomMessage = rollToCustomMessage;