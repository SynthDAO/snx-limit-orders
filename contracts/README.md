# SNX Limit Orders Contracts

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