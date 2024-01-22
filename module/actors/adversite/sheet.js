export class AdversiteSheet extends ActorSheet {
    static get defaultOptions() {
        const options = super.defaultOptions;
        return (
          (options.classes = [...options.classes, "adversite"]),
          (options.width = 400),
          (options.height = 700),
          options.scrollY.push(".sheet-body"),

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
    

        console.log(sheetData);
        return sheetData;
      }
}