
import { BloodlineSheetSW } from "./items/lignee/sheet.js";
import { PeopleSheetSW } from "./items/people/sheet.js";
import { VocationSheetSW } from "./items/vocation/sheet.js";

export const shaanworld = {};

shaanworld.Item = {
  documentClasses: {
    lignee: BloodlineSheetSW,
    people: PeopleSheetSW,
    vocation: VocationSheetSW,
  },
};

shaanworld.domains = ["Technique","Savoir","Social","Arts","Shaan","Magie","Rituels","Survie","Combat","Nécrose"]
shaanworld.roles = ["Victime", "Observateur", "Sauveur", "Bourreau"]
shaanworld.archetypes = ["Technicien", "Savant", "Médiateur", "Artiste", "Shaaniste", "Mage", "Croyant", "Aventurier", "Guerrier", "Déviant"]