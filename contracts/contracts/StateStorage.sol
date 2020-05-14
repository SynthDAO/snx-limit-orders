pragma solidity ^0.4.25;

contract StateStorage {

    address proxy;
    address public synthetix;
    address public exchangeRates;
    uint256 public latestID;
    mapping (uint256 => LimitOrder) orders;

    modifier onlyProxy {
        require(msg.sender == proxy, "Only the proxy contract is allowed to send this transaction");
        _;
    }

    struct LimitOrder {
        address submitter;
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

    constructor(address proxyContract, address synthetixContract, address exchangeRatesContract) public {
        proxy = proxyContract;
        synthetix = synthetixContract;
        exchangeRates = exchangeRatesContract;
    }

    function createOrder(address submitter, bytes32 sourceCurrencyKey, uint sourceAmount, bytes32 destinationCurrencyKey, uint minDestinationAmount, uint weiDeposit, uint executionFee, bool executed) onlyProxy public returns (uint orderID) {
        latestID++;
        orders[latestID] = LimitOrder(
            submitter,
            sourceCurrencyKey,
            sourceAmount,
            destinationCurrencyKey,
            minDestinationAmount,
            weiDeposit,
            executionFee,
            0,
            0,
            executed
        );
        return latestID;
    }

    function getOrder(uint256 orderID) view public returns (address submitter, bytes32 sourceCurrencyKey, uint sourceAmount, bytes32 destinationCurrencyKey, uint minDestinationAmount, uint weiDeposit, uint executionFee, uint executionTimestamp, uint destinationAmount, bool executed) {
        LimitOrder order = orders[orderID];
        return (
            order.submitter,
            order.sourceCurrencyKey,
            order.sourceAmount,
            order.destinationCurrencyKey,
            order.minDestinationAmount,
            order.weiDeposit,
            order.executionFee,
            order.executionTimestamp,
            order.destinationAmount,
            order.executed
        );
    }

}