pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "../../utils/SafeMath.sol";
import "../../interfaces/IERC1155TokenReceiver.sol";
import "../../interfaces/IERC165.sol";
import "../../utils/Address.sol";


/**
 * @dev Implementation of Multi-Token Standard contract. This implementation of the MTS standard exploit the fact that
 *      balances of different token ids can be concatenated within individual uint256 storage slots.
 *      This allows the contract to batch transfer tokens more efficiently at the cost of limiting the 
 *      maximum token balance each address can hold. This limit is 2^IDS_BITS_SIZE, which can be 
 *      adjusted below. In practice, using IDS_BITS_SIZE smaller than 16 did not lead to major 
 *      efficiency gains. This token contract tries to adhere to ERC-1055 standard, but currently
 *      diverges from it as the standard is currently being constructed.
 */
contract ERC1155PackedBalance is IERC165 { 
  using SafeMath for uint256;
  using Address for address;


  /***********************************|
  |        Variables and Events       |
  |__________________________________*/

  // onReceive function signatures                              
  bytes4 constant internal ERC1155_RECEIVED_VALUE = 0xf23a6e61;
  bytes4 constant internal ERC1155_BATCH_RECEIVED_VALUE = 0xbc197c81;

  // Constants regarding bin or chunk sizes for balance packing
  uint256 internal constant IDS_BITS_SIZE   = 16;                  // Max size of each token ID
  uint256 internal constant IDS_PER_UINT256 = 256 / IDS_BITS_SIZE; // Number of ids per uint256

  // Operations for _updateIDBalance
  enum Operations { Add, Sub }

  // Token IDs balances ; balances[address][id] => balance (using array instead of mapping for efficiency)
  mapping (address => mapping(uint256 => uint256)) balances;

  // Operators
  mapping (address => mapping(address => bool)) operators;

  // Events
  event TransferSingle(address indexed _operator, address indexed _from, address indexed _to, uint256 _id, uint256 _amount);
  event TransferBatch(address indexed _operator, address indexed _from, address indexed _to, uint256[] _ids, uint256[] _amounts);
  event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);
  event URI(string _uri, uint256 indexed _id);

  /***********************************|
  |     Public Transfer Functions     |
  |__________________________________*/

  /**
   * @notice Transfers amount amount of an _id from the _from address to the _to address specified 
   * @param _from    Source address
   * @param _to      Target address
   * @param _id      ID of the token type
   * @param _amount  Transfered amount
   * @param _data    Additional data with no specified format, sent in call to `_to`
   */
  function safeTransferFrom(address _from, address _to, uint256 _id, uint256 _amount, bytes memory _data) 
    public 
  {  
    // Requirements
    require((msg.sender == _from) || operators[_from][msg.sender], "ERC1155PackedBalance#safeTransferFrom: INVALID_OPERATOR");
    require(_to != address(0),"ERC1155PackedBalance#safeTransferFrom: INVALID_RECIPIENT");
    // require(_amount <= balances);  Not necessary since checked with writeValueInBin() checks
    
    _safeTransferFrom(_from, _to, _id, _amount, _data);
  }

  /**
   * @notice Send multiple types of Tokens from the _from address to the _to address (with safety call)
   * @dev Arrays should be sorted so that all ids in a same storage slot are adjacent (more efficient)
   * @param _from     Source addresses
   * @param _to       Target addresses
   * @param _ids      IDs of each token type
   * @param _amounts  Transfer amounts per token type
   * @param _data     Additional data with no specified format, sent in call to `_to`
   */
  function safeBatchTransferFrom(address _from, address _to, uint256[] memory _ids, uint256[] memory _amounts, bytes memory _data) 
    public 
  {
    // Requirements
    require((msg.sender == _from) || operators[_from][msg.sender], "ERC1155PackedBalance#safeBatchTransferFrom: INVALID_OPERATOR");
    require(_to != address(0),"ERC1155PackedBalance#safeTransferFrom: INVALID_RECIPIENT");

    _safeBatchTransferFrom(_from, _to, _ids, _amounts, _data);
  }


  /***********************************|
  |    Internal Transfer Functions    |
  |__________________________________*/

  /**
   * @notice Transfers amount amount of an _id from the _from address to the _to address specified 
   * @param _from    Source address
   * @param _to      Target address
   * @param _id      ID of the token type
   * @param _amount  Transfered amount
   * @param _data    Additional data with no specified format, sent in call to `_to`
   */
  function _safeTransferFrom(address _from, address _to, uint256 _id, uint256 _amount, bytes memory _data)
    internal
  {
    //Update balances
    _updateIDBalance(_from, _id, _amount, Operations.Sub); // Subtract amount from sender
    _updateIDBalance(_to,   _id, _amount, Operations.Add); // Add amount to recipient
      
    //Pass data if recipient is contract
    if (_to.isContract()) {
      // Call receiver function on recipient
      bytes4 retval = IERC1155TokenReceiver(_to).onERC1155Received(msg.sender, _from, _id, _amount, _data);
      require(retval == ERC1155_RECEIVED_VALUE, "ERC1155PackedBalance#_safeTransferFrom: INVALID_ON_RECEIVE_MESSAGE");
    }

    // Emit event
    emit TransferSingle(msg.sender, _from, _to, _id, _amount);
  }

  /**
   * @notice Send multiple types of Tokens from the _from address to the _to address (with safety call)
   * @dev Arrays should be sorted so that all ids in a same storage slot are adjacent (more efficient)
   * @param _from     Source addresses
   * @param _to       Target addresses
   * @param _ids      IDs of each token type
   * @param _amounts  Transfer amounts per token type
   * @param _data     Additional data with no specified format, sent in call to `_to`
   */
  function _safeBatchTransferFrom(address _from, address _to, uint256[] memory _ids, uint256[] memory _amounts, bytes memory _data) 
    internal
  {
    require(_ids.length == _amounts.length, "ERC1155PackedBalance#_safeBatchTransferFrom: INVALID_ARRAYS_LENGTH");

    // Load first bin and index where the token ID balance exists
    (uint256 bin, uint256 index) = getIDBinIndex(_ids[0]);

    // Balance for current bin in memory (initialized with first transfer)
    uint256 balFrom = _viewUpdateIDBalance(balances[_from][bin], index, _amounts[0], Operations.Sub);
    uint256 balTo = _viewUpdateIDBalance(balances[_to][bin], index, _amounts[0], Operations.Add);

    // Number of transfer to execute
    uint256 nTransfer = _ids.length;

    // Last bin updated
    uint256 lastBin = bin;

    for (uint256 i = 1; i < nTransfer; i++) {
      (bin, index) = getIDBinIndex(_ids[i]);

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
      balFrom = _viewUpdateIDBalance(balFrom, index, _amounts[i], Operations.Sub);
      balTo = _viewUpdateIDBalance(balTo, index, _amounts[i], Operations.Add);
    
    }

    // Update storage of the last bin visited
    balances[_from][bin] = balFrom;
    balances[_to][bin] = balTo;

    // Pass data if recipient is contract
    if (_to.isContract()) {
      bytes4 retval = IERC1155TokenReceiver(_to).onERC1155BatchReceived(msg.sender, _from, _ids, _amounts, _data);
      require(retval == ERC1155_BATCH_RECEIVED_VALUE, "ERC1155PackedBalance#_safeBatchTransferFrom: INVALID_ON_RECEIVE_MESSAGE");
    }

    emit TransferBatch(msg.sender, _from, _to, _ids, _amounts);
  }


  /***********************************|
  |         Operator Functions        |
  |__________________________________*/

  /**
   * @notice Enable or disable approval for a third party ("operator") to manage all of caller's tokens
   * @param _operator  Address to add to the set of authorized operators
   * @param _approved  True if the operator is approved, false to revoke approval
   */
  function setApprovalForAll(address _operator, bool _approved) 
    external 
  {
    // Update operator status
    operators[msg.sender][_operator] = _approved;
    emit ApprovalForAll(msg.sender, _operator, _approved);
  }

  /**
   * @notice Queries the approval status of an operator for a given owner
   * @param _owner     The owner of the Tokens
   * @param _operator  Address of authorized operator
   * @return True if the operator is approved, false if not
   */
  function isApprovedForAll(address _owner, address _operator)
    external view returns (bool isOperator)
  {
    return operators[_owner][_operator];
  }


  /***********************************|
  |     Public Balance Functions      |
  |__________________________________*/

  /**
   * @notice Get the balance of an account's Tokens
   * @param _owner  The address of the token holder
   * @param _id     ID of the Token
   * @return The _owner's balance of the Token type requested
   */
  function balanceOf(address _owner, uint256 _id) 
    external view returns (uint256) 
  {
    uint256 bin;
    uint256 index;

    //Get bin and index of _IF
    (bin, index) = getIDBinIndex(_id);
    return getValueInBin(balances[_owner][bin], index);
  }

  /**
   * @notice Get the balance of multiple account/token pairs
   * @param _owners The addresses of the token holders
   * @param _ids    ID of the Tokens
   * @return The _owner's balance of the Token types requested (i.e. balance for each (owner, id) pair)
    */
  function balanceOfBatch(address[] calldata _owners, uint256[] calldata _ids) 
    external view returns (uint256[] memory)
  {
    require(_owners.length == _ids.length, "ERC1155PackedBalance#balanceOfBatch: INVALID_ARRAY_LENGTH");

    // Variables
    uint256[] memory batchBalances = new uint256[](_owners.length);
    uint256 bin;
    uint256 index;

    // Iterate over each owner and token ID
    for (uint256 i = 0; i < _owners.length; i++) {
      (bin, index) = getIDBinIndex(_ids[i]);
      batchBalances[i] = getValueInBin(balances[_owners[i]][bin], index);
    }

    return batchBalances;
  }


  /***********************************|
  |      Packed Balance Functions     |
  |__________________________________*/

  /**
   * @notice Update the balance of a id for a given address
   * @param _address    Address to update id balance
   * @param _id         Id to update balance of
   * @param _amount     Amount to update the id balance
   * @param _operation  Which operation to conduct :
   *   Operations.Add: Add _amount to id balance
   *   Operations.Sub: Substract _amount from id balance
   */
  function _updateIDBalance(address _address, uint256 _id, uint256 _amount, Operations _operation) 
    internal
  {
    uint256 bin;
    uint256 index;

    // Get bin and index of _id
    (bin, index) = getIDBinIndex(_id);

    // Update balance
    balances[_address][bin] = _viewUpdateIDBalance(balances[_address][bin], index, _amount, _operation);
  }

  /**
   * @notice Update the balance of a id provided in _binBalances
   * @param _binBalances  Uint256 containing the balances of the token ID
   * @param _index        Index of the token ID in the provided bin
   * @param _amount       Amount to update the id balance
   * @param _operation    Which operation to conduct :
   *   Operations.Add: Add _amount to id balance
   *   Operations.Sub: Substract _amount from id balance
   */
  function _viewUpdateIDBalance(uint256 _binBalances, uint256 _index, uint256 _amount, Operations _operation)
    internal pure returns (uint256 newBinBalance)
  {
    uint256 objectBalance;

    // Overflow check in writeValueInBin
    if (_operation == Operations.Add) {

      objectBalance = getValueInBin(_binBalances, _index);
      newBinBalance = writeValueInBin(_binBalances, _index, objectBalance + _amount);

    // Underflow is checked by safemath
    } else if (_operation == Operations.Sub) {

      objectBalance = getValueInBin(_binBalances, _index);
      newBinBalance = writeValueInBin(_binBalances, _index, objectBalance.sub(_amount));

    } else {
      revert("ERC1155PackedBalance#_viewUpdateIDBalance: INVALID_BIN_WRITE_OPERATION"); // Bad operation
    }

    return newBinBalance;
  }

  /**
  * @notice Return the bin number and index within that bin where ID is
  * @param _id  Token id
  * @return (Bin number, ID"s index within that bin)
  */
  function getIDBinIndex(uint256 _id) 
    public pure returns (uint256 bin, uint256 index) 
  {
    bin = _id * IDS_BITS_SIZE / 256;
    index = _id % IDS_PER_UINT256;
    return (bin, index);
  }

  /**
   * @notice Return amount in _binAmount at position _index
   * @param _binAmount  uint256 containing the balances of IDS_PER_UINT256 ids
   * @param _index      Index at which to retrieve amount
   * @return amount at given _index in _bin
   */
  function getValueInBin(uint256 _binAmount, uint256 _index) 
    public pure returns (uint256) 
  {
    // Mask to retrieve data for a given binData
    uint256 mask = (uint256(1) << IDS_BITS_SIZE) - 1;

    // Shift amount
    uint256 rightShift = 256 - IDS_BITS_SIZE * (_index + 1);
    return (_binAmount >> rightShift) & mask;
  }

  /**
   * @notice Return the updated _binAmount after writing _amount at _index
   * @param _binAmount  uint256 containing the balances of IDS_PER_UINT256 ids
   * @param _index      Index at which to retrieve amount
   * @param _amount     amount to store at _index in _bin
   * @return amount at given _index in _bin
   */
  function writeValueInBin(uint256 _binAmount, uint256 _index, uint256 _amount) 
    public pure returns (uint256) 
  {
    require(_amount >= 0, "ERC1155PackedBalance#writeValueInBin: INVALID_amount"); // Probably can remove ???
    require(_amount < 2**IDS_BITS_SIZE, "ERC1155PackedBalance#writeValueInBin: OVERFLOW");

    // Mask to retrieve data for a given binData
    uint256 mask = (uint256(1) << IDS_BITS_SIZE) - 1;

    // Shift amount
    uint256 leftShift = 256 - IDS_BITS_SIZE*(_index + 1);
    return (_binAmount & ~(mask << leftShift) ) | (_amount << leftShift);
  }


  /***********************************|
  |          ERC165 Functions         |
  |__________________________________*/

  /**
   * INTERFACE_SIGNATURE_ERC165 = bytes4(keccak256("supportsInterface(bytes4)"));
   */
  bytes4 constant private INTERFACE_SIGNATURE_ERC165 = 0x01ffc9a7;

  /**
   * INTERFACE_SIGNATURE_ERC1155 =  
   *   bytes4(keccak256("safeTransferFrom(address,address,uint256,uint256,bytes)")) ^
   *   bytes4(keccak256("safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)")) ^
   *   bytes4(keccak256("balanceOf(address,uint256)")) ^
   *   bytes4(keccak256("setApprovalForAll(address,bool)")) ^
   *   bytes4(keccak256("isApprovedForAll(address,address)"));
   */
  bytes4 constant private INTERFACE_SIGNATURE_ERC1155 = 0x97a409d2;

  /**
   * @notice Query if a contract implements an interface
   * @param _interfaceID  The interface identifier, as specified in ERC-165
   * @return `true` if the contract implements `_interfaceID` and
   */
  function supportsInterface(bytes4 _interfaceID) external view returns (bool) {
    if (_interfaceID == INTERFACE_SIGNATURE_ERC165 ||
        _interfaceID == INTERFACE_SIGNATURE_ERC1155) {
      return true;
    }
    return false;
  }

}
