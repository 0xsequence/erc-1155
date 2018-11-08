pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";


contract ERC20Mock is ERC20 {

  constructor() public { }

  function mockMint(address _address, uint256 _amount) public {
    _mint(_address, _amount);
  }

  function batchTransfer(address[] _tokens, address to, uint256[] _amounts) public {

    require(_tokens.length == _amounts.length);

    for (uint256 i = 0; i < _amounts.length; i++){
      require( ERC20(_tokens[i]).transfer(to, _amounts[i]) );
    }

  }

}