require('dotenv-safe').config();
const Watcher = require('./src/watcher')
const Execution = require('./src/execution')
const ethers = require('ethers');

const PRIVATE_KEY = process.env.PRIVATE_KEY
const PROVIDER_URL = process.env.PROVIDER_URL
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS
const NETWORK = process.env.NETWORK
const MIN_EXECUTION_FEE_WEI = process.env.MIN_EXECUTION_FEE_WEI // string
const GAS_PRICE_WEI = process.env.GAS_PRICE_WEI // string

const provider = new ethers.providers.JsonRpcProvider(PROVIDER_URL, NETWORK)
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const abi = [
    "function latestID() public view returns (uint)",
    "function orders(uint orderID) public view returns (tuple(address submitter, bytes32 sourceCurrencyKey, uint256 sourceAmount, bytes32 destinationCurrencyKey, uint256 minDestinationAmount, uint256 weiDeposit, uint256 executionFee, uint256 executionTimestamp, uint256 destinationAmount, bool executed) user)",
    "function executeOrder(uint orderID) public",
    "event Order(uint indexed orderID, address indexed submitter, bytes32 sourceCurrencyKey, uint sourceAmount, bytes32 destinationCurrencyKey, uint minDestinationAmount, uint executionFee, uint weiDeposit)",
    "event Cancel(uint indexed orderID)",
    "event Execute(uint indexed orderID, address executer)"
]
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

Execution(wallet, contract, GAS_PRICE_WEI).then((execution) => {
    const watcher = Watcher(provider, contract, MIN_EXECUTION_FEE_WEI)

    watcher.watch(execution.executeOrders)
})