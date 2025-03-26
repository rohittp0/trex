// runner/Runner.js

import {
    RunnerConfig,
    RunnerDefaultDimensions,
    RunnerClasses,
    RunnerEvents,
    RunnerKeycodes,
    RunnerImageSources,
    RunnerSounds,
    IS_MOBILE,
    IS_IOS,
    IS_HIDPI,
    DEFAULT_WIDTH,
    FPS,
} from './constants.js';

import {
    createCanvas,
    decodeBase64ToArrayBuffer,
    vibrate,
    getTimeStamp,
    updateCanvasScaling
} from './utils.js';

import { GameOverPanel } from './GameOverPanel.js';
import { Trex } from './Trex.js';
import { DistanceMeter } from './DistanceMeter.js';
import { Horizon } from './Horizon.js';
import { checkForCollision } from './collisionHelpers.js';

export class Runner {
    static instance_ = null;

    constructor(outerContainerId, opt_config) {
        if (Runner.instance_) {
            return Runner.instance_;
        }
        Runner.instance_ = this;

        this.outerContainerEl = document.getElementById(outerContainerId);
        this.containerEl = null;
        this.config = opt_config || RunnerConfig;
        this.dimensions = { ...RunnerDefaultDimensions };
        this.canvas = null;
        this.canvasCtx = null;
        this.tRex = null;
        this.distanceMeter = null;
        this.distanceRan = 0;
        this.highestScore = 0;
        this.time = 0;
        this.runningTime = 0;
        this.msPerFrame = 1000 / FPS;
        this.currentSpeed = this.config.SPEED;
        this.obstacles = [];
        this.started = false;
        this.activated = false;
        this.crashed = false;
        this.paused = false;
        this.resizeTimerId_ = null;
        this.playCount = 0;

        // Sound FX
        this.audioBuffer = null;
        this.soundFx = {};
        this.audioContext = null;

        // Images
        this.images = {};
        this.imagesLoaded = 0;

        this.loadImages();
    }

    loadImages() {
        const imageSources = IS_HIDPI ? RunnerImageSources.HDPI : RunnerImageSources.LDPI;
        for (let i = 0; i < imageSources.length; i++) {
            const { name, id } = imageSources[i];
            // We assume the DOM has <img id="1x-cloud" /> etc.
            this.images[name] = document.getElementById(id);
        }
        this.init();
    }

    loadSounds() {
        if (!IS_IOS) {
            this.audioContext = new AudioContext();
            const resourceTemplate = document.getElementById(this.config.RESOURCE_TEMPLATE_ID).content;
            for (const sound in RunnerSounds) {
                let soundSrc = resourceTemplate.getElementById(RunnerSounds[sound]).src;
                soundSrc = soundSrc.substr(soundSrc.indexOf(',') + 1);
                const buffer = decodeBase64ToArrayBuffer(soundSrc);
                this.audioContext.decodeAudioData(buffer, (audioData) => {
                    this.soundFx[sound] = audioData;
                });
            }
        }
    }

    init() {
        this.adjustDimensions();
        this.setSpeed();
        this.containerEl = document.createElement('div');
        this.containerEl.className = RunnerClasses.CONTAINER;

        this.canvas = createCanvas(
            this.containerEl,
            this.dimensions.WIDTH,
            this.dimensions.HEIGHT,
            RunnerClasses.PLAYER
        );
        this.canvasCtx = this.canvas.getContext('2d');
        this.canvasCtx.fillStyle = '#f7f7f7';
        this.canvasCtx.fill();
        updateCanvasScaling(this.canvas, this.dimensions.WIDTH, this.dimensions.HEIGHT);

        this.horizon = new Horizon(
            this.canvas,
            this.images,
            this.dimensions,
            this.config.GAP_COEFFICIENT
        );

        this.distanceMeter = new DistanceMeter(
            this.canvas,
            this.images.TEXT_SPRITE,
            this.dimensions.WIDTH
        );

        this.tRex = new Trex(this.canvas, this.images.TREX);

        this.outerContainerEl.appendChild(this.containerEl);

        if (IS_MOBILE) {
            this.createTouchController();
        }
        this.startListening();
        this.update();
        window.addEventListener(RunnerEvents.RESIZE, this.debounceResize.bind(this));
    }

