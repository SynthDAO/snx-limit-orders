const Execution = require('../src/execution')
const ethers = require('ethers')

test('executeOrders should execute orders', async (done) => {
    const mockWallet = {
        async getTransactionCount () {
            return 0
        }
    }
    const mockWait = jest.fn(async () => {
        done()
        return {
            status:1
        }
    })

    const mockContract = {
        executeOrder: jest.fn(async (id, overrides) => {
            return {
                wait: mockWait
            }
        }),
        estimate:{
            executeOrder: jest.fn(async (id, overrides) => null)
        }
    }
    const execution = await Execution(mockWallet, mockContract, "1")
    const input = [
        {
            id:1
        }
    ]
    await execution.executeOrders(input)
    expect(mockContract.estimate.executeOrder.mock.calls[0][0]).toBe(1);
    expect(mockContract.estimate.executeOrder.mock.calls[0][1]).toStrictEqual({gasPrice:ethers.utils.parseUnits("1", 'wei')});
    expect(mockContract.executeOrder.mock.calls[0][0]).toBe(1);
    expect(mockContract.executeOrder.mock.calls[0][1]).toStrictEqual({nonce: 0, gasPrice:ethers.utils.parseUnits("1", 'wei')});
    expect(mockWait.mock.calls.length).toBe(1);
})