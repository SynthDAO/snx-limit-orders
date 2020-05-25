pragma solidity ^0.4.25;

import "./StateStorage.sol";

interface ISynth {
    function transferFrom(address, address, uint) public returns (bool);
    function transfer(address, uint) public returns (bool);
}

interface ISynthetix {
    function synths(bytes32) public returns (address);
    function exchange(bytes32, uint, bytes32) external returns (uint);
}

contract Implementation {

    StateStorage internal stateStorage;

    function newOrder(bytes32 sourceCurrencyKey, uint sourceAmount, bytes32 destinationCurrencyKey, uint minDestinationAmount, uint executionFee) payable public returns (uint orderID) {
        require(msg.value > 0, "wei deposit must be larger than 0");
        require(msg.value > executionFee, "wei deposit must be larger than executionFee");
        ISynthetix synthetix = ISynthetix(stateStorage.synthetix());
        ISynth sourceSynth = ISynth(synthetix.synths(sourceCurrencyKey));
        require(sourceSynth.transferFrom(msg.sender, address(this), sourceAmount), "User allowance insufficient for transferFrom");
        orderID = stateStorage.createOrder(msg.sender, sourceCurrencyKey, sourceAmount, destinationCurrencyKey, minDestinationAmount, msg.value, executionFee, 0, 0, false);
        emit Order(orderID, msg.sender, sourceCurrencyKey, sourceAmount, destinationCurrencyKey, minDestinationAmount, executionFee, msg.value);
    }

    function cancelOrder(uint orderID) public {
        require(orderID <= stateStorage.latestID(), "Order does not exist");
        (address submitter, bytes32 sourceCurrencyKey, uint sourceAmount, , , uint weiDeposit, , , , bool executed) = stateStorage.getOrder(orderID);
        require(submitter == msg.sender, "This order was not submitted my the sender or already cancelled");
        require(executed == false, "Order already executed");
        ISynthetix synthetix = ISynthetix(stateStorage.synthetix());
        ISynth sourceSynth = ISynth(synthetix.synths(sourceCurrencyKey));
        require(sourceSynth.transfer(msg.sender, sourceAmount), "synth.transfer() failed");
        msg.sender.transfer(weiDeposit);
        stateStorage.deleteOrder(orderID);
        emit Cancel(orderID);
    }

    function executeOrder(uint orderID) public {
        uint gasUsed = gasleft();
        require(orderID <= stateStorage.latestID(), "Order does not exist");
        (address submitter, bytes32 sourceCurrencyKey, uint sourceAmount, bytes32 destinationCurrencyKey, uint minDestinationAmount, uint weiDeposit, uint executionFee, , , bool executed) = stateStorage.getOrder(orderID);
        require(executed == false, "Order already executed");
        ISynthetix synthetix = ISynthetix(stateStorage.synthetix());
        uint destinationAmount = synthetix.exchange(sourceCurrencyKey, sourceAmount, destinationCurrencyKey);
        require(destinationAmount >= minDestinationAmount, "target price not reached");
        stateStorage.setOrder(orderID, submitter, sourceCurrencyKey, sourceAmount, destinationCurrencyKey, minDestinationAmount, weiDeposit, executionFee, block.timestamp, destinationAmount, true);
        emit Execute(orderID, msg.sender);
        gasUsed -= gasleft();
        uint refund = ((gasUsed + 33459) * tx.gasprice) + executionFee; // magic number generated using tests
        require(weiDeposit >= refund, "Insufficient weiDeposit");
        msg.sender.transfer(refund);
    }

    event Order(uint indexed orderID, address indexed submitter, bytes32 sourceCurrencyKey, uint sourceAmount, bytes32 destinationCurrencyKey, uint minDestinationAmount, uint executionFee, uint weiDeposit);
    event Cancel(uint indexed orderID);
    event Execute(uint indexed orderID, address executer);

}