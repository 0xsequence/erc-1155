pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "../token/ERC1155X.sol";


contract ERC1155XMock is ERC1155X {

  constructor() public { /** */ }
  
  function mockMint(address _to, uint256 _id, uint256 _value) public {
    _updateIDBalance(_to, _id, _value, Operations.Add);
  }

}
