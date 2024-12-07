// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "../../interfaces/IERC1155TokenReceiver.sol";
import "../../interfaces/IERC1155.sol";
import "../../utils/Address.sol";
import "../../utils/ContextUpgradeable.sol";
import "../../utils/ERC165.sol";
import '../../utils/StorageSlot.sol';

/**
 * @dev Implementation of Multi-Token Standard contract.
 *      This contract uses an upgradeable context.
 */
contract ERC1155Upgradeable is ContextUpgradeable, IERC1155, ERC165 {
  using Address for address;

  /***********************************|
  |        Variables and Events       |
  |__________________________________*/

  // onReceive function signatures
  bytes4 constant internal ERC1155_RECEIVED_VALUE = 0xf23a6e61;
  bytes4 constant internal ERC1155_BATCH_RECEIVED_VALUE = 0xbc197c81;

  // Math operations
  enum Operations { Add, Sub }

  // Objects balances
  bytes32 constant private _BALANCES_SLOT_KEY = keccak256("0xsequence.ERC1155Upgradeable.balances");

  // Operator Functions
  bytes32 constant private _OPERATORS_SLOT_KEY = keccak256("0xsequence.ERC1155Upgradeable.operators");


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
    public virtual override
  {
    require((_msgSender() == _from) || isApprovedForAll(_from, _msgSender()), "ERC1155#safeTransferFrom: INVALID_OPERATOR");
    require(_to != address(0),"ERC1155#safeTransferFrom: INVALID_RECIPIENT");

    _safeTransferFrom(_from, _to, _id, _amount);
    _callonERC1155Received(_from, _to, _id, _amount, gasleft(), _data);
  }

  /**
   * @notice Send multiple types of Tokens from the _from address to the _to address (with safety call)
   * @param _from     Source addresses
   * @param _to       Target addresses
   * @param _ids      IDs of each token type
   * @param _amounts  Transfer amounts per token type
   * @param _data     Additional data with no specified format, sent in call to `_to`
   */
  function safeBatchTransferFrom(address _from, address _to, uint256[] memory _ids, uint256[] memory _amounts, bytes memory _data)
    public virtual override
  {
    // Requirements
    require((_msgSender() == _from) || isApprovedForAll(_from, _msgSender()), "ERC1155#safeBatchTransferFrom: INVALID_OPERATOR");
    require(_to != address(0), "ERC1155#safeBatchTransferFrom: INVALID_RECIPIENT");

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
    internal virtual
  {
    // Update balances
    _updateBalance(_from, _id, _amount, Operations.Sub);
    _updateBalance(_to, _id, _amount, Operations.Add);

    // Emit event
    emit TransferSingle(_msgSender(), _from, _to, _id, _amount);
  }

  /**
   * @notice Verifies if receiver is contract and if so, calls (_to).onERC1155Received(...)
   */
  function _callonERC1155Received(address _from, address _to, uint256 _id, uint256 _amount, uint256 _gasLimit, bytes memory _data)
    internal virtual
  {
    // Check if recipient is contract
    if (_to.isContract()) {
      bytes4 retval = IERC1155TokenReceiver(_to).onERC1155Received{gas: _gasLimit}(_msgSender(), _from, _id, _amount, _data);
      require(retval == ERC1155_RECEIVED_VALUE, "ERC1155#_callonERC1155Received: INVALID_ON_RECEIVE_MESSAGE");
    }
  }

  /**
   * @notice Send multiple types of Tokens from the _from address to the _to address (with safety call)
   * @param _from     Source addresses
   * @param _to       Target addresses
   * @param _ids      IDs of each token type
   * @param _amounts  Transfer amounts per token type
   */
  function _safeBatchTransferFrom(address _from, address _to, uint256[] memory _ids, uint256[] memory _amounts)
    internal virtual
  {
    require(_ids.length == _amounts.length, "ERC1155#_safeBatchTransferFrom: INVALID_ARRAYS_LENGTH");

    // Number of transfer to execute
    uint256 nTransfer = _ids.length;

    // Executing all transfers
    for (uint256 i = 0; i < nTransfer; i++) {
      // Update storage balance of previous bin
      _updateBalance(_from, _ids[i], _amounts[i], Operations.Sub);
      _updateBalance(_to, _ids[i], _amounts[i], Operations.Add);
    }

    // Emit event
    emit TransferBatch(_msgSender(), _from, _to, _ids, _amounts);
  }

  /**
   * @notice Verifies if receiver is contract and if so, calls (_to).onERC1155BatchReceived(...)
   */
  function _callonERC1155BatchReceived(address _from, address _to, uint256[] memory _ids, uint256[] memory _amounts, uint256 _gasLimit, bytes memory _data)
    internal virtual
  {
    // Pass data if recipient is contract
    if (_to.isContract()) {
      bytes4 retval = IERC1155TokenReceiver(_to).onERC1155BatchReceived{gas: _gasLimit}(_msgSender(), _from, _ids, _amounts, _data);
      require(retval == ERC1155_BATCH_RECEIVED_VALUE, "ERC1155#_callonERC1155BatchReceived: INVALID_ON_RECEIVE_MESSAGE");
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
    external virtual override
  {
    // Update operator status
    _setOperator(_msgSender(), _operator, _approved);
    emit ApprovalForAll(_msgSender(), _operator, _approved);
  }

  /**
   * @notice Queries the approval status of an operator for a given owner
   * @param _owner     The owner of the Tokens
   * @param _operator  Address of authorized operator
   * @return isOperator True if the operator is approved, false if not
   */
  function isApprovedForAll(address _owner, address _operator)
    public virtual override view returns (bool isOperator)
  {
    return _getOperator(_owner, _operator);
  }


  /***********************************|
  |         Balance Functions         |
  |__________________________________*/

  /**
   * @notice Get the balance of an account's Tokens
   * @param _owner  The address of the token holder
   * @param _id     ID of the Token
   * @return The _owner's balance of the Token type requested
   */
  function balanceOf(address _owner, uint256 _id)
    public virtual override view returns (uint256)
  {
    return _getBalance(_owner, _id);
  }

  /**
   * @notice Get the balance of multiple account/token pairs
   * @param _owners The addresses of the token holders
   * @param _ids    ID of the Tokens
   * @return        The _owner's balance of the Token types requested (i.e. balance for each (owner, id) pair)
   */
  function balanceOfBatch(address[] memory _owners, uint256[] memory _ids)
    public view virtual override returns (uint256[] memory)
  {
    require(_owners.length == _ids.length, "ERC1155#balanceOfBatch: INVALID_ARRAY_LENGTH");

    // Variables
    uint256[] memory batchBalances = new uint256[](_owners.length);

    // Iterate over each owner and token ID
    for (uint256 i = 0; i < _owners.length; i++) {
      batchBalances[i] = _getBalance(_owners[i], _ids[i]);
    }

    return batchBalances;
  }

  /***********************************|
  |         Storage Functions         |
  |__________________________________*/

  function _getBalance(address _owner, uint256 _id) internal view virtual returns (uint256) {
    return StorageSlot.getUint256Slot(keccak256(abi.encodePacked(_BALANCES_SLOT_KEY, _owner, _id))).value;
  }

  function _setBalance(address _owner, uint256 _id, uint256 _balance) internal virtual {
    StorageSlot.getUint256Slot(keccak256(abi.encodePacked(_BALANCES_SLOT_KEY, _owner, _id))).value = _balance;
  }

  function _updateBalance(address _owner, uint256 _id, uint256 _diff, Operations _operation) internal virtual {
    StorageSlot.Uint256Slot storage slot = StorageSlot.getUint256Slot(keccak256(abi.encodePacked(_BALANCES_SLOT_KEY, _owner, _id)));
    if (_operation == Operations.Add) {
      slot.value += _diff;
    } else if (_operation == Operations.Sub) {
      slot.value -= _diff;
    } else {
      revert("ERC1155Upgradeable#_updateBalance: INVALID_OPERATION");
    }
  }

  function _getOperator(address _owner, address _operator) internal view virtual returns (bool) {
    return StorageSlot.getBooleanSlot(keccak256(abi.encodePacked(_OPERATORS_SLOT_KEY, _owner, _operator))).value;
  }

  function _setOperator(address _owner, address _operator, bool _approved) internal virtual {
    StorageSlot.getBooleanSlot(keccak256(abi.encodePacked(_OPERATORS_SLOT_KEY, _owner, _operator))).value = _approved;
  }


  /***********************************|
  |          ERC165 Functions         |
  |__________________________________*/

  /**
   * @notice Query if a contract implements an interface
   * @param _interfaceID  The interface identifier, as specified in ERC-165
   * @return `true` if the contract implements `_interfaceID` and
   */
  function supportsInterface(bytes4 _interfaceID) public view virtual override(ERC165, IERC165) returns (bool) {
    if (_interfaceID == type(IERC1155).interfaceId) {
      return true;
    }
    return super.supportsInterface(_interfaceID);
  }
}
