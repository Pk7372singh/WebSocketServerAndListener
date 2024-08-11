const WebSocket = require('ws');
const client = new WebSocket('ws://localhost:8080');

let existingOrders = {};

client.on('message', (data) => {
    const order = JSON.parse(data);
    const { AppOrderID, price, triggerPrice, priceType, productType, status, exchange, symbol } = order;

    const key = `${AppOrderID}-${price}-${triggerPrice}-${priceType}-${productType}-${status}-${exchange}-${symbol}`;
    if (existingOrders[key]) {
        console.log(`Filtered duplicate update: ${key}`);
        return;
    }
    existingOrders[key] = true;

    let action = null;
    if (priceType === "MKT" && status === "complete") {
        action = "placeOrder";
    } else if (priceType === "LMT" && status === "open") {
        action = "placeOrder";
    } else if ((priceType === "SL-LMT" || priceType === "SL-MKT") && status === "pending") {
        action = "placeOrder";
    } else if (priceType === "LMT" && status === "cancelled") {
        action = "cancelOrder";
    } else if ((priceType === "MKT" && status === "complete") || 
               (priceType === "LMT" && status === "open") || 
               (priceType === "SL-LMT" || priceType === "SL-MKT" && status === "pending")) {
        action = "modifyOrder";
    }

    if (action) {
        console.log(`Action taken: ${action} for order ${AppOrderID}`);
    } else {
        console.log(`No action needed for order ${AppOrderID}`);
    }
});

client.on('message', debounce((data) => {
    console.log(`Sending aggregated update: ${data}`);
}, 1000));

function debounce(func, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}
