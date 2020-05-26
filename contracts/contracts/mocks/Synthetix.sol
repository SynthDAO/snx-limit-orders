pragma solidity ^0.4.25;

import "./Synth.sol";

contract Synthetix {

    mapping(bytes32 => Synth) public synths;

    constructor (address testSynth) public {
        synths[0x0000000000000000000000000000000000000000000000000000000000000000] = Synth(testSynth);
        synths[0x0000000000000000000000000000000000000000000000000000000000000001] = Synth(testSynth);
    }

    function exchange(bytes32, uint, bytes32) external returns (uint) {
        return 2;
    }

}