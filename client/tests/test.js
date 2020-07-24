import Client from '../src/index';
import "regenerator-runtime/runtime.js";
import FakeProvider from 'web3-fake-provider';

let client;

beforeEach(() => {
  client = new Client(new FakeProvider())
  const mockGetNetwork = jest.fn()
  client.provider.getNetwork = mockGetNetwork
  mockGetNetwork.mockResolvedValue('rinkeby')
});

test('getContract should return a contract instance', async () => {
  const contract = await client.getContract()
  expect(contract.constructor.name).toBe('Contract')
});

test('submitOrder should send a newOrder tx', async () => {
  const params = {
    sourceCurrencyKey: "0x0",
    sourceAmount:"1",
    destinationCurrencyKey:"0x0",
    minDestinationAmount:"1",
    executionFee:"1",
    weiDeposit:"1"
  }
  const mockNewOrder = jest.fn()
  client.getContract = jest.fn()
  client.getContract.mockResolvedValue({
    newOrder: mockNewOrder
  })
  const mockHash = "0x1234"
  mockNewOrder.mockResolvedValue({
    hash:mockHash
  })
  const txHash = await client.submitOrder(params)
  expect(txHash).toBe(mockHash)
  expect(mockNewOrder).toHaveBeenCalled()
});

test('cancelOrder should send a cancelOrder tx', async () => {
  const mockCancelOrder = jest.fn()
  client.getContract = jest.fn()
  client.getContract.mockResolvedValue({
    cancelOrder: mockCancelOrder
  })
  const mockHash = "0x1234"
  mockCancelOrder.mockResolvedValue({
    hash:mockHash
  })
  const txHash = await client.cancelOrder("1")
  expect(txHash).toBe(mockHash)
  expect(mockCancelOrder).toHaveBeenCalled()
});

test('getOrder should return order data from orders mapping', async () => {
  const mockGetOrder = jest.fn()
  client.getContract = jest.fn()
  const testOrder = {
    submitter:"0x0000000000000000000000000000000000000001",
    sourceCurrencyKey: "0x0",
    sourceAmount:"1",
    destinationCurrencyKey:"0x0",
    minDestinationAmount:"1",
    executionFee:"1",
    weiDeposit:"1",
    executed:false
  }
  client.getContract.mockResolvedValue({
    orders: mockGetOrder
  })
  mockGetOrder.mockResolvedValue(testOrder)
  const order = await client.getOrder("1")
  expect(order).toBe(testOrder)
  expect(mockGetOrder).toHaveBeenCalled()
});

test('getAllActiveOrders should return active limit orders array', async () => {
  client.getContract = jest.fn()
  const mockQueryFilter = jest.fn()
  client.getContract.mockResolvedValue({
    filters:{
      Order: jest.fn()
    },
    queryFilter: mockQueryFilter
  })
  mockQueryFilter.mockResolvedValue([
    {
      data:{
        orderID:"1"
      }
    }
  ])
  client.getOrder = jest.fn()
  const mockAddress = "0x0000000000000000000000000000000000000001"
  client.provider.provider.selectedAddress = mockAddress
  client.getOrder.mockResolvedValue({
    submitter:mockAddress,
    sourceCurrencyKey: "0x0",
    sourceAmount:"1",
    destinationCurrencyKey:"0x0",
    minDestinationAmount:"1",
    executionFee:"1",
    weiDeposit:"1",
    executed:false
  })
  const orders = await client.getAllActiveOrders()
  expect(Array.isArray(orders)).toBe(true)
  expect(orders.length).toBe(1)
  expect(mockQueryFilter).toHaveBeenCalled()
});