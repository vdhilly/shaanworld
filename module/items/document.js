export class ItemSW extends Item {}

export const ItemProxySW = new Proxy(ItemSW, {
  construct: (_target, args) =>
    new CONFIG.shaanworld.Item.documentClasses[args[0].type](...args),
});
