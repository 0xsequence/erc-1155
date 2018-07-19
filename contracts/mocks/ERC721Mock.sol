pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721BasicToken.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";


contract ERC721Mock is ERC721BasicToken{

  constructor() public { }

  event BatchTransfer(address from, address to, uint256[] tokenIDs);

  function mockMint(address _address, uint256 _tokenID) public {
    _mint(_address, _tokenID);
  }

  function batchTransferFrom(address _from, address _to, uint256[] _tokenIDs) public {
    require(_from != address(0));
    require(_to != address(0));

    uint256 tokenID;

    for (uint256 i = 0; i < _tokenIDs.length; i++){
      tokenID = _tokenIDs[i];

      clearApproval(_from, tokenID);
      removeTokenFrom(_from, tokenID);
      addTokenTo(_to, tokenID);
    }

    emit BatchTransfer(_from, _to, _tokenIDs);
  }

}