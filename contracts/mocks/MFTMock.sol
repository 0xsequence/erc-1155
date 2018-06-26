pragma solidity ^0.4.24;

import '../token/MFT.sol';

contract MFTMock is MultiFungibleToken {

  uint256 initBalance = 0x1000100010001000100010001000100010001000100010001000100010001 * 256;
  // uint256 initBalance = 0x1010101010101010101010101010101010101010101010101010101010101 * 128;

  constructor() public {

  }

  function mint(address _address, uint256 _type, uint256 _value) public {
    _updateTypeBalance(_address, _type, _value, Operations.Add);
  }

}