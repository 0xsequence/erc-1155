pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/AddressUtils.sol";
import "./ERCXXXXTokenReceiver.sol";


// TODO
// * Optimize bin, index quering - Maybe struct? smaller uint for bin and index?
// * Implement transferAndCall (or safeTransfer)
// * Optimize everything
// * Need to support ERC-165

interface ERCXXXX {
  event Transfer(address from, address to, uint256 tokenType, uint256 amount);
  event BatchTransfer(address from, address to, uint256[] tokenTypes, uint256[] amounts);
  event ApprovalForAll(address tokensHolder, address operator, bool status);

  function transferFrom(address _from, address _to, uint256 _type, uint256 _amount) external;
  function batchTransferFrom(address _from, address _to, uint256[] _types, uint256[] _amounts) external;
  function safeTransferFrom(address _from, address _to, uint256 _type, uint256 _amount, bytes _data) external;
  function balanceOf(address _address, uint256 _type) external view returns (uint256);

  function setApprovalForAll(address _operator, address _tokenHolder) external;
  function isApprovedForAll(address _owner, address _operator) external view returns (bool isOperator);
}


contract MultiFungibleToken { 
  using SafeMath     for uint256;
  using AddressUtils for address;

  /** 
  * TO DO
  *  - Optimize bin, index quering - Maybe struct? smaller uint for bin and index?
  *  - Implement transferAndCall (or safeTransfer)
  *  - Optimize everything 
  *  - Need to support ERC-165
  */

  //
  // Storage and Events
  //

  // Constants
  uint8   constant public decimals            = 0;                   // Number of decimals                               
  bytes4  constant public ERCXXXX_RECEIVE_SIG = 0xeb510be8;          // onERCXXXXReceive function signature, obtained via : 
                                                                     //   bytes4(keccak256("onERCXXXXReceived(address,address,uint256,uint256,bytes)"));

  uint256 constant public NUMBER_OF_TYPES   = 2**32;                 // Maximum number of object types (higher is bigger deployment cost)
  uint256 constant public TYPES_BITS_SIZE   = 16;                    // Max size of each object
  uint256 constant public TYPES_PER_UINT256 = 256 / TYPES_BITS_SIZE; // Number of types per uint256

  // Deployment cost
  // 2**16 : 3,488,299
  // 2**64 : 3,507,993

  // Operations for _updateTypeBalance
  enum Operations { Add, Sub, Replace }

  // Objects total supply
  mapping(uint256 => uint256) public totalSupply;

  // Objects balances ; balances[address][type] => balance (using array instead of mapping for efficiency)
  mapping (address => uint256[NUMBER_OF_TYPES / TYPES_PER_UINT256]) balances;

  // Operators
  mapping (address => mapping(address => bool)) operators;

  // Events
  event Transfer(address from, address to, uint256 tokenType, uint256 amount);
  event BatchTransfer(address from, address to, uint256[] tokenTypes, uint256[] amounts);
  event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);



  //
  // Transfer Functions
  //

  /**
   * @dev Allow _from or an operator to transfer tokens from one address to another
   * @param _from address The address which you want to send tokens from
   * @param _to address The address which you want to transfer to
   * @param _type type to update balance of
   * @param _amount uint256 the amount of tokens to be transferred
   */
  function transferFrom(address _from, address _to, uint256 _type, uint256 _amount) external {

    // Requirements
    require( (msg.sender == _from) || operators[_from][msg.sender], 'msg.sender is neither _from nor operator');
    require(_to != address(0),                                      'Invalid recipient');
    // require(_amount <= balances);  Not necessary since checked with .sub16 method

    // Update balances
    _updateTypeBalance(_from, _type, _amount, Operations.Sub); // Subtract value from sender
    _updateTypeBalance(_to,   _type, _amount, Operations.Add); // Add value to recipient

    // Emit transfer Event
    emit Transfer(_from, _to, _type, _amount);
  }

  /**
   * @dev Allow _from or an operator to transfer tokens from one address to another
   * @param _from Address The address which you want to send tokens from
   * @param _to Address The address which you want to transfer to
   * @param _type type to update balance of 
   * @param _amount The amount of tokens of provided type to be transferred
   */
  function safeTransferFrom(address _from, address _to, uint256 _type, uint256 _amount, bytes _data) external {

    // Requirements
    require( (msg.sender == _from) || operators[_from][msg.sender], 'msg.sender is neither _from nor operator');
    require(_to != address(0),                                      'Invalid recipient');
    // require(_amount <= balances);  Not necessary since checked with writeValueInBin() checks
    
    // Update balances
    _updateTypeBalance(_from, _type, _amount, Operations.Sub); // Subtract value from sender
    _updateTypeBalance(_to,   _type, _amount, Operations.Add); // Add value to recipient
  
    // Pass data if recipient is contract
    if (_to.isContract()) {
      bytes4 retval =  ERCXXXXTokenReceiver(_to).onERCXXXXReceived(msg.sender, _from, _type, _amount, _data);
      require(retval == ERCXXXX_RECEIVE_SIG);
    }

    // Emit transfer Event
    emit Transfer(_from, _to, _type, _amount);
  }

 /**
  * @dev transfer objects from different types to specified address
  * @param _from The address to BatchTransfer objects from.
  * @param _to The address to batchTransfer objects to.
  * @param _types Array of types to update balance of
  * @param _amounts Array of amount of object per type to be transferred.
  * Note:  Arrays should be sorted so that all types in a same bin are adjacent (more efficient).
  */
  function batchTransferFrom(address _from, address _to, uint256[] _types, uint256[] _amounts) external {

    // Requirements
    require( (msg.sender == _from) || operators[_from][msg.sender], 'msg.sender is neither sender or operator');
    require(_types.length == _amounts.length,                       'Inconsistent array length between args');
    require(_to != address(0),                                      'Invalid recipient');

    // Load first bin and index where the object balance exists
    (uint256 bin, uint256 index) = getTypeBinIndex(_types[0]);

    // Balance for current bin in memory (initialized with first transfer)
    uint256 balFrom = _viewUpdateTypeBalance(balances[_from][bin], index, _amounts[0], Operations.Sub);
    uint256 balTo   = _viewUpdateTypeBalance(balances[_to][bin],   index, _amounts[0], Operations.Add);

    // Number of transfer to execute1
    uint256 nTransfer = _types.length;

    // Last bin updated
    uint256 lastBin = bin;

    for (uint256 i = 1; i < nTransfer; i++) {
      (bin, index) = getTypeBinIndex(_types[i]);

      // If new bin
      if (bin != lastBin) {
        // Update storage balance of previous bin
        balances[_from][lastBin] = balFrom;
        balances[_to][lastBin] = balTo;

        // Load current bin balance in memory
        balFrom = balances[_from][bin];
        balTo = balances[_to][bin];

        // Bin will be the most recent bin
        lastBin = bin;
      }

      // Update memory balance
      // require(_amounts[i] <= 2**16-1);  Not required since checked in SafeMathUint16
      // require(_amounts[i] <= balFrom);  Not required since checked with .sub16 method
      balFrom = _viewUpdateTypeBalance(balFrom, index, _amounts[i], Operations.Sub);
      balTo   = _viewUpdateTypeBalance(balTo,   index, _amounts[i], Operations.Add);
    }

    // Update storage of the last bin visited
    balances[_from][bin] = balFrom;
    balances[_to][bin]   = balTo;

    // Emit batchTransfer event
    emit BatchTransfer(_from, _to, _types, _amounts);
  }



  //
  // Operator Functions
  //

  /**
  * @dev Will set _operator operator status to true or false
  * @param _operator Address to changes operator status.
  * @param _approved  _operator's new operator status (true or false)
  */
  function setApprovalForAll(address _operator, bool _approved) external {
    // Update operator status
    operators[msg.sender][_operator] = _approved;
    emit ApprovalForAll(msg.sender, _operator, _approved);
  }

  /**
  * @dev Function that verifies whether _operator is an authorized operator of _tokenHolder.
  * @param _operator The address of the operator to query status of
  * @param _owner Address of the tokenHolder
  * @return A uint256 specifying the amount of tokens still available for the spender.
  */
  function isApprovedForAll(address _owner, address _operator) external view returns (bool isOperator) {
    return operators[_owner][_operator];
  }



  //
  // Objects and Types Functions
  //

  /**
  * @dev update the balance of a type for a given address
  * @param _address Address to update type balance
  * @param _type type to update balance of
  * @param _amount Value to update the type balance
  * @param _operation Which operation to conduct :
  *     Operations.Replace : Replace type balance with _amount
  *     Operations.Add     : Add _amount to type balance
  *     Operations.Sub     : Substract _amount from type balance
  */
  function _updateTypeBalance(
    address _address,
    uint256 _type,
    uint256 _amount,
    Operations _operation) internal
  {
    uint256 bin;
    uint256 index;

    // Get bin and index of _type
    (bin, index) = getTypeBinIndex(_type);

    // Update balance
    balances[_address][bin] = _viewUpdateTypeBalance( balances[_address][bin], index,
                                                       _amount, _operation );
  }

  /**
  * @dev update the balance of a type provided in _binBalances
  * @param _binBalances Uint256 containing the balances of objects
  * @param _index Index of the object in the provided bin
  * @param _amount Value to update the type balance
  * @param _operation Which operation to conduct :
  *     Operations.Replace : Replace type balance with _amount
  *     Operations.Add     : Add _amount to type balance
  *     Operations.Sub     : Substract _amount from type balance
  */
  function _viewUpdateTypeBalance(
    uint256 _binBalances,
    uint256 _index,
    uint256 _amount,
    Operations _operation) internal pure returns (uint256 newBinBalance)
  {
    if (_operation == Operations.Add) {

        uint256 objectBalance = getValueInBin(_binBalances, _index);
        newBinBalance = writeValueInBin(_binBalances, _index, objectBalance.add(_amount));

    } else if (_operation == Operations.Sub) {

        objectBalance = getValueInBin(_binBalances, _index);
        newBinBalance = writeValueInBin(_binBalances, _index, objectBalance.sub(_amount));

    } else if (_operation == Operations.Replace){

        newBinBalance = writeValueInBin(_binBalances, _index, _amount);

    } else {
      revert('Invalid operation'); // Bad operation
    }

    return newBinBalance;
  }

  /**
  * @dev return the _type type' balance of _address
  * @param _address Address to query balance of
  * @param _type type to query balance of
  * @return Amount of objects of a given type ID
  */
  function balanceOf(address _address, uint256 _type) external view returns (uint256) {
    uint256 bin;
    uint256 index;

    //Get bin and index of _IF
    (bin, index) = getTypeBinIndex(_type);
    return getValueInBin(balances[_address][bin], index);
  }

  /**
  * @dev Return the bin number and index within that bin where ID is
  * @param _type Object type
  * @return (Bin number, ID's index within that bin)
  */
  function getTypeBinIndex(uint256 _type) public pure returns (uint256 bin, uint256 index) {
     bin   = _type * TYPES_BITS_SIZE / 256;
     index = _type % TYPES_PER_UINT256;
     return (bin, index);
  }

  /*
  * @dev return value in _binValue at position _index
  * @param _binValue uint256 containing the balances of TYPES_PER_UINT256 types
  * @param _index index at which to retrieve value
  * @return Value at given _index in _bin
  */
  function getValueInBin(uint256 _binValue, uint256 _index) public pure returns (uint256) {

    // Mask to retrieve data for a given binData
    uint256 mask = (uint256(1) << TYPES_BITS_SIZE) - 1;

    // Shift amount
    uint256 rightShift = 256 - TYPES_BITS_SIZE*(_index + 1);
    return (_binValue >> rightShift) & mask;
  }

  /**
  * @dev return the updated _binValue after writing _amount at _index
  * @param _binValue uint256 containing the balances of TYPES_PER_UINT256 types
  * @param _index Index at which to retrieve value
  * @param _amount Value to store at _index in _bin
  * @return Value at given _index in _bin
  */
  function writeValueInBin(uint256 _binValue, uint256 _index, uint256 _amount) public pure returns (uint256) {
    require(_amount >= 0, 'Amount to write in bin needs to be positive'); // Probably can remove ???
    require(_amount < 2**TYPES_BITS_SIZE, 'Amount to write in bin is too large');

    // Mask to retrieve data for a given binData
    uint256 mask = (uint256(1) << TYPES_BITS_SIZE) - 1;

    // Shift amount
    uint256 leftShift = 256 - TYPES_BITS_SIZE*(_index + 1);
    return (_binValue & ~(mask << leftShift) ) | (_amount << leftShift);
  }

}
