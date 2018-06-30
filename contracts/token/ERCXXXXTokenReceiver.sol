pragma solidity ^0.4.24;

/**
 * @dev ERC-XXXX interface for accepting safe transfers.
 */
interface ERCXXXXTokenReceiver {

  /**
  * @dev Handle the receipt of a MFT. The ERCXXXX smart contract calls this function on the
  * recipient after a `transfer`. This function MAY throw to revert and reject the transfer. Return
  * of other than the magic value MUST result in the transaction being reverted.
  * Returns `bytes4(keccak256("onERCXXXXReceived(address,address,uint256,uint256,bytes)"))` unless throwing.
  * @notice The contract address is always the message sender. A wallet/broker/auction application
  * MUST implement the wallet interface if it will accept safe transfers.
  * @param _operator The address which called `safeTransferFrom` function.
  * @param _from The address from which the token was transfered from.
  * @param _type The type of token being transfered (where each type is represented as an ID)
  * @param _amount The amount of token of a given type that was transfered.
  * @param _data Additional data with no specified format.
  */
  function onERCXXXXReceived(
    address _operator,
    address _from,
    uint256 _type,
    uint256 _amount,
    bytes _data 
    ) 
    external 
    returns(bytes4);

  /**
  * @dev Handle the receipt of a MFT. The ERCXXXX smart contract calls this function on the
  * recipient after a `batchTransfer`. This function MAY throw to revert and reject the transfer. Return
  * of other than the magic value MUST result in the transaction being reverted.
  * Returns `bytes4(keccak256("onERCXXXXBatchReceived(address,address,uint256[],uint256[],bytes)"))` unless throwing.
  * @notice The contract address is always the message sender. A wallet/broker/auction application
  * MUST implement the wallet interface if it will accept safe transfers.
  * @param _operator The address which called `safeTransferFrom` function.
  * @param _from The address from which the token was transfered from.
  * @param _types Array of types of token being transfered (where each type is represented as an ID)
  * @param _amounts Array containing the amount of token of each token type that was transfered.
  * @param _data Additional data with no specified format.
  */
  function onERCXXXXBatchReceived(
    address _operator,
    address _from,
    uint256[] _types,
    uint256[] _amounts,
    bytes _data 
    ) 
    external
    returns(bytes4);
    
}