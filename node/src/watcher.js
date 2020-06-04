module.exports = function(provider, contract, minExecutionFeeWei) {
    const ethers = require('ethers')

    getAllPendingOrders = async () => {
        let latestID = await contract.latestID()
        latestID = latestID.toNumber()

        let orders = []

        for (let i = 0; i <= latestID; i++) {
            if(i === 0) continue;
            let order = await contract.orders(i)
            order.id = i
            orders.push(order)
        }

        return orders
            .filter((order) => order.submitter != ethers.constants.AddressZero) // remove deleted (cancelled) orders
            .filter((order) => !order.executed) // remove executed orders
            .filter((order) => order.executionFee.gte(minExecutionFeeWei)) // remove orders with a smaller execution fee than required
    }

    watch = async (callback) => {
        provider.on('block', async () => {
            callback(await getAllPendingOrders())
        })
    }

    return {
        getAllPendingOrders,
        watch
    }
}