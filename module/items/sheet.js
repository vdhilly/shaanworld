export class ItemSheetSW extends foundry.appv1.sheets.ItemSheet {
  get template() {
    return `systems/shaanworld/templates/items/${this.item.type}/sheet.hbs`;
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
