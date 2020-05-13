pragma solidity ^0.4.25;

import './ImplementationResolver.sol';

contract Proxy {

    ImplementationResolver internal resolver;

    constructor(address resolverAddress) public {
        resolver = ImplementationResolver(resolverAddress);
    }

    function() external payable {
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