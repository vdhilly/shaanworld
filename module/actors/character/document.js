import { Vocation } from "../../items/vocation/document.js";
import { tupleHasValue } from "../../utils/utils.js";
export class character extends Actor {
    // constructor(...args) {
    //     super(...args);
    //     this.vocations = [];
    // }
    // prepareBaseData() {
    //     super.prepareBaseData();

    //     this.vocations = this.system.domains.vocations
    //     .map((m) => fromUuidSync(m.uuid))
    //     .filter(
    //         (a) =>
    //         a instanceof Vocation
    //     )
    //     .sort((a, b) => a.name.localeCompare(b.name));
    // }
    // async addVocations(...itemsToAdd){
    //     const existing = this.system.vocations.filter((d) => {
    //         this.vocations.some((m) => m.uuid === d.uuid)
    //     });
    //     console.log(existing)
    //     if(existing.length === 25){
    //         return ui.notifications.warn("Le maximum de vocations est 25.")
    //     }
    //     const existingUUIDs = new Set(existing.map((data) => data.uuid));
    //     const newVocations = itemsToAdd.filter((a)=> a.uuid.startsWith("Item.") && !existingUUIDs.has(a.uuid));
    //     console.log(newVocations)
    //     const vocations = [...existing, ...newVocations.map((m) => ({uuid:m.uuid}))]
    //     await this.update({system:{domains: { vocations }}})
    // }
    // async removeVocations(...remove){
    //     const uuids = remove.map((d)=> (typeof d === "string" ? d : d.uuid));
    //     const existing = this.system.domains.vocations.filter((d) =>
    //     this.vocations.some((m) => m.uuid === d.uuid)
    //     );
    //     const vocations = existing.filter((m) => !tupleHasValue(uuids, m.uuid));
    //     await this.update({ system: { details: { vocations } } });
    // }
}
export const ActorProxySR = new Proxy(character, {
    construct: (_target, args) =>
      new CONFIG.shaanRenaissance.Actor.documentClasses[args[0].type](...args),
  });