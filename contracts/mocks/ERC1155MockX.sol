pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import '../token/ERC1155X.sol';

contract ERC1155XMock is ERC1155X {

  function mockMint(address _address, uint256 _type, uint256 _value) public {
    _updateIDBalance(_address, _type, _value, Operations.Add);
  }

}
