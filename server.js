const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

let updateCount = 0;

const sendUpdates = (ws, count, interval) => {
    let sent = 0;
    const send = setInterval(() => {
        if (sent >= count) {
            clearInterval(send);
            return;
        }
        const orderUpdate = {
            AppOrderID: updateCount + 1,
            price: Math.random() * 100,
            triggerPrice: Math.random() * 100,
            priceType: "MKT",
            productType: "I",
            status: "complete",
            exchange: "NSE",
            symbol: `SYM${updateCount + 1}`,
        };
        ws.send(JSON.stringify(orderUpdate));
        console.log(`Sent update: ${JSON.stringify(orderUpdate)} at ${new Date().toISOString()}`);
        updateCount++;
        sent++;
    }, interval);
};

server.on('connection', (ws) => {
    console.log('Client connected');
    sendUpdates(ws, 10, 100);  
    setTimeout(() => sendUpdates(ws, 20, 100), 2000);  
    setTimeout(() => sendUpdates(ws, 40, 100), 5000);  
    setTimeout(() => sendUpdates(ws, 30, 100), 10000);  
});
