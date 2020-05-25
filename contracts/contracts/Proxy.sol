pragma solidity ^0.4.25;

import './ImplementationResolver.sol';

contract Proxy {

    // https://eips.ethereum.org/EIPS/eip-1967
    bytes32 private constant implementationResolverSlot = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

    constructor(address resolverAddress) public {
        bytes32 slot = implementationResolverSlot;
        assembly {
            sstore(slot, resolverAddress)
        }
    }

    function() external payable {
        bytes32 slot = implementationResolverSlot;
        address resolverAddress;
        assembly {
            resolverAddress := sload(slot)
        }
        ImplementationResolver resolver = ImplementationResolver(resolverAddress);
        address impl = resolver.getImplementation();
        assembly {
          let ptr := mload(0x40)
        
          // (1) copy incoming call data
          calldatacopy(ptr, 0, calldatasize)
        
          // (2) forward call to logic contract
          let result := delegatecall(gas, impl, ptr, calldatasize, 0, 0)
          let size := returndatasize
        
          // (3) retrieve return data
          returndatacopy(ptr, 0, size)

          // (4) forward return data back to caller
          switch result
          case 0 { revert(ptr, size) }
          default { return(ptr, size) }
        }
    }
}