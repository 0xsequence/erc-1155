// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.7.4;

import "../interfaces/IERC1155.sol";


// Contract to test safe transfer behavior.
contract ERC1155ReceiverMock {

  /***********************************|
  |        Variables and Events       |
  |__________________________________*/

  bytes4 constant internal ERC1155_RECEIVED_SIG = 0xf23a6e61;
  bytes4 constant internal ERC1155_BATCH_RECEIVED_SIG = 0xbc197c81;
  bytes4 constant internal ERC1155_RECEIVED_INVALID = 0xdeadbeef;
  bytes4 constant internal IS_ERC1155_RECEIVER = 0x0d912442; //bytes4(keccak256("isERC1155TokenReceiver()"));

  // Keep values from last received contract.
  bool public shouldReject;

  bytes public lastData;
  address public lastOperator;
  uint256 public lastId;
  uint256 public lastValue;

  //Debug event
  event TransferSingleReceiver(address _from, address _to, uint256 _fromBalance, uint256 _toBalance);
  event TransferBatchReceiver(address _from, address _to, uint256[] _fromBalances, uint256[] _toBalances);


  /***********************************|
  |         OnReceive Functions       |
  |__________________________________*/

  /**
   * @notice Handle the receipt of a single ERC1155 token type.
   * @dev An ERC1155-compliant smart contract MUST call this function on the token recipient contract, at the end of a `safeTransferFrom` after the balance has been updated.
   * This function MAY throw to revert and reject the transfer.
   * Return of other than the magic value MUST result in the transaction being reverted.
   * Note: The contract address is always the message sender.
   * @param _from      The address which previously owned the token
   * @param _id        The id of the token being transferred
   * @param _data      Additional data with no specified format
   * @return           `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))`
   */
  function onERC1155Received(address, address _from, uint256 _id, uint256, bytes memory _data)
    public returns(bytes4)
  {
    // To check the following conditions;
    //   All the balances in the transfer MUST have been updated to match the senders intent before any hook is called on a recipient.
    //   All the transfer events for the transfer MUST have been emitted to reflect the balance changes before any hook is called on a recipient.
    //   If data is passed, must be specific
    uint256 fromBalance = IERC1155(msg.sender).balanceOf(_from, _id);
    uint256 toBalance = IERC1155(msg.sender).balanceOf(address(this), _id);
    emit TransferSingleReceiver(_from, address(this), fromBalance, toBalance);

    if (_data.length != 0) {
      require(
        keccak256(_data) == keccak256(abi.encodePacked("Hello from the other side")),
        "ERC1155ReceiverMock#onERC1155Received: UNEXPECTED_DATA"
      );
    }

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
   * @param _from      The address which previously owned the token
   * @param _ids       An array containing ids of each token being transferred
   * @param _data      Additional data with no specified format
   * @return           `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))`
   */
  function onERC1155BatchReceived(address, address _from, uint256[] memory _ids, uint256[] memory, bytes memory _data)
    public returns(bytes4)
  {
    // To check the following conditions;
    //   All the balances in the transfer MUST have been updated to match the senders intent before any hook is called on a recipient.
    //   All the transfer events for the transfer MUST have been emitted to reflect the balance changes before any hook is called on a recipient.
    //   If data is passed, must be specific
    address[] memory fromAddressArray = new address[](_ids.length);
    address[] memory toAddressArray = new address[](_ids.length);
    for (uint i = 0; i < _ids.length; i++ ) {
      fromAddressArray[i] = _from;
      toAddressArray[i] = (address(this));
    }
    uint256[] memory fromBalances = IERC1155(msg.sender).balanceOfBatch(fromAddressArray, _ids);
    uint256[] memory toBalances = IERC1155(msg.sender).balanceOfBatch(toAddressArray, _ids);
    emit TransferBatchReceiver(_from, address(this), fromBalances, toBalances);

    if (_data.length != 0) {
      require(
        keccak256(_data) == keccak256(abi.encodePacked("Hello from the other side")),
        "ERC1155ReceiverMock#onERC1155Received: UNEXPECTED_DATA");
    }

    if (shouldReject == true) {
      return ERC1155_RECEIVED_INVALID; // Some random value
    } else {
      return ERC1155_BATCH_RECEIVED_SIG;
    }
  }

  /***********************************|
  |          ERC165 Functions         |
  |__________________________________*/

  /**
   * @notice Indicates whether a contract implements the `ERC1155TokenReceiver` functions and so can accept ERC1155 token types.
   * @param  interfaceID The ERC-165 interface ID that is queried for support.s
   * @dev This function MUST return true if it implements the ERC1155TokenReceiver interface and ERC-165 interface.
   *      This function MUST NOT consume more than 5,000 gas.
   * @return Wheter ERC-165 or ERC1155TokenReceiver interfaces are supported.
   */
  function supportsInterface(bytes4 interfaceID) external view returns (bool) {
    return  interfaceID == 0x01ffc9a7 || // ERC-165 support (i.e. `bytes4(keccak256('supportsInterface(bytes4)'))`).
      interfaceID == 0x4e2312e0;         // ERC-1155 `ERC1155TokenReceiver` support
  }

  function setShouldReject(bool _value) public {
    shouldReject = _value;
  }
}
