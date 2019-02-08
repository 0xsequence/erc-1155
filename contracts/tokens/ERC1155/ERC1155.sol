pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "../../interfaces/IERC165.sol";
import "../../utils/SafeMath.sol";
import "../../interfaces/IERC1155TokenReceiver.sol";
import "../../interfaces/IERC1155.sol";
import "openzeppelin-solidity/contracts/utils/Address.sol";


/**
 * @dev Implementation of Multi-Token Standard contract.
 */
contract ERC1155 is IERC165 {
  using SafeMath for uint256;
  using Address for address;



  /***********************************|
  |        Variables and Events       |
  |__________________________________*/

  // onReceive function signatures
  bytes4 constant public ERC1155_RECEIVED_VALUE = 0xf23a6e61;
  bytes4 constant public ERC1155_BATCH_RECEIVED_VALUE = 0xbc197c81;

  // Objects balances
  mapping (address => mapping(uint256 => uint256)) internal balances;

  // Operator Functions
  mapping (address => mapping(address => bool)) internal operators;

  // Events
  event TransferSingle(address indexed _operator, address indexed _from, address indexed _to, uint256 _id, uint256 _value);
  event TransferBatch(address indexed _operator, address indexed _from, address indexed _to, uint256[] _ids, uint256[] _values);
  event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);



  /***********************************|
  |     Public Transfer Functions     |
  |__________________________________*/

  /**
   * @dev Allow _from or an operator to transfer tokens from one address to another
   * @param _from The address which you want to send tokens from
   * @param _to The address which you want to transfer to
   * @param _id Token id to update balance of - For this implementation, via `uint256(tokenAddress)`.
   * @param _value The amount of tokens of provided token ID to be transferred
   * @param _data Data to pass to onERC1155Received() function if recipient is contract
   */
  function safeTransferFrom(address _from, address _to, uint256 _id, uint256 _value, bytes memory _data)
    public
  {
    require((msg.sender == _from) || operators[_from][msg.sender], "ERC1155#safeTransferFrom: INVALID_OPERATOR");
    require(_to != address(0),"ERC1155#safeTransferFrom: INVALID_RECIPIENT");
    // require(_value >= balances[_from][_id]) is not necessary since checked with safemath operations

    _safeTransferFrom(_from, _to, _id, _value, _data);
  }


  /**
   * @dev transfer objects from different ids to specified address
   * @param _from The address to batchTransfer objects from.
   * @param _to The address to batchTransfer objects to.
   * @param _ids Array of ids to update balance of - For this implementation, via `uint256(tokenAddress)`
   * @param _values Array of amount of object per id to be transferred.
   * @param _data Data to pass to onERC1155Received() function if recipient is contract
   */
  function safeBatchTransferFrom(address _from, address _to, uint256[] memory _ids, uint256[] memory _values, bytes memory _data)
    public
  {
    // Requirements
    require((msg.sender == _from) || operators[_from][msg.sender], "ERC1155#safeBatchTransferFrom: INVALID_OPERATOR");
    require(_to != address(0), "ERC1155#safeBatchTransferFrom: INVALID_RECIPIENT");

    _safeBatchTransferFrom(_from, _to, _ids, _values, _data);
  }


  /***********************************|
  |    Internal Transfer Functions    |
  |__________________________________*/

  /**
   * @dev Allow _from or an operator to transfer tokens from one address to another
   * @param _from The address which you want to send tokens from
   * @param _to The address which you want to transfer to
   * @param _id Token id to update balance of - For this implementation, via `uint256(tokenAddress)`.
   * @param _value The amount of tokens of provided token ID to be transferred
   * @param _data Data to pass to onERC1155Received() function if recipient is contract
   */
  function _safeTransferFrom(address _from, address _to, uint256 _id, uint256 _value, bytes memory _data)
    internal
  {
    // Update balances
    balances[_from][_id] = balances[_from][_id].sub(_value); // Subtract value
    balances[_to][_id] = balances[_to][_id].add(_value);     // Add value

    // Check if recipient is contract
    if (_to.isContract()) {
      bytes4 retval = IERC1155TokenReceiver(_to).onERC1155Received(msg.sender, _from, _id, _value, _data);
      require(retval == ERC1155_RECEIVED_VALUE, "ERC1155#_safeTransferFrom: INVALID_ON_RECEIVE_MESSAGE");
    }

    // Emit event
    emit TransferSingle(msg.sender, _from, _to, _id, _value);
  }


  /**
   * @dev transfer objects from different ids to specified address
   * @param _from The address to batchTransfer objects from.
   * @param _to The address to batchTransfer objects to.
   * @param _ids Array of ids to update balance of - For this implementation, via `uint256(tokenAddress)`
   * @param _values Array of amount of object per id to be transferred.
   * @param _data Data to pass to onERC1155Received() function if recipient is contract
   */
  function _safeBatchTransferFrom(address _from, address _to, uint256[] memory _ids, uint256[] memory _values, bytes memory _data)
    internal
  {
    require(_ids.length == _values.length, "ERC1155#_safeBatchTransferFrom: INVALID_ARRAYS_LENGTH");

    // Number of transfer to execute
    uint256 nTransfer = _ids.length;

    // Executing all transfers
    for (uint256 i = 0; i < nTransfer; i++) {
      // Update storage balance of previous bin
      balances[_from][_ids[i]] = balances[_from][_ids[i]].sub(_values[i]);
      balances[_to][_ids[i]]   = balances[_to][_ids[i]].add(_values[i]);
    }

    // Pass data if recipient is contract
    if (_to.isContract()) {
      bytes4 retval = IERC1155TokenReceiver(_to).onERC1155BatchReceived(msg.sender, _from, _ids, _values, _data);
      require(retval == ERC1155_BATCH_RECEIVED_VALUE, "ERC1155#_safeBatchTransferFrom: INVALID_ON_RECEIVE_MESSAGE");
    }

    emit TransferBatch(msg.sender, _from, _to, _ids, _values);
  }



  /***********************************|
  |         Operator Functions        |
  |__________________________________*/

  /**
   * @dev Will set _operator operator status to true or false
   * @param _operator Address to changes operator status.
   * @param _approved  _operator"s new operator status (true or false)
   */
  function setApprovalForAll(address _operator, bool _approved)
    external
  {
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
  function isApprovedForAll(address _owner, address _operator)
    external view returns (bool isOperator)
  {
    return operators[_owner][_operator];
  }



  /***********************************|
  |         Balance Functions         |
  |__________________________________*/

  /**
   * @dev return the _id id" balance of _address
   * @param _address Address to query balance of
   * @param _id id to query balance of
   * @return Amount of objects of a given id ID
   */
  function balanceOf(address _address, uint256 _id)
    external view returns (uint256)
  {
    return balances[_address][_id];
  }


  /**
   * @dev Get the balance of multiple account/token pairs
   * @param _owners The addresses of the token holders
   * @param _ids    ID of the Tokens
   * @return        The _owner's balance of the Token types requested
   */
  function balanceOfBatch(address[] calldata _owners, uint256[] calldata _ids)
    external view returns (uint256[] memory)
  {
    require(_owners.length == _ids.length, "ERC1155#balanceOfBatch: INVALID_ARRAY_LENGTH");

    // Variables
    uint256[] memory batchBalances = new uint256[](_owners.length);

    // Iterate over each owner and token ID
    for (uint256 i = 0; i < _owners.length; i++) {
      batchBalances[i] = balances[_owners[i]][_ids[i]];
    }

    return batchBalances;
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
   * @dev Query if a contract implements an interface
   * @param _interfaceID The interface identifier, as specified in ERC-165
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
