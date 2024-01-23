import * as Adversite from "../../module/system/adversite/adversite.js";
import * as Puiser from "../../module/system/check/puiser.js";
export const RenderChatMessage = {
  listen: () => {
    Hooks.on("renderChatMessage", (app, html, data) => {
      Puiser.hideChatPuiserButtons(app, html, data);
      Puiser.addChatListeners(app, html, data);
      Adversite.addChatListeners(app, html, data);
    });
  },
};
