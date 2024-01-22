import { ActorProxySR } from "../../module/actors/document.js";
import { ItemProxySW } from "../../module/items/document.js";
import { TokenConfigSW } from "../../module/token/TokenConfigSW.js";
import { TokenDocumentSW } from "../../module/token/TokenDocumentSW.js";
import { TokenSW } from "../../module/token/TokenSW.js";

export const Load = {
  listen: () => {
    CONFIG.Actor.documentClass = ActorProxySR;
    CONFIG.Item.documentClass = ItemProxySW;
    CONFIG.Token.objectClass = TokenSW;
    CONFIG.Token.documentClass = TokenDocumentSW;
    CONFIG.Token.prototypeSheetClass = TokenConfigSW;
  },
};
