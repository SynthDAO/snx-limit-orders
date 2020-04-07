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

### Lack of Incentive
In our current contract design, we intentionally avoid adding an incentive (e.g. via executor commission). At the end of a limit order execution, the executor is refunded by the order submitter for exactly the amount of gas they spent on their transaction.
This design decision mitigates a potential [Thundering Herd Problem](https://en.wikipedia.org/wiki/Thundering_herd_problem).

Since the cost of running the node is trivial, we expect the Synthetix team to be well incentivized run it as a public good on behalf of the community. In a case where Synthetix teams shuts down the node for some reason, the community is able to run its own node.

### Upgradability
The `SynthLimitOrder` contract architecture does not include any upgradability or admin modules. If a future contract upgrade becomes available, each user is required to cancel any pending limit orders individually and move them to the new contract. In a different case where the Synthetix core contracts are upgraded, a new instance of the contract would be deployed to point at the new Synthetix contracts addresses.

We think it is best not include an admin key that would have the power to cancel all pending orders and/or prevent future orders as that has the potential to be misused for the purpose of market manipulation.
