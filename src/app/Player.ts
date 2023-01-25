import { CollisionBlock } from './CollisionBlock';
import { collision, platformCollision } from './collisionUtils';
import { ISprite, Sprite } from './Sprite';
import { box, point, position, vector } from './vector';

export interface CameraContext {
  camera: point;
  canvas: box;
}

export interface IPlayer {
  position: position;
  gravity: number;
  collisionBlocks: CollisionBlock[];
  platformCollisionBlocks: CollisionBlock[];
  imageSrc: string;
  frameRate: number;
  scale?: number;
  animations: any;
}

export class Player extends Sprite {
  velocity: vector;
  collisionBlocks: CollisionBlock[];
  platformCollisionBlocks: CollisionBlock[];
  hitbox: box;
  lastDirection: string;
  animations: any;
  camerabox: box;
  gravity: number;

  constructor(iplayer: IPlayer) {
    const _defaultscale = 0.5;
    super({
      position: iplayer.position,
      imageSrc: iplayer.imageSrc,
      frameRate: iplayer.frameRate,
      scale: _defaultscale
    } as ISprite);
    this.position = iplayer.position;
    this.velocity = {
      x: 0,
      y: 1
    };

    this.gravity = iplayer.gravity;

    this.collisionBlocks = iplayer.collisionBlocks;
    this.platformCollisionBlocks = iplayer.platformCollisionBlocks;

    this.hitbox = {
      position: {
        x: this.position.x,
        y: this.position.y
      } as position,
      width: 10,
      height: 10
    } as box;

    this.name = 'player';

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.animations = iplayer.animations;
    this.lastDirection = 'right';

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    const anim_mapped: any[] = Object.keys(this.animations).map((key) => ({
      key: key,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      value: this.animations[key]
    }));
    anim_mapped.forEach((anim) => {
      const image = new Image();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      image.src = this.animations[anim.key].imageSrc;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.animations[anim.key].image = image;
    });

    this.camerabox = {
      position: {
        x: this.position.x,
        y: this.position.y
      },
      width: 200,
      height: 80
    };
  }

  switchSprite(key) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (this.image === this.animations[key].image || !this.loaded) return;

