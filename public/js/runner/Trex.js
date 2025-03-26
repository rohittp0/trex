// runner/Trex.js
import { IS_HIDPI, RunnerDefaultDimensions, RunnerConfig, FPS } from './constants.js';
import { getTimeStamp } from './utils.js';

export class Trex {
    static config = {
        DROP_VELOCITY: -5,
        GRAVITY: 0.6,
        HEIGHT: 47,
        INIITAL_JUMP_VELOCITY: -10,
        INTRO_DURATION: 1500,
        MAX_JUMP_HEIGHT: 30,
        MIN_JUMP_HEIGHT: 30,
        SPEED_DROP_COEFFICIENT: 3,
        SPRITE_WIDTH: 262,
        START_X_POS: 50,
        WIDTH: 44
    };

    static collisionBoxes = [
        // x, y, width, height
        { x: 1,  y: -1, width: 30, height: 26 },
        { x: 32, y: 0,  width: 8,  height: 16 },
        { x: 10, y: 35, width: 14, height: 8 },
        { x: 1,  y: 24, width: 29, height: 5 },
        { x: 5,  y: 30, width: 21, height: 4 },
        { x: 9,  y: 34, width: 15, height: 4 }
    ];

    static status = {
        CRASHED: 'CRASHED',
        JUMPING: 'JUMPING',
        RUNNING: 'RUNNING',
        WAITING: 'WAITING'
    };

    static animFrames = {
        WAITING: { frames: [44, 0],     msPerFrame: 1000 / 3 },
        RUNNING: { frames: [88, 132],   msPerFrame: 1000 / 12 },
        CRASHED: { frames: [220],       msPerFrame: 1000 / 60 },
        JUMPING: { frames: [0],         msPerFrame: 1000 / 60 },
    };

    static BLINK_TIMING = 7000;

    constructor(canvas, image) {
        this.canvas = canvas;
        this.canvasCtx = canvas.getContext('2d');
        this.image = image;
        this.xPos = 0;
        this.yPos = 0;
        this.groundYPos = 0;
        this.currentFrame = 0;
        this.currentAnimFrames = [];
        this.blinkDelay = 0;
        this.animStartTime = 0;
        this.timer = 0;
        this.msPerFrame = 1000 / FPS;
        this.config = Trex.config;
        this.status = Trex.status.WAITING;
        this.jumping = false;
        this.jumpVelocity = 0;
        this.reachedMinHeight = false;
        this.speedDrop = false;
        this.jumpCount = 0;
        this.playingIntro = false;
        this.init();
    }

    init() {
        this.blinkDelay = this.setBlinkDelay();
        this.groundYPos =
            RunnerDefaultDimensions.HEIGHT - this.config.HEIGHT - RunnerConfig.BOTTOM_PAD;
        this.yPos = this.groundYPos;
        this.minJumpHeight = this.groundYPos - this.config.MIN_JUMP_HEIGHT;
        this.draw(0, 0);
        this.update(0, Trex.status.WAITING);
    }

    setBlinkDelay() {
        return Math.ceil(Math.random() * Trex.BLINK_TIMING);
    }

    draw(sourceX, sourceY) {
        let sourceWidth = this.config.WIDTH;
        let sourceHeight = this.config.HEIGHT;
        if (IS_HIDPI) {
            sourceX *= 2;
            sourceY *= 2;
            sourceWidth *= 2;
            sourceHeight *= 2;
        }
        this.canvasCtx.drawImage(
            this.image,
            sourceX, sourceY,
            sourceWidth, sourceHeight,
            this.xPos, this.yPos,
            this.config.WIDTH, this.config.HEIGHT
        );
    }

    update(deltaTime, optStatus) {
        this.timer += deltaTime;
        if (optStatus) {
            this.status = optStatus;
            this.currentFrame = 0;
            this.msPerFrame = Trex.animFrames[optStatus].msPerFrame;
            this.currentAnimFrames = Trex.animFrames[optStatus].frames;
            if (optStatus === Trex.status.WAITING) {
                this.animStartTime = getTimeStamp();
                this.setBlinkDelay();
            }
        }

        // Intro movement (slide T-Rex in)
        if (this.playingIntro && this.xPos < this.config.START_X_POS) {
            this.xPos += Math.round(
                (this.config.START_X_POS / this.config.INTRO_DURATION) * deltaTime
            );
        }

        if (this.status === Trex.status.WAITING) {
            this.blink(getTimeStamp());
        } else {
            this.draw(this.currentAnimFrames[this.currentFrame], 0);
        }

        if (this.timer >= this.msPerFrame) {
            this.currentFrame =
                this.currentFrame === this.currentAnimFrames.length - 1
                    ? 0
                    : this.currentFrame + 1;
            this.timer = 0;
        }
    }

    blink(time) {
        const deltaTime = time - this.animStartTime;
        if (deltaTime >= this.blinkDelay) {
            this.draw(this.currentAnimFrames[this.currentFrame], 0);
            if (this.currentFrame === 1) {
                this.setBlinkDelay();
                this.animStartTime = time;
            }
        }
    }

    startJump() {
        if (!this.jumping) {
            this.update(0, Trex.status.JUMPING);
            this.jumpVelocity = this.config.INIITAL_JUMP_VELOCITY;
            this.jumping = true;
            this.reachedMinHeight = false;
            this.speedDrop = false;
        }
    }

    endJump() {
        if (this.reachedMinHeight && this.jumpVelocity < this.config.DROP_VELOCITY) {
            this.jumpVelocity = this.config.DROP_VELOCITY;
        }
    }

    updateJump(deltaTime, runnerConfig) {
        const msPerFrame = Trex.animFrames[this.status].msPerFrame;
        const framesElapsed = deltaTime / msPerFrame;

        if (this.speedDrop) {
            this.yPos += Math.round(
                this.jumpVelocity * this.config.SPEED_DROP_COEFFICIENT * framesElapsed
            );
        } else {
            this.yPos += Math.round(this.jumpVelocity * framesElapsed);
        }
        this.jumpVelocity += runnerConfig.GRAVITY * framesElapsed;

        if (this.yPos < this.minJumpHeight || this.speedDrop) {
            this.reachedMinHeight = true;
        }
        if (this.yPos < this.config.MAX_JUMP_HEIGHT || this.speedDrop) {
            this.endJump();
        }
        if (this.yPos > this.groundYPos) {
            this.reset();
            this.jumpCount++;
        }
        this.update(deltaTime);
    }

    setSpeedDrop() {
        this.speedDrop = true;
        this.jumpVelocity = 1;
    }

    reset() {
        this.yPos = this.groundYPos;
        this.jumpVelocity = 0;
        this.jumping = false;
        this.update(0, Trex.status.RUNNING);
        this.speedDrop = false;
        this.jumpCount = 0;
    }
}
