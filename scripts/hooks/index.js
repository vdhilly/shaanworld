import { DiceSoNiceReady } from "./dice-so-nice-ready.js";
import { Init } from "./init.js";
import { Setup } from "./setup.js";

export const HooksSW = {
  listen() {
    const listeners = [DiceSoNiceReady, Init, Setup];
    for (const Listener of listeners) {
      Listener.listen();
    }
  },
};
