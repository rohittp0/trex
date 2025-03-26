const runner = new Runner('game');
const ws = new WebSocket(`ws://${location.host}`);
const gameId = new URLSearchParams(location.search).get('gameId');

ws.onopen = () => {
    ws.send(JSON.stringify({type: 'actor', actorId: gameId}));
};

ws.onmessage = ({data}) => {
    data = JSON.parse(data);
    if(data.type === 'move' && data.direction === 'up') {
        runner.jump()
    }
}
