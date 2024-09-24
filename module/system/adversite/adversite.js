import { AdversiteDialog } from "./dialog.js";

export function addChatListeners(app, html, data) {
  const Button = html.find("button.ajout-adversite");
  Button.on("click", onAddAdversite);
  const adversiteName = html.find("span[data-adversite-id]");
  adversiteName.on("click", onOpenAdversite);
}

async function onAddAdversite(event) {
  const messageTemplate = "systems/shaanworld/templates/actors/adversite/chat/chat-card.hbs";
  const chatCard = this.parentElement.parentElement.className.includes("domainCheck")
    ? $(this.parentElement.parentElement)
    : $(this.parentElement);
  const actor = game.actors.get(chatCard[0].dataset.actorId.replace("Actor.", ""));
  const adversites = game.actors.filter((actor) => actor.type === "adversite").filter((adversite) => adversite.system.active);
  if (adversites.length == 0) return ui.notifications.warn("Aucune adversité n'est active.");

  let score = Number(chatCard.find(".score")[0].innerText);
  let perte = Number(chatCard.find(".pertes")[0].value)
    ? Number(chatCard.find(".pertes")[0].value)
    : Number(-chatCard.find(".pertes")[0].innerText.replace("énergie", "").replace("s", "").replace("et un malus narratif", ""));
  let adversiteOptions = await getAdversiteOptions({
    adversites,
    score,
    perte,
  });
  if (adversiteOptions.cancelled) {
    return;
  }

  score += adversiteOptions.bonus;
  score -= adversiteOptions.malus;

  applyPertes(adversiteOptions.trihns, actor);
  let isFinished = await applyScore(score, adversiteOptions.adversite);

  ToCustomMessage(actor, adversiteOptions.adversite, score, messageTemplate, adversiteOptions.trihns, isFinished);
}

async function getAdversiteOptions({
  adversites = {},
  score = null,
  perte = null,
  trihns = { esprit: 0, ame: 0, corps: 0 },
  template = "systems/shaanworld/templates/actors/adversite/chat/dialog.hbs",
} = {}) {
  const html = await renderTemplate(template, {
    adversites,
    score,
    perte,
    trihns: { esprit: 0, ame: 0, corps: 0 },
  });
  const adversiteData = {
    adversites,
    score,
    perte,
  };

  return new Promise((resolve) => {
    const data = {
      title: game.i18n.format("chat.adversite.title"),
      content: html,
      data: adversiteData,
      buttons: {
        normal: {
          label: game.i18n.localize("chat.actions.confirm"),
          callback: (html) => resolve(_processAdversiteOptions(html[0].querySelector("form"))),
        },
        cancel: {
          label: game.i18n.localize("chat.actions.cancel"),
          callback: (html) => resolve({ cancelled: true }),
        },
      },
      default: "normal",
      close: () => resolve({ cancelled: true }),
    };
    new AdversiteDialog(data, null).render(true);
  });
  function _processAdversiteOptions(form) {
    return {
      adversite: game.actors.get(form.adversite?.value),
      trihns: {
        esprit: Number(form.esprit?.value),
        ame: Number(form.ame?.value),
        corps: Number(form.corps?.value),
      },
      bonus: Number(form.bonus?.value),
      malus: Math.abs(Number(form.malus?.value)),
    };
  }
}

function applyPertes(trihns, actor) {
  actor.update({
    system: {
      trihns: {
        esprit: { value: actor.system.trihns.esprit.value - Math.abs(trihns.esprit) },
        ame: { value: actor.system.trihns.ame.value - Math.abs(trihns.ame) },
        corps: { value: actor.system.trihns.corps.value - Math.abs(trihns.corps) },
      },
    },
  });
  actor.sheet.render();
}
async function applyScore(score, adversite) {
  adversite = await adversite.update({
    "system.score": adversite.system.score + score,
  });
  if (adversite.system.score >= adversite.system.scoreMax) {
    return true;
  } else {
    false;
  }
}

async function ToCustomMessage(actor, adversite, score, messageTemplate, pertes, isFinished) {
  let templateContext = {
    actorID: actor._id,
    adversite: adversite,
    actor: actor,
    score: score,
    pertes: pertes,
    isFinished,
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
    speaker: ChatMessage.getSpeaker({ actor }),
    content: await renderTemplate(messageTemplate, templateContext),
    sound: CONFIG.sounds.notification,
    type: CONST.CHAT_MESSAGE_TYPES.OTHER,
    whisper: whispers,
  };
  ChatMessage.create(chatData);
}

function onOpenAdversite(event) {
  if (!game.user.isGM) return;
  fromUuid(event.target.dataset.adversiteId).then((adversite) => {
    adversite.sheet.render(true);
  });
}

export const hideChatAdversiteButtons = function (message, html, data) {
  const chatCard = html.find(".chat-card");
  if (chatCard.length > 0) {
    // if (game.user.isGM) {
    //   return;
    // }
    const buttons = chatCard.find("button.ajout-adversite");
    buttons.each((i, btn) => {
      btn.style.display = "none";
    });
  }
};
