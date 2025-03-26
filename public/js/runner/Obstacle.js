// runner/Obstacle.js
import { getRandomNum } from './utils.js';
import { CollisionBox, boxCompare, createAdjustedCollisionBox } from './CollisionBox.js';
import { FPS, IS_HIDPI } from './constants.js';

export class Obstacle {
    static MAX_GAP_COEFFICIENT = 1.5;
    static MAX_OBSTACLE_LENGTH = 3;

    // Definitions
    static types = [
        {
            type: 'CACTUS_SMALL',
            width: 17,
            height: 35,
            yPos: 105,
            multipleSpeed: 3,
            minGap: 180,
            collisionBoxes: [
                new CollisionBox(0, 7, 5, 27),
                new CollisionBox(4, 0, 6, 34),
                new CollisionBox(10, 4, 7, 14)
            ]
        },
        {
            type: 'CACTUS_LARGE',
            width: 25,
            height: 50,
            yPos: 90,
            multipleSpeed: 6,
            minGap: 180,
            collisionBoxes: [
                new CollisionBox(0, 12, 7, 38),
                new CollisionBox(8, 0, 7, 49),
                new CollisionBox(13, 10, 10, 38)
            ]
        }
    ];

    constructor(canvasCtx, type, obstacleImg, dimensions, gapCoefficient, speed) {
        this.canvasCtx = canvasCtx;
        this.image = obstacleImg;
        this.typeConfig = type;
        this.gapCoefficient = gapCoefficient;
        this.size = getRandomNum(1, Obstacle.MAX_OBSTACLE_LENGTH);
        this.dimensions = dimensions;
        this.remove = false;
        this.xPos = 0;
        this.yPos = this.typeConfig.yPos;
        this.width = 0;
        this.collisionBoxes = [];
        this.gap = 0;
        this.followingObstacleCreated = false;
        this.init(speed);
    }

    init(speed) {
        this.cloneCollisionBoxes();
        if (this.size > 1 && this.typeConfig.multipleSpeed > speed) {
            this.size = 1;
        }
        this.width = this.typeConfig.width * this.size;
        this.xPos = this.dimensions.WIDTH - this.width;
        this.draw();
        if (this.size > 1) {
            this.collisionBoxes[1].width =
                this.width - this.collisionBoxes[0].width - this.collisionBoxes[2].width;
            this.collisionBoxes[2].x = this.width - this.collisionBoxes[2].width;
        }
        this.gap = this.getGap(this.gapCoefficient, speed);
    }

    draw() {
        let sourceWidth = this.typeConfig.width;
        let sourceHeight = this.typeConfig.height;
        if (IS_HIDPI) {
            sourceWidth *= 2;
            sourceHeight *= 2;
        }
        const sourceX = sourceWidth * this.size * 0.5 * (this.size - 1);
        this.canvasCtx.drawImage(
            this.image,
            sourceX, 0,
            sourceWidth * this.size, sourceHeight,
            this.xPos, this.yPos,
            this.typeConfig.width * this.size, this.typeConfig.height
        );
    }

    update(deltaTime, speed) {
        if (!this.remove) {
            this.xPos -= Math.floor((speed * FPS) / 1000 * deltaTime);
            this.draw();
            if (!this.isVisible()) {
                this.remove = true;
            }
        }
    }

    getGap(gapCoefficient, speed) {
        const minGap = Math.round(
            this.width * speed + this.typeConfig.minGap * gapCoefficient
        );
        const maxGap = Math.round(minGap * Obstacle.MAX_GAP_COEFFICIENT);
        return getRandomNum(minGap, maxGap);
    }

    isVisible() {
        return this.xPos + this.width > 0;
    }

    cloneCollisionBoxes() {
        const boxes = this.typeConfig.collisionBoxes;
        for (let i = boxes.length - 1; i >= 0; i--) {
            this.collisionBoxes[i] = new CollisionBox(
                boxes[i].x,
                boxes[i].y,
                boxes[i].width,
                boxes[i].height
            );
        }
    }
}
