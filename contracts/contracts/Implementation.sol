pragma solidity ^0.4.25;

import './ImplementationResolver.sol';
import "./StateStorage.sol";

contract Implementation {

    StateStorage internal stateStorage;

    function newOrder(bytes32 sourceCurrencyKey, uint sourceAmount, bytes32 destinationCurrencyKey, uint minDestinationAmount, uint executionFee) public returns (uint orderID) {
        return 1;
    }

}