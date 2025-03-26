if (/Mobi|Android/i.test(navigator.userAgent)) {
    window.location.replace('/controller.html');
}

const gameId = Math.floor(1000 + Math.random() * 9000).toString();
document.getElementById('gameId').textContent = gameId;
document.getElementById('origin').textContent = location.origin;

const protocol = location.protocol.replace("http", "ws")
const ws = new WebSocket(`${protocol}//${location.host}`);

ws.onopen = () => {
    ws.send(JSON.stringify({type: 'actor', actorId: gameId}));
};

ws.onmessage = (event) => {
    const {payload} = JSON.parse(event.data);
    if (payload === 'start') {
        window.location.href = "game.html?gameId=" + gameId;
    }
};
