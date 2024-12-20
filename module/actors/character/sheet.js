import { AllyCheck } from "../../system/check/ally.js";
import * as Dice from "../../system/check/dice.js";
import { Heal } from "../../system/check/heal.js";
import { Regen } from "../../system/check/regen.js";
import { htmlQuery, htmlQueryAll } from "../../utils/utils.js";
import { AllySW } from "../ally/document.js";

export class ActorSheetSW extends ActorSheet {
  static get defaultOptions() {
    const options = super.defaultOptions;
    return (
      (options.classes = [...options.classes, "character"]),
      (options.width = 750),
      (options.height = 750),
      options.scrollY.push(".sheet-body"),
      (options.tabs = [
        {
          navSelector: ".sheet-navigation",
          contentSelector: ".sheet-content",
          initial: "character",
        },
        {
          navSelector: ".nav-notes",
          contentSelector: ".notes-content",
          initial: "userNotes",
        },
      ]),
      options
    );
  }
  get template() {
    return `systems/shaanworld/templates/actors/${this.actor.type}/sheet.hbs`;
  }
  async getData(options = this.options) {
    options.id || (options.id = this.id);
    const actorData = this.actor.toObject(!1),
      sheetData = {
        editable: this.isEditable,
        document: this.actor,
        effects: this.actor.getEmbeddedCollection("ActiveEffect"),
        owner: this.actor.isOwner,
        actor: actorData,
        data: actorData.system,
        items: actorData.items,
        flags: actorData.flags,
        config: CONFIG.shaanworld,
        user: {
          isGM: game.user.isGM,
        },
      };

    await this.prepareEditors(sheetData);
    this.prepareVocations(sheetData);
    this.prepareData(sheetData, actorData);
    this.prepareRank(sheetData);
    console.log(sheetData);
    return sheetData;
  }
  async prepareEditors(sheetData) {
    sheetData.enrichedGMnotes = await TextEditor.enrichHTML(
      foundry.utils.getProperty(this.actor.system, "biography.campagne.gm"),
      { async: true }
    );
    sheetData.enrichedArtefactsNotes = await TextEditor.enrichHTML(foundry.utils.getProperty(this.actor.system, "artefacts"), {
      async: true,
    });
    sheetData.enrichedUserNotes = await TextEditor.enrichHTML(
      foundry.utils.getProperty(this.actor.system, "biography.campagne.notes"),
      { async: true }
    );
    sheetData.enrichedBGNotes = await TextEditor.enrichHTML(
      foundry.utils.getProperty(this.actor.system, "biography.background"),
      { async: true }
    );
    sheetData.enrichedRuptureNotes = await TextEditor.enrichHTML(
      foundry.utils.getProperty(this.actor.system, "biography.rupture"),
      { async: true }
    );
    sheetData.enrichedQuestNotes = await TextEditor.enrichHTML(foundry.utils.getProperty(this.actor.system, "biography.quest"), {
      async: true,
    });
    sheetData.enrichedAppearanceNotes = await TextEditor.enrichHTML(
      foundry.utils.getProperty(this.actor.system, "biography.appearance"),
      { async: true }
    );
    sheetData.enrichedAlliesNotes = await TextEditor.enrichHTML(
      foundry.utils.getProperty(this.actor.system, "biography.campagne.allies"),
      { async: true }
    );
    sheetData.enrichedEnemiesNotes = await TextEditor.enrichHTML(
      foundry.utils.getProperty(this.actor.system, "biography.campagne.enemies"),
      { async: true }
    );
  }
  prepareData(sheetData, actorData) {
    let lastElement;
    // Filtre Lignee
    let lignee = actorData.items.filter(function (item) {
      return item.type == "lignee";
    });
    lastElement = lignee[lignee.length - 1];

    lignee.forEach((element) => {
      if (element != lastElement) {
        let itemId = element._id;
        return this.actor.deleteEmbeddedDocuments("Item", [itemId]);
      }
    });
    sheetData.lignee = lastElement;

    // Filtre Peuple
    let people = actorData.items.filter(function (item) {
      return item.type == "people";
    });
    lastElement = people[people.length - 1];

    people.forEach((element) => {
      if (element != lastElement) {
        let itemId = element._id;
        return this.actor.deleteEmbeddedDocuments("Item", [itemId]);
      }
    });
    sheetData.people = lastElement;

    // Filtre Role
    let role = actorData.items.filter(function (item) {
      return item.type == "role";
    });
    lastElement = role[role.length - 1];

    role.forEach((element) => {
      if (element != lastElement) {
        let itemId = element._id;
        return this.actor.deleteEmbeddedDocuments("Item", [itemId]);
      }
    });
    sheetData.role = lastElement;
  }
  prepareVocations(sheetData) {
    sheetData.vocations = {};

    for (const domain of sheetData.config.domains) {
      sheetData.vocations[domain.toLowerCase().replace("é", "e")] = sheetData.items.filter(function (item) {
        return item.system.domain === domain;
      });
    }
  }
  async prepareRank(sheetData) {
    const domains = sheetData.data.domains;

    // Get the highest domain rank
    let highestDomain = Math.max(...Object.values(domains).map((domain) => domain.rank));

    // Calculate rank based on highest domain
    function calculateRank(highestDomain) {
      if (highestDomain >= 6 && highestDomain <= 8) return 2;
      if (highestDomain >= 9 && highestDomain <= 11) return 3;
      if (highestDomain >= 12 && highestDomain <= 14) return 4;
      if (highestDomain === 15) return 5;
      return 1; // Default case
    }

    const rank = calculateRank(highestDomain);

    // Update sheetData with the calculated rank and baseDifficulty
    sheetData.data.rank = rank;
    sheetData.data.baseDifficulty = rank === 1 ? 10 : 5 * rank;
    switch (rank) {
      case 1:
        sheetData.data.rankLabel = "Profane";
        break;
      case 2:
        sheetData.data.rankLabel = "Apprenti";
        break;
      case 3:
        sheetData.data.rankLabel = "Initié";
        break;
      case 4:
        sheetData.data.rankLabel = "Maître";
        break;
      case 5:
        sheetData.data.rankLabel = "Légende";
        break;
    }
  }