    createTouchController() {
        this.touchController = document.createElement('div');
        this.touchController.className = RunnerClasses.TOUCH_CONTROLLER;
    }

    debounceResize() {
        if (!this.resizeTimerId_) {
            this.resizeTimerId_ = setInterval(this.adjustDimensions.bind(this), 250);
        }
    }

    adjustDimensions() {
        clearInterval(this.resizeTimerId_);
        this.resizeTimerId_ = null;
        const boxStyles = window.getComputedStyle(this.outerContainerEl);
        const padding = parseInt(boxStyles.paddingLeft) || 0;
        this.dimensions.WIDTH = this.outerContainerEl.offsetWidth - padding * 2;

        if (this.canvas) {
            this.canvas.width = this.dimensions.WIDTH;
            this.canvas.height = this.dimensions.HEIGHT;
            updateCanvasScaling(this.canvas, this.dimensions.WIDTH, this.dimensions.HEIGHT);
            this.distanceMeter.calcXPos(this.dimensions.WIDTH);
            this.clearCanvas();
            this.horizon.update(0, 0, true);
            this.tRex.update(0);
            if (this.activated || this.crashed) {
                this.containerEl.style.width = `${this.dimensions.WIDTH}px`;
                this.containerEl.style.height = `${this.dimensions.HEIGHT}px`;
                this.distanceMeter.update(0, Math.ceil(this.distanceRan));
                this.stop();
            } else {
                this.tRex.draw(0, 0);
            }
            if (this.crashed && this.gameOverPanel) {
                this.gameOverPanel.updateDimensions(this.dimensions.WIDTH);
                this.gameOverPanel.draw();
            }
        }
    }

    setSpeed(opt_speed) {
        const speed = opt_speed || this.currentSpeed;
        if (this.dimensions.WIDTH < DEFAULT_WIDTH) {
            const mobileSpeed =
                (speed * this.dimensions.WIDTH) / DEFAULT_WIDTH *
                this.config.MOBILE_SPEED_COEFFICIENT;
            this.currentSpeed = mobileSpeed > speed ? speed : mobileSpeed;
        } else if (opt_speed) {
            this.currentSpeed = opt_speed;
        }
    }

    clearCanvas() {
        this.canvasCtx.clearRect(0, 0, this.dimensions.WIDTH, this.dimensions.HEIGHT);
    }

    update() {
        this.drawPending = false;
        const now = getTimeStamp();
        let deltaTime = now - (this.time || now);
        this.time = now;

        if (this.activated) {
            this.clearCanvas();
            if (this.tRex.jumping) {
                this.tRex.updateJump(deltaTime, this.config);
            }
            this.runningTime += deltaTime;
            const hasObstacles = this.runningTime > this.config.CLEAR_TIME;

            if (this.tRex.jumpCount === 1 && !this.playingIntro) {
                this.playIntro();
            }

            if (this.playingIntro) {
                this.horizon.update(0, this.currentSpeed, hasObstacles);
            } else {
                deltaTime = !this.started ? 0 : deltaTime;
                this.horizon.update(deltaTime, this.currentSpeed, hasObstacles);
            }

            // Example collision check (pseudocode):
            const firstObstacle = this.horizon.obstacles[0];
            if (hasObstacles && firstObstacle) {
                const collision = checkForCollision(firstObstacle, this.tRex, this.canvasCtx);
                if (collision) {
                    this.gameOver();
                } else {
                    this.distanceRan += (this.currentSpeed * deltaTime) / this.msPerFrame;
                    if (this.currentSpeed < this.config.MAX_SPEED) {
                        this.currentSpeed += this.config.ACCELERATION;
                    }
                }
            }

            if (
                this.distanceMeter.getActualDistance(this.distanceRan) >
                this.distanceMeter.maxScore
            ) {
                this.distanceRan = 0;
            }
            const playAchievementSound = this.distanceMeter.update(
                deltaTime,
                Math.ceil(this.distanceRan)
            );
            if (playAchievementSound) {
                this.playSound(this.soundFx.SCORE);
            }
        }

        if (!this.crashed) {
            this.tRex.update(deltaTime);
            this.raq();
        }
    }

