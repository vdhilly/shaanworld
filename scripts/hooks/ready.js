import { SWTokenHUD } from "../../module/token/SWTokenHUD.js";

export const Ready = {
    listen: () => {
      Hooks.once("ready", function () {
        canvas.hud.token = new SWTokenHUD();

      });
    },
  };