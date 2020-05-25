pragma solidity ^0.4.25;

interface ISynth {
    function transferFrom(address, address, uint) external returns (bool);
    function transfer(address, uint) external returns (bool);
}

interface ISynthetix {
    function synths(bytes32) external returns (address);
    function exchange(bytes32, uint, bytes32) external returns (uint);
}

contract Implementation {

    bool initialized;
    ISynthetix synthetix;
    uint withdrawalDelay;
    uint256 public latestID;
    mapping (uint256 => LimitOrder) public orders;

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

    function initialize(address synthetixAddress, uint _withdrawalDelay) public {
        require(initialized == false, "Already initialized");
        initialized = true;
        synthetix = ISynthetix(synthetixAddress);
        withdrawalDelay = _withdrawalDelay;
    }

    function newOrder(bytes32 sourceCurrencyKey, uint sourceAmount, bytes32 destinationCurrencyKey, uint minDestinationAmount, uint executionFee) payable public returns (uint) {
        require(msg.value > 0, "wei deposit must be larger than 0");
        require(msg.value > executionFee, "wei deposit must be larger than executionFee");
        ISynth sourceSynth = ISynth(synthetix.synths(sourceCurrencyKey));
        require(sourceSynth.transferFrom(msg.sender, address(this), sourceAmount), "User allowance insufficient for transferFrom");
        latestID++;
        orders[latestID] = LimitOrder(
            msg.sender,
            sourceCurrencyKey,
            sourceAmount,
            destinationCurrencyKey,
            minDestinationAmount,
            msg.value,
            executionFee,
            0,
            0,
            false
        );
        emit Order(latestID, msg.sender, sourceCurrencyKey, sourceAmount, destinationCurrencyKey, minDestinationAmount, executionFee, msg.value);
        return latestID;
    }

    function cancelOrder(uint orderID) public {
        require(orderID <= latestID, "Order does not exist");
        LimitOrder storage order = orders[orderID];
        require(order.submitter == msg.sender, "This order was not submitted my the sender or already cancelled");
        require(order.executed == false, "Order already executed");
        ISynth sourceSynth = ISynth(synthetix.synths(order.sourceCurrencyKey));
        require(sourceSynth.transfer(msg.sender, order.sourceAmount), "synth.transfer() failed");
        msg.sender.transfer(order.weiDeposit);
        delete orders[orderID];
        emit Cancel(orderID);
    }

    function executeOrder(uint orderID) public {
        uint gasUsed = gasleft();
        require(orderID <= latestID, "Order does not exist");
        LimitOrder storage order = orders[orderID];
        require(order.executed == false, "Order already executed");
        uint destinationAmount = synthetix.exchange(order.sourceCurrencyKey, order.sourceAmount, order.destinationCurrencyKey);
        require(destinationAmount >= order.minDestinationAmount, "target price not reached");
        order.executionTimestamp = block.timestamp;
        order.destinationAmount = destinationAmount;
        order.executed = true;
        emit Execute(orderID, msg.sender);
        gasUsed -= gasleft();
        uint refund = ((gasUsed + 35058) * tx.gasprice) + order.executionFee; // magic number generated using tests
        require(order.weiDeposit >= refund, "Insufficient weiDeposit");
        msg.sender.transfer(refund);
    }

    event Order(uint indexed orderID, address indexed submitter, bytes32 sourceCurrencyKey, uint sourceAmount, bytes32 destinationCurrencyKey, uint minDestinationAmount, uint executionFee, uint weiDeposit);
    event Cancel(uint indexed orderID);
    event Execute(uint indexed orderID, address executer);

}