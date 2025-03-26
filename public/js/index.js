const gameId = Math.floor(1000 + Math.random() * 9000).toString();
document.getElementById('gameId').textContent = gameId;

const ws = new WebSocket(`ws://${location.host}`);
ws.onopen = () => {
    ws.send(JSON.stringify({type: 'actor', actorId: gameId}));
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'start') {
        window.location.href = "game.html?gameId=" + gameId;
    }
};
