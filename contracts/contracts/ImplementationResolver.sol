pragma solidity ^0.4.25;

contract ImplementationResolver {

    address public owner;
    address public implementation;

    modifier onlyOwner {
        require(msg.sender == owner, 'Only owner is allowed to send this transaction');
        _;
    }

    constructor(address initialImplementation, address initialOwner) public {
        owner = initialOwner;
        implementation = initialImplementation;
    }

    function getImplementation() view public returns (address) {
        return implementation;
    }

    function changeOwnership(address newOwner) onlyOwner public {
        owner = newOwner;
        emit NewOwner(newOwner);
    }

    function upgrade(address newImplementation) onlyOwner public {
        implementation = newImplementation;
        emit Upgraded(newImplementation);
    }

    event NewOwner(address newOwner);
    event Upgraded(address newImplementation);

}
