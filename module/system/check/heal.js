import { getSelectedActors } from "../../utils/utils.js";
import { CheckDialog } from "./dialog.js";
import { RollToCustomMessage } from "./dice.js";
export async function Heal(actor) {
  const actorData = actor ? actor.system : null;
  const messageTemplate = "systems/shaanworld/templates/chat/heal-chat.hbs";
  let domain, vocations, bonus, malus, lignee, people;

  let checkOptions = await GetRollOptions();

  if (checkOptions.cancelled) {
    return;
  }
  domain = checkOptions.domain;
  vocations = checkOptions.vocations;
  vocations.vocation1 = actor.items.get(vocations.vocation1);
  vocations.vocation2 = actor.items.get(vocations.vocation2);
  bonus = checkOptions.bonus;
  malus = checkOptions.malus;
  lignee = checkOptions.lignee;
  people = checkOptions.people;

  let rollFormula;
  if (domain == "necrose") {
    rollFormula = "{1d10[Necrose]}";
  } else {
    rollFormula = "{1d10[Esprit], 1d10[Ame], 1d10[Corps]}";
  }

  let rollData = {
    actor: actorData,
    domain: domain,
    vocations: vocations,
    bonus: bonus,
    malus: malus,
    lignee: lignee,
    people: people,
  };

  let rollResult = await new Roll(rollFormula, rollData).roll({ async: true });
  let dice3d;
  if (game.dice3d != undefined) {
    dice3d = game.dice3d.showForRoll(rollResult, game.user, true);
    dice3d;
  }

  let Corps, Ame, Esprit, domainDice, domainFlavor;

  Esprit = rollResult.dice[0];
  Ame = rollResult.dice[1];
  Corps = rollResult.dice[2];

  if (domain !== "necrose") {
    if (
      Corps.total === Ame.total &&
      Ame.total === Esprit.total &&
      Esprit.total !== 10
    ) {
      rollResult.symbiose = true;
    } else if (
      Corps.total === Ame.total &&
      Ame.total === Esprit.total &&
      Esprit.total === 10
    ) {
      rollResult.symbioseLimbe = true;
    }
  } else {
    Necrose = rollResult.dice[0];
  }

  if (domain == "technique" || domain == "savoir" || domain == "social") {
    domainDice = Esprit;
    domainFlavor = "Esprit";
  } else if (domain == "arts" || domain == "shaan" || domain == "magie") {
    domainDice = Ame;
    domainFlavor = "Ame";
  } else if (domain == "rituels" || domain == "survie" || domain == "combat") {
    domainDice = Corps;
    domainFlavor = "Corps";
  } else if (domain == "necrose") {
    domainDice = Necrose;
    domainFlavor = "Necrose";
  }

  let score;
  if (domainFlavor !== "Necrose") {
    if (domainDice.total === 10) {
      score = 0;
    } else {
      score = domainDice.total;

      score += actor.system.domains[domain].rank;
      if (bonus) score += bonus;
      if (malus) score -= Math.abs(malus);
      if (vocations.vocation1) score += vocations.vocation1.system.bonus;
      if (vocations.vocation2) score += vocations.vocation2.system.bonus;
      if (lignee) score += 2;
      if (people) score += 2;
      if (rollResult.symbiose) score += 30;
    }
  } else {
    score = domainDice.total;

    score += actor.system.domains[domain].rank;
    if (bonus) score += bonus;
    if (malus) score -= Math.abs(malus);
    if (vocations.vocation1) score += vocations.vocation1.system.bonus;
    if (vocations.vocation2) score += vocations.vocation2.system.bonus;
    if (lignee) score += 2;
    if (people) score += 2;
  }

  RollToCustomMessage(actor, rollResult, messageTemplate, {
    domain: domain,
    domainLevel: actor.system.domains[domain].rank,
    score: score,
    bonus: bonus,
    malus: malus,
    vocations: vocations,
    lignee: lignee,
    people: people,
    actorID: actor.uuid,
    domainFlavor: domainFlavor,
  });

  async function GetRollOptions({
    template = "systems/shaanworld/templates/chat/domainCheck.hbs",
    domain = null,
    vocations = { vocation1: null, vocation2: null },
    bonus = null,
    malus = null,
    lignee = false,
    people = false,
  } = {}) {
    const html = await renderTemplate(template, {
      actor,
      domain,
      vocations,
      bonus,
      malus,
      lignee,
      people,
    });
    const config = CONFIG.shaanworld;

    return new Promise((resolve) => {
      const data = {
        title: game.i18n.format("chat.Heal.title"),
        content: html,
        domains: config.domains,
        actor: actorData,
        buttons: {
          normal: {
            label: game.i18n.localize("chat.actions.roll"),
            callback: (html) =>
              resolve(
                _processDomainCheckOptions(html[0].querySelector("form"))
              ),
          },
          cancel: {
            label: game.i18n.localize("chat.actions.cancel"),
            callback: (html) => resolve({ cancelled: true }),
          },
        },
        default: "normal",
        close: () => resolve({ cancelled: true }),
      };

      new CheckDialog(data, null).render(true);
    });
  }
  function _processDomainCheckOptions(form) {
    return {
      domain: form.domain?.value,
      vocations: {
        vocation1: form.vocation1.value,
        vocation2: form.vocation2.value,
      },
      bonus: parseInt(form.bonus?.value),
      malus: parseInt(form.malus?.value),
      lignee: form.lignee?.checked,
      people: form.people?.checked,
    };
  }
}

export function addChatListeners(app, html, data) {
  const Button = html.find("button.soigner");
  Button.on("click", _onHeal);
}

async function _onHeal() {
  const actors = (0, getSelectedActors)(["character"]);
  if (actors.length == 0)
    return ui.notifications.warn(
      "Vous devez sélectionner au moins un token de Personnage."
    );

  const chatCard = $(this.parentElement.parentElement);

  const score = Number(chatCard.find(".score")[0].innerText);

  let heal = Math.ceil(score / 5);
  if (heal < 0) heal = -1;
  else heal = heal;

  let healedTrihn = await getHealOptions();

  for (const actor of actors) {
    const trihn = actor.system.trihns[healedTrihn];

    const { value, max } = trihn;

    let newValue = Math.min(heal + value, max);
    actor.update({
      [`system.trihns.${healedTrihn}.value`]: newValue,
    });
  }
}

async function getHealOptions() {
  let template = "systems/shaanworld/templates/chat/healing-dialog.hbs";
  let trihn;
  const html = await renderTemplate(template, { trihn });

  return new Promise((resolve) => {
    const data = {
      title: game.i18n.format("chat.Heal.soin"),
      content: html,
      data: {},
      buttons: {
        normal: {
          label: game.i18n.localize("chat.Heal.soin"),
          callback: (html) =>
            resolve(_processHealOptions(html[0].querySelector("form"))),
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
  function _processHealOptions(form) {
    return form.trihn?.value;
  }
}
