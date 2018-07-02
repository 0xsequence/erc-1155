pragma solidity ^0.4.24;

import '../token/MFT.sol';

contract MFTMock is MFT {

  constructor() public { }

  function mockMint(address _address, uint256 _type, uint256 _value) public {
    _updateTypeBalance(_address, _type, _value, Operations.Add);
  }

}