    playIntro() {
        if (!this.started && !this.crashed) {
            this.playingIntro = true;
            this.tRex.playingIntro = true;

            const keyframes = '@-webkit-keyframes intro {' +
                `from { width:${Trex.config.WIDTH}px }` +
                `to { width: ${this.dimensions.WIDTH}px }` +
                '}';
            document.styleSheets[0].insertRule(keyframes, 0);

            this.containerEl.addEventListener(
                RunnerEvents.ANIM_END,
                this.startGame.bind(this)
            );
            this.containerEl.style.webkitAnimation = 'intro .4s ease-out 1 both';
            this.containerEl.style.width = `${this.dimensions.WIDTH}px`;
            if (this.touchController) {
                this.outerContainerEl.appendChild(this.touchController);
            }
            this.activated = true;
            this.started = true;
        } else if (this.crashed) {
            this.restart();
        }
    }

    startGame() {
        this.runningTime = 0;
        this.playingIntro = false;
        this.tRex.playingIntro = false;
        this.containerEl.style.webkitAnimation = '';
        this.playCount++;

        window.addEventListener(RunnerEvents.VISIBILITY, this.onVisibilityChange.bind(this));
        window.addEventListener(RunnerEvents.BLUR, this.onVisibilityChange.bind(this));
        window.addEventListener(RunnerEvents.FOCUS, this.onVisibilityChange.bind(this));
    }

    handleEvent(e) {
        switch (e.type) {
            case RunnerEvents.KEYDOWN:
            case RunnerEvents.TOUCHSTART:
            case RunnerEvents.MOUSEDOWN:
                this.onKeyDown(e);
                break;
            case RunnerEvents.KEYUP:
            case RunnerEvents.TOUCHEND:
            case RunnerEvents.MOUSEUP:
                this.onKeyUp(e);
                break;
        }
    }

    startListening() {
        document.addEventListener(RunnerEvents.KEYDOWN, this);
        document.addEventListener(RunnerEvents.KEYUP, this);

        if (IS_MOBILE) {
            this.touchController.addEventListener(RunnerEvents.TOUCHSTART, this);
            this.touchController.addEventListener(RunnerEvents.TOUCHEND, this);
            this.containerEl.addEventListener(RunnerEvents.TOUCHSTART, this);
        } else {
            document.addEventListener(RunnerEvents.MOUSEDOWN, this);
            document.addEventListener(RunnerEvents.MOUSEUP, this);
        }
    }

    stopListening() {
        document.removeEventListener(RunnerEvents.KEYDOWN, this);
        document.removeEventListener(RunnerEvents.KEYUP, this);
        if (IS_MOBILE) {
            this.touchController.removeEventListener(RunnerEvents.TOUCHSTART, this);
            this.touchController.removeEventListener(RunnerEvents.TOUCHEND, this);
            this.containerEl.removeEventListener(RunnerEvents.TOUCHSTART, this);
        } else {
            document.removeEventListener(RunnerEvents.MOUSEDOWN, this);
            document.removeEventListener(RunnerEvents.MOUSEUP, this);
        }
    }

    jump() {
        if (!this.activated || this.tRex.jumping) return;
        this.playSound(this.soundFx.BUTTON_PRESS);
        this.tRex.startJump();
    }

