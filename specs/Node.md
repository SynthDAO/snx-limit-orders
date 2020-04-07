# Limit Order Execution Node Spec

## Introduction

The Limit Order Execution Node is an always-running node that collects `newOrder` events from the `SynthLimitOrder` contract and executes each order when its `minDestinationAmount` condition is met by the Synthetix oracle (Synthetix `ExchangeRates.sol` contract).

## Requirements
* The node collects executable limit orders as soon as their execution conditions are met.
* The node only executes orders that can refund the entire gas cost of the transaction.
* The node attempts to re-execute failing order transactions as soon as their order conditions are met again

## Components

### Watcher Service

This service listens for new Ethereum blocks in realtime. On each new block, the service calls the `SynthLimitOrder` contract's `getAllExecutableOrders` view function. This function will return an array of `orderID`s that are immediately executable by the service. This array also excludes cancelled or previously executed limit orders.

Alternatively, the service can also use the `Order` contract event to subscribe to newly submitted limit orders and check their validity using the `orders` mapping.

If any executable limit orders are found, they are passed to the Execution Service

### Execution Service

In order to determine whether an `orderID` should be immediately executed, the service follows the following steps:
- Checks a local database for any existing pending transactions previously submitted by this executing the same `orderID`. If a record is found, this order will not be submitted.
- Attempts to estimate gas cost for calling the `executeOrder` contract function while passing the `orderID`. If the attempt fails, this is likely because the order's deposited `wei` funds are insufficient to fully recover the gas cost of this transaction.
- Checks if the node wallet address owns sufficient `wei` to cover this transaction cost. If the balance is insufficient, an email notification must be sent to the node operator.

After the checks have passed, the order is executed:
- The `orderID` is submitted to the `executeOrder` function in a new transaction
- The `orderID` is mapped to the resulting transaction hash in the local database to prevent future duplicate transactions.

The execution service then listens for the transaction status.
If the transaction is successfully mined and but the EVM execution has failed:
- The service removes both the mapped `orderID` and transaction hash from the local database
- This `orderID` will then be collected again by the Watcher Service as soon as its conditions are met, starting from the next block.