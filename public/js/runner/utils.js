// runner/utils.js

import { IS_MOBILE, IS_IOS } from './constants.js';

/**
 * Return the current timestamp, preferring performance.now() if available.
 * @return {number}
 */
export function getTimeStamp() {
    return IS_IOS ? new Date().getTime() : performance.now();
}

/**
 * Get random integer between min and max, inclusive.
 */
export function getRandomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Vibrate on mobile devices.
 * @param {number} duration
 */
export function vibrate(duration) {
    if (IS_MOBILE && window.navigator.vibrate) {
        window.navigator.vibrate(duration);
    }
}

/**
 * Create and append a canvas element.
 */
export function createCanvas(container, width, height, opt_classname) {
    const canvas = document.createElement('canvas');
    if (opt_classname) {
        canvas.className = opt_classname;
    }
    canvas.width = width;
    canvas.height = height;
    container.appendChild(canvas);
    return canvas;
}

/**
 * Decode a base64 string into an ArrayBuffer.
 */
export function decodeBase64ToArrayBuffer(base64String) {
    const len = (base64String.length / 4) * 3;
    const str = atob(base64String);
    const arrayBuffer = new ArrayBuffer(len);
    const bytes = new Uint8Array(arrayBuffer);
    for (let i = 0; i < len; i++) {
        bytes[i] = str.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * Update canvas scaling for high DPI.
 */
export function updateCanvasScaling(canvas, width, height, devicePixelRatio = window.devicePixelRatio) {
    const context = canvas.getContext('2d');
    const backingStoreRatio = context.webkitBackingStorePixelRatio ||
        context.mozBackingStorePixelRatio ||
        context.msBackingStorePixelRatio ||
        context.oBackingStorePixelRatio ||
        context.backingStorePixelRatio || 1;

    const ratio = devicePixelRatio / backingStoreRatio;
    if (ratio !== 1) {
        const oldWidth = width || canvas.width;
        const oldHeight = height || canvas.height;
        canvas.width = oldWidth * ratio;
        canvas.height = oldHeight * ratio;
        canvas.style.width = `${oldWidth}px`;
        canvas.style.height = `${oldHeight}px`;
        context.scale(ratio, ratio);
    }
}
