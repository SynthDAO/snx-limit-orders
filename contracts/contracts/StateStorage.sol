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

    constructor(address synthetixContract, address exchangeRatesContract) public {
        synthetix = synthetixContract;
        exchangeRates = exchangeRatesContract;
    }

    function setProxy(address proxyContract) public {
        require(proxy == address(0), "Proxy contract already set");
        proxy = proxyContract;
    }

    function createOrder(address submitter, bytes32 sourceCurrencyKey, uint sourceAmount, bytes32 destinationCurrencyKey, uint minDestinationAmount, uint weiDeposit, uint executionFee, uint256 executionTimestamp, uint256 destinationAmount, bool executed) onlyProxy public returns (uint orderID) {
        latestID++;
        orders[latestID] = LimitOrder(
            submitter,
            sourceCurrencyKey,
            sourceAmount,
            destinationCurrencyKey,
            minDestinationAmount,
            weiDeposit,
            executionFee,
            executionTimestamp,
            destinationAmount,
            executed
        );
        return latestID;
    }

    function setOrder(uint orderId, address submitter, bytes32 sourceCurrencyKey, uint sourceAmount, bytes32 destinationCurrencyKey, uint minDestinationAmount, uint weiDeposit, uint executionFee, uint executionTimestamp, uint destinationAmount, bool executed) onlyProxy public {
        require(orderId <= latestID, "This order does not exist");
        orders[latestID] = LimitOrder(
            submitter,
            sourceCurrencyKey,
            sourceAmount,
            destinationCurrencyKey,
            minDestinationAmount,
            weiDeposit,
            executionFee,
            executionTimestamp,
            destinationAmount,
            executed
        );
    }

    function getOrder(uint256 orderID) view public returns (address submitter, bytes32 sourceCurrencyKey, uint sourceAmount, bytes32 destinationCurrencyKey, uint minDestinationAmount, uint weiDeposit, uint executionFee, uint executionTimestamp, uint destinationAmount, bool executed) {
        LimitOrder memory order = orders[orderID];
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

    function deleteOrder(uint256 orderId) onlyProxy public {
        require(orderId <= latestID, "This order does not exist");
        delete orders[orderId];
    }

}