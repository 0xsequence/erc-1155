pragma solidity ^0.5.16;

interface IERC1155Meta {

  /****************************************|
  |                 Events                 |
  |_______________________________________*/

  // Will be emitted when the nonce of a user is changed
  event NonceChange(address indexed signer, uint256 newNonce);


  /****************************************|
  |     Public Meta Transfer Functions     |
  |_______________________________________*/

/**
 * @notice Allows anyone with a valid signature to transfer _amount amount of a token _id on the bahalf of _from
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
  address _from,
  address _to,
  uint256 _id,
  uint256 _amount,
  bool _isGasFee,
  bytes calldata _data)
external;


/**
 * @notice Allows anyone with a valid signature to transfer multiple types of tokens on the bahalf of _from
 * @param _from     Source addresses
 * @param _to       Target addresses
 * @param _ids      IDs of each token type
 * @param _amounts  Transfer amounts per token type
 * @param _data     Encodes a meta transfer indicator, signature, gas payment receipt and extra transfer data
 *   _data should be encoded as ((bytes32 r, bytes32 s, uint8 v, SignatureType sigType), (GasReceipt g, bytes data))
 *   i.e. high level encoding should be (bytes, bytes), where the latter bytes array is a nested bytes array
 */
function metaSafeBatchTransferFrom(
  address _from,
  address _to,
  uint256[] calldata _ids,
  uint256[] calldata _amounts,
  bool _isGasFee,
  bytes calldata _data)
external;


  /***********************************|
  |         Operator Functions        |
  |__________________________________*/

  /**
   * @notice Approve the passed address to spend on behalf of _from if valid signature is provided
   * @param _owner     Address that wants to set operator status  _spender
   * @param _operator  Address to add to the set of authorized operators
   * @param _approved  True if the operator is approved, false to revoke approval
   * @param _isGasFee  Whether gas will be reimbursed or not, with vlid signature
   * @param _data      Encodes signature and gas payment receipt
   *   _data should be encoded as ((bytes32 r, bytes32 s, uint8 v, SignatureType sigType), (GasReceipt g))
   *   i.e. high level encoding should be (bytes, bytes), where the latter bytes array is a nested bytes array
   */
  function metaSetApprovalForAll(
    address _owner,
    address _operator,
    bool _approved,
    bool _isGasFee,
    bytes calldata _data)
  external;
}
