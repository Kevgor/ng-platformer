import { canvasItem } from "./canvasItem";
import { box, position } from "./vector";

export class CollisionBlock implements box, canvasItem {
  position: position;
  width:number;
  height:number;

  canvasContext: CanvasRenderingContext2D;

  constructor( { position , height = 16 } ) {
    this.position = position as position;
    this.width = 16;
    this.height = height;
  }

  Initialize( cvctx: CanvasRenderingContext2D) {
    this.canvasContext = cvctx;
   }

  draw() {
    this.canvasContext.fillStyle = 'rgba(255, 0, 0, 0.5)';
    this.canvasContext.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.draw();
  }
}
