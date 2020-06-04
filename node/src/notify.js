module.exports = function(webhookURL) {

    const axios = require('axios').default;

    const webbhook = axios.create({
        baseURL: webhookURL,
        timeout: 1000
    });

    send = (message) => {
        console.log("Sending notification:", message)
        webbhook.post('/',{
            message
        }).catch((e) => {
            console.error("Failed to send notification", message, e);
        })
    }

    return {
        send,
        lowBalance(address) {
            send(`Limit order execution node balance too low. Please refill some ETH at ${address}`)
        }
    }

}