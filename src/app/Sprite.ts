import { canvasItem } from './canvasItem';
import { box, position } from './vector';

export interface ISprite {
  position: position;
  imageSrc: string;
  frameRate?: number; // defaults to 1
  frameBuffer?: number; // defaults to 3
  scale?: number; // defaults to 1
}

export class Sprite implements canvasItem {
  position: position;
  width: number;
  height: number;
  scale: number;
  loaded: boolean;
  image: HTMLImageElement;
  frameRate: number;
  currentFrame: number;
  frameBuffer: number;
  elapsedFrames: number;

  name: string;

  canvasContext: CanvasRenderingContext2D;

  constructor(sprite: ISprite) {
    const _defaultscale = 1;
    const _defaultframeRate = 1;
    const _defaultframeBuffer = 3;

    this.scale = sprite.scale ? sprite.scale : _defaultscale;

    this.position = sprite.position;
    this.loaded = false;
    this.image = new Image();

    this.image.onload = () => {
      this.width = (this.image.width / this.frameRate) * this.scale;
      this.height = this.image.height * this.scale;
      this.loaded = true;
    };

    if (sprite.imageSrc) {
      this.image.src = sprite.imageSrc;
    }

    this.frameRate = sprite.frameRate ? sprite.frameRate : _defaultframeRate;
    this.currentFrame = 0;
    this.frameBuffer = sprite.frameBuffer
      ? sprite.frameBuffer
      : _defaultframeBuffer;
    this.elapsedFrames = 0;
  }

  Initialize(cvctx: CanvasRenderingContext2D) {
    this.canvasContext = cvctx;
  }

  draw() {
    if (!this.image) return;

    const cropbox: box = {
      position: {
        x: this.currentFrame * (this.image.width / this.frameRate),
        y: 0
      },
      width: this.image.width / this.frameRate,
      height: this.image.height
    };

    this.canvasContext.drawImage(
      this.image,
      cropbox.position.x,
      cropbox.position.y,
      cropbox.width,
      cropbox.height,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }

  update() {
    this.draw();
    if (this.image) {
      this.updateFrames();
    }
  }

  updateFrames() {
    this.elapsedFrames++;

    if (this.elapsedFrames % this.frameBuffer === 0) {
      if (this.currentFrame < this.frameRate - 1) this.currentFrame++;
      else this.currentFrame = 0;
    }
  }
}
