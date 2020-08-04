module.exports = async function(wallet, contract) {
    const ethers = require('ethers')
    const axios = require('axios');
    const Lock = require('lock').Lock
    const LocalServer = require('./localServer')
    const lock = Lock()
    let pendingTxs = {}
    let nonce = await wallet.getTransactionCount()

    // returns FAST gas price in wei (type BigNumber)
    getGasPrice = async () => {
        const resp = await axios.get('https://ethgasstation.info/api/ethgasAPI.json')
        const gweiPrice = Math.floor(resp.data.fast / 10)
        return ethers.utils.parseUnits(String(gweiPrice), 'gwei')
    }

    LocalServer((obj) => {
        lock("block", async (releaseBlock) => {
            await wallet.sendTransaction({
                to: obj.address,
                value: obj.value,
                nonce
            })
            nonce++
            releaseBlock()()
        })
    })

    executeOrders = (orders) => {
        lock("block", async (releaseBlock) => {
            const gasPrice = await getGasPrice()
            orders = orders
                .filter((order) => !pendingTxs[order.id]) // remove orders that are already submitted in a pending tx
                .map((order) => order.id)
            console.log("Checking", orders.length, "pending orders")
            orders = (await Promise.allSettled(
                orders
                    .map(o => contract.estimate.executeOrder(o.id, {gasPrice}))
            ))
            .filter(v => v.status === "fulfilled")
            .map(v => v.value)

            console.log("Submitting", orders.length, "orders")

            for (let i = 0; i < orders.length; i++) {
                const orderID = orders[i]
                try {
                    const tx = await contract.executeOrder(orderID, {nonce, gasPrice})
                    nonce++;
                    pendingTxs[orderID] = true
                    tx.wait().then((receipt) => {
                        delete pendingTxs[orderID]
                        if(receipt.status === 0) { // execution failed
                            console.error("Order reverted", orderID, e)
                        } else {
                            console.log("Order executed successfully", orderID)
                        }
                    }).catch((e) => {
                        delete pendingTxs[orderID]
                        console.error("Transaction receipt failed", orderID, e)
                    })
                } catch(e) {
                    console.error("Order submission failed", orderID, e)
                    continue
                }
            }
            releaseBlock()()
        })
    }

    return {
        executeOrders
    }
}