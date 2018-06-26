pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract RegularToken { 
  using SafeMath for uint256;  

  //Copy constants from LFT contract
  uint256 constant public NUMBER_OF_CLASSES   = 2**13;    // Maximum number of object classes
  uint256 constant public CLASSES_BITS_SIZE   = 16;       // Max size of each object
  uint256 constant public CLASSES_PER_UINT256 = 256 / 16; // 256 / CLASSES_BITS_SIZE

  mapping (address => mapping(uint256 => uint256)) public balances; 
  mapping (address => bool) public starterDeckReceived;

  //Event 
  event Transfer(address from, address to, uint256 value);
  event BatchTransfer(address from, address to, uint256[] classes, uint256[] amounts);

  constructor(uint256 _initBalance) public {
    for (uint256 i = 0; i<32; i++) {
      balances[msg.sender][i] = _initBalance;
    }
  }

  function balanceOf(address _address, uint256 _class) public view returns (uint256) {
    return balances[_address][_class];
  }

  function mint(address _address, uint256 _class, uint256 _value) public {
    balances[_address][_class] += _value; 
  }

  function batchTransfer(address _to, uint256[] _classes, uint256[] _values) public {
    uint256 cnt = _values.length;
    uint256 amount;
    uint256 class;

    for (uint i = 0; i < cnt; i++) {
      amount = _values[i];
      class  = _classes[i];

      //Transfering
      balances[msg.sender][class] = balances[msg.sender][class].sub(amount);
      balances[_to][class] = balances[_to][class].add(amount);
    }

    emit BatchTransfer(msg.sender, _to, _classes, _values);
  }

 
    
}