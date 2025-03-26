const protocol = location.protocol.replace("http", "ws")
const ws = new WebSocket(`${protocol}//${location.host}`);
const connectForm = document.getElementById("connect")
const message = document.getElementById("messages")
const motionDetector = new MotionDetector()

let gameId = null

const connected = new Promise((resolve) => {
    ws.onopen = () => connectForm.addEventListener("submit", (e) => {
        e.preventDefault()
        gameId = document.getElementById("gameId").value
        ws.send(JSON.stringify({type: 'controller', actorId: gameId, payload: "start"}))
        connectForm.style.display = "none"
        message.innerText = `Connected to ${gameId}`
        resolve()
    })
})

connected.then(() => motionDetector.start())

ws.onclose = () => {
    message.innerText = "Connection closed"
    connectForm.style.display = "block"
    motionDetector.stop()
}

function jump(totalAcceleration) {
    const payload = {
        action: "jump",
        velocity: totalAcceleration * 0.75
    }
    ws.send(JSON.stringify({type: 'controller', actorId: gameId, payload}));
}

motionDetector.setOnJump(jump)
