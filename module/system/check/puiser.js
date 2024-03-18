import { getSelectedOrOwnActors, htmlQueryAll } from "../../utils/utils.js";
export function addChatListeners(app, html, data) {
  const Button = html.find("button.puiser");
  Button.on("click", onPuiser);
  const ButtonHeal = html.find("button.puiser-heal");
  ButtonHeal.on("click", onPuiserHeal);
}

async function onPuiser(event) {
  const actors = (0, getSelectedOrOwnActors)(["character"]);
  if (actors.length == 0)
    return ui.notifications.warn("Vous devez sélectionner au moins un token.");
  const chatCard = $(this.parentElement.parentElement);
  const diceValues = chatCard.find("input.dice-value");
  const domainLevel = Number(
    chatCard.find("span.domain")[0].dataset.domainLevel
  );
  const domainName = chatCard.find("span.domain")[0].dataset.domain;
  const perte = Number(
    -chatCard
      .find(".pertes")[0]
      .innerText.replace("énergies", "")
      .replace("et un malus narratif")
      .replace("énergie", "")
  );

  const bonus = await calculPuiserBonus(chatCard);
  const messageTemplate = "systems/shaanworld/templates/chat/puiser.hbs";

  const trihn = await getTrihn(domainName);
  let dice;
  if (trihn === "necrose") {
    return ui.notifications.warn(
      "Vous ne pouvez pas puiser lors d'un Jet de Nécrose."
    );
  } else {
    dice = await prepareDice(diceValues, trihn);
  }
  let choix = await getChoice(domainLevel, dice);
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

  if (puiserOptions.cancelled) {
    return;
  }
  result += puiserOptions.result;
  result += bonus;
  result += domainLevel;

  for (const actor of actors) {
    let flavor = puiserOptions.flavor.toLowerCase();
    actor.update({
      [`system.trihns.${flavor}.value`]: actor.system.trihns[flavor].value - 1,
    });
    actor.sheet.render();
    ToCustomMessage(actor, result, messageTemplate, flavor, perte);
  }
}

