import { box } from "./vector";

class CollisionContext {
  object1: box;
  object2: box;
}

export function collision(clCtx: CollisionContext) : boolean {
  return (
    clCtx.object1.position.y + clCtx.object1.height >= clCtx.object2.position.y &&
    clCtx.object1.position.y <= clCtx.object2.position.y + clCtx.object2.height &&
    clCtx.object1.position.x <= clCtx.object2.position.x + clCtx.object2.width &&
    clCtx.object1.position.x + clCtx.object1.width >= clCtx.object2.position.x
  );
}

export function platformCollision(clCtx: CollisionContext) : boolean {
  return (
    clCtx.object1.position.y + clCtx.object1.height >= clCtx.object2.position.y &&
    clCtx.object1.position.y + clCtx.object1.height <= clCtx.object2.position.y + clCtx.object2.height &&
    clCtx.object1.position.x <= clCtx.object2.position.x + clCtx.object2.width &&
    clCtx.object1.position.x + clCtx.object1.width >= clCtx.object2.position.x
  );
}
