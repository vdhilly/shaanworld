import { RollToCustomMessage } from "./dice.js";

export async function Regen(actor) {
  const actorData = actor ? actor.system : null;
  const messageTemplate = "systems/shaanworld/templates/chat/regen-chat.hbs";

  const regenOptions = await getRegenOptions(actor);
  if (regenOptions.cancelled) return;

  const bonus = {
    esprit: regenOptions.bonusEsprit,
    ame: regenOptions.bonusAme,
    corps: regenOptions.bonusCorps,
  };
  const chambreBonus = await getChambreBonus(regenOptions.chambre);

  const roll = {
    esprit: _generateRandomRoll(),
    ame: _generateRandomRoll(),
    corps: _generateRandomRoll(),
  };

  const trihns = actorData.trihns;
  const regen = await _calculateRegen(roll, bonus, chambreBonus);

  _updateActor(actor, regen, trihns);

  RollToCustomMessage(actor, regen, messageTemplate, {
    trihns,
    regen,
    actor,
  });
}

function _generateRandomRoll() {
  return Math.floor(Math.random() * 10);
}

function _calculateRegen(roll, bonus, chambreBonus) {
  const regen = {
    esprit: roll.esprit + bonus.esprit + chambreBonus,
    ame: roll.ame + bonus.ame + chambreBonus,
    corps: roll.corps + bonus.corps + chambreBonus,
  };

  if (roll.esprit === 0 || regen.esprit < 0) regen.esprit = -1;
  if (roll.ame === 0 || regen.ame < 0) regen.ame = -1;
  if (roll.corps === 0 || regen.corps < 0) regen.corps = -1;

  return regen;
}
async function getRegenOptions({
  actor,
  bonusEsprit,
  bonusAme,
  bonusCorps,
  chambre,
  template = "systems/shaanworld/templates/chat/regen-dialog.hbs",
} = {}) {
  const html = await renderTemplate(template, {
    bonusEsprit,
    bonusAme,
    bonusCorps,
    chambre,
  });
  const actorData = actor;

  return new Promise((resolve) => {
    const data = {
      title: game.i18n.format("chat.regenHP.title"),
      content: html,
      actor: actorData,
      buttons: {
        normal: {
          label: game.i18n.localize("chat.actions.roll"),
          callback: (html) =>
            resolve(_processHPRegenOptions(html[0].querySelector("form"))),
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
}
function _processHPRegenOptions(form) {
  return {
    bonusEsprit: parseInt(form.malusEsprit?.value),
    bonusAme: parseInt(form.malusAme?.value),
    bonusCorps: parseInt(form.malusCorps?.value),
    chambre: parseInt(form.chambre?.value),
  };
}
function getChambreBonus(chambre) {
  switch (chambre) {
    case 1:
      return -1;
    case 2:
      return 0;
    case 3:
      return +2;
  }
}

function _updateActor(actor, regen, trihns) {
  trihns.esprit.value += regen.esprit;
  trihns.ame.value += regen.ame;
  trihns.corps.value += regen.corps;

  trihns.esprit.value = Math.min(trihns.esprit.value, trihns.esprit.max);
  trihns.ame.value = Math.min(trihns.ame.value, trihns.ame.max);
  trihns.corps.value = Math.min(trihns.corps.value, trihns.corps.max);

  actor.update({
    "data.trihns.esprit.value": trihns.esprit.value,
    "data.trihns.ame.value": trihns.ame.value,
    "data.trihns.corps.value": trihns.corps.value,
  });
}
