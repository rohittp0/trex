// runner/CollisionBox.js

export class CollisionBox {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}

/**
 * Compare two collision boxes for intersection.
 */
export function boxCompare(boxA, boxB) {
    return (
        boxA.x < boxB.x + boxB.width &&
        boxA.x + boxA.width > boxB.x &&
        boxA.y < boxB.y + boxB.height &&
        boxA.y + boxA.height > boxB.y
    );
}

/**
 * Return a new collision box adjusted by an offset box.
 */
export function createAdjustedCollisionBox(box, adjustment) {
    return new CollisionBox(
        box.x + adjustment.x,
        box.y + adjustment.y,
        box.width,
        box.height
    );
}
