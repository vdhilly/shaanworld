import { objectHasKey } from "../utils/utils.js";
export class TokenDocumentSW extends TokenDocument {
  _onCreate(data, options, userId) {
    super._onCreate(data, options, userId);
    if (this.parent.isView) this.object?._onCreate(data, options, userId);
    this.bar1 = { attribute: "trihns.esprit" };
    this.bar2 = { attribute: "trihns.ame" };
    this.bar3 = { attribute: "trihns.corps" };
  }
  _onUpdate(data, options, userId) {
    // Update references to original state so that resetting the preview does not clobber these updates in-memory.
    if (!options.preview)
      Object.values(this.apps).forEach(
        (app) => (app.original = this.toObject())
      );

    // If the Actor association has changed, expire the cached Token actor
    if ("actorId" in data || "actorLink" in data) {
      if (this._actor)
        Object.values(this._actor.apps).forEach((app) =>
          app.close({ submit: false })
        );
      this._actor = null;
    }

    // If the Actor data override changed, simulate updating the synthetic Actor
    if ("actorData" in data && !this.isLinked) {
      this._onUpdateTokenActor(data.actorData, options, userId);
    }

    // Post-update the Token itself

    return super._onUpdate(data, options, userId);
  }
}
