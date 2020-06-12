const Watcher = require('../src/watcher')
const ethers = require('ethers')

test('getAllPendingOrders should return only pending orders', async () => {
  const mockContract = {
      latestID: async () => {
          return {
            toNumber: () => 1
          }
      },
      orders: async (id) => {
          if(id === 1) {
            return {
                submitter: "0x0000000000000000000000000000000000000001",
                executed: false,
                executionFee:ethers.utils.bigNumberify("2")
              }
          } else if(id === 2) {
            return {
                submitter: "0x0000000000000000000000000000000000000000",
                executed: false,
                executionFee:ethers.utils.bigNumberify("2")
              }
          } else if(id === 3) {
            return {
                submitter: "0x0000000000000000000000000000000000000001",
                executed: true,
                executionFee:ethers.utils.bigNumberify("2")
              }
          } else if(id === 4) {
            return {
                submitter: "0x0000000000000000000000000000000000000001",
                executed: false,
                executionFee:ethers.utils.bigNumberify("0")
              }
          }
        }
    }

    const watcher = Watcher(undefined, undefined, mockContract, "1", undefined, undefined)
    const output = await watcher.getAllPendingOrders()
    expect(output.length).toBe(1)
    expect(output[0].id).toBe(1)
});