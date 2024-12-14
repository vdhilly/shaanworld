import { AdversiteSheet } from "../module/actors/adversite/sheet.js";
import { AllySheetSW } from "../module/actors/ally/sheet.js";
import { ActorSheetSW } from "../module/actors/character/sheet.js";
import { BloodlineSheetSW } from "../module/items/lignee/sheet.js";
import { PeopleSheetSW } from "../module/items/people/sheet.js";
import { RoleSheetSW } from "../module/items/role/sheet.js";
import { VocationSheetSW } from "../module/items/vocation/sheet.js";
export function registerSheets() {
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("shaanworld", ActorSheetSW, {
    types: ["character"],
    label: "character",
  });
  Actors.registerSheet("shaanworld", AdversiteSheet, {
    types: ["adversite"],
    label: "adversite",
  });
  Actors.registerSheet("shaanworld", AllySheetSW, {
    types: ["ally"],
    label: "ally",
  });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("shaanworld", BloodlineSheetSW, {
    types: ["lignee"],
    label: "lignee",
  });
  Items.registerSheet("shaanworld", PeopleSheetSW, {
    types: ["people"],
    label: "people",
  });
  Items.registerSheet("shaanworld", VocationSheetSW, {
    types: ["vocation"],
    label: "vocation",
  });
  Items.registerSheet("shaanworld", RoleSheetSW, {
    types: ["role"],
    label: "role",
  });
}
