const protocol = location.protocol.replace('http', 'ws');
let ws = new WebSocket(`${protocol}//${location.host}`);

const form = document.getElementById('connect');
const gameIdInput = document.getElementById('gameId');
const messages = document.getElementById('messages');
const wsReady = new Promise((resolve) => ws.onopen = resolve);

// On form submit, open the WS connection
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const gameId = gameIdInput.value.trim();
    if (!gameId) return;

    form.disabled = true;
    messages.textContent = 'Connecting...';
    await wsReady

    ws.send(JSON.stringify({type: 'actor', actorId: gameId}));
});

ws.onmessage = ({data}) => {
    const parsed = JSON.parse(data);
    const {payload} = parsed;

    if(payload.type === 'connected')
        messages.textContent = 'Connected! Jump with your phone to control T-Rex!';
    else if(payload.type === 'error')
        messages.textContent = 'Error: ' + payload.message;

    form.disabled = false;
};

ws.onerror = (err) => {
    messages.textContent = `WebSocket error: ${err}`;
};

ws.onclose = () => {
    messages.textContent = 'Connection closed.';
};
