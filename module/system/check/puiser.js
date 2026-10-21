import { getSelectedOrOwnActors } from "../../utils/utils.js";

/* -------------------------------------------- */
/*  Listeners Chat                              */
/* -------------------------------------------- */

export function addChatListeners(app, html, data) {
  const element = html instanceof HTMLElement ? html : html[0];
  if (!element) return;

  const btnPuiser = element.querySelector("button.puiser");
  if (btnPuiser) btnPuiser.addEventListener("click", onPuiser);

  const btnPuiserHeal = element.querySelector("button.puiser-heal");
  if (btnPuiserHeal) btnPuiserHeal.addEventListener("click", onPuiserHeal);
}

async function onPuiser(event) {
  const actors = getSelectedOrOwnActors(["character"]);
  if (actors.length === 0) {
    return ui.notifications.warn("Vous devez sélectionner au moins un token.");
  }

  const button = event.currentTarget;
  const chatCard = button.closest(".chat-card") || button.closest(".message-content") || button.parentElement.parentElement;
  
  const diceValueInputs = chatCard.querySelectorAll("input.dice-value");
  const domainSpan = chatCard.querySelector("span.domain");
  const domainLevel = Number(domainSpan?.dataset?.domainLevel ?? 0);
  const domainName = domainSpan?.dataset?.domain;

  const pertesElem = chatCard.querySelector(".pertes");
  const perteText = pertesElem ? pertesElem.innerText : "";
  const perte = Number(
    -perteText
      .replace("énergies", "")
      .replace("et un malus narratif", "")
      .replace("énergie", "")
      .trim()
  );

  const bonus = await calculPuiserBonus(chatCard);
  const messageTemplate = "systems/shaanworld/templates/chat/puiser.hbs";

  const trihn = getTrihn(domainName);
  let dice;
  if (trihn === "necrose") {
    return ui.notifications.warn(
      "Vous ne pouvez pas puiser lors d'un Jet de Nécrose."
    );
  } else {
    dice = prepareDice(diceValueInputs, trihn);
  }

  let choix = getChoice(domainLevel, dice);
  if (!choix.choix1 && !choix.choix2) {
    return ui.notifications.error("Vous ne pouvez puiser dans aucun Trihn.");
  }
  choix.bonus = bonus;

  let result = 0;
  let puiserOptions = await GetPuiserOptions({
    domain: { value: domainLevel, name: domainName },
    dice,
    choix,
    result,
  });

  if (!puiserOptions || puiserOptions.cancelled) {
    return;
  }

  result += puiserOptions.result;
  result += bonus;
  result += domainLevel;

  for (const actor of actors) {
    let flavor = puiserOptions.flavor.toLowerCase();
    await actor.update({
      [`system.trihns.${flavor}.value`]: actor.system.trihns[flavor].value - 1,
    });
    actor.sheet.render();
    await ToCustomMessage(actor, result, messageTemplate, flavor, perte);
  }
}

export function calculPuiserBonus(chatCard) {
  let bonus = 0;
  const puiserBonus = chatCard.querySelectorAll(".puiser-bonus");
  for (let i = 0; i < puiserBonus.length; i++) {
    bonus += Number(puiserBonus[i].innerText);
  }
  return bonus;
}

function getTrihn(domainName) {
  let trihn;
  const trihns = {
    esprit: ["technique", "savoir", "social"],
    ame: ["arts", "shaan", "magie"],
    corps: ["rituels", "survie", "combat"],
    necrose: ["necrose"],
  };
  for (const trihnKey in trihns) {
    if (trihns[trihnKey].includes(domainName)) {
      trihn = trihnKey;
    }
  }
  return trihn;
}

function prepareDice(diceValueInputs, trihn) {
  const getVal = (idx) => Number(diceValueInputs[idx]?.value ?? 0);

  let baseDice, puiser1, puiser2;
  if (trihn === "esprit") {
    baseDice = { value: getVal(0), label: "esprit", flavor: "Esprit", color: "jaune", checked: false };
    puiser1  = { value: getVal(1), label: "ame", flavor: "Ame", color: "bleu", checked: false };
    puiser2  = { value: getVal(2), label: "corps", flavor: "Corps", color: "rouge", checked: false };
  } else if (trihn === "ame") {
    puiser1  = { value: getVal(0), label: "esprit", flavor: "Esprit", color: "jaune", checked: false };
    baseDice = { value: getVal(1), label: "ame", flavor: "Ame", color: "bleu", checked: false };
    puiser2  = { value: getVal(2), label: "corps", flavor: "Corps", color: "rouge", checked: false };
  } else if (trihn === "corps") {
    puiser1  = { value: getVal(0), label: "esprit", flavor: "Esprit", color: "jaune", checked: false };
    puiser2  = { value: getVal(1), label: "ame", flavor: "Ame", color: "bleu", checked: false };
    baseDice = { value: getVal(2), label: "corps", flavor: "Corps", color: "rouge", checked: false };
  }
  return { baseDice, puiser1, puiser2 };
}

function getChoice(domainLevel, dice) {
  let choix = {};
  if (dice.puiser1?.value !== 10) {
    choix.choix1 = dice.puiser1;
  }
  if (dice.puiser2?.value !== 10) {
    choix.choix2 = dice.puiser2;
  }
  return choix;
}

