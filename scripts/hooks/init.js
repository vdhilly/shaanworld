import { shaanworld } from "../../module/config.js";
import { registerHandlebarsHelpers } from "../handlebars.js";
import { templatePaths } from "../preloadTemplates.js";
import { registerFonts } from "../register-fonts.js";

export const Init = {
  listen: () => {
    Hooks.once("init", () => {
      console.log("SHAAN WORLD | Initialising Shaan World System");

      CONFIG.shaanworld = shaanworld;
      registerFonts();
      registerHandlebarsHelpers();
      preloadHandleBarTemplates();

      game.shaanworld = {};
    });
  },
};

async function preloadHandleBarTemplates() {
  return loadTemplates(templatePaths);
}
