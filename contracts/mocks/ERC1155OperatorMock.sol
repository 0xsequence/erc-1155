pragma solidity ^0.5.0;

import "../interfaces/IERC1155.sol";


/** 
 * @dev Contract that acts as an operator contract.
 */
contract ERC1155OperatorMock {

  /**
   * @dev Allow _from or an operator to transfer tokens from one address to another
   * @param _tokenAddress The address of the token contract to call
   * @param _from The address which you want to send tokens from
   * @param _to The address which you want to transfer to
   * @param _id token id to update balance of 
   * @param _value The amount of tokens of provided token ID to be transferred
   * @param _data Data to pass to onERC1155Received() function if recipient is contract
   */
  function safeTransferFrom(
    address _tokenAddress, 
    address _from, 
    address _to, 
    uint256 _id, 
    uint256 _value, 
    bytes memory _data) 
    public 
  {  
    IERC1155(_tokenAddress).safeTransferFrom(_from, _to, _id, _value, _data);
  }

  /**
   * @dev transfer objects from different ids to specified address
   * @param _tokenAddress The address of the token contract to call
   * @param _from The address to batchTransfer objects from.
   * @param _to The address to batchTransfer objects to.
   * @param _ids Array of ids to update balance of
   * @param _values Array of amount of object per id to be transferred.
   * @param _data Data to pass to onERC1155Received() function if recipient is contract
   * Note:  Arrays should be sorted so that all ids in a same bin are adjacent (more efficient).
   */
  function safeBatchTransferFrom(
    address _tokenAddress, 
    address _from, 
    address _to, 
    uint256[] memory _ids, 
    uint256[] memory _values, 
    bytes memory _data) 
    public 
  {
    IERC1155(_tokenAddress).safeBatchTransferFrom(_from, _to, _ids, _values, _data);
  }

}