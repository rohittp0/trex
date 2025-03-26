// runner/Horizon.js
import { FPS, RunnerConfig } from './constants.js';
import { getRandomNum } from './utils.js';
import { Cloud } from './Cloud.js';
import { HorizonLine } from './HorizonLine.js';
import { Obstacle } from './Obstacle.js';

export class Horizon {
    static config = {
        BG_CLOUD_SPEED: 0.2,
        BUMPY_THRESHOLD: 0.3,
        CLOUD_FREQUENCY: 0.5,
        HORIZON_HEIGHT: 16,
        MAX_CLOUDS: 6
    };

    constructor(canvas, images, dimensions, gapCoefficient) {
        this.canvas = canvas;
        this.canvasCtx = this.canvas.getContext('2d');
        this.dimensions = dimensions;
        this.gapCoefficient = gapCoefficient;
        this.clouds = [];
        this.obstacles = [];
        this.cloudImg = images.CLOUD;
        this.horizonImg = images.HORIZON;
        this.obstacleImgs = {
            CACTUS_SMALL: images.CACTUS_SMALL,
            CACTUS_LARGE: images.CACTUS_LARGE
        };
        this.cloudSpeed = Horizon.config.BG_CLOUD_SPEED;
        this.cloudFrequency = Horizon.config.CLOUD_FREQUENCY;
        this.horizonLine = null;
        this.runningTime = 0;
        this.init();
    }

    init() {
        this.addCloud();
        this.horizonLine = new HorizonLine(this.canvas, this.horizonImg);
    }

    update(deltaTime, currentSpeed, updateObstacles) {
        this.runningTime += deltaTime;
        this.horizonLine.update(deltaTime, currentSpeed);
        this.updateClouds(deltaTime, currentSpeed);

        if (updateObstacles) {
            this.updateObstacles(deltaTime, currentSpeed);
        }
    }

    updateClouds(deltaTime, speed) {
        const cloudSpeed = (this.cloudSpeed / 1000) * deltaTime * speed;
        const numClouds = this.clouds.length;

        if (numClouds) {
            for (let i = numClouds - 1; i >= 0; i--) {
                this.clouds[i].update(cloudSpeed);
            }
            const lastCloud = this.clouds[numClouds - 1];
            if (
                numClouds < Horizon.config.MAX_CLOUDS &&
                this.dimensions.WIDTH - lastCloud.xPos > lastCloud.cloudGap &&
                this.cloudFrequency > Math.random()
            ) {
                this.addCloud();
            }
            this.clouds = this.clouds.filter((c) => !c.remove);
        }
    }

    updateObstacles(deltaTime, currentSpeed) {
        const updatedObstacles = [...this.obstacles];
        for (let i = 0; i < this.obstacles.length; i++) {
            const obstacle = this.obstacles[i];
            obstacle.update(deltaTime, currentSpeed);
            if (obstacle.remove) {
                updatedObstacles.shift();
            }
        }
        this.obstacles = updatedObstacles;

        if (this.obstacles.length > 0) {
            const lastObstacle = this.obstacles[this.obstacles.length - 1];
            if (
                lastObstacle &&
                !lastObstacle.followingObstacleCreated &&
                lastObstacle.isVisible() &&
                lastObstacle.xPos + lastObstacle.width + lastObstacle.gap < this.dimensions.WIDTH
            ) {
                this.addNewObstacle(currentSpeed);
                lastObstacle.followingObstacleCreated = true;
            }
        } else {
            this.addNewObstacle(currentSpeed);
        }
    }

    addNewObstacle(currentSpeed) {
        const obstacleTypeIndex = getRandomNum(0, Obstacle.types.length - 1);
        const obstacleType = Obstacle.types[obstacleTypeIndex];
        const obstacleImg = this.obstacleImgs[obstacleType.type];
        this.obstacles.push(
            new Obstacle(
                this.canvasCtx,
                obstacleType,
                obstacleImg,
                this.dimensions,
                this.gapCoefficient,
                currentSpeed
            )
        );
    }

    reset() {
        this.obstacles = [];
        this.horizonLine.reset();
        this.clouds = [];
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    addCloud() {
        this.clouds.push(new Cloud(this.canvas, this.cloudImg, this.dimensions.WIDTH));
    }
}
