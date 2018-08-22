pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";


contract ERC20Mock is StandardToken {

  constructor() public { }

  event Transfer(address token);

  function mockMint(address _address, uint256 _amount) public {
    balances[_address] = balances[_address].add(_amount);
  }

  function batchTransfer(address[] _tokens, address to, uint256[] _amounts) public {

    require(_tokens.length == _amounts.length);

    for (uint256 i = 0; i < _amounts.length; i++){
      require( StandardToken(_tokens[i]).transfer(to, _amounts[i]) );
      emit Transfer(_tokens[i]);
    }

  }

}