    this.currentFrame = 0;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    this.image = this.animations[key].image;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    this.frameBuffer = this.animations[key].frameBuffer;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    this.frameRate = this.animations[key].frameRate;
  }

  updateCamerabox() {
    this.camerabox = {
      position: {
        x: this.position.x - 50,
        y: this.position.y
      },
      width: 200,
      height: 80
    };
  }

  checkForHorizontalCanvasCollision() {
    if (
      this.hitbox.position.x + this.hitbox.width + this.velocity.x >= 576 ||
      this.hitbox.position.x + this.velocity.x <= 0
    ) {
      this.velocity.x = 0;
    }
  }

  shouldPanCameraToTheLeft(ctx: CameraContext) {
    const cameraboxRightSide = this.camerabox.position.x + this.camerabox.width;
    const scaledDownCanvasWidth = ctx.canvas.width / 4;

    if (cameraboxRightSide >= 576) return;

    if (
      cameraboxRightSide >=
      scaledDownCanvasWidth + Math.abs(ctx.camera.position.x)
    ) {
      ctx.camera.position.x -= this.velocity.x;
    }
  }

  shouldPanCameraToTheRight(ctx: CameraContext) {
    if (this.camerabox.position.x <= 0) return;

    if (this.camerabox.position.x <= Math.abs(ctx.camera.position.x)) {
      ctx.camera.position.x -= this.velocity.x;
    }
  }

  shouldPanCameraDown(ctx: CameraContext) {
    if (this.camerabox.position.y + this.velocity.y <= 0) return;

    if (this.camerabox.position.y <= Math.abs(ctx.camera.position.y)) {
      ctx.camera.position.y -= this.velocity.y;
    }
  }

  shouldPanCameraUp(ctx: CameraContext) {
    if (
      this.camerabox.position.y + this.camerabox.height + this.velocity.y >=
      432
    )
      return;

    const scaledCanvasHeight = ctx.canvas.height / 4;

    if (
      this.camerabox.position.y + this.camerabox.height >=
      Math.abs(ctx.camera.position.y) + scaledCanvasHeight
    ) {
      ctx.camera.position.y -= this.velocity.y;
    }
  }

  override update() {
    this.updateFrames();
    this.updateHitbox();
    this.updateCamerabox();

    // c.fillStyle = 'rgba(0, 0, 255, 0.2)'
    // c.fillRect(
    //   this.camerabox.position.x,
    //   this.camerabox.position.y,
    //   this.camerabox.width,
    //   this.camerabox.height
    // )

    // draws out the image
    // this.canvasContext.fillStyle = 'rgba(0, 255, 0, 0.2)'
    // this.canvasContext.fillRect(this.position.x, this.position.y, this.width, this.height)

    // this.canvasContext.fillStyle = 'rgba(255, 0, 0, 0.2)'
    // this.canvasContext.fillRect(
    //   this.hitbox.position.x,
    //   this.hitbox.position.y,
    //   this.hitbox.width,
    //   this.hitbox.height
    // )

    this.draw();

    this.position.x += this.velocity.x;
    this.updateHitbox();
    this.checkForHorizontalCollisions();
    this.applyGravity();
    this.updateHitbox();
    this.checkForVerticalCollisions();
  }

  updateHitbox() {
    this.hitbox = {
      position: {
        x: this.position.x + 35,
        y: this.position.y + 26
      },
      width: 14,
      height: 27
    };
  }

  checkForHorizontalCollisions() {
    for (let i = 0; i < this.collisionBlocks.length; i++) {
      const collisionBlock = this.collisionBlocks[i];

      if (
        collision({
          object1: this.hitbox,
          object2: collisionBlock
        })
      ) {
        if (this.velocity.x > 0) {
          this.velocity.x = 0;

          const offset =
            this.hitbox.position.x - this.position.x + this.hitbox.width;

          this.position.x = collisionBlock.position.x - offset - 0.01;
          break;
        }

        if (this.velocity.x < 0) {
          this.velocity.x = 0;

          const offset = this.hitbox.position.x - this.position.x;

          this.position.x =
            collisionBlock.position.x + collisionBlock.width - offset + 0.01;
          break;
        }
      }
    }
  }

  applyGravity() {
    this.velocity.y += this.gravity;
    this.position.y += this.velocity.y;
  }

  checkForVerticalCollisions() {
    for (let i = 0; i < this.collisionBlocks.length; i++) {
      const collisionBlock = this.collisionBlocks[i];

      if (
        collision({
          object1: this.hitbox,
          object2: collisionBlock as box
        })
      ) {
        if (this.velocity.y > 0) {
          this.velocity.y = 0;

          const offset =
            this.hitbox.position.y - this.position.y + this.hitbox.height;

          this.position.y = collisionBlock.position.y - offset - 0.01;
          break;
        }

        if (this.velocity.y < 0) {
          this.velocity.y = 0;

          const offset = this.hitbox.position.y - this.position.y;

          this.position.y =
            collisionBlock.position.y + collisionBlock.height - offset + 0.01;
          break;
        }
      }
    }

    // platform collision blocks
    for (let i = 0; i < this.platformCollisionBlocks.length; i++) {
      const platformCollisionBlock = this.platformCollisionBlocks[i];

      if (
        platformCollision({
          object1: this.hitbox,
          object2: platformCollisionBlock
        })
      ) {
        if (this.velocity.y > 0) {
          this.velocity.y = 0;

          const offset =
            this.hitbox.position.y - this.position.y + this.hitbox.height;

          this.position.y = platformCollisionBlock.position.y - offset - 0.01;
          break;
        }
      }
    }
  }
}
