
const ws = new WebSocket(`ws://localhost:9999/?token=${JWT_TOKEN}`);

ws.onopen = () => {
    console.log("Conectado al WebSocket");
};