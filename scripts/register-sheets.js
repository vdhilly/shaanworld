import { ActorSheetSW } from "../module/actors/character/sheet.js";
import { BloodlineSheetSW } from "../module/items/lignee/sheet.js";
import { PeopleSheetSW } from "../module/items/people/sheet.js";
import { RoleSheetSW } from "../module/items/role/sheet.js";
import { VocationSheetSW } from "../module/items/vocation/sheet.js";
export function registerSheets() {
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("shaanrenaissance", ActorSheetSW, {
    types: ["character"],
    label: "character",
  });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("shaanrenaissance", BloodlineSheetSW, {
    types: ["lignee"],
    label: "lignee",
  });
  Items.registerSheet("shaanrenaissance", PeopleSheetSW, {
    types: ["people"],
    label: "people",
  });
  Items.registerSheet("shaanrenaissance", VocationSheetSW, {
    types: ["vocation"],
    label: "vocation",
  });
  Items.registerSheet("shaanrenaissance", RoleSheetSW, {
    types: ["role"],
    label: "role",
  });
}
