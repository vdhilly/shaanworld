import { ItemSheetSW } from "../sheet.js";

export class ArchetypeSheetSW extends ItemSheetSW {
    static get defaultOptions() {
        const options = super.defaultOptions;
        return (
          (options.classes = [...options.classes, "item"]),
          (options.width = 650),
          (options.height = 535),
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
}
