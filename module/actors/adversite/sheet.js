const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class AdversiteSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["adversite"],
    position: {
      width: 400,
      height: 780,
    },
    form: {
      submitOnChange: true,
      closeOnSubmit: false,
    },
  };

  /** @override */
  static PARTS = {
    form: {
      template: "systems/shaanworld/templates/actors/adversite/sheet.hbs",
      // Si le nom du dossier varie selon le type d'acteur, utilisez une méthode dynamique _prepareContext
    },
  };

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const actorData = this.actor.toObject(false);

    Object.assign(context, {
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
    });

    console.log(context);
    return context;
  }

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);
    const html = this.element; // Récupère l'élément HTMLElement natif du DOM (plus besoin de jQuery)

    // Vos écouteurs d'événements JS natifs vont ici
    // Exemple : html.querySelector(".my-button")?.addEventListener("click", ...);
  }
}