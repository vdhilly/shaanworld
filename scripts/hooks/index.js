import { DiceSoNiceReady } from "./dice-so-nice-ready.js";
import { Init } from "./init.js";
import { Load } from "./load.js";
import { Ready } from "./ready.js";
import { RenderChatMessage } from "./render-chat-message.js";
import { Setup } from "./setup.js";

export const HooksSW = {
  listen() {
    const listeners = [Load, DiceSoNiceReady, Init, Ready, RenderChatMessage, Setup];
    for (const Listener of listeners) {
      Listener.listen();
    }
  },
};
