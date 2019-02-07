pragma solidity ^0.5.0;


// Contract to test safe transfer behavior.
contract ERC1155ReceiverMock {
  bytes4 constant public ERC1155_RECEIVED_SIG = 0xf23a6e61;
  bytes4 constant public ERC1155_BATCH_RECEIVED_SIG = 0xbc197c81;
  bytes4 constant public ERC1155_RECEIVED_INVALID = 0xdeadbeef; 

  // Keep values from last received contract.
  bool public shouldReject;

  bytes public lastData;
  address public lastOperator;
  uint256 public lastId;
  uint256 public lastValue;

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
  function onERC1155Received(address _operator, address _from, uint256 _id, uint256 _value, bytes calldata _data ) 
    external view returns(bytes4) 
  {   
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
  function onERC1155BatchReceived(address _operator, address _from, uint256[] calldata _ids, uint256[] calldata _values, bytes calldata _data) 
    external view returns(bytes4)
  {
    if (shouldReject == true) {
      return ERC1155_RECEIVED_INVALID; // Some random value
    } else {
      return ERC1155_BATCH_RECEIVED_SIG;
    }
  }

}