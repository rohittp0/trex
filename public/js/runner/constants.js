// runner/constants.js

export const DEFAULT_WIDTH = 1200;
export const FPS = 60;

export const IS_HIDPI = window.devicePixelRatio > 1;
export const IS_MOBILE = /Mobi|Android/i.test(window.navigator.userAgent);
export const IS_IOS = /UIWebViewForStaticFileContent/i.test(window.navigator.userAgent);

export const RunnerConfig = {
    ACCELERATION: 0.001,
    BG_CLOUD_SPEED: 0.2,
    BOTTOM_PAD: 10,
    CLEAR_TIME: 3000,
    CLOUD_FREQUENCY: 0.5,
    GAMEOVER_CLEAR_TIME: 750,
    GAP_COEFFICIENT: 1,
    GRAVITY: 0.6,
    INITIAL_JUMP_VELOCITY: 12,
    MAX_CLOUDS: 6,
    MAX_OBSTACLE_LENGTH: 3,
    MAX_SPEED: 12,
    MOBILE_SPEED_COEFFICIENT: 1.2,
    RESOURCE_TEMPLATE_ID: 'audio-resources',
    SPEED: 6,
    SPEED_DROP_COEFFICIENT: 3
};

export const RunnerDefaultDimensions = {
    WIDTH: DEFAULT_WIDTH,
    HEIGHT: 600
};

// A few other sets of enumerations or static objects:
export const RunnerClasses = {
    CANVAS: 'runner-canvas',
    CONTAINER: 'runner-container',
    CRASHED: 'crashed',
    ICON: 'icon-offline',
    TOUCH_CONTROLLER: 'controller'
};

export const RunnerImageSources = {
    LDPI: [
        { name: 'CACTUS_LARGE', id: '1x-obstacle-large' },
        { name: 'CACTUS_SMALL', id: '1x-obstacle-small' },
        { name: 'CLOUD', id: '1x-cloud' },
        { name: 'HORIZON', id: '1x-horizon' },
        { name: 'RESTART', id: '1x-restart' },
        { name: 'TEXT_SPRITE', id: '1x-text' },
        { name: 'TREX', id: '1x-trex' },
    ],
    HDPI: [
        { name: 'CACTUS_LARGE', id: '2x-obstacle-large' },
        { name: 'CACTUS_SMALL', id: '2x-obstacle-small' },
        { name: 'CLOUD', id: '2x-cloud' },
        { name: 'HORIZON', id: '2x-horizon' },
        { name: 'RESTART', id: '2x-restart' },
        { name: 'TEXT_SPRITE', id: '2x-text' },
        { name: 'TREX', id: '2x-trex' },
    ]
};

export const RunnerSounds = {
    BUTTON_PRESS: 'offline-sound-press',
    HIT: 'offline-sound-hit',
    SCORE: 'offline-sound-reached'
};

export const RunnerKeycodes = {
    JUMP: { '38': 1, '32': 1 }, // Up, Space
    DUCK: { '40': 1 },          // Down
    RESTART: { '13': 1 }        // Enter
};

export const RunnerEvents = {
    ANIM_END: 'webkitAnimationEnd',
    CLICK: 'click',
    KEYDOWN: 'keydown',
    KEYUP: 'keyup',
    MOUSEDOWN: 'mousedown',
    MOUSEUP: 'mouseup',
    RESIZE: 'resize',
    TOUCHEND: 'touchend',
    TOUCHSTART: 'touchstart',
    VISIBILITY: 'visibilitychange',
    BLUR: 'blur',
    FOCUS: 'focus',
    LOAD: 'load'
};
