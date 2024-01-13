import { ItemProxySW } from "../../module/items/document.js";

export const Load = {
  listen: () => {
    CONFIG.Item.documentClass = ItemProxySW;
  },
};
