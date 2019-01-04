pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";


contract ERC20Mock is ERC20 {

  constructor() public { }

  function mockMint(address _address, uint256 _amount) public {
    _mint(_address, _amount);
  }

  function batchTransfer(address[] calldata _tokens, address _to, uint256[] calldata _amounts) external {
    for (uint256 i = 0; i < _amounts.length; i++){
      ERC20(_tokens[i]).transfer(_to, _amounts[i]);
    }
  }

}