async function GetPuiserOptions({
  domain = null,
  dice = null,
  choix = {},
  result = null,
  template = "systems/shaanworld/templates/chat/puiser-dialog.hbs",
} = {}) {
  const content = await foundry.applications.handlebars.renderTemplate(template, {
    domain,
    dice,
    choix,
    result,
  });

  // Utilisation de la classe personnalisée PuiserDialog basée sur DialogV2
  const dialogResult = await PuiserDialog.wait({
    window: { title: game.i18n.format("chat.puiser.title") },
    content,
    buttons: [
      {
        action: "puiser",
        label: game.i18n.localize("chat.actions.puiser"),
        default: true,
        callback: (event, button) => {
          const form = button.form;
          const checked = form?.querySelector("input:checked");
          if (!checked) {
            ui.notifications.warn("Vous devez faire un choix.");
            return null;
          }
          const div = checked.closest("div");
          const flavor = div?.querySelector("b")?.dataset?.flavor;
          return {
            result: Number(form.result?.value ?? 0),
            flavor,
          };
        },
      },
      {
        action: "cancel",
        label: game.i18n.localize("chat.actions.cancel"),
      },
    ],
    rejectClose: false,
  });

  if (!dialogResult || dialogResult === "cancel") {
    return { cancelled: true };
  }
  return dialogResult;
}

async function ToCustomMessage(Token, result, messageTemplate, flavor, perte) {
  let templateContext = {
    actorID: Token._id,
    Token: Token,
    score: result,
    flavor: flavor,
    perte,
  };

  let rollMode = game.settings.get("core", "rollMode");
  let whispers = [];
  switch (rollMode) {
    case "gmroll":
    case "blindroll":
      whispers = ChatMessage.getWhisperRecipients("GM");
      break;
    case "selfroll":
      whispers = [game.user.id];
      break;
  }

  const style = CONST.CHAT_MESSAGE_STYLES?.OTHER ?? CONST.CHAT_MESSAGE_TYPES?.OTHER ?? 0;

  const chatData = {
    user: game.user.id,
    speaker: ChatMessage.getSpeaker({ actor: Token.actor }),
    content: await foundry.applications.handlebars.renderTemplate(messageTemplate, templateContext),
    sound: CONFIG.sounds.notification,
    style: style,
    whisper: whispers,
  };

  await ChatMessage.create(chatData);
}

export const hideChatPuiserButtons = function (message, html, data) {
  const element = html instanceof HTMLElement ? html : html[0];
  if (!element) return;

  const chatCard = element.querySelector(".chat-card");
  if (chatCard) {
    const actorId = chatCard.getAttribute("data-actor-id")?.replace("Actor.", "");
    let actor = game.actors.get(actorId);

    if ((actor && actor.isOwner) || game.user.isGM) {
      return;
    }

    const buttons = chatCard.querySelectorAll("button.puiser");
    buttons.forEach((btn) => {
      btn.style.display = "none";
    });
  }
};

async function onPuiserHeal(event) {
  const actors = getSelectedOrOwnActors(["character"]);
  if (actors.length === 0)
    return ui.notifications.warn("Vous devez sélectionner au moins un token.");

  const button = event.currentTarget;
  const chatCard = button.closest(".chat-card") || button.closest(".message-content") || button.parentElement.parentElement;

  const diceValueInputs = chatCard.querySelectorAll("input.dice-value");
  const domainSpan = chatCard.querySelector("span.domain");
  const domainLevel = Number(domainSpan?.dataset?.domainLevel ?? 0);
  const domainName = domainSpan?.dataset?.domain;

  const bonus = await calculPuiserBonus(chatCard);
  const messageTemplate = "systems/shaanworld/templates/chat/puiserHeal.hbs";

  const trihn = getTrihn(domainName);
  let dice;
  if (trihn === "necrose") {
    return ui.notifications.warn(
      "Vous ne pouvez pas puiser lors d'un Jet de Nécrose."
    );
  } else {
    dice = prepareDice(diceValueInputs, trihn);
  }

  let choix = getChoice(domainLevel, dice);
  if (!choix.choix1 && !choix.choix2) {
    return ui.notifications.error("Vous ne pouvez puiser dans aucun Trihn.");
  }
  choix.bonus = bonus;

  let result = 0;
  let puiserOptions = await GetPuiserOptions({
    domain: { value: domainLevel, name: domainName },
    dice,
    choix,
    result,
  });

  if (!puiserOptions || puiserOptions.cancelled) {
    return;
  }

  result += puiserOptions.result;
  result += bonus;
  result += domainLevel;

  for (const actor of actors) {
    let flavor = puiserOptions.flavor.toLowerCase();
    await actor.update({
      [`system.trihns.${flavor}.value`]: actor.system.trihns[flavor].value - 1,
    });
    actor.sheet.render();
    await ToCustomMessage(actor, result, messageTemplate, flavor);
  }
}

/**
 * Définition de la classe PuiserDialog compatible ApplicationV2 / DialogV2
 */
export class PuiserDialog extends foundry.applications.api.DialogV2 {
  static LOCALES = false;

  static get DEFAULT_OPTIONS() {
    return foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
      classes: ["dialog", "puiser-dialog"],
      window: {
        width: 400
      }
    });
  }
}