import { AllyCheck } from "../../system/check/ally.js";

export class AllySheetSW extends foundry.appv1.sheets.ActorSheet {
  static get defaultOptions() {
    const options = super.defaultOptions;
    return (options.classes = [...options.classes, "character"]), (options.width = 500), (options.height = 500), options;
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
        owner: this.actor.isOwner,
        actor: actorData,
        data: actorData.system,
        config: CONFIG.shaanworld,
        user: {
          isGM: game.user.isGM,
        },
      };

    this.prepareData(sheetData, actorData);
    console.log(sheetData);
    return sheetData;
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
  }
  activateListeners($html) {
    super.activateListeners($html);
    const html = $html[0];

    $html.find(".roll-ally").click(this._onAllyRoll.bind(this));
  }
  _onAllyRoll(event) {
    let actor = this.actor;
    AllyCheck(actor);
  }
}
