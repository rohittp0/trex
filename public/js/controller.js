const ws = new WebSocket(`ws://${location.host}`);
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

function jump() {
    console.log("jump")
    ws.send(JSON.stringify({type: 'controller', actorId: gameId, payload: "jump"}));
}

motionDetector.setOnJump(jump)
