pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract ERC1155MockNoBalancePacking { 
  using SafeMath for uint256;  

  //Copy constants from LFT contract
  uint256 constant public CLASSES_BITS_SIZE   = 16;       // Max size of each object
  uint256 constant public CLASSES_PER_UINT256 = 256 / 16; // 256 / CLASSES_BITS_SIZE

  // Balances
  mapping (address => mapping(uint256 => uint256)) balances; 

  // Operators
  mapping (address => mapping(address => bool)) operators;

  //Event 
  event Transfer(address from, address to, uint256 value);
  event BatchTransfer(address from, address to, uint256[] classes, uint256[] amounts);

  constructor() public { }

  function balanceOf(address _address, uint256 _class) public view returns (uint256) {
    return balances[_address][_class];
  }

  function mockMint(address _address, uint256 _class, uint256 _value) public {
    balances[_address][_class] += _value; 
  }

  function batchTransferFrom(address _from, address _to, uint256[] _classes, uint256[] _values) public {
    require( (msg.sender == _from) || operators[_from][msg.sender], 'msg.sender is neither _from nor operator');
    require(_to != address(0),                                      'Invalid recipient');

    uint256 cnt = _values.length;
    uint256 amount;
    uint256 class;

    for (uint i = 0; i < cnt; i++) {
      amount = _values[i];
      class  = _classes[i];

      //Transfering
      balances[_from][class] = balances[_from][class].sub(amount);
      balances[_to][class] = balances[_to][class].add(amount);
    }

    emit BatchTransfer(_from, _to, _classes, _values);
  }

 
    
}