# SynthLimitOrder Contracts Spec
*NOTES*:
 - The following specifications use syntax from Solidity `^0.5.16`.
 - In order for these contracts to be able to access user SNX tokens, they must approve the proxy contract address for each token individually using the ERC20 approve() function. We recommend a max uint (2^256 - 1) approval amount.

*Order of deployment*:
 1. The `Implementation` contract is deployed
 2. The `ImplementationResolver` contract is deployed where the address of the `Implementation` contract is provided to the constructor as an `initialImplementation`
 3. The `Proxy` contract is deployed with the address of the `ImplementationResolver` provided to the constructor.
 4. `Implementation.initialize()` is called on the `Proxy` address.
---

## Implementation Contract

The Implementation contract stores no state and no funds and is never called directly by users. It is meant to only receive forwarded contract calls from the Proxy contract.

All state read and write operations on this contract are stored in the Proxy contract state. In the event of an implementation upgrade, the Proxy state would become automatically accessible to the new `Implementation`.

### Public Variables

#### latestID

A uin256 variable that tracks the highest orderID stored.

#### synthetix

An address variable that contains the address of the Synthetix exchange contract

#### orders

A mapping between uint256 orderIDs and `LimitOrder` structs


### Structs

#### LimitOrder
```js
struct LimitOrder {
    address payable submitter;
    bytes32 sourceCurrencyKey;
    uint256 sourceAmount;
    bytes32 destinationCurrencyKey;
    uint256 minDestinationAmount;
    uint256 weiDeposit;
    uint256 executionFee;
    uint256 executionTimestamp;
    uint256 destinationAmount;
    bool executed;
}
```

### Methods

#### initialize

``` js
function initialize(address synthetixAddress, address _addressResolver) public;
```

This method can only be called once to initialize the proxy instance.

#### newOrder

``` js
function newOrder(bytes32 sourceCurrencyKey, uint sourceAmount, bytes32 destinationCurrencyKey, uint minDestinationAmount, uint executionFee) payable public returns (uint orderID);
```

This function allows a `msg.sender` who has already given the `Proxy` contract an allowance of `sourceCurrencyKey` to submit a new limit order.

1. Transfers `sourceAmount` of the `sourceCurrencyKey` Synth from the `msg.sender` to this contract via `transferFrom`.
2. Adds a new limit order using to the `orders` mapping where the key is `latestID + 1`. The order's `executed` property is set to `false`.
3. Increments the global `latestID` variable.
4. Requires a deposited `msg.value` to be more than the `executionFee` in order to refund node operators for their exact gas wei cost in addition to the `executionFee` amount. The remainder will be transferred back to the user at the end of the trade.
5. Emits an `Order` event for node operators including order data and `orderID`.
6. Returns the `orderID`.

#### cancelOrder

``` js
function cancelOrder(uint orderID) public;
```

This function cancels a previously submitted and unexecuted order by the same `msg.sender` of the input `orderID`.

1. Requires the order `submitter` property to be equal to `msg.sender`.
2. Requires the order `executed` property to be equal to be `false`.
3. Refunds the order's `sourceAmount` and deposited `msg.value`
4. Deletes the order using from the `orders` mapping.
5. Emits a `Cancel` event for node operators including the `orderID`

#### executeOrder

``` js
function executeOrder(uint orderID) public;
```

This function allows anyone to execute a limit order.

It fetches the order data from the `orders` mapping and attempts to execute it using `Synthetix.exchange()`, if the amount received is larger than or equal to the order's `minDestinationAmount`:

1. This transaction's submitter address is refunded for this transaction's gas cost + the `executionFee` amount from the user's wei deposit.
2. The remainder of the wei deposit is forwarded to the order submitter's address
3. The order's `executed` property is changed to `true`, the `executionTimestamp` property set to `block.timestamp` and `destinationAmount` set to the received amount.
4. `Execute` event is emitted with the `orderID` for node operators 

If the amount received is smaller than the order's `minDestinationAmount`, the transaction reverts.

#### withdrawOrders

``` js
function withdrawOrders(uint[] orderID) public;
```

This function allows the sender to withdraw funds associated with an array of executed orders as soon as the Synthetix fee reclamation window for each of the order has elapsed.

It iterates over each order's data from the `orders` mapping, if each order's `submitter` is equal to `msg.sender`, has the `executed` property equal to `true` and `executionTimestamp + Exchanger.waitingPeriodSecs() < block.timestamp`:

1. The `destinationAmount` of the `destinationCurrencyKey` is transferred to `msg.sender` using `Synth.transferAndSettle()`
2. The order is deleted using from the `orders` mapping.
3. `Withdraw` event is emitted with the `orderID`.

### Events

#### Order

``` js
event Order(uint indexed orderID, address indexed submitter, bytes32 sourceCurrencyKey, uint sourceAmount, bytes32 destinationCurrencyKey, uint minDestinationAmount uint executionFee, uint weiDeposit)
```

This event is emitted on each new submitted order. Its primary purpose is to alert node operators of newly submitted orders in realtime.

#### Cancel

``` js
event Cancel(uint indexed orderID);
```

This event is emitted on each cancelled order. Its primary purpose is to alert node operators that a previously submitted order should no longer be watched.

#### Execute

``` js
event Execute(uint indexed orderID, address executor);
```

This event is emitted on each successfully executed order. Its primary purpose is to alert node operators that a previously submitted order should no longer be watched.

#### Withdraw

``` js
event Withdraw(uint indexed orderID, address indexed submitter);
```

This event is emitted on each successfully withdrawn order.

---

## Proxy Contract
The proxy contract receives all incoming user transactions to its address and forwards them to the current implementation contract. It also holds all deposited token funds at all times including future upgrades.

All calls to this contract address must follow the ABI of the current `Implementation` contract.

### Constructor

```js
constructor(address ImplementationResolver) public;
```

The constructor sets the `ImplementationResolver` to an internal global variable to be accessed by the fallback function on each future contract call.

### Fallback function

```js
function() public;
```

Following any incoming contract call, the fallback function calls the `ImplementationResolver`'s `getImplementation()` function in order to query the address of the current `Implementation` contract and then uses `DELEGATECALL` opcode to forward the incoming contract call to the queried contract address.

---

## ImplementationResolver Contract

This contract provides the current `Implementation` contract address to the `Proxy` contract.
It is the only contract that is controlled by an `owner` address. It is also responsible for upgrading the current implementation address in case new features are to be added in the future.

### Constructor

```js
constructor(address initialImplementation, address initialOwner) public;
```

The constructor sets the `initialImplementation` address to an internal global variable to be access later by the `getImplementation()` method. It also sets the `initialOwner` address to the `owner` public global variable.

### Public Variables

#### owner

An address variable that stores the contract owner address responsible for upgrading the implementation contract address.


### Methods

#### changeOwnership

``` js
function changeOwnership(address newOwner) public;
```

This function allows only the current `owner` address to change the contract owner to a new address. It sets the `owner` global variable to the `newOwner` argument value and emits a `NewOwner` event.

#### upgrade

``` js
function upgrade(address newImplementation) public;
```

This function allows only the current `owner` address to upgrade the contract implementation address.

It sets the internal implementation global variable to the `newImplementation` global variable.

Following the upgrade, the `Upgraded` event is emitted.


## Events

#### NewOwner

``` js
event NewOwner(address newOwner);
```

This event is emitted when the contract `owner` address is changed.

#### Upgraded

``` js
event Upgraded(address newImplementation);
```

This event is emitted when `finalizeUpgrade()` is called.