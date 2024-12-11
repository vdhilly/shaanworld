import { SWTokenHUD } from "../../module/token/SWTokenHUD.js";
import {DefaultTokenConfigSW} from "../../module/token/DefaultTokenConfigSW.js";

export const Ready = {
    listen: () => {
      Hooks.once("ready", function () {
        canvas.hud.token = new SWTokenHUD();

          game.settings.registerMenu("core", DefaultTokenConfigSW.SETTING, {
              name: "SETTINGS.DefaultTokenN",
              label: "SETTINGS.DefaultTokenL",
              hint: "SETTINGS.DefaultTokenH",
              icon: "fas fa-user-alt",
              type: DefaultTokenConfigSW,
              restricted: true
          });
      });
    },
  };