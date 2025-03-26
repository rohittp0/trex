export class MotionDetector {
    constructor() {
        this.onJump = null;

        // Threshold for deciding an acceleration spike indicates a jump
        this.ACCELERATION_THRESHOLD = 14; // approximate m/s^2 (this is tunable)
        // Minimum time (ms) between consecutive jump detections
        this.COOLDOWN_MS = 500;

        this.lastJumpTime = 0;

        // Bind the event handler so we can properly remove it if needed
        this.handleMotionEvent = this.handleMotionEvent.bind(this);
    }

    /**
     * Sets the callback to invoke when a jump is detected.
     */
    setOnJump(onJump) {
        this.onJump = onJump;
    }

    /**
     * Start listening to device motion events.
     */
    start() {
        if (typeof DeviceMotionEvent !== 'undefined') {
            // Some iOS devices require permission
            if (typeof DeviceMotionEvent.requestPermission === 'function') {
                DeviceMotionEvent.requestPermission()
                    .then((response) => {
                        if (response === 'granted') {
                            window.addEventListener('devicemotion', this.handleMotionEvent, true);
                        } else {
                            console.warn('Motion permission not granted.');
                        }
                    })
                    .catch(console.error);
            } else {
                // Permission request not needed (e.g., Android Chrome)
                window.addEventListener('devicemotion', this.handleMotionEvent, true);
            }
        } else {
            console.warn('DeviceMotionEvent is not supported on this device/browser.');
        }
    }

    /**
     * Stop listening to device motion events.
     */
    stop() {
        window.removeEventListener('devicemotion', this.handleMotionEvent, true);
    }

    /**
     * Handle the devicemotion event to detect a jump.
     */
    handleMotionEvent(event) {
        const acc = event.accelerationIncludingGravity;
        if (!acc) return;

        // Compute magnitude of acceleration vector
        const totalAcceleration = Math.sqrt(
            (acc.x || 0) ** 2 +
            (acc.y || 0) ** 2 +
            (acc.z || 0) ** 2
        );

        // Check if acceleration is above threshold and if cooldown has passed
        const now = Date.now();
        if (
            totalAcceleration > this.ACCELERATION_THRESHOLD &&
            now - this.lastJumpTime > this.COOLDOWN_MS
        ) {
            this.lastJumpTime = now;
            if (this.onJump) {
                this.onJump(totalAcceleration);
            }
        }
    }
}
