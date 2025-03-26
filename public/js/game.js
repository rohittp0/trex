const runner = new Runner('game');
const protocol = location.protocol.replace("http", "ws")
const ws = new WebSocket(`${protocol}//${location.host}`);
const gameId = new URLSearchParams(location.search).get('gameId');

ws.onopen = () => {
    ws.send(JSON.stringify({type: 'actor', actorId: gameId}));
};

ws.onmessage = ({data}) => {
    const {payload} = JSON.parse(data);
    if (payload === 'jump')
        runner.jump()
}
