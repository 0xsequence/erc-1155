pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";


contract ERC721Mock is ERC721 {

  constructor() public { }

  function mockMint(address _address, uint256 _tokenID) public {
    _mint(_address, _tokenID);
  }

  function batchTransferFrom(address _from, address _to, uint256[] _tokenIDs) public {
    require(_from != address(0));
    require(_to != address(0));

    uint256 tokenID;

    for (uint256 i = 0; i < _tokenIDs.length; i++){
      tokenID = _tokenIDs[i];
      transferFrom(_from, _to, tokenID);
    }
  }

}