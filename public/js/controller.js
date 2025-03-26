const ws = new WebSocket(`ws://${location.host}`);
const connectForm = document.getElementById("connect")

const connected = new Promise((resolve) => {
    ws.onopen = () => connectForm.addEventListener("submit", () => {
        const gameId = document.getElementById("gameId").value
        ws.send(JSON.stringify({type: 'controller', actorId: gameId, payload: "start"}))
        resolve()
    })
})
