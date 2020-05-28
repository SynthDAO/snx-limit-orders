# SNX Limit Orders Contracts

## Live Contracts

### Rinkeby
* Implementation: [0xdABb898a4fC5484E51D41eF8987a14Cf7Ae766Fa](https://rinkeby.etherscan.io/address/0xdabb898a4fc5484e51d41ef8987a14cf7ae766fa)
* ImplementationResolver: [0x90Ce04CDA35204bfe7553C6Ad035438D2De135d6](https://rinkeby.etherscan.io/address/0x90ce04cda35204bfe7553c6ad035438d2de135d6)
* Proxy: [0xF771A01C488c24F7755Ad1824650D3e243B65A9c](https://rinkeby.etherscan.io/address/0xf771a01c488c24f7755ad1824650d3e243b65a9c)

For convenience, use the [OneClickDapp page](https://oneclickdapp.com/cola-tarzan/) for testnet manual testing.

## Test
```sh
npx buidler test
```
## Deployment
1. Add constructor arguments as environment variables
```sh
export SYNTHETIX_ADDRESS="0x123"
export FEE_RECLAMATION_WINDOW="10" # in seconds
```
2. Add Infura access token and private key as environement variables
```sh
export INFURA_PROJECT_ID="..."
export PRIVATE_KEY="..." # without the 0x prefix
```
3. Deploy to a live network
```sh
npx buidler run scripts/deploy.js --network rinkeby
```