  activateListeners($html) {
    super.activateListeners($html);
    const html = $html[0];

    $html.find(".domainCheck").click(this._onDomainCheck.bind(this));
    $html.find(".item-edit, .vocation-name").click(this._onItemEdit.bind(this));
    $html.find(".item-delete").click(this._onItemDelete.bind(this));
    $html.find(".heal").click(this._onHeal.bind(this));
    $html.find(".circle input").on("focus", (event) => {
      event.target.select();
    });
    $html.find(".roll-ally").click(this._onAllyRoll.bind(this));

    const imageLink = htmlQuery(html, "a[data-action=show-image]");
    if (!imageLink) return;

    imageLink.addEventListener("click", () => {
      const actor = this.actor;
      const title = actor?.token?.name || actor?.prototypeToken?.name || actor.name;

      new ImagePopout(actor.img, {
        title,
        uuid: actor.uuid,
      }).render(true);
    });
    $html.find(".open-compendium").on("click", (event) => {
      if (event.currentTarget.dataset.compendium) {
        const compendium = game.packs.get(event.currentTarget.dataset.compendium);
        compendium && compendium.render(!0);
      }
    });

    const vocationNameSpans = htmlQueryAll(html, ".vocation-name");
    for (let i = 0; i < vocationNameSpans.length; i++) {
      let vocationName = vocationNameSpans[i].innerText;
      if (vocationName.length >= 19) {
        let difference = vocationName.length - 19;
        vocationNameSpans[i].innerText = vocationName.substring(0, 19 - 2) + "...";
      }
    }
  }
  _onDomainCheck(event) {
    let actor = this.actor;

    Dice.domainCheck(actor);
  }
  _onHeal(event) {
    let action = event.currentTarget.dataset.action;
    let actor = this.actor;
    switch (action) {
      case "heal":
        Heal(actor);
        break;
      case "regen":
        Regen(actor);
        break;
    }
  }
  _onItemEdit(event) {
    event.preventDefault();
    let element = event.target;
    let itemId = element.closest(".item").dataset.itemId;
    if (!itemId) {
      return console.log("Aucun item n'a été trouvé");
    }
    let item = this.actor.items.get(itemId);

    item.sheet.render(true);
  }
  _onItemDelete(event) {
    try {
      event.preventDefault();
      let element = event.target;
      let itemId = element.closest(".item").dataset.itemId;
      if (!itemId) {
        throw new Error("itemId is not defined");
      }
      return this.actor.deleteEmbeddedDocuments("Item", [itemId]);
    } catch (error) {
      console.error(error);
    }
  }
  async _onDropActor(event, data) {
    await super._onDropActor(event, data);

    const actor = fromUuidSync(data.uuid);
    if (actor instanceof AllySW) {
      this.document.addAllies(actor);
    }
  }
  _onAllyRoll(event) {
    const target = event.currentTarget;
    let actor = game.actors.get(target.dataset.id);
    AllyCheck(actor);
  }
}
