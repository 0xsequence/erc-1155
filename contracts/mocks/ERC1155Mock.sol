pragma solidity ^0.4.24;

import '../token/ERC1155.sol';

contract ERC1155Mock is ERC1155 {

  constructor() public { }

  function mockMint(address _address, uint256 _type, uint256 _value) public {
    _updateIDBalance(_address, _type, _value, Operations.Add);
  }

}