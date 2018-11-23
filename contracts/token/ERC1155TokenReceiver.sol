pragma solidity ^0.4.24;

/**
 * @dev ERC-1155 interface for accepting safe transfers.
 */
interface ERC1155TokenReceiver {

  /**
   * @dev Handle the receipt of multiple fungible tokens from an MFT contract. The ERCXXXX smart contract calls 
   * this function on the recipient after a `batchTransfer`. This function MAY throw to revert and reject the 
   * transfer. Return of other than the magic value MUST result in the transaction being reverted.
   * Returns `bytes4(keccak256("onERCXXXXBatchReceived(address,address,uint256[],uint256[],bytes)"))` unless throwing.
   * @notice The contract address is always the message sender. A wallet/broker/auction application
   * MUST implement the wallet interface if it will accept safe transfers.
   * @param _operator The address which called `safeTransferFrom` function.
   * @param _from The address from which the token was transfered from.
   * @param _types Array of types of token being transferred (where each type is represented as an ID)
   * @param _amounts Array of amount of object per type to be transferred.
   * @param _data Additional data with no specified format.
   */
  function onERC1155Received(
    address _operator,
    address _from,
    uint256[] _types,
    uint256[] _amounts,
    bytes _data
    )
    external
    returns(bytes4);
}