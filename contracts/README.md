# SNX Limit Orders Contracts

## Live Contracts

### Kovan
* Implementation: [0xc9c7613845A0c26169288C30eEF2604BeBf3A962](https://kovan.etherscan.io/address/0xc9c7613845A0c26169288C30eEF2604BeBf3A962)
* ImplementationResolver: [0x8fdeCb5A4572231Aa058f6F724D09F95160450d2](https://kovan.etherscan.io/address/0x8fdeCb5A4572231Aa058f6F724D09F95160450d2)
* Proxy: [0x5854EA08531B56f99B2c9C9A4D2ffca01032A432](https://kovan.etherscan.io/address/0x5854EA08531B56f99B2c9C9A4D2ffca01032A432)

(make sure to `approveExchangeOnBehalf()` the proxy contract before trying to place an order)

## Test
```sh
npx buidler test
```
## Deployment
```
1. Add Infura access token and private key as environement variables
```sh
export INITIAL_OWNER="..."
export INFURA_PROJECT_ID="..."
export PRIVATE_KEY="..." # without the 0x prefix
```
2. Deploy to a live network
```sh
npx buidler run scripts/deploy.js --network rinkeby
```
