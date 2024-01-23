import { CHARACTER_ACTOR_TYPES, tupleHasValue } from "../utils/utils.js";
export class ActorSW extends Actor{
    isOfType(...types) {   
        return types.some((t) =>
            "character" === t
              ? (0, tupleHasValue)(CHARACTER_ACTOR_TYPES, this.type)
              : this.type === t
          );
    }
}
export const ActorProxySR = new Proxy(ActorSW, {
    construct: (_target, args) =>
      new CONFIG.shaanworld.Actor.documentClasses[args[0].type](...args),
});