    onKeyDown(e) {
        if (
            !this.crashed &&
            (RunnerKeycodes.JUMP[String(e.keyCode)] ||
                e.type === RunnerEvents.TOUCHSTART)
        ) {
            if (!this.activated) {
                this.loadSounds();
                this.activated = true;
                this.playSound(this.soundFx.BUTTON_PRESS);
                this.tRex.startJump();
            }
        }
        // Touch to restart after crash
        if (
            this.crashed &&
            e.type === RunnerEvents.TOUCHSTART &&
            e.currentTarget === this.containerEl
        ) {
            this.restart();
        }
        // Duck
        if (RunnerKeycodes.DUCK[e.keyCode] && this.tRex.jumping) {
            e.preventDefault();
            this.tRex.setSpeedDrop();
        }
    }

    onKeyUp(e) {
        const keyCode = String(e.keyCode);
        const isjumpKey =
            RunnerKeycodes.JUMP[keyCode] ||
            e.type === RunnerEvents.TOUCHEND ||
            e.type === RunnerEvents.MOUSEUP;

        if (this.isRunning() && isjumpKey) {
            this.tRex.endJump();
        } else if (RunnerKeycodes.DUCK[keyCode]) {
            this.tRex.speedDrop = false;
        } else if (this.crashed) {
            const deltaTime = getTimeStamp() - this.time;
            if (
                RunnerKeycodes.RESTART[keyCode] ||
                (e.type === RunnerEvents.MOUSEUP && e.target === this.canvas) ||
                (deltaTime >= this.config.GAMEOVER_CLEAR_TIME &&
                    RunnerKeycodes.JUMP[keyCode])
            ) {
                this.restart();
            }
        } else if (this.paused && isjumpKey) {
            this.play();
        }
    }

    raq() {
        if (!this.drawPending) {
            this.drawPending = true;
            this.raqId = requestAnimationFrame(this.update.bind(this));
        }
    }

    isRunning() {
        return !!this.raqId;
    }

    gameOver() {
        this.playSound(this.soundFx.HIT);
        vibrate(200);
        this.stop();
        this.crashed = true;
        this.distanceMeter.acheivement = false;
        this.tRex.update(100, Trex.status.CRASHED);

        if (!this.gameOverPanel) {
            const { TEXT_SPRITE, RESTART } = this.images;
            this.gameOverPanel = new GameOverPanel(
                this.canvas,
                TEXT_SPRITE,
                RESTART,
                this.dimensions
            );
        } else {
            this.gameOverPanel.draw();
        }

        if (this.distanceRan > this.highestScore) {
            this.highestScore = Math.ceil(this.distanceRan);
            this.distanceMeter.setHighScore(this.highestScore);
        }
        this.time = getTimeStamp();
    }

    stop() {
        this.activated = false;
        this.paused = true;
        cancelAnimationFrame(this.raqId);
        this.raqId = 0;
    }

    play() {
        if (!this.crashed) {
            this.activated = true;
            this.paused = false;
            this.tRex.update(0, Trex.status.RUNNING);
            this.time = getTimeStamp();
            this.update();
        }
    }

    restart() {
        if (!this.raqId) {
            this.playCount++;
            this.runningTime = 0;
            this.activated = true;
            this.crashed = false;
            this.distanceRan = 0;
            this.setSpeed(this.config.SPEED);
            this.time = getTimeStamp();
            this.containerEl.classList.remove(RunnerClasses.CRASHED);
            this.clearCanvas();
            this.distanceMeter.reset(this.highestScore);
            this.horizon.reset();
            this.tRex.reset();
            this.playSound(this.soundFx.BUTTON_PRESS);
            this.update();
        }
    }

    onVisibilityChange(e) {
        if (document.hidden || document.webkitHidden || e.type === 'blur') {
            this.stop();
        } else {
            this.play();
        }
    }

    playSound(soundBuffer) {
        if (soundBuffer && this.audioContext) {
            const sourceNode = this.audioContext.createBufferSource();
            sourceNode.buffer = soundBuffer;
            sourceNode.connect(this.audioContext.destination);
            sourceNode.start(0);
        }
    }
}
