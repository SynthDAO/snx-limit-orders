# SNX Limit Order Execution Node

## Deploy using docker

The docker image can be found on docker hub at [synthdao/snx-limit-order-node](https://hub.docker.com/r/synthdao/snx-limit-order-node).

It can be deployed on any cloud provider that supports containers **and** container SSH access in order to be able to access the CLI. 


## Environment Variables
The following environment variables must also be set in the container:

### PRIVATE_KEY
The hot wallet private key used by the node to execute orders.
It must also already hold some ETH before container deployment. 

Do not add the `0x` prefix to the key.
```sh
PRIVATE_KEY=EEA...
```

### PROVIDER_URL
The HTTP/S provider URL for accessing the Ethereum blockchain.
```sh
PROVIDER_URL=https://mainnet.infura.io/v3/1234...
```

### CONTRACT_ADDRESS
the SNX Limit Order contract address.
Below is an example for Rinkeby.
```sh
CONTRACT_ADDRESS=0x651009E266Ba7994fceAB8999ae1b922e17a0DA3
```

### NETWORK
Network name (e.g. mainnet, rinkeby, etc)

```sh
NETWORK=rinkeby
```

### MIN_EXECUTION_FEE_WEI
The minimum fee (in wei) this node will accept from the user to execute their order in addition to the transaction gas refund.
```sh
MIN_EXECUTION_FEE_WEI="1"
```

### GAS_PRICE_WEI
The gas price in wei for all transactions sent by this node.
```sh
GAS_PRICE_WEI="1000000000"
```

### NOTIFY_WEBHOOK
The webhook url to be called if the node wallet wei balance drops below `LOW_BALANCE_THRESHOLD_WEI`.

The JSON post request will include a single `string` message field. This can be used in combination with services like Zapier to alert the node operator when they need to send ETH to the node address

```sh
NOTIFY_WEBHOOK=https://snx.requestcatcher.com/
```

### LOW_BALANCE_THRESHOLD_WEI
If the node wallet balance drops under this wei amount, a post request will be sent to the `NOTIFY_WEBHOOK` url.

Below is an example for 0.001 ETH
```sh
LOW_BALANCE_THRESHOLD_WEI="1000000000000000"
```

## Withdrawing ETH

Please DO NOT withdraw ETH or make any transactions from the node address using any external wallet. This will break the internal nonce management of the node. That said, you can only send ETH to the node address at any time.

In order to withdraw ETH from the hot wallet, you need to SSH into the container and run the following script with the destination address and Wei amount as arguments:
```sh
node /usr/src/app/node/scripts/withdraw.js YOUR_ETH_ADDRESS WEI_AMOUNT
```
Please note that this requires the node itself to be running. When using the container, the node will be running automatically.
