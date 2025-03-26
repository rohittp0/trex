const protocol = location.protocol.replace('http', 'ws');
let ws = new WebSocket(`${protocol}//${location.host}/ws`);

const form = document.getElementById('connect');
const gameIdInput = document.getElementById('gameId');
const submitButton = document.getElementById('submitButton');
const messages = document.getElementById('messages');
const wsReady = new Promise((resolve) => ws.onopen = resolve);

// On form submit, open the WS connection
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const gameId = gameIdInput.value.trim();
    if (!gameId) return;

    submitButton.disabled = true;
    messages.textContent = 'Connecting...';
    await wsReady

    ws.send(JSON.stringify({type: 'controller', actorId: gameId, payload: "start"}));
});

ws.onmessage = ({data}) => {
    const parsed = JSON.parse(data);

    if(parsed.type === 'connected')
        messages.textContent = 'Connected! Jump with your phone to control T-Rex!';
    else if(parsed.type === 'error') {
        messages.textContent = 'Error: ' + parsed.message;
        submitButton.disabled = false;
    }
};

ws.onerror = (err) => {
    messages.textContent = `Connection error: ${err}, refresh and try again`;
    submitButton.disabled = false;
};

ws.onclose = () => {
    messages.textContent = 'Connection closed, refresh and try again';
    submitButton.disabled = false;
};