export function calculPuiserBonus(chatCard) {
  let bonus = 0;
  const puiserBonus = chatCard[0].querySelectorAll(".puiser-bonus");
  console.log(puiserBonus);
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

function prepareDice(diceValues, trihn) {
  let baseDice, puiser1, puiser2;
  if (trihn === "esprit") {
    (baseDice = {
      value: Number(diceValues[0].value),
      label: "esprit",
      flavor: "Esprit",
      color: "jaune",
      checked: false,
    }),
      (puiser1 = {
        value: Number(diceValues[1].value),
        label: "ame",
        flavor: "Ame",
        color: "bleu",
        checked: false,
      });
    puiser2 = {
      value: Number(diceValues[2].value),
      label: "corps",
      flavor: "Corps",
      color: "rouge",
      checked: false,
    };
  } else if (trihn === "ame") {
    (puiser1 = {
      value: Number(diceValues[0].value),
      label: "esprit",
      flavor: "Esprit",
      color: "jaune",
      checked: false,
    }),
      (baseDice = {
        value: Number(diceValues[1].value),
        label: "ame",
        flavor: "Ame",
        color: "bleu",
        checked: false,
      });
    puiser2 = {
      value: Number(diceValues[2].value),
      label: "corps",
      flavor: "Corps",
      color: "rouge",
      checked: false,
    };
  } else if (trihn === "corps") {
    (puiser1 = {
      value: Number(diceValues[0].value),
      label: "esprit",
      flavor: "Esprit",
      color: "jaune",
      checked: false,
    }),
      (puiser2 = {
        value: Number(diceValues[1].value),
        label: "ame",
        flavor: "Ame",
        color: "bleu",
        checked: false,
      });
    baseDice = {
      value: Number(diceValues[2].value),
      label: "corps",
      flavor: "Corps",
      color: "rouge",
      checked: false,
    };
  }
  return { baseDice: baseDice, puiser1: puiser1, puiser2: puiser2 };
}

function getChoice(domainLevel, dice) {
  let choix = {};
  console.log(dice);
  if (dice.puiser1.value !== 10) {
    choix.choix1 = dice.puiser1;
  }
  if (dice.puiser2.value !== 10) {
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
  const html = await renderTemplate(template, {
    domain,
    dice,
    choix,
    result,
  });
  const puiserData = {
    dice: dice,
    choix: choix,
  };

  return new Promise((resolve) => {
    const data = {
      title: game.i18n.format("chat.puiser.title"),
      content: html,
      data: puiserData,
      buttons: {
        normal: {
          label: game.i18n.localize("chat.actions.puiser"),
          callback: (html) =>
            resolve(_processPuiserOptions(html[0].querySelector("form"))),
        },
        cancel: {
          label: game.i18n.localize("chat.actions.cancel"),
          callback: (html) => resolve({ cancelled: true }),
        },
      },
      default: "normal",
      close: () => resolve({ cancelled: true }),
    };
    new Dialog(data, null).render(true);
  });
  function _processPuiserOptions(form) {
    let checked = form.querySelector("input:checked");
    if (checked) {
      let div = checked.closest("div");
      let flavor = div.querySelector("b").dataset.flavor;
      return {
        result: Number(form.result?.value),
        flavor: flavor,
      };
    } else {
      ui.notifications.warn("Vous devez faires un choix.");
    }
  }
}
async function ToCustomMessage(Token, result, messageTemplate, flavor, perte) {
  let templateContext = {
    actorID: Token._id,
    Token: Token,
    score: result,
    flavor: flavor,
    perte,
  };
  let chatData;
  let rollMode = game.settings.get("core", "rollMode");
  let whispers;
  switch (rollMode) {
    case "publicroll":
      whispers = [];
      break;

    case "gmroll":
      whispers = ChatMessage.getWhisperRecipients("GM");
      break;

    case "blindroll":
      whispers = ChatMessage.getWhisperRecipients("GM");
      break;

    case "selfroll":
      whispers = [game.user.id];
      break;
  }
  chatData = {
    user: game.user.id,
    speaker: ChatMessage.getSpeaker({ actor: Token.actor }),
    content: await renderTemplate(messageTemplate, templateContext),
    sound: CONFIG.sounds.notification,
    type: CONST.CHAT_MESSAGE_TYPES.OTHER,
    whisper: whispers,
  };
  ChatMessage.create(chatData);
}

export const hideChatPuiserButtons = function (message, html, data) {
  const chatCard = html.find(".chat-card");
  if (chatCard.length > 0) {
    let actor = game.actors.get(
      chatCard.attr("data-actor-id").replace("Actor.", "")
    );
    if (actor && actor.isOwner) {
      return;
    }
    if (game.user.isGM) {
      return;
    }
    const buttons = chatCard.find("button.puiser");
    buttons.each((i, btn) => {
      btn.style.display = "none";
    });
  }
};

async function onPuiserHeal(event) {
  const actors = (0, getSelectedOrOwnActors)(["character"]);
  if (actors.length == 0)
    return ui.notifications.warn("Vous devez sélectionner au moins un token.");
  const chatCard = $(this.parentElement.parentElement);
  const diceValues = chatCard.find("input.dice-value");
  const domainLevel = Number(
    chatCard.find("span.domain")[0].dataset.domainLevel
  );
  const domainName = chatCard.find("span.domain")[0].dataset.domain;

  const bonus = await calculPuiserBonus(chatCard);
  const messageTemplate = "systems/shaanworld/templates/chat/puiserHeal.hbs";

  const trihn = await getTrihn(domainName);
  let dice;
  if (trihn === "necrose") {
    return ui.notifications.warn(
      "Vous ne pouvez pas puiser lors d'un Jet de Nécrose."
    );
  } else {
    dice = await prepareDice(diceValues, trihn);
  }
  let choix = await getChoice(domainLevel, dice);
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

  if (puiserOptions.cancelled) {
    return;
  }
  result += puiserOptions.result;
  result += bonus;
  result += domainLevel;

  for (const actor of actors) {
    let flavor = puiserOptions.flavor.toLowerCase();
    actor.update({
      [`system.trihns.${flavor}.value`]: actor.system.trihns[flavor].value - 1,
    });
    actor.sheet.render();
    ToCustomMessage(actor, result, messageTemplate, flavor);
  }
}
