import { ItemSheetSW } from "../sheet.js";

export class VocationSheetSW extends ItemSheetSW {
    static get defaultOptions() {
      const options = super.defaultOptions;
      return (
        (options.classes = [...options.classes, "item"]),
        (options.width = 650),
        (options.height = 730),
        options
      );
    }
    async getData(options = this.options) {
    options.id || (options.id = this.id);
    const itemData = this.item.toObject(!1),
      sheetData = {
        editable: this.isEditable,
        document: this.item,
        limited: this.item.limited,
        owner: this.item.isOwner,
        title: this.title,
        item: itemData,
        data: itemData.system,
        effects: itemData.effects,
        config: CONFIG.shaanworld,
        user: {
          isGM: game.user.isGM,
        },
      };

    console.log(sheetData);
    return sheetData;
  }
  activateListeners($html){
    super.activateListeners($html)
    const html = $html[0]

    if(this.isEditable && this.object.parent){
      const header = $html.find("header")[0]
      const control = document.createElement("a")
      const trashCan = document.createElement("i")
      trashCan.title = "Supprimer de l'acteur"
      $(control).addClass("item-delete")
      $(trashCan).addClass("fas fa-fw fa-trash")
      control.appendChild(trashCan)
      header.appendChild(control)
      $html.find(".item-delete").click(this._onItemDeleteFromParent.bind(this))
    }
  }
  _onItemDeleteFromParent(event){
    const itemId = this.document.id
    return this.actor.deleteEmbeddedDocuments("Item", [itemId]) 
  }
}