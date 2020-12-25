// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.7.4;
import "../interfaces/IERC1155.sol";
import "../interfaces/IERC1155Meta.sol";


/**
 * @dev Contract that acts as an operator contract.
 */
contract ERC1155OperatorMock {

  /****************************************|
  |   Public Regular Transfer Functions    |
  |_______________________________________*/

  /**
   * @dev Allow _from or an operator to transfer tokens from one address to another
   * @param _tokenAddress The address of the token contract to call
   * @param _from The address which you want to send tokens from
   * @param _to The address which you want to transfer to
   * @param _id token id to update balance of
   * @param _amount The amount of tokens of provided token ID to be transferred
   * @param _data Data to pass to onERC1155Received() function if recipient is contract
   */
  function safeTransferFrom(
    address _tokenAddress,
    address _from,
    address _to,
    uint256 _id,
    uint256 _amount,
    bytes memory _data)
    public
  {
    IERC1155(_tokenAddress).safeTransferFrom(_from, _to, _id, _amount, _data);
  }

  /**
   * @dev transfer objects from different ids to specified address
   * @param _tokenAddress The address of the token contract to call
   * @param _from The address to batchTransfer objects from.
   * @param _to The address to batchTransfer objects to.
   * @param _ids Array of ids to update balance of
   * @param _amounts Array of amount of object per id to be transferred.
   * @param _data Data to pass to onERC1155Received() function if recipient is contract
   * Note:  Arrays should be sorted so that all ids in a same bin are adjacent (more efficient).
   */
  function safeBatchTransferFrom(
    address _tokenAddress,
    address _from,
    address _to,
    uint256[] memory _ids,
    uint256[] memory _amounts,
    bytes memory _data)
    public
  {
    IERC1155(_tokenAddress).safeBatchTransferFrom(_from, _to, _ids, _amounts, _data);
  }

  /****************************************|
  |     Public Meta Transfer Functions     |
  |_______________________________________*/

  /**
   * @notice Allows anyone with a valid signature to transfer _amount amount of a token _id on the bahalf of _from
   * @param _tokenAddress The address of the token contract to call
   * @param _from     Source address
   * @param _to       Target address
   * @param _id       ID of the token type
   * @param _amount   Transfered amount
   * @param _isGasFee Whether gas is reimbursed to executor or not
   * @param _data     Encodes a meta transfer indicator, signature, gas payment receipt and extra transfer data
   *   _data should be encoded as ((bytes32 r, bytes32 s, uint8 v, SignatureType sigType), (GasReceipt g, bytes data))
   *   i.e. high level encoding should be (bytes, bytes), where the latter bytes array is a nested bytes array
   */
  function metaSafeTransferFrom(
    address _tokenAddress,
    address _from,
    address _to,
    uint256 _id,
    uint256 _amount,
    bool _isGasFee,
    bytes memory _data)
    public
  {
    IERC1155Meta(_tokenAddress).metaSafeTransferFrom(_from, _to, _id, _amount, _isGasFee, _data);
  }


  /**
   * @notice Allows anyone with a valid signature to transfer multiple types of tokens on the bahalf of _from
   * @param _tokenAddress The address of the token contract to call
   * @param _from     Source addresses
   * @param _to       Target addresses
   * @param _ids      IDs of each token type
   * @param _amounts  Transfer amounts per token type
   * @param _data     Encodes a meta transfer indicator, signature, gas payment receipt and extra transfer data
   *   _data should be encoded as ((bytes32 r, bytes32 s, uint8 v, SignatureType sigType), (GasReceipt g, bytes data))
   *   i.e. high level encoding should be (bytes, bytes), where the latter bytes array is a nested bytes array
   */
  function metaSafeBatchTransferFrom(
    address _tokenAddress,
    address _from,
    address _to,
    uint256[] memory _ids,
    uint256[] memory _amounts,
    bool _isGasFee,
    bytes memory _data)
    public
  {
    IERC1155Meta(_tokenAddress).metaSafeBatchTransferFrom(_from, _to, _ids, _amounts, _isGasFee, _data);
  }


  /***********************************|
  |         Operator Functions        |
  |__________________________________*/

  /**
   * @notice Approve the passed address to spend on behalf of _from if valid signature is provided
   * @param _tokenAddress The address of the token contract to call
   * @param _owner     Address that wants to set operator status  _spender
   * @param _operator  Address to add to the set of authorized operators
   * @param _approved  True if the operator is approved, false to revoke approval
   * @param _isGasFee  Whether gas will be reimbursed or not, with vlid signature
   * @param _data      Encodes signature and gas payment receipt
   *   _data should be encoded as ((bytes32 r, bytes32 s, uint8 v, SignatureType sigType), (GasReceipt g))
   *   i.e. high level encoding should be (bytes, bytes), where the latter bytes array is a nested bytes array
   */
  function metaSetApprovalForAll(
    address _tokenAddress,
    address _owner,
    address _operator,
    bool _approved,
    bool _isGasFee,
    bytes memory _data)
    public
  {
    IERC1155Meta(_tokenAddress).metaSetApprovalForAll(_owner, _operator, _approved, _isGasFee, _data);
  }
}
