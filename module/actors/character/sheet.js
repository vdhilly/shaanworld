import * as Dice from "../../system/check/dice.js";
import { htmlQuery } from "../../utils/utils.js";

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

    this.prepareEditors(sheetData);
    this.prepareVocations(sheetData);
    this.prepareData(sheetData, actorData);
    console.log(sheetData);
    return sheetData;
  }
  async prepareEditors(sheetData){
    sheetData.enrichedGMnotes = await TextEditor.enrichHTML(
      getProperty(this.actor.system, "biography.campagne.gm"),
      { async: true }
    );
    sheetData.enrichedUserNotes = await TextEditor.enrichHTML(
      getProperty(this.actor.system, "biography.campagne.notes"),
      { async: true }
    );
    sheetData.enrichedBGNotes = await TextEditor.enrichHTML(
      getProperty(this.actor.system, "biography.background"),
      { async: true }
    );
    sheetData.enrichedRuptureNotes = await TextEditor.enrichHTML(
      getProperty(this.actor.system, "biography.rupture"),
      { async: true }
    );
    sheetData.enrichedQuestNotes = await TextEditor.enrichHTML(
      getProperty(this.actor.system, "biography.quest"),
      { async: true }
    );
    sheetData.enrichedAppearanceNotes = await TextEditor.enrichHTML(
      getProperty(this.actor.system, "biography.appearance"),
      { async: true }
    );
    sheetData.enrichedAlliesNotes = await TextEditor.enrichHTML(
      getProperty(this.actor.system, "biography.campagne.allies"),
      { async: true }
    );
    sheetData.enrichedEnemiesNotes = await TextEditor.enrichHTML(
      getProperty(this.actor.system, "biography.campagne.enemies"),
      { async: true }
    );
  }
  prepareData(sheetData, actorData){
    let lastElement
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
    const beforeUpdate = JSON.parse(JSON.stringify(sheetData.actor.system.domains))
    const actorBefore = JSON.parse(JSON.stringify(this.actor.system.domains))
    // console.log(sheetData.actor.system)

    for (const domain of sheetData.config.domains) {
      let domainVocations = sheetData.items.filter(function (item) {
        return item.system.domain === domain;
      });
  
      let d = domain.toLowerCase().replace('é', 'e');
  
      for (const vocation of domainVocations) {
        const isUnique = !sheetData.data.domains[d].vocations.some(existingVocation =>
          existingVocation._id === vocation._id
        );

        if (isUnique) {
          sheetData.data.domains[d].vocations.push(vocation);
        }
      }
    }

    this.updateVocations(sheetData, beforeUpdate)
  }
  updateVocations(sheetData, beforeUpdate){
    const domains = sheetData.actor.system.domains

    for(const domainKey in domains){
      if(JSON.stringify(domains[domainKey]) !== JSON.stringify(beforeUpdate[domainKey])){
        this.actor.update({[`system.domains.${domainKey}`]: domains[domainKey]})
      }
    }
  }
  activateListeners($html){
    super.activateListeners($html);
    const html = $html[0];

    $html.find(".domainCheck").click(this._onDomainCheck.bind(this));
    $html.find(".item-edit").click(this._onItemEdit.bind(this));
    $html.find(".vocation-delete").click(this._onVocationDelete.bind(this));
    $html.find(".item-delete").click(this._onItemDelete.bind(this));

    const imageLink = htmlQuery(html, "a[data-action=show-image]");
    if (!imageLink) return;

    imageLink.addEventListener("click", () => {
      const actor = this.actor;
      const title =
        actor?.token?.name || actor?.prototypeToken?.name || actor.name;

      new ImagePopout(actor.img, {
        title,
        uuid: actor.uuid,
      }).render(true);
    });
    $html.find(".open-compendium").on("click", (event) => {
      if (event.currentTarget.dataset.compendium) {
        const compendium = game.packs.get(
          event.currentTarget.dataset.compendium
        );
        console.log(compendium)
        compendium && compendium.render(!0);
      }
    });
  }
  _onDomainCheck(event){
    let actor = this.actor
    console.log(actor)

    Dice.domainCheck(actor)
  }
  _onItemEdit(event) {
    event.preventDefault();
    let element = event.target;
    let itemId = element.closest(".item").dataset.itemId;
    if(!itemId){
      return console.log("Aucun item n'a été trouvé")
    }
    let item = this.actor.items.get(itemId);

    item.sheet.render(true);
  }
  _onVocationDelete(event){
    event.preventDefault();
    let element = event.target;
    let itemId = element.closest(".item").dataset.itemId;
    let domain = element.closest(".item").dataset.vocationDomain
    if(!itemId){
        itemId = this.actor.system.domains[domain].vocations[0]._id 
        this.actor.system.domains[domain].vocations.forEach((obj, index) => {
          if (obj._id === itemId) {
            // Remove the object at the current index
            const filteredVocations = this.actor.system.domains[domain].vocations.filter(function (vocation) {
              return vocation._id !== itemId
            });
            this.actor.update({[`system.domains.${domain}.vocations`]: filteredVocations})
          }
        });
        if(this.actor.system.domains[domain].vocations == itemId){
          this.actor.update({[`system.domains.${domain}.vocation`]:""})
        }
        return this.actor.deleteEmbeddedDocuments("Item", [itemId])
    }

    if(this.actor.system.domains[domain].vocation == itemId){
      const indexToRemove = this.actor.system.domains[domain].vocations;
      this.actor.system.domains[domain].vocations.forEach((obj, index) => {
        if (obj._id === itemId) {
          // Remove the object at the current index
          const filteredVocations = this.actor.system.domains[domain].vocations.filter(function (vocation) {
            return vocation._id !== itemId
          });
          this.actor.update({[`system.domains.${domain}.vocations`]: filteredVocations})
        }
      });
      if(this.actor.system.domains[domain].vocations == itemId){
        this.actor.update({[`system.domains.${domain}.vocation`]:""})
      }
      return this.actor.deleteEmbeddedDocuments("Item", [itemId])
    }

  }
  _onItemDelete(event) {
    event.preventDefault();
    let element = event.target;
    let itemId = element.closest(".item").dataset.itemId;
    if(!itemId){
      return console.log("Aucun item n'a été trouvé")
    }
    return this.actor.deleteEmbeddedDocuments("Item", [itemId]) 
  }
}
