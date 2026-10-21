import { AllyCheck } from "../../system/check/ally.js";
import * as Dice from "../../system/check/dice.js";
import { Heal } from "../../system/check/heal.js";
import { Regen } from "../../system/check/regen.js";
import { AllySW } from "../ally/document.js";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

// Types d'items dont l'acteur ne peut posséder qu'un seul exemplaire
const UNIQUE_ITEM_TYPES = ["lignee", "people", "role"];

export class ActorSheetSW extends HandlebarsApplicationMixin(ActorSheetV2) {
  /**
   * Les DEFAULT_OPTIONS sont fusionnés automatiquement avec ceux des classes parentes
   * (classes, actions, position, etc.), pas besoin de spread de super.
   */
  static DEFAULT_OPTIONS = {
    classes: ["character", "actor", "sheet"],
    position: {
      width: 750,
      height: 750,
    },
    form: {
      submitOnChange: true,
      closeOnSubmit: false,
    },
    actions: {
      domainCheck: ActorSheetSW.#onDomainCheck,
      heal: ActorSheetSW.#onHeal,
      regen: ActorSheetSW.#onRegen,
      editItem: ActorSheetSW.#onItemEdit,
      deleteItem: ActorSheetSW.#onItemDelete,
      rollAlly: ActorSheetSW.#onAllyRoll,
      showImage: ActorSheetSW.#onShowImage,
      openCompendium: ActorSheetSW.#onOpenCompendium,
    },
  };

  static PARTS = {
    header: { template: "systems/shaanworld/templates/actors/character/sheet.hbs" },
    tabs: { template: "systems/shaanworld/templates/actors/character/partials/nav.hbs" },
    character: { template: "systems/shaanworld/templates/actors/character/partials/general.hbs" },
    abilities: { template: "systems/shaanworld/templates/actors/character/partials/abilities.hbs" },
    allies: { template: "systems/shaanworld/templates/actors/character/partials/allies.hbs" },
    biography: { template: "systems/shaanworld/templates/actors/character/partials/biography.hbs" },
  };

  static TABS = {
    primary: {
      tabs: [{ id: "character" }, { id: "abilities" }, { id: "allies" }, { id: "biography" }],
      labelPrefix: "",
      initial: "character",
    },
  };

  /** Mémorise les onglets scrollés */
  scrollY = [".sheet-body"];

  get title() {
    return this.actor.name;
  }

  /* -------------------------------------------- */
  /*  Préparation des données                     */
  /* -------------------------------------------- */

  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    const actorData = this.actor.toObject(false);
    const sheetData = {
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
      tabs: this._prepareTabs("primary"),
    };

    await this.#prepareEditors(sheetData);
    this.#prepareVocations(sheetData);
    this.#prepareUniqueItems(sheetData, actorData);
    this.#prepareRank(sheetData);

