pragma solidity ^0.5.16;

contract AddressResolver {

    address exchangerAddr;

    constructor (address exchanger) public {
        exchangerAddr = exchanger;
    }

    function getAddress(bytes32) public view returns (address) {
        return exchangerAddr;
    }

}