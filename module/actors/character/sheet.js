import * as Dice from "../../system/check/dice.js";

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
    sheetData.enrichedBGnotes = await TextEditor.enrichHTML(
      getProperty(this.actor.system, "biography.background"),
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
  prepareVocations(sheetData) {
    const beforeUpdate = JSON.parse(JSON.stringify(sheetData.data.domains))
    const actorDomains = JSON.parse(JSON.stringify(this.actor.system.domains))

    for (const domain of sheetData.config.domains) {
      let domainVocations = sheetData.items.filter(function (item) {
        return item.system.domain == domain;
      });
  
      let d = domain.toLowerCase().replace('é', 'e');
  
      sheetData.data.domains[d].vocations.push(...domainVocations);
    }
    const domains = sheetData.data.domains 

      if(JSON.stringify(domains) !== JSON.stringify(beforeUpdate) || JSON.stringify(domains) !== JSON.stringify(actorDomains)) {
        this.actor.update({
          "system.domains": domains
        })
      }
  }
  activateListeners($html){
    super.activateListeners($html);
    const html = $html[0];

    $html.find(".domainCheck").click(this._onDomainCheck.bind(this));
  }
  _onDomainCheck(event){
    let actor = this.actor
    console.log(actor)

    Dice.domainCheck(actor)
  }
}
