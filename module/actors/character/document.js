
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
    
        const allowed = Hooks.call(
          "modifyTokenAttribute",
          { attribute, value, isDelta, isBar },
          updates
        );
        return allowed !== false ? this.update(updates) : this;
      }
}