// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.7.4;

import "../../utils/SafeMath.sol";
import "../../interfaces/IERC1155TokenReceiver.sol";
import "../../interfaces/IERC1155.sol";
import "../../utils/Address.sol";
import "../../utils/ERC165.sol";


/**
 * @dev Implementation of Multi-Token Standard contract. This implementation of the ERC-1155 standard
 *      utilizes the fact that balances of different token ids can be concatenated within individual
 *      uint256 storage slots. This allows the contract to batch transfer tokens more efficiently at
 *      the cost of limiting the maximum token balance each address can hold. This limit is
 *      2^IDS_BITS_SIZE, which can be adjusted below. In practice, using IDS_BITS_SIZE smaller than 16
 *      did not lead to major efficiency gains.
 */
contract ERC1155PackedBalance is IERC1155, ERC165 {
  using SafeMath for uint256;
  using Address for address;

  /***********************************|
  |        Variables and Events       |
  |__________________________________*/

  // onReceive function signatures
  bytes4 constant internal ERC1155_RECEIVED_VALUE = 0xf23a6e61;
  bytes4 constant internal ERC1155_BATCH_RECEIVED_VALUE = 0xbc197c81;

  // Constants regarding bin sizes for balance packing
  // IDS_BITS_SIZE **MUST** be a power of 2 (e.g. 2, 4, 8, 16, 32, 64, 128)
  uint256 internal constant IDS_BITS_SIZE   = 32;                  // Max balance amount in bits per token ID
  uint256 internal constant IDS_PER_UINT256 = 256 / IDS_BITS_SIZE; // Number of ids per uint256

  // Operations for _updateIDBalance
  enum Operations { Add, Sub }

  // Token IDs balances ; balances[address][id] => balance (using array instead of mapping for efficiency)
  mapping (address => mapping(uint256 => uint256)) internal balances;

  // Operators
  mapping (address => mapping(address => bool)) internal operators;


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
    public override
  {
    // Requirements
    require((msg.sender == _from) || isApprovedForAll(_from, msg.sender), "ERC1155PackedBalance#safeTransferFrom: INVALID_OPERATOR");
    require(_to != address(0),"ERC1155PackedBalance#safeTransferFrom: INVALID_RECIPIENT");
    // require(_amount <= balances);  Not necessary since checked with _viewUpdateBinValue() checks

    _safeTransferFrom(_from, _to, _id, _amount);
    _callonERC1155Received(_from, _to, _id, _amount, gasleft(), _data);
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
    public override
  {
    // Requirements
    require((msg.sender == _from) || isApprovedForAll(_from, msg.sender), "ERC1155PackedBalance#safeBatchTransferFrom: INVALID_OPERATOR");
    require(_to != address(0),"ERC1155PackedBalance#safeBatchTransferFrom: INVALID_RECIPIENT");

    _safeBatchTransferFrom(_from, _to, _ids, _amounts);
    _callonERC1155BatchReceived(_from, _to, _ids, _amounts, gasleft(), _data);
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
   */
  function _safeTransferFrom(address _from, address _to, uint256 _id, uint256 _amount)
    internal
  {
    //Update balances
    _updateIDBalance(_from, _id, _amount, Operations.Sub); // Subtract amount from sender
    _updateIDBalance(_to,   _id, _amount, Operations.Add); // Add amount to recipient

    // Emit event
    emit TransferSingle(msg.sender, _from, _to, _id, _amount);
  }

  /**
   * @notice Verifies if receiver is contract and if so, calls (_to).onERC1155Received(...)
   */
  function _callonERC1155Received(address _from, address _to, uint256 _id, uint256 _amount, uint256 _gasLimit, bytes memory _data)
    internal
  {
    // Check if recipient is contract
    if (_to.isContract()) {
      bytes4 retval = IERC1155TokenReceiver(_to).onERC1155Received{gas:_gasLimit}(msg.sender, _from, _id, _amount, _data);
      require(retval == ERC1155_RECEIVED_VALUE, "ERC1155PackedBalance#_callonERC1155Received: INVALID_ON_RECEIVE_MESSAGE");
    }
  }

  /**
   * @notice Send multiple types of Tokens from the _from address to the _to address (with safety call)
   * @dev Arrays should be sorted so that all ids in a same storage slot are adjacent (more efficient)
   * @param _from     Source addresses
   * @param _to       Target addresses
   * @param _ids      IDs of each token type
   * @param _amounts  Transfer amounts per token type
   */
  function _safeBatchTransferFrom(address _from, address _to, uint256[] memory _ids, uint256[] memory _amounts)
    internal
  {
    uint256 nTransfer = _ids.length; // Number of transfer to execute
    require(nTransfer == _amounts.length, "ERC1155PackedBalance#_safeBatchTransferFrom: INVALID_ARRAYS_LENGTH");

    if (_from != _to && nTransfer > 0) {
      // Load first bin and index where the token ID balance exists
      (uint256 bin, uint256 index) = getIDBinIndex(_ids[0]);

      // Balance for current bin in memory (initialized with first transfer)
      uint256 balFrom = _viewUpdateBinValue(balances[_from][bin], index, _amounts[0], Operations.Sub);
      uint256 balTo = _viewUpdateBinValue(balances[_to][bin], index, _amounts[0], Operations.Add);

      // Last bin updated
      uint256 lastBin = bin;

      for (uint256 i = 1; i < nTransfer; i++) {
        (bin, index) = getIDBinIndex(_ids[i]);

        // If new bin
        if (bin != lastBin) {
          // Update storage balance of previous bin
          balances[_from][lastBin] = balFrom;
          balances[_to][lastBin] = balTo;

          balFrom = balances[_from][bin];
          balTo = balances[_to][bin];

          // Bin will be the most recent bin
          lastBin = bin;
        }

        // Update memory balance
        balFrom = _viewUpdateBinValue(balFrom, index, _amounts[i], Operations.Sub);
        balTo = _viewUpdateBinValue(balTo, index, _amounts[i], Operations.Add);
      }

      // Update storage of the last bin visited
      balances[_from][bin] = balFrom;
      balances[_to][bin] = balTo;

    // If transfer to self, just make sure all amounts are valid
    } else {
      for (uint256 i = 0; i < nTransfer; i++) {
        require(balanceOf(_from, _ids[i]) >= _amounts[i], "ERC1155PackedBalance#_safeBatchTransferFrom: UNDERFLOW");
      }
    }

    // Emit event
    emit TransferBatch(msg.sender, _from, _to, _ids, _amounts);
  }

  /**
   * @notice Verifies if receiver is contract and if so, calls (_to).onERC1155BatchReceived(...)
   */
  function _callonERC1155BatchReceived(address _from, address _to, uint256[] memory _ids, uint256[] memory _amounts, uint256 _gasLimit, bytes memory _data)
    internal
  {
    // Pass data if recipient is contract
    if (_to.isContract()) {
      bytes4 retval = IERC1155TokenReceiver(_to).onERC1155BatchReceived{gas: _gasLimit}(msg.sender, _from, _ids, _amounts, _data);
      require(retval == ERC1155_BATCH_RECEIVED_VALUE, "ERC1155PackedBalance#_callonERC1155BatchReceived: INVALID_ON_RECEIVE_MESSAGE");
    }
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
    external override
  {
    // Update operator status
    operators[msg.sender][_operator] = _approved;
    emit ApprovalForAll(msg.sender, _operator, _approved);
  }

  /**
   * @notice Queries the approval status of an operator for a given owner
   * @param _owner     The owner of the Tokens
   * @param _operator  Address of authorized operator
   * @return isOperator True if the operator is approved, false if not
   */
  function isApprovedForAll(address _owner, address _operator)
    public override view returns (bool isOperator)
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
    public override view returns (uint256)
  {
    uint256 bin;
    uint256 index;

    //Get bin and index of _id
    (bin, index) = getIDBinIndex(_id);
    return getValueInBin(balances[_owner][bin], index);
  }

  /**
   * @notice Get the balance of multiple account/token pairs
   * @param _owners The addresses of the token holders (sorted owners will lead to less gas usage)
   * @param _ids    ID of the Tokens (sorted ids will lead to less gas usage
   * @return The _owner's balance of the Token types requested (i.e. balance for each (owner, id) pair)
    */
  function balanceOfBatch(address[] memory _owners, uint256[] memory _ids)
    public override view returns (uint256[] memory)
  {
    uint256 n_owners = _owners.length;
    require(n_owners == _ids.length, "ERC1155PackedBalance#balanceOfBatch: INVALID_ARRAY_LENGTH");

    // First values
    (uint256 bin, uint256 index) = getIDBinIndex(_ids[0]);
    uint256 balance_bin = balances[_owners[0]][bin];
    uint256 last_bin = bin;

    // Initialization
    uint256[] memory batchBalances = new uint256[](n_owners);
    batchBalances[0] = getValueInBin(balance_bin, index);

    // Iterate over each owner and token ID
    for (uint256 i = 1; i < n_owners; i++) {
      (bin, index) = getIDBinIndex(_ids[i]);

      // SLOAD if bin changed for the same owner or if owner changed
      if (bin != last_bin || _owners[i-1] != _owners[i]) {
        balance_bin = balances[_owners[i]][bin];
        last_bin = bin;
      }

      batchBalances[i] = getValueInBin(balance_bin, index);
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
    balances[_address][bin] = _viewUpdateBinValue(balances[_address][bin], index, _amount, _operation);
  }

  /**
   * @notice Update a value in _binValues
   * @param _binValues  Uint256 containing values of size IDS_BITS_SIZE (the token balances)
   * @param _index      Index of the value in the provided bin
   * @param _amount     Amount to update the id balance
   * @param _operation  Which operation to conduct :
   *   Operations.Add: Add _amount to value in _binValues at _index
   *   Operations.Sub: Substract _amount from value in _binValues at _index
   */
  function _viewUpdateBinValue(uint256 _binValues, uint256 _index, uint256 _amount, Operations _operation)
    internal pure returns (uint256 newBinValues)
  {
    uint256 shift = IDS_BITS_SIZE * _index;
    uint256 mask = (uint256(1) << IDS_BITS_SIZE) - 1;

    if (_operation == Operations.Add) {
      newBinValues = _binValues + (_amount << shift);
      require(newBinValues >= _binValues, "ERC1155PackedBalance#_viewUpdateBinValue: OVERFLOW");
      require(
        ((_binValues >> shift) & mask) + _amount < 2**IDS_BITS_SIZE, // Checks that no other id changed
        "ERC1155PackedBalance#_viewUpdateBinValue: OVERFLOW"
      );

    } else if (_operation == Operations.Sub) {
      newBinValues = _binValues - (_amount << shift);
      require(newBinValues <= _binValues, "ERC1155PackedBalance#_viewUpdateBinValue: UNDERFLOW");
      require(
        ((_binValues >> shift) & mask) >= _amount, // Checks that no other id changed
        "ERC1155PackedBalance#_viewUpdateBinValue: UNDERFLOW"
      );

    } else {
      revert("ERC1155PackedBalance#_viewUpdateBinValue: INVALID_BIN_WRITE_OPERATION"); // Bad operation
    }

    return newBinValues;
  }

  /**
  * @notice Return the bin number and index within that bin where ID is
  * @param _id  Token id
  * @return bin index (Bin number, ID"s index within that bin)
  */
  function getIDBinIndex(uint256 _id)
    public pure returns (uint256 bin, uint256 index)
  {
    bin = _id / IDS_PER_UINT256;
    index = _id % IDS_PER_UINT256;
    return (bin, index);
  }

  /**
   * @notice Return amount in _binValues at position _index
   * @param _binValues  uint256 containing the balances of IDS_PER_UINT256 ids
   * @param _index      Index at which to retrieve amount
   * @return amount at given _index in _bin
   */
  function getValueInBin(uint256 _binValues, uint256 _index)
    public pure returns (uint256)
  {
    // require(_index < IDS_PER_UINT256) is not required since getIDBinIndex ensures `_index < IDS_PER_UINT256`

    // Mask to retrieve data for a given binData
    uint256 mask = (uint256(1) << IDS_BITS_SIZE) - 1;

    // Shift amount
    uint256 rightShift = IDS_BITS_SIZE * _index;
    return (_binValues >> rightShift) & mask;
  }


  /***********************************|
  |          ERC165 Functions         |
  |__________________________________*/

  /**
   * @notice Query if a contract implements an interface
   * @param _interfaceID  The interface identifier, as specified in ERC-165
   * @return `true` if the contract implements `_interfaceID` and
   */
  function supportsInterface(bytes4 _interfaceID) public override(ERC165, IERC165) virtual pure returns (bool) {
    if (_interfaceID == type(IERC1155).interfaceId) {
      return true;
    }
    return super.supportsInterface(_interfaceID);
  }
}
