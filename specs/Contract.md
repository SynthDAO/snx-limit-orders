# SynthLimitOrder Contract Spec
*NOTES*:
 - The following specifications use syntax from Solidity `0.6.4` (or above)
 - In order for this contract to be able to access your SNX tokens, you must approve this contract for each token individually using the ERC20 `approve()` function. We recommend a max uint (`2^256 - 1`) approval amount.

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

### Orders Mapping

A mapping from an orderID to a LimitOrder struct. The orderID is globally sequential and is iterated using a global private variable.

```js
mapping (uint256 => LimitOrder) public orders;
```
## Methods

### newOrder

``` js
function newOrder(bytes32 sourceCurrencyKey, uint sourceAmount, bytes32 destinationCurrencyKey, uint minDestinationAmount, uint executionFee) public returns (uint orderID);
```

This function allows a `msg.sender` who has already given this contract an allowance of `sourceCurrencyKey` to submit a new limit order.

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

### executeOrder

``` js
function executeOrder(uint orderID) public;
```

This function can be called by anyone using any valid orderID as long as the conditions are met.
It attempts to execute the user's order on the Synthetix exchange.

If the output destination amount is larger than or equal to the order's `minDestinationAmount`:

1. The output amount is forwarded to the order submitter's address. 
2. This transaction's submitter address is refunded for this transaction's gas cost + the `executionFee` amount from the user's wei deposit.
3. The remainder of the wei deposit is forwarded to the order submitter's address
4. `Execute` event is emitted with the `orderID` for node operators 

If the output destination amount is smaller than the order's `minDestinationAmount`, the transaction reverts.

### getAllExecutableOrders

``` js
function getAllExecutableOrders() public view returns (uint256[] orderIDs);
```

This view function iterates over each `orderID` in the `orders` mapping and returns the IDs of all orders that are currently executable. An order is executable if its `minDestinationAmount` is larger than or equal to the amount swapable under the latest price published by the Synthetix oracle.

This utlity function is meant to be called by a Limit Order Execution Node on each new Ethereum block in order to collect new limit orders that can be immediately executed on this contract via the `executeOrder` function.

## Events

### Order

``` js
event Order(uint indexed orderID, address indexed submitter, bytes32 sourceCurrencyKey, uint sourceAmount, bytes32 destinationCurrencyKey, uint minDestinationAmount uint executionFee, uint weiDeposit)
```

This event is emitted on each new submitted order. It's primary purpose is to alert node operators of newly submitted orders in realtime.

### Cancel

``` js
event Cancel(uint indexed orderID)
```

This event is emitted on each cancelled order. It's primary purpose is to alert node operators that a previously submitted order should no longer be watched.

### Execute

``` js
event Execute(uint indexed orderID, address executor)
```

This event is emitted on each successfully executed order. It's primary purpose is to alert node operators that a previously submitted order should no longer be watched.
