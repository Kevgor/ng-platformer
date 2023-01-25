import { Sprite } from './Sprite';
import { position } from './vector';

export interface IBall {
  position: position;
  radius?: number;
}

export class Ball extends Sprite {
  radius: number;

  constructor(iball: IBall) {
    super({ position: iball.position, imageSrc: null });
    this.radius = iball.radius ? iball.radius : 10;
  }

  override draw() {
    this.canvasContext.fillStyle = 'rgba(255, 255, 0, 0.6)';

    const radius = this.radius;

    const circle = new Path2D(); 
    circle.arc(this.position.x, this.position.y, radius, 0, 2 * Math.PI, false);
    this.canvasContext.fill(circle); 

    // this.canvasContext.lineWidth = 0.5;
    // this.canvasContext.strokeStyle = '#000066';
    // this.canvasContext.stroke(circle);  
  }
}
