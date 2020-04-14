# SynthLimitOrder Contract Spec
*NOTES*:
 - The following specifications use syntax from Solidity `0.6.4` (or above)
 - In order for this contract to be able to access user SNX tokens, they must approve this contract for each token individually using the ERC20 approve() function. We recommend a max uint (2^256 - 1) approval amount.
 - In order for limit orders to execute successfully, users must approve this contract to exchange on their behalf using Synthetix `DelegateApprovals.approveExchangeOnBehalf()`

## Constructor

The constructor sets the `initialOwner` to the `owner` global variable. It also sets the `synthetixAddressResolver` to an internal global variable to be accessed by the `executeOrder` function.

```js
constructor(address initialOwner, address synthetixAddressResolver) public;
```

## Structs

### LimitOrder

```js
struct LimitOrder {
    address submitter;
    uint256 orderID;
    bytes32 sourceCurrencyKey;
    uint256 sourceAmount;
    bytes32 destinationCurrencyKey;
    uint256 minDestinationAmount;
    uint256 weiDeposit;
    uint256 executionFee;
}
```

## Public Variables

### orders

A mapping from an orderID to a LimitOrder struct. The orderID is globally sequential and is iterated using a global private variable.

```js
mapping (uint256 => LimitOrder) public orders;
```

### paused

A boolean variable that indicates whether submitting and executing orders is currently paused by the `owner` address. Its value is set to `false` by default.

```js
bool public paused;
```

### owner

An address variable that stores the contract owner address responsible for pausing or unpausing orders.

```js
address public owner;
```

## Methods

### newOrder

``` js
function newOrder(bytes32 sourceCurrencyKey, uint sourceAmount, bytes32 destinationCurrencyKey, uint minDestinationAmount, uint executionFee) public returns (uint orderID);
```

This function allows a `msg.sender` who has already given this contract an allowance of `sourceCurrencyKey` to submit a new limit order. This function reverts if `paused` is true.

1. Transfers `sourceAmount` of the `sourceCurrencyKey` Synth from the `msg.sender` to this contract via `transferFrom`.
2. Adds a new limit order to the `orders` mapping that can only execute on Synthtix exchange if the returned destination amount is more than or equal to `minDestinationAmount`.
3. Requires a deposited `msg.value` to be more than the `executionFee` in order to refund node operators for their exact gas wei cost in addition to the `executionFee` amount. The remainder is transferred back to the user at the end of the trade.
4. Emits an `Order` event for node operators including order data and `orderID`.
5. Returns (globally sequential) `orderID`

### cancelOrder

``` js
function cancelOrder(uint orderID) public;
```

This function cancels a previously submitted and unexecuted order by the same `msg.sender` of the input `orderID`.

1. Deletes the order from the `orders` mapping
2. Refunds the order's `sourceAmount` and deposited `msg.value`
3. Emits a `Cancel` event for node operators including the `orderID`

Please note that unlike other functions, the `cancelOrder` function does **NOT** revert if `paused` is true (or false).

### executeOrder

``` js
function executeOrder(uint orderID) public;
```

This function can be called by anyone using any valid orderID as long as the conditions are met. It fetches the current `Synthetix` and `ExchangeRates` contract addresses via the Synthetix `AddressResolver` contract address stored internally. Then it attempts to execute the user's order using `Synthetix.exchangeOnBehalf()`. This function reverts if `paused` is true.

If the amount received is larger than or equal to the order's `minDestinationAmount`:

1. The amount received is forwarded to the order submitter's address. 
2. This transaction's submitter address is refunded for this transaction's gas cost + the `executionFee` amount from the user's wei deposit.
3. The remainder of the wei deposit is forwarded to the order submitter's address
4. `Execute` event is emitted with the `orderID` for node operators 

If the amount received is smaller than the order's `minDestinationAmount`, the transaction reverts.

### getAllExecutableOrders

``` js
function getAllExecutableOrders() public view returns (uint256[] orderIDs);
```

This view function iterates over each `orderID` in the `orders` mapping and returns the IDs of all orders that are currently executable. An order is executable if its `minDestinationAmount` is larger than or equal to the amount receivable under the latest price published by the Synthetix oracle.

This utlity function is meant to be called by a Limit Order Execution Node on each new Ethereum block in order to collect new limit orders that can be immediately executed on this contract via the `executeOrder` function.

### pause

This function allows only the `owner` address to pause or unpause submitting and executing orders on this contract. It sets the `paused` global variable to the `value` argument value and emits a `Pause` event if true or an `Unpause` event if false.

``` js
function pause(bool value) public;
```

### changeOwnership

This function allows only the current `owner` address to change the contract owner to a new address. It sets the `owner` global variable to the `newOwner` argument value and emits a `NewOwner` event.

``` js
function changeOwnership(address newOwner) public;
```

## Events

### Order

``` js
event Order(uint indexed orderID, address indexed submitter, bytes32 sourceCurrencyKey, uint sourceAmount, bytes32 destinationCurrencyKey, uint minDestinationAmount uint executionFee, uint weiDeposit)
```

This event is emitted on each new submitted order. Its primary purpose is to alert node operators of newly submitted orders in realtime.

### Cancel

``` js
event Cancel(uint indexed orderID)
```

This event is emitted on each cancelled order. Its primary purpose is to alert node operators that a previously submitted order should no longer be watched.

### Execute

``` js
event Execute(uint indexed orderID, address executor)
```

This event is emitted on each successfully executed order. Its primary purpose is to alert node operators that a previously submitted order should no longer be watched.

### Pause

``` js
event Pause()
```

This event is emitted when the contract is paused by the owner. Its primary purpose is to alert users and node operators that all limits orders are no longer active and that new limit orders can no longer be submitted.

### Unpause

``` js
event Unpause()
```

This event is emitted when the contract is unpaused by the owner. Its primary purpose is to alert users and node operators that all limits orders are now active and that new limit orders can be submitted.

### NewOwner

``` js
event NewOwner(address newOwner)
```

This event is emitted when the contract `owner` address is changed.