# SNX Limit Orders (Work In Progress)

## Summary
We propose a trustless architecture for adding limit orders functionality to the Synthetix Exchange that would not require any changes to the core contracts.

## Abstract
To keep the integrity of the core Synthetix contracts in place, we propose the creation of a separate layer of “advanced mode” trading contracts to enable additional functionality. The primary contract is a limit order contract. The exchange users can place limit orders on it and send the order source amount to it. Additionally, they specify the parameters of limit orders, including destination asset price, allowed slippage and execution fees.

## Motivation
To increase the flexibility of the Synthetix exchange, limit order functionality is needed so users can effectively trade synthetic assets.
While limit orders can be trivial to implement in the case of centralized exchanges, in the case of a DEX such as Synthetix, limit orders can be challenging in terms of security guarantees and trustlessness due to client unavailability.

## Specification

* [SynthLimitOrder Solidity Contract](specs/Contract.md)
* [Limit Order Execution Node](specs/Node.md)
* [Client-side Javascript Library](specs/Library.md)


## Rationale
<!--The rationale fleshes out the specification by describing what motivated the design and why particular design decisions were made. It should describe alternate designs that were considered and related work, e.g. how the feature is supported in other languages. The rationale may also provide evidence of consensus within the community, and should discuss important objections or concerns raised during discussion.-->
### Limit Order Execution Nodes
By allowing anyone to run “limit order execution nodes” and compete for limit order execution fees, we achieve order execution reliability and censorship-resistance through permissionless-ness. These are especially important in the context of limit orders, where censorship or execution delays might cause trading losses.

### Upgradability
Contract functions that interact with any Synthetix contract fetch the current address of the target contract from the Synthetix `AddressResolver` contract on each transaction. This ensures that our contract is always in sync with the latest contracts deployed by Synthetix.

Additionally, submitting and executing orders on the `SynthLimitOrder` contract can be temporarily or permanently paused by a preset admin key in the event where the `AddressResolver` becomes deprecated or the contract interface of the target contracts is modified by the Synthetix team. In either of these cases, a new version of this contract should be deployed with a new address to replace it. Each user would be required to cancel their active orders and resubmit them on the new contract. Only the `cancelOrder` contract function is not pausable in order to allow users to withdraw any stored funds while the contract is paused.