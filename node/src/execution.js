module.exports = async function(wallet, contract, gasPrice) {
    const ethers = require('ethers')
    const Lock = require('lock').Lock
    const lock = Lock()
    let pendingTxs = {}
    let nonce = await wallet.getTransactionCount()

    executeOrders = (orders) => {
        lock("block", async (releaseBlock) => {
            orders = orders
                .filter((order) => !pendingTxs[order.id]) // remove orders that are already submitted in a pending tx
                .map((order) => order.id)

            for (let i = 0; i < orders.length; i++) {
                const orderID = orders[i]
                try {
                    await contract.estimate.executeOrder(orderID, {gasPrice:ethers.utils.parseUnits(gasPrice, 'wei')})
                } catch(e) {
                    console.error("Order gas estimation failed", orderID, e)
                    continue;
                }
                try {
                    const tx = await contract.executeOrder(orderID, {nonce, gasPrice:ethers.utils.parseUnits(gasPrice, 'wei')})
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
            releaseBlock()
        })
    }

    return {
        executeOrders
    }
}