import * as Adversite from "../../module/system/adversite/adversite.js";
import * as Heal from "../../module/system/check/heal.js";
import * as Puiser from "../../module/system/check/puiser.js";
export const RenderChatMessage = {
  listen: () => {
    Hooks.on("renderChatMessage", (app, html, data) => {
      Puiser.hideChatPuiserButtons(app, html, data);
      Puiser.addChatListeners(app, html, data);
      Adversite.addChatListeners(app, html, data);
      Adversite.hideChatAdversiteButtons(app, html, data);
      Heal.addChatListeners(app, html, data);

      // Handle Table messages
      const table = html[0].querySelector(".table-draw");
      if (table) html[0].classList.add("table-draw");
    });
  },
};
