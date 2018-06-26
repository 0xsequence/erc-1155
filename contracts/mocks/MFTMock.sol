pragma solidity ^0.4.24;

import '../token/MFT.sol';

contract MFTMock is MultiFungibleToken {

  uint256 initBalance = 0x1000100010001000100010001000100010001000100010001000100010001 * 256;
  // uint256 initBalance = 0x1010101010101010101010101010101010101010101010101010101010101 * 128;

  constructor() public {
    balances[msg.sender][0] = initBalance;
    for (uint256 i = 0; i < 16; i++) {
      totalSupply[i] = 256;
    }
  }

  function mint(address _address, uint256 _class, uint256 _value) public {
    _updateClassBalance(_address, _class, _value, Operations.Add);
  }

}