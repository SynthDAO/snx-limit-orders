module.exports = function(wallet, provider, contract, minExecutionFeeWei, webhookURL, lowBalanceThreshold) {
    const ethers = require('ethers')
    const Notify = require('./notify')
    const DAY_MILLSECONDS = 86400000;

    const orderBlacklist = {}

    getAllPendingOrders = async () => {
        let latestID = await contract.latestID()
        latestID = latestID.toNumber()

        let orderIDs = Array.from(Array(latestID), (_, i) => i + 1) // array of IDs from 1 to latestDS

        let orders = await Promise.allSettled(
            orderIDs
                .filter((id) => !orderBlacklist[id])
                .map(id => contract.orders(id))
        )

        return orders
            .filter((order, i) => {
                order = order.value
                if(order.submitter === ethers.constants.AddressZero || order.executionFee.lte(minExecutionFeeWei)) {
                    orderBlacklist[i + 1] = true
                    return false
                } else {
                    return true
                }
            })
            .map((order, i) => {
                order.id = i + 1
                return order
            })
    }

    watchBalance = () => {
        const notify = Notify(webhookURL);
        setInterval(async () => {
            const balance = await wallet.getBalance()
            if(balance.lt(lowBalanceThreshold)) {
                notify.lowBalance(wallet.address)
            }
        }, DAY_MILLSECONDS)
    }

    watch = async (callback) => {
        provider.on('block', async () => {
            callback(await getAllPendingOrders())
        })
        watchBalance()
    }

    return {
        getAllPendingOrders,
        watch
    }
}