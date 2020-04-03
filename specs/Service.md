# Limit Order Execution Service Spec

## Introduction

The Limit Order Execution Service is an always-running node that collects `newOrder` events from the `SynthLimitOrder` contract and executes each order when its `minDestinationAmount` condition is met by the Synthetix oracle (Synthetix `ExchangeRates.sol` contract).

## Architecture
TODO