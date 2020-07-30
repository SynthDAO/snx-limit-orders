# SNX Limit Orders Contracts

## Live Contracts

Make sure to `approveExchangeOnBehalf()` the proxy contract before trying to place a limit order

### Mainnet
* Implementation: [0x736d22180993e20cac87E9B2035560c1De455027](https://etherscan.io/address/0x736d22180993e20cac87E9B2035560c1De455027)
* ImplementationResolver: [0x2206aa8EC85270ACe5597539E3c287E021D41843](https://etherscan.io/address/0x2206aa8EC85270ACe5597539E3c287E021D41843)
* Proxy: [0x1864Ff44b3f94732b1dEf2502383FE138C636444](https://etherscan.io/address/0x1864Ff44b3f94732b1dEf2502383FE138C636444)

### Ropsten
* Implementation: [0xC38776bdB0f02CFa66113F069D1f319f36901736](https://ropsten.etherscan.io/address/0xC38776bdB0f02CFa66113F069D1f319f36901736)
* ImplementationResolver: [0x61D8e17C885B39534f972F92A9475FD50D2a0F32](https://ropsten.etherscan.io/address/0x61D8e17C885B39534f972F92A9475FD50D2a0F32)
* Proxy: [0x001b566995718756bDBF599650c4440a3186E86c](https://ropsten.etherscan.io/address/0x001b566995718756bDBF599650c4440a3186E86c)

### Rinkeby
* Implementation: [0x3dCf67EdABe1B97B44ed6F34c91B4DA9ef8f4933](https://rinkeby.etherscan.io/address/0x3dCf67EdABe1B97B44ed6F34c91B4DA9ef8f4933)
* ImplementationResolver: [0x76661E0441eCEfD0494DB501e013A82722bdDA6d](https://rinkeby.etherscan.io/address/0x76661E0441eCEfD0494DB501e013A82722bdDA6d)
* Proxy: [0x2F5a16bb99927A0a663a568b7c54A839527023A7](https://rinkeby.etherscan.io/address/0x2F5a16bb99927A0a663a568b7c54A839527023A7)

### Kovan
* Implementation: [0xc9c7613845A0c26169288C30eEF2604BeBf3A962](https://kovan.etherscan.io/address/0xc9c7613845A0c26169288C30eEF2604BeBf3A962)
* ImplementationResolver: [0x8fdeCb5A4572231Aa058f6F724D09F95160450d2](https://kovan.etherscan.io/address/0x8fdeCb5A4572231Aa058f6F724D09F95160450d2)
* Proxy: [0x5854EA08531B56f99B2c9C9A4D2ffca01032A432](https://kovan.etherscan.io/address/0x5854EA08531B56f99B2c9C9A4D2ffca01032A432)


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
