import { AdversiteSheet } from "../module/actors/adversite/sheet.js";
import { AllySheetSW } from "../module/actors/ally/sheet.js";
import { ActorSheetSW } from "../module/actors/character/sheet.js";
import { BloodlineSheetSW } from "../module/items/lignee/sheet.js";
import { PeopleSheetSW } from "../module/items/people/sheet.js";
import { RoleSheetSW } from "../module/items/role/sheet.js";
import { VocationSheetSW } from "../module/items/vocation/sheet.js";
export function registerSheets() {
  foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
  foundry.documents.collections.Actors.registerSheet("shaanworld", ActorSheetSW, {
    types: ["character"],
    label: "character",
  });
  foundry.documents.collections.Actors.registerSheet("shaanworld", AdversiteSheet, {
    types: ["adversite"],
    label: "adversite",
  });
  foundry.documents.collections.Actors.registerSheet("shaanworld", AllySheetSW, {
    types: ["ally"],
    label: "ally",
  });
  foundry.documents.collections.Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);
  foundry.documents.collections.Items.registerSheet("shaanworld", BloodlineSheetSW, {
    types: ["lignee"],
    label: "lignee",
  });
  foundry.documents.collections.Items.registerSheet("shaanworld", PeopleSheetSW, {
    types: ["people"],
    label: "people",
  });
  foundry.documents.collections.Items.registerSheet("shaanworld", VocationSheetSW, {
    types: ["vocation"],
    label: "vocation",
  });
  foundry.documents.collections.Items.registerSheet("shaanworld", RoleSheetSW, {
    types: ["role"],
    label: "role",
  });
}
