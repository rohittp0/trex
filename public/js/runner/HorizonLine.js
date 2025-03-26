// runner/HorizonLine.js
import { IS_HIDPI, FPS } from './constants.js';

export class HorizonLine {
    static dimensions = {
        WIDTH: 600,
        HEIGHT: 12,
        YPOS: 127
    };

    constructor(canvas, bgImg) {
        this.canvas = canvas;
        this.canvasCtx = canvas.getContext('2d');
        this.image = bgImg;
        this.dimensions = { ...HorizonLine.dimensions };
        this.sourceDimensions = {};
        this.sourceXPos = [0, 0];
        this.xPos = [0, 0];
        this.yPos = this.dimensions.YPOS;
        this.bumpThreshold = 0.5;
        this.setSourceDimensions();
        this.draw();
    }

    setSourceDimensions() {
        if (IS_HIDPI) {
            this.sourceDimensions.WIDTH = this.dimensions.WIDTH * 2;
            this.sourceDimensions.HEIGHT = this.dimensions.HEIGHT * 2;
        } else {
            this.sourceDimensions.WIDTH = this.dimensions.WIDTH;
            this.sourceDimensions.HEIGHT = this.dimensions.HEIGHT;
        }
        this.xPos = [0, this.dimensions.WIDTH];
        this.sourceXPos = [0, this.getRandomType()];
    }

    getRandomType() {
        return Math.random() > this.bumpThreshold
            ? this.dimensions.WIDTH
            : 0;
    }

    draw() {
        // Draw the first piece
        this.canvasCtx.drawImage(
            this.image,
            this.sourceXPos[0], 0,
            this.sourceDimensions.WIDTH, this.sourceDimensions.HEIGHT,
            this.xPos[0], this.yPos,
            this.dimensions.WIDTH, this.dimensions.HEIGHT
        );
        // Draw the second piece
        this.canvasCtx.drawImage(
            this.image,
            this.sourceXPos[1], 0,
            this.sourceDimensions.WIDTH, this.sourceDimensions.HEIGHT,
            this.xPos[1], this.yPos,
            this.dimensions.WIDTH, this.dimensions.HEIGHT
        );
    }

    updateXPos(pos, increment) {
        const line1 = pos;
        const line2 = pos === 0 ? 1 : 0;

        this.xPos[line1] -= increment;
        this.xPos[line2] = this.xPos[line1] + this.dimensions.WIDTH;
        if (this.xPos[line1] <= -this.dimensions.WIDTH) {
            this.xPos[line1] += this.dimensions.WIDTH * 2;
            this.xPos[line2] = this.xPos[line1] - this.dimensions.WIDTH;
            this.sourceXPos[line1] = this.getRandomType();
        }
    }

    update(deltaTime, speed) {
        const increment = Math.floor(speed * (FPS / 1000) * deltaTime);
        if (this.xPos[0] <= 0) {
            this.updateXPos(0, increment);
        } else {
            this.updateXPos(1, increment);
        }
        this.draw();
    }

    reset() {
        this.xPos = [0, this.dimensions.WIDTH];
    }
}
