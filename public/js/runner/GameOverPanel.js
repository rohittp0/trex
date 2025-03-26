// runner/GameOverPanel.js

import { IS_HIDPI } from './constants.js';

export class GameOverPanel {
    static dimensions = {
        TEXT_X: 0,
        TEXT_Y: 13,
        TEXT_WIDTH: 191,
        TEXT_HEIGHT: 11,
        RESTART_WIDTH: 36,
        RESTART_HEIGHT: 32
    };

    constructor(canvas, textSprite, restartImg, dimensions) {
        this.canvas = canvas;
        this.canvasCtx = this.canvas.getContext('2d');
        this.canvasDimensions = dimensions;
        this.textSprite = textSprite;
        this.restartImg = restartImg;
        this.draw();
    }

    updateDimensions(width, opt_height) {
        this.canvasDimensions.WIDTH = width;
        if (opt_height) {
            this.canvasDimensions.HEIGHT = opt_height;
        }
    }

    draw() {
        const { TEXT_X, TEXT_Y, TEXT_WIDTH, TEXT_HEIGHT,
            RESTART_WIDTH, RESTART_HEIGHT } = GameOverPanel.dimensions;

        const centerX = this.canvasDimensions.WIDTH / 2;
        // Game Over text
        let textSourceX = TEXT_X, textSourceY = TEXT_Y;
        let textSourceWidth = TEXT_WIDTH, textSourceHeight = TEXT_HEIGHT;
        const textTargetX = Math.round(centerX - TEXT_WIDTH / 2);
        const textTargetY = Math.round((this.canvasDimensions.HEIGHT - 25) / 3);
        // Restart button
        let restartSourceWidth = RESTART_WIDTH, restartSourceHeight = RESTART_HEIGHT;
        const restartTargetX = centerX - RESTART_WIDTH / 2;
        const restartTargetY = this.canvasDimensions.HEIGHT / 2;

        if (IS_HIDPI) {
            textSourceX *= 2;
            textSourceY *= 2;
            textSourceWidth *= 2;
            textSourceHeight *= 2;
            restartSourceWidth *= 2;
            restartSourceHeight *= 2;
        }

        // Draw "Game Over"
        this.canvasCtx.drawImage(
            this.textSprite,
            textSourceX, textSourceY, textSourceWidth, textSourceHeight,
            textTargetX, textTargetY, TEXT_WIDTH, TEXT_HEIGHT
        );

        // Draw restart icon
        this.canvasCtx.drawImage(
            this.restartImg,
            0, 0,
            restartSourceWidth, restartSourceHeight,
            restartTargetX, restartTargetY,
            RESTART_WIDTH, RESTART_HEIGHT
        );
    }
}
