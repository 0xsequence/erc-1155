pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "openzeppelin-eth/contracts/ownership/Ownable.sol";
import "../token/ERC1155X.sol";


contract ERC1155XMock is ERC1155X {

  constructor() public {
    Ownable.initialize(msg.sender);
  }

  function mockMint(address _address, uint256 _type, uint256 _value) public {
    _updateIDBalance(_address, _type, _value, Operations.Add);
  }

}