    return {
      ...context,
      ...sheetData,
    };
  }

  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    context.tab = context.tabs?.[partId];
    return context;
  }

  async #enrich(path) {
    const value = foundry.utils.getProperty(this.actor.system, path) ?? "";
    return foundry.applications.ux.TextEditor.implementation.enrichHTML(value, {
      secrets: this.actor.isOwner,
      relativeTo: this.actor,
    });
  }

  async #prepareEditors(sheetData) {
    sheetData.enrichedGMnotes = await this.#enrich("biography.campagne.gm");
    sheetData.enrichedArtefactsNotes = await this.#enrich("artefacts");
    sheetData.enrichedUserNotes = await this.#enrich("biography.campagne.notes");
    sheetData.enrichedBGNotes = await this.#enrich("biography.background");
    sheetData.enrichedRuptureNotes = await this.#enrich("biography.rupture");
    sheetData.enrichedQuestNotes = await this.#enrich("biography.quest");
    sheetData.enrichedAppearanceNotes = await this.#enrich("biography.appearance");
    sheetData.enrichedAlliesNotes = await this.#enrich("biography.campagne.allies");
    sheetData.enrichedEnemiesNotes = await this.#enrich("biography.campagne.enemies");
  }

  /**
   * Expose le dernier item de chaque type unique (lignee, people, role).
   * La suppression des doublons est gérée au drop (voir _onDropItem),
   * jamais pendant le rendu.
   */
  #prepareUniqueItems(sheetData, actorData) {
    for (const type of UNIQUE_ITEM_TYPES) {
      const items = actorData.items.filter((item) => item.type === type);
      sheetData[type] = items.at(-1);
    }
  }

  #prepareVocations(sheetData) {
    sheetData.vocations = {};

    for (const domain of sheetData.config?.domains ?? []) {
      sheetData.vocations[domain.toLowerCase().replace("é", "e")] = sheetData.items.filter(
        (item) => item.system?.domain === domain
      );
    }
  }

  #prepareRank(sheetData) {
    const domains = sheetData.data.domains ?? {};
    const ranks = Object.values(domains).map((domain) => domain.rank ?? 0);
    const highestDomain = ranks.length ? Math.max(...ranks) : 0;

    const calculateRank = (value) => {
      if (value >= 6 && value <= 8) return 2;
      if (value >= 9 && value <= 11) return 3;
      if (value >= 12 && value <= 14) return 4;
      if (value === 15) return 5;
      return 1;
    };

    const rankLabels = {
      1: "Profane",
      2: "Apprenti",
      3: "Initié",
      4: "Maître",
      5: "Légende",
    };

    const rank = calculateRank(highestDomain);

    sheetData.data.rank = rank;
    sheetData.data.baseDifficulty = rank === 1 ? 10 : 5 * rank;
    sheetData.data.rankLabel = rankLabels[rank];
  }

  /* -------------------------------------------- */
  /*  Rendu                                       */
  /* -------------------------------------------- */

  async _onRender(context, options) {
    await super._onRender(context, options);
    const html = this.element;

    // Sélectionne le contenu des champs au focus
    html.querySelectorAll(".circle input").forEach((input) => {
      input.addEventListener("focus", (event) => event.target.select());
    });

    // Tronque les noms de vocation trop longs
    html.querySelectorAll(".vocation-name").forEach((span) => {
      const name = span.innerText;
      if (name.length >= 19) {
        span.innerText = name.substring(0, 17) + "...";
      }
    });
  }

  /* -------------------------------------------- */
  /*  Actions (data-action="...")                 */
  /* -------------------------------------------- */

  static #onDomainCheck(event, target) {
    Dice.domainCheck(this.actor);
  }

  static #onHeal(event, target) {
    Heal(this.actor);
  }

  static #onRegen(event, target) {
    Regen(this.actor);
  }

  static #onItemEdit(event, target) {
    const itemId = target.closest("[data-item-id]")?.dataset.itemId;
    if (!itemId) return console.warn("Aucun item n'a été trouvé");
    this.actor.items.get(itemId)?.sheet.render(true);
  }

  static async #onItemDelete(event, target) {
    const itemId = target.closest("[data-item-id]")?.dataset.itemId;
    if (!itemId) return console.error("itemId is not defined");
    return this.actor.deleteEmbeddedDocuments("Item", [itemId]);
  }

  static #onAllyRoll(event, target) {
    const actor = game.actors.get(target.dataset.id);
    if (actor) AllyCheck(actor);
  }

  static #onShowImage(event, target) {
    const actor = this.actor;
    const title = actor.token?.name || actor.prototypeToken?.name || actor.name;

    new foundry.applications.apps.ImagePopout({
      src: actor.img,
      window: { title },
      uuid: actor.uuid,
    }).render({ force: true });
  }

  static #onOpenCompendium(event, target) {
    const pack = game.packs.get(target.dataset.compendium);
    pack?.render({ force: true });
  }

  /* -------------------------------------------- */
  /*  Drag & drop                                 */
  /* -------------------------------------------- */

  async _onDropActor(event, data) {
    const result = await super._onDropActor(event, data);

    const actor = await fromUuid(data.uuid);
    if (actor instanceof AllySW) {
      await this.document.addAllies(actor);
    }
    return result;
  }

  /**
   * Garantit l'unicité des items lignee / people / role :
   * l'ancien est supprimé quand un nouveau est déposé.
   */
  async _onDropItem(event, data) {
    if (!this.actor.isOwner) return null;

    const item = await Item.implementation.fromDropData(data);
    if (item && UNIQUE_ITEM_TYPES.includes(item.type)) {
      const previous = this.actor.items.filter((i) => i.type === item.type).map((i) => i.id);
      if (previous.length) await this.actor.deleteEmbeddedDocuments("Item", previous);
    }

    return super._onDropItem(event, data);
  }
}