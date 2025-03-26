import {MotionDetector} from './motion.js';

const protocol = location.protocol.replace('http', 'ws');

const ws = new WebSocket(`${protocol}//${location.host}/ws`);
const motionDetector = new MotionDetector();

const form = document.getElementById('connect');
const gameIdInput = document.getElementById('gameId');
const submitButton = document.getElementById('submitButton');
const messages = document.getElementById('messages');
const wsReady = new Promise((resolve) => ws.onopen = resolve);

let gameId = null;

function stop() {
    submitButton.disabled = false;
    motionDetector.stop();
}

motionDetector.setOnJump(async (acceleration) => {
    await wsReady

    const payload = {
        action: "jump",
        velocity: Math.min(acceleration * 0.75, 22)
    }
    ws.send(JSON.stringify({type: 'controller', actorId: gameId, payload}));
});

// On form submit, open the WS connection
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    gameId = gameIdInput.value.trim();

    if (!gameId) return;

    submitButton.disabled = true;
    messages.textContent = 'Connecting...';
    await wsReady

    ws.send(JSON.stringify({type: 'controller', actorId: gameId, payload: "start"}));
});

ws.onmessage = ({data}) => {
    const parsed = JSON.parse(data);

    if (parsed.type === 'connected') {
        messages.textContent = 'Connected! Jump with your phone to control T-Rex!';
        motionDetector.start()
    } else if (parsed.type === 'error') {
        messages.textContent = 'Error: ' + parsed.message;
        stop()
    }
};

ws.onerror = (err) => {
    messages.textContent = `Connection error: ${err}, refresh and try again`;
    stop()
};

ws.onclose = () => {
    messages.textContent = 'Connection closed, refresh and try again';
    stop()
};
