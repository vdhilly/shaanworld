import { RollToCustomMessage } from "./dice.js";

export async function Regen(actor) {
  if (!actor) return;
  const actorData = actor.system;
  const messageTemplate = "systems/shaanworld/templates/chat/regen-chat.hbs";

  const regenOptions = await getRegenOptions({ actor });
  if (regenOptions.cancelled) return;

  const bonus = {
    esprit: regenOptions.bonusEsprit || 0,
    ame: regenOptions.bonusAme || 0,
    corps: regenOptions.bonusCorps || 0,
  };
  const chambreBonus = getChambreBonus(regenOptions.chambre) || 0;

  const roll = {
    esprit: _generateRandomRoll(),
    ame: _generateRandomRoll(),
    corps: _generateRandomRoll(),
  };

  const trihns = foundry.utils.deepClone(actorData.trihns);
  
  const regen = _calculateRegen(roll, bonus, chambreBonus);
  const newTrihns = await _updateActor(actor, regen, trihns);

  await RollToCustomMessage(actor, roll, messageTemplate, {
    trihns: newTrihns,
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
  bonusEsprit = 0,
  bonusAme = 0,
  bonusCorps = 0,
  chambre = 2,
  template = "systems/shaanworld/templates/chat/regen-dialog.hbs",
} = {}) {
  const content = await foundry.applications.handlebars.renderTemplate(template, {
    bonusEsprit,
    bonusAme,
    bonusCorps,
    chambre,
    actor,
  });

  const dialogResult = await RegenDialog.wait({
    window: { title: game.i18n.format("chat.regenHP.title") },
    content,
    buttons: [
      {
        action: "roll",
        label: game.i18n.localize("chat.actions.roll"),
        default: true,
        callback: (event, button) => {
          const form = button.form;
          return _processHPRegenOptions(form);
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

function _processHPRegenOptions(form) {
  return {
    bonusEsprit: parseInt(form.malusEsprit?.value ?? 0),
    bonusAme: parseInt(form.malusAme?.value ?? 0),
    bonusCorps: parseInt(form.malusCorps?.value ?? 0),
    chambre: parseInt(form.chambre?.value ?? 2),
  };
}

function getChambreBonus(chambre) {
  switch (chambre) {
    case 1:
      return -1;
    case 2:
      return 0;
    case 3:
      return 2;
    default:
      return 0;
  }
}

async function _updateActor(actor, regen, trihns) {
  trihns.esprit.value += regen.esprit === -1 ? 0 : regen.esprit;
  trihns.ame.value += regen.ame === -1 ? 0 : regen.ame;
  trihns.corps.value += regen.corps === -1 ? 0 : regen.corps;

  trihns.esprit.value = Math.min(trihns.esprit.value, trihns.esprit.max);
  trihns.ame.value = Math.min(trihns.ame.value, trihns.ame.max);
  trihns.corps.value = Math.min(trihns.corps.value, trihns.corps.max);

  await actor.update({
    "system.trihns.esprit.value": trihns.esprit.value,
    "system.trihns.ame.value": trihns.ame.value,
    "system.trihns.corps.value": trihns.corps.value,
  });

  return actor.system.trihns;
}

/**
 * Boîte de dialogue "Regen" basée sur DialogV2
 */
export class RegenDialog extends foundry.applications.api.DialogV2 {
  static LOCALES = false;

  static get DEFAULT_OPTIONS() {
    return foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
      classes: ["dialog", "regen-dialog"],
      window: {
        width: 400
      }
    });
  }
}