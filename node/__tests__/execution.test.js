const Execution = require('../src/execution')
const ethers = require('ethers')
const axios = require('axios');

jest.mock('axios');

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

    const ethGasStationMockResp = {
        data: {
            "fast":130.53
        }
    }

    // 130.53 becomes 1 because EthGasStation multiplies results by 10 for some reason & no decimals
    const gasPrice = ethers.utils.parseUnits(String(10), 'gwei')

    axios.get.mockResolvedValue(ethGasStationMockResp)

    const execution = await Execution(mockWallet, mockContract)
    const input = [
        {
            id:1
        }
    ]
    await execution.executeOrders(input)

    expect(mockContract.estimate.executeOrder.mock.calls[0][0]).toBe(1);
    expect(mockContract.estimate.executeOrder.mock.calls[0][1]).toStrictEqual({gasPrice});
    expect(mockContract.executeOrder.mock.calls[0][0]).toBe(1);
    expect(mockContract.executeOrder.mock.calls[0][1]).toStrictEqual({nonce: 0, gasPrice});
    expect(mockWait.mock.calls.length).toBe(1);
})