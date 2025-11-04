import {shaanworld} from "../../module/config.js";
import {registerHandlebarsHelpers} from "../handlebars.js";
import {templatePaths} from "../preloadTemplates.js";
import {registerFonts} from "../register-fonts.js";
import shaanworldHooks from "./shaanworldHooks.js";

export const Init = {
  listen: () => {
    Hooks.once("init", () => {
      console.log("SHAAN WORLD | Initialising Shaan World System");

      CONFIG.shaanworld = shaanworld;

      registerFonts();
      registerHandlebarsHelpers();
      preloadHandleBarTemplates();

      game.shaanworld = {};

      shaanworldHooks()
    });
  },
};

async function preloadHandleBarTemplates() {
  return foundry.applications.handlebars.loadTemplates(templatePaths);
}
