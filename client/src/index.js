import {ethers} from 'ethers';

const ABI = [
  "function newOrder(bytes32 sourceCurrencyKey, uint sourceAmount, bytes32 destinationCurrencyKey, uint minDestinationAmount, uint executionFee) payable public returns (uint)",
  "function cancelOrder(uint orderID) public",
  "function orders(uint orderID) public view returns (tuple(address submitter, bytes32 sourceCurrencyKey, uint256 sourceAmount, bytes32 destinationCurrencyKey, uint256 minDestinationAmount, uint256 weiDeposit, uint256 executionFee, uint256 executionTimestamp, uint256 destinationAmount, bool executed) user)",
  "event Order(uint indexed orderID, address indexed submitter, bytes32 sourceCurrencyKey, uint sourceAmount, bytes32 destinationCurrencyKey, uint minDestinationAmount, uint executionFee, uint weiDeposit)",
  "event Execute(uint indexed orderID, address indexed submitter, address executer)",
  "function withdrawOrders(uint[] memory orderIDs) public"
]

const CONSTANTS = {
  "rinkeby":{
    contractAddress:"0x0000000000000000000000000000000000000001"
  }
}

class Client {

  constructor (web3Provider) {
    this.provider = new ethers.providers.Web3Provider(web3Provider)
  }

  getContract = async () => {
    const network = await this.provider.getNetwork()
    const signer = this.provider.getSigner()
    return new ethers.Contract(CONSTANTS[network].contractAddress, ABI, signer)
  }

  submitOrder = async ({sourceCurrencyKey, sourceAmount, destinationCurrencyKey, minDestinationAmount, executionFee, weiDeposit}) => {
    const contract = await this.getContract()
    const tx = await contract.newOrder(sourceCurrencyKey, sourceAmount, destinationCurrencyKey, minDestinationAmount, executionFee, {
      value: weiDeposit
    })
    return tx.hash
    // TODO: Return order ID instead
  };

  cancelOrder = async (orderID) => {
    const contract = await this.getContract()
    const tx = await contract.cancelOrder(orderID);
    return tx.hash
  }

  getOrder = async (orderID) => {
    const contract = await this.getContract()
    return await contract.orders(orderID);
  }

  getAllActiveOrders = async () => {
    const contract = await this.getContract();
    const filter = contract.filters.Order(null, this.provider.provider.selectedAddress);
    const events = await contract.queryFilter(filter, 0);
    let activeOrders = []
    for (let i = 0; i < events.length; i++) {
      let orderState = await this.getOrder(events[i].data.orderID)
      orderState.id = events[i].data.orderID
      if(orderState.submitter.toLowerCase() === this.provider.provider.selectedAddress && orderState.executed === false) {
        activeOrders.push(orderState)
      }
    }
    return activeOrders;
  }

}

export default Client;
