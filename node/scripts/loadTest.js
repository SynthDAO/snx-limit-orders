require('dotenv-safe').config();
const ethers = require('ethers');
const axios = require('axios')

const DELEGATE_APPROVALS_ADDRESS = "0xB8CFB40B4c66533cD8f760c1b15cc228452bB03E"
const CONTRACT_ADDRESS = "0x5854EA08531B56f99B2c9C9A4D2ffca01032A432"
const NETWORK = "kovan"
const PROVIDER_URL = process.env.PROVIDER_URL
const MIN_EXECUTION_FEE_WEI = "2"
const PRIVATE_KEY = process.env.PRIVATE_KEY
const NUM_ORDERS = 2
const sourceCurrencyKey = ethers.utils.formatBytes32String("sUSD")
const destinationCurrencyKey = ethers.utils.formatBytes32String("sETH")
const sourceAmount = "1"
const minDestinationAmount = "1"

const provider = new ethers.providers.JsonRpcProvider(PROVIDER_URL, NETWORK)
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const abi = [
    "function latestID() public view returns (uint)",
    "function orders(uint orderID) public view returns (tuple(address submitter, bytes32 sourceCurrencyKey, uint256 sourceAmount, bytes32 destinationCurrencyKey, uint256 minDestinationAmount, uint256 weiDeposit, uint256 executionFee) user)",
    "function newOrder(bytes32 sourceCurrencyKey, uint sourceAmount, bytes32 destinationCurrencyKey, uint minDestinationAmount, uint executionFee) payable returns (uint)",
    "event Order(uint indexed orderID, address indexed submitter, bytes32 sourceCurrencyKey, uint sourceAmount, bytes32 destinationCurrencyKey, uint minDestinationAmount, uint executionFee, uint weiDeposit)",
    "event Cancel(uint indexed orderID)",
    "event Execute(uint indexed orderID, address indexed submitter, address executer)"
]

const delegateApprovalsAbi = [
    "function approveExchangeOnBehalf(address delegate)"
]

const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);
const delegateApprovalsContract = new ethers.Contract(DELEGATE_APPROVALS_ADDRESS, delegateApprovalsAbi, wallet)

getGasPrice = async () => {
    const resp = await axios.get('https://ethgasstation.info/api/ethgasAPI.json')
    const gweiPrice = Math.floor(resp.data.fast / 10) * 2
    return ethers.utils.parseUnits(String(gweiPrice), 'gwei')
}

main = async () => {
    const weiDeposit = (await provider.getGasPrice()).mul(500000).add(MIN_EXECUTION_FEE_WEI)

    const approveTx = await delegateApprovalsContract.approveExchangeOnBehalf(CONTRACT_ADDRESS)
    await approveTx.wait()
    console.log("Delegated Approval successful")

    for (let i = 0; i < NUM_ORDERS; i++) {
        const tx = await contract.newOrder(sourceCurrencyKey, sourceAmount, destinationCurrencyKey, minDestinationAmount, MIN_EXECUTION_FEE_WEI, {
            value: weiDeposit
        })
        console.log("Submitting tx:", i);
        await tx.wait()
        console.log("Submitted");
    }

}

main()