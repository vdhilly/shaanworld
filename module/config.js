
import { character } from "./actors/character/document.js";
import { ItemSW } from "./items/document.js";
import { Vocation } from "./items/vocation/document.js";
import { domainCheck } from "./system/check/dice.js";
import { getSelectedOrOwnActors } from "./utils/utils.js";

export const shaanworld = {};

shaanworld.Actor = {
  documentClasses: {
    character: character
  }
}
shaanworld.Item = {
  documentClasses: {
    lignee: ItemSW,
    people: ItemSW,
    vocation: Vocation,
  },
};

shaanworld.domains = ["Technique","Savoir","Social","Arts","Shaan","Magie","Rituels","Survie","Combat","Nécrose"]
shaanworld.archetypes = ["Technicien", "Savant", "Médiateur", "Artiste", "Shaaniste", "Mage", "Croyant", "Aventurier", "Guerrier", "Déviant"]

shaanworld.macros = {
  domainCheck: domainCheck
}
shaanworld.utils = {
  getSelectedOrOwnActors: getSelectedOrOwnActors
}