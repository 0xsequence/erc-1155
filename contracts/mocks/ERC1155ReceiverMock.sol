pragma solidity ^0.5.0;

import '../interfaces/IERC1155.sol';


// Contract to test safe transfer behavior.
contract ERC1155ReceiverMock {
  bytes4 constant internal ERC1155_RECEIVED_SIG = 0xf23a6e61;
  bytes4 constant internal ERC1155_BATCH_RECEIVED_SIG = 0xbc197c81;
  bytes4 constant internal ERC1155_RECEIVED_INVALID = 0xdeadbeef;
  bytes4 constant internal IS_ERC1155_RECEIVER = bytes4(keccak256("isERC1155TokenReceiver()"));

  // Keep values from last received contract.
  bool public shouldReject;

  bytes public lastData;
  address public lastOperator;
  uint256 public lastId;
  uint256 public lastValue;

  //Debug event
  event TransferSingleReceiver(address _from, address _to, uint256 _fromBalance, uint256 _toBalance);
  event TransferBatchReceiver(address _from, address _to, uint256[] _fromBalances, uint256[] _toBalances);

  function setShouldReject(bool _value) public {
    shouldReject = _value;
  }

  /**
  * @notice Handle the receipt of a single ERC1155 token type.
  * @dev An ERC1155-compliant smart contract MUST call this function on the token recipient contract, at the end of a `safeTransferFrom` after the balance has been updated.
  * This function MAY throw to revert and reject the transfer.
  * Return of other than the magic value MUST result in the transaction being reverted.
  * Note: The contract address is always the message sender.
  * @param _operator  The address which called the `safeTransferFrom` function
  * @param _from      The address which previously owned the token
  * @param _id        The id of the token being transferred
  * @param _value     The amount of tokens being transferred
  * @param _data      Additional data with no specified format
  * @return           `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))`
  */
  function onERC1155Received(address _operator, address _from, uint256 _id, uint256 _value, bytes memory _data)
    public returns(bytes4)
  {
    // To check the following conditions;
    //   All the balances in the transfer MUST have been updated to match the senders intent before any hook is called on a recipient.
    //   All the transfer events for the transfer MUST have been emitted to reflect the balance changes before any hook is called on a recipient.
    uint256 fromBalance = IERC1155(msg.sender).balanceOf(_from, _id);
    uint256 toBalance = IERC1155(msg.sender).balanceOf(address(this), _id);
    emit TransferSingleReceiver(_from, address(this), fromBalance, toBalance);

    if (shouldReject == true) {
      return ERC1155_RECEIVED_INVALID; // Some random value
    } else {
      return ERC1155_RECEIVED_SIG;
    }
  }

  /**
  * @notice Handle the receipt of multiple ERC1155 token types.
  * @dev An ERC1155-compliant smart contract MUST call this function on the token recipient contract, at the end of a `safeBatchTransferFrom` after the balances have been updated.
  * This function MAY throw to revert and reject the transfer.
  * Return of other than the magic value WILL result in the transaction being reverted.
  * Note: The contract address is always the message sender.
  * @param _operator  The address which called the `safeBatchTransferFrom` function
  * @param _from      The address which previously owned the token
  * @param _ids       An array containing ids of each token being transferred
  * @param _values    An array containing amounts of each token being transferred
  * @param _data      Additional data with no specified format
  * @return           `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))`
  */
  function onERC1155BatchReceived(address _operator, address _from, uint256[] memory _ids, uint256[] memory _values, bytes memory _data) 
    public returns(bytes4)
  {
    // To check the following conditions;
    //   All the balances in the transfer MUST have been updated to match the senders intent before any hook is called on a recipient.
    //   All the transfer events for the transfer MUST have been emitted to reflect the balance changes before any hook is called on a recipient.
    address[] memory fromAddressArray = new address[](_ids.length);
    address[] memory toAddressArray = new address[](_ids.length);
    for (uint i = 0; i < _ids.length; i++ ) {
      fromAddressArray[i] = _from;
      toAddressArray[i] = (address(this));
    }
    uint256[] memory fromBalances = IERC1155(msg.sender).balanceOfBatch(fromAddressArray, _ids);
    uint256[] memory toBalances = IERC1155(msg.sender).balanceOfBatch(toAddressArray, _ids);
    emit TransferBatchReceiver(_from, address(this), fromBalances, toBalances);

    if (shouldReject == true) {
      return ERC1155_RECEIVED_INVALID; // Some random value
    } else {
      return ERC1155_BATCH_RECEIVED_SIG;
    }
  }

  /**
   * @notice Indicates whether a contract implements the `ERC1155TokenReceiver` functions and so can accept ERC1155 token types.
   * @dev This function MUST return `bytes4(keccak256("isERC1155TokenReceiver()"))` (i.e. 0x0d912442).
   * This function MUST NOT consume more than 5,000 gas.
   * @return `bytes4(keccak256("isERC1155TokenReceiver()"))`
   */
  function isERC1155TokenReceiver() public view returns (bytes4) {
    return IS_ERC1155_RECEIVER;
  }

}