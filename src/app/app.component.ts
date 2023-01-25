import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Ball } from './ball';

import { CollisionBlock } from './CollisionBlock';
import { floorCollisions, platformCollisions } from './collisionsData';
import { Player } from './Player';
import { Sprite } from './Sprite';
import { box, point, position } from './vector';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  // its important myCanvas matches the variable name in the template
  @ViewChild('theCanvas', { static: false })
  theCanvas: ElementRef<HTMLCanvasElement>;

  private canvasContext: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  private backgroundImageHeight = 432;
  public gravity = 0.1;

  xscale = 4;
  yscale = 4;

  camera: point;

  background: Sprite = new Sprite({
    position: {
      x: 0,
      y: 0
    },
    imageSrc: 'assets/img/background.png'
  });

  ball: Ball = new Ball({ position: { x: 70, y: 170 }, radius: 4 });

  keys = {
    d: {
      pressed: false
    },
    a: {
      pressed: false
    }
  };

  collisionBlocks: CollisionBlock[];
  platformCollisionBlocks: CollisionBlock[];

  player: Player;

  constructor() {
    this.background.name = 'background';
  }

  ngAfterViewInit(): void {
    this.canvasContext = this.theCanvas.nativeElement.getContext('2d');
    this.canvas = this.canvasContext.canvas;

    this.canvas.width = 1024;
    this.canvas.height = 576;

    const scaledCanvas = {
      width: this.canvas.width / this.xscale,
      height: this.canvas.height / this.yscale
    };

    this.camera = {
      position: {
        x: 0,
        y: -this.backgroundImageHeight + scaledCanvas.height
      } as position
    } as point;

    const floorCollisions2D: Array<number[]> = new Array<number[]>();
    for (let i = 0; i < floorCollisions.length; i += 36) {
      floorCollisions2D.push(floorCollisions.slice(i, i + 36));
    }

    this.collisionBlocks = [];
    floorCollisions2D.forEach((row, y) => {
      row.forEach((symbol, x) => {
        if (symbol === 202) {
          this.collisionBlocks.push(
            new CollisionBlock({
              position: {
                x: x * 16,
                y: y * 16
              }
            })
          );
        }
      });
    });

    const platformCollisions2D: Array<number[]> = new Array<number[]>();
    for (let i = 0; i < platformCollisions.length; i += 36) {
      platformCollisions2D.push(platformCollisions.slice(i, i + 36));
    }

    this.platformCollisionBlocks = [];
    platformCollisions2D.forEach((row, y) => {
      row.forEach((symbol, x) => {
        if (symbol === 202) {
          this.platformCollisionBlocks.push(
            new CollisionBlock({
              position: {
                x: x * 16,
                y: y * 16
              },
              height: 4
            })
          );
        }
      });
    });

    window.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'd':
          this.keys.d.pressed = true;
          break;
        case 'a':
          this.keys.a.pressed = true;
          break;
        case 'w':
          this.player.velocity.y = -4;
          break;
      }
    });

    window.addEventListener('keyup', (event) => {
      switch (event.key) {
        case 'd':
          this.keys.d.pressed = false;
          break;
        case 'a':
          this.keys.a.pressed = false;
          break;
      }
    });

    this.canvas.addEventListener('mousedown', (event) => {
      this.getCursorPosition(this.canvas, event);
    });

    const gravity = this.gravity;

    this.player = new Player({
      position: {
        x: 100,
        y: 300
      },
      gravity,
      collisionBlocks: this.collisionBlocks,
      platformCollisionBlocks: this.platformCollisionBlocks,
      imageSrc: 'assets/img/warrior/Idle.png',
      frameRate: 8,
      animations: {
        Idle: {
          imageSrc: 'assets/img/warrior/Idle.png',
          frameRate: 8,
          frameBuffer: 3
        },
        Run: {
          imageSrc: 'assets/img/warrior/Run.png',
          frameRate: 8,
          frameBuffer: 5
        },
        Jump: {
          imageSrc: 'assets/img/warrior/Jump.png',
          frameRate: 2,
          frameBuffer: 3
        },
        Fall: {
          imageSrc: 'assets/img/warrior/Fall.png',
          frameRate: 2,
          frameBuffer: 3
        },
        FallLeft: {
          imageSrc: 'assets/img/warrior/FallLeft.png',
          frameRate: 2,
          frameBuffer: 3
        },
        RunLeft: {
          imageSrc: 'assets/img/warrior/RunLeft.png',
          frameRate: 8,
          frameBuffer: 5
        },
        IdleLeft: {
          imageSrc: 'assets/img/warrior/IdleLeft.png',
          frameRate: 8,
          frameBuffer: 3
        },
        JumpLeft: {
          imageSrc: 'assets/img/warrior/JumpLeft.png',
          frameRate: 2,
          frameBuffer: 3
        }
      }
    });

    this.platformCollisionBlocks.forEach((block) =>
      block.Initialize(this.canvasContext)
    );
    this.collisionBlocks.forEach((block) =>
      block.Initialize(this.canvasContext)
    );

    this.background.Initialize(this.canvasContext);
    this.player.Initialize(this.canvasContext);
    this.ball.Initialize(this.canvasContext);

    this.run();
  }

  run() {
    this.animate();
  }

  animate() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    window.requestAnimationFrame(this.animate.bind(this));

    this.canvasContext.fillStyle = 'white';
    this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.canvasContext.save();
    this.canvasContext.scale(this.xscale, this.yscale);
    this.canvasContext.translate(
      this.camera.position.x,
      this.camera.position.y
    );
    this.background.update();

    const canvasRect: box = {
      position: { x: 0, y: 0 } as position,
      width: this.canvas.width,
      height: this.canvas.height
    };

    this.collisionBlocks.forEach((collisionBlock) => {
      collisionBlock.update();
    });

    this.platformCollisionBlocks.forEach((block) => {
      block.update();
    });

    if (this.player) {
      this.player.checkForHorizontalCanvasCollision();
      this.player.update();

      this.player.velocity.x = 0;

      if (this.keys.d.pressed) {
        this.player.switchSprite('Run');
        this.player.velocity.x = 2;
        this.player.lastDirection = 'right';
        this.player.shouldPanCameraToTheLeft({
          canvas: canvasRect,
          camera: this.camera
        });
      } else if (this.keys.a.pressed) {
        this.player.switchSprite('RunLeft');
        this.player.velocity.x = -2;
        this.player.lastDirection = 'left';
        this.player.shouldPanCameraToTheRight({
          canvas: canvasRect,
          camera: this.camera
        });
      } else if (this.player.velocity.y === 0) {
        if (this.player.lastDirection === 'right')
          this.player.switchSprite('Idle');
        else this.player.switchSprite('IdleLeft');
      }

      if (this.player.velocity.y < 0) {
        this.player.shouldPanCameraDown({
          canvas: canvasRect,
          camera: this.camera
        });
        if (this.player.lastDirection === 'right')
          this.player.switchSprite('Jump');
        else this.player.switchSprite('JumpLeft');
      } else if (this.player.velocity.y > 0) {
        this.player.shouldPanCameraUp({
          canvas: canvasRect,
          camera: this.camera
        });
        if (this.player.lastDirection === 'right')
          this.player.switchSprite('Fall');
        else this.player.switchSprite('FallLeft');
      }
    }

    this.ball.update();

    this.canvasContext.restore();
  }

  private getCursorPosition(canvas, event: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    // console.log('x: ' + x / this.xscale + ' y: ' + y / this.yscale);
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    console.log('x: ' + x + ' y: ' + y);
  }
}
