import { ActorProxySR } from "../../module/actors/character/document.js";
import { ItemProxySW } from "../../module/items/document.js";

export const Load = {
  listen: () => {
    CONFIG.Actor.documentClass = ActorProxySR;
    CONFIG.Item.documentClass = ItemProxySW;
  },
};
