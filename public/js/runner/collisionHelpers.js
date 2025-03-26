// collisionHelpers.js
import {
    CollisionBox,
    createAdjustedCollisionBox,
    boxCompare
} from './CollisionBox.js';

/**
 * Check for a collision between the T-Rex and the first obstacle.
 * @param {!Obstacle} obstacle The obstacle to check.
 * @param {!Trex} tRex The T-Rex character.
 * @param {CanvasRenderingContext2D} [opt_canvasCtx] Optional canvas context for
 *   drawing collision boxes (debugging).
 * @return {boolean} True if there is a collision.
 */
export function checkForCollision(obstacle, tRex, opt_canvasCtx) {
    if (!obstacle) return false;

    // Adjust the T-Rex's bounding box slightly (the sprite has a 1-pixel border).
    const tRexBox = new CollisionBox(
        tRex.xPos + 1,
        tRex.yPos + 1,
        tRex.config.WIDTH - 2,
        tRex.config.HEIGHT - 2
    );

    const obstacleBox = new CollisionBox(
        obstacle.xPos + 1,
        obstacle.yPos + 1,
        obstacle.typeConfig.width * obstacle.size - 2,
        obstacle.typeConfig.height - 2
    );

    // Quick bounding box check
    if (!boxCompare(tRexBox, obstacleBox)) {
        return false;
    }

    // Detailed bounding box checks for each collision box
    const collisionBoxes = obstacle.collisionBoxes;
    const tRexCollisionBoxes = tRex.constructor.collisionBoxes; // static arrays

    for (let t = 0; t < tRexCollisionBoxes.length; t++) {
        for (let i = 0; i < collisionBoxes.length; i++) {
            // Adjust collision boxes to the real positions
            const adjTrexBox = createAdjustedCollisionBox(tRexCollisionBoxes[t], tRexBox);
            const adjObstacleBox = createAdjustedCollisionBox(collisionBoxes[i], obstacleBox);

            if (boxCompare(adjTrexBox, adjObstacleBox)) {
                return true;
            }
        }
    }

    return false;
}
