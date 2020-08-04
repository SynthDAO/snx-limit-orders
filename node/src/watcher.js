module.exports = function(wallet, provider, contract, minExecutionFeeWei, webhookURL, lowBalanceThreshold) {
    const ethers = require('ethers')
    const Notify = require('./notify')
    const DAY_MILLSECONDS = 86400000;

    const orderBlacklist = {}

    getAllPendingOrders = async () => {
        let latestID = await contract.latestID()
        latestID = latestID.toNumber()

        let orders = []

        for (let i = 0; i <= latestID; i++) {
            if(i === 0) continue;
            // skip orders that were checked before
            if(orderBlacklist[i]) continue;
            let order = await contract.orders(i)

            // blacklist and skip cancelled/executed order & those with insufficient execution fee
            if(
                order.submitter === ethers.constants.AddressZero
                ||
                order.executionFee.lte(minExecutionFeeWei)
            ) {
                orderBlacklist[i] = true;
            } else {
                order.id = i
                orders.push(order)
            }
        }

        return orders
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