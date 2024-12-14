import { AllySW } from "../ally/document.js";
import { ActorSW } from "../document.js";
export class character extends ActorSW {
  async modifyTokenAttribute(attribute, value, isDelta = false, isBar = true) {
    const current = foundry.utils.getProperty(this.system, attribute);
    // Determine the updates to make to the actor data
    let updates;
    if (isBar) {
      if (isDelta) {
        value = Math.clamped(-30, Number(current.value) + value, current.max);
      }
      updates = { [`system.${attribute}.value`]: value };
    } else {
      value = Number(current) + value;
      updates = { [`system.${attribute}`]: value };
    }

    const allowed = Hooks.call("modifyTokenAttribute", { attribute, value, isDelta, isBar }, updates);
    return allowed !== false ? this.update(updates) : this;
  }
  prepareBaseData() {
    super.prepareBaseData();

    this.allies = this.system.allies
      .map((m) => fromUuidSync(m.uuid))
      .filter((a) => a instanceof AllySW)
      .sort((a, b) => a.name.localeCompare(b.name));

    // for (const ally of this.allies) {
    //   ally?.shaanis.add(this);
    // }
  }
  async addAllies(...alliesToAdd) {
    const existing = this.system.allies.filter((d) => this.allies.some((m) => m.uuid === d.uuid));
    // if (existing.length === 10) {
    //   return ui.notifications.warn("Le maximum de membre dans un Shaani est de 10.");
    // }
    const existingUUIDs = new Set(existing.map((data) => data.uuid));
    const newAllies = alliesToAdd.filter((a) => a.uuid.startsWith("Actor.") && !existingUUIDs.has(a.uuid));

    const allies = [...existing, ...newAllies.map((m) => ({ uuid: m.uuid }))];
    await this.update({ system: { allies } });
  }
}
