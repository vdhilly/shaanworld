import { getSelectedActors } from "../../utils/utils.js";
import { DOMAIN_TRIHN, getRollOptions, rollToCustomMessage } from "./dice.js";

const HEAL_CHAT_TEMPLATE = "systems/shaanworld/templates/chat/heal-chat.hbs";
const HEAL_DIALOG_TEMPLATE = "systems/shaanworld/templates/chat/healing-dialog.hbs";

/* -------------------------------------------- */
/*  Test de soin                                */
/* -------------------------------------------- */

export async function Heal(actor) {
  if (!actor) return;

  const options = await getRollOptions(actor, "chat.Heal.title");
  if (options.cancelled) return;

  const { domain, bonus, lignee, people } = options;
  const malus = Math.abs(options.malus);
  const vocations = {
    vocation1: actor.items.get(options.vocations.vocation1),
    vocation2: actor.items.get(options.vocations.vocation2),
  };

  const isNecrose = domain === "necrose";
  const rollFormula = isNecrose ? "{1d10[Necrose]}" : "{1d10[Esprit], 1d10[Ame], 1d10[Corps]}";

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

  let Esprit, Ame, Corps, Necrose;
  if (isNecrose) {
    Necrose = rollResult.dice[0];
  } else {
    Esprit = rollResult.dice[0];
    Ame = rollResult.dice[1];
    Corps = rollResult.dice[2];

    if (Corps.total === Ame.total && Ame.total === Esprit.total) {
      if (Esprit.total !== 10) rollResult.symbiose = true;
      else rollResult.symbioseLimbe = true;
    }
  }

  const domainFlavor = DOMAIN_TRIHN[domain];
  const domainDice = { Esprit, Ame, Corps, Necrose }[domainFlavor];
  const domainLevel = actor.system.domains[domain].rank;

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
    score = baseScore + (rollResult.symbiose ? 30 : 0);
  }

  await rollToCustomMessage(actor, rollResult, HEAL_CHAT_TEMPLATE, {
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
  });
}

/* -------------------------------------------- */
/*  Bouton "Soigner" dans le chat               */
/* -------------------------------------------- */

/**
 * Branche le bouton "soigner" d'un message de chat.
 * Hook V13 : Hooks.on("renderChatMessageHTML", addChatListeners)
 * (remplace "renderChatMessage", dont le html était un objet jQuery)
 *
 * @param {ChatMessage} message
 * @param {HTMLElement} html
 */
export function addChatListeners(message, html) {
  html[0].querySelectorAll("button.soigner").forEach((button) => {
    button.addEventListener("click", (event) => _onHeal(event, button));
  });
}

async function _onHeal(event, button) {
  const actors = getSelectedActors(["character"]);
  if (actors.length === 0) {
    return ui.notifications.warn("Vous devez sélectionner au moins un token de Personnage.");
  }

  const chatCard = button.parentElement.parentElement;
  const score = Number(chatCard.querySelector(".score")?.innerText);
  if (Number.isNaN(score)) return;

  const heal = Math.max(Math.ceil(score / 5), -1);

  const healedTrihn = await getHealOptions();
  if (!healedTrihn) return;

  await Promise.all(
    actors.map((actor) => {
      const trihn = actor.system.trihns[healedTrihn];
      if (!trihn) return null;

      const { value, max } = trihn;
      return actor.update({
        [`system.trihns.${healedTrihn}.value`]: Math.min(heal + value, max),
      });
    })
  );
}

/**
 * Demande quel Trihn soigner.
 * @returns {Promise<string|null>} le Trihn choisi, ou null si annulé
 */
async function getHealOptions() {
  const content = await foundry.applications.handlebars.renderTemplate(HEAL_DIALOG_TEMPLATE, { trihn: undefined });

  const result = await foundry.applications.api.DialogV2.wait({
    window: { title: game.i18n.localize("chat.Heal.soin") },
    content,
    buttons: [
      {
        action: "heal",
        label: game.i18n.localize("chat.Heal.soin"),
        default: true,
        callback: (event, button) => button.form.elements.trihn?.value,
      },
      {
        action: "cancel",
        label: game.i18n.localize("chat.actions.cancel"),
      },
    ],
    rejectClose: false,
  });

  if (!result || result === "cancel") return null;
  return result;
}