pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "./ERC1155PackedBalance.sol";
import "../../utils/LibBytes.sol";
import "../../utils/SignatureValidator.sol";


/**
 * @dev ERC-1155 with native metatransaction methods. These additional functions allow users
 *      to presign function calls and allow third parties to execute these on their behalf.
 */
contract ERC1155MetaPackedBalance is ERC1155PackedBalance, SignatureValidator {
  using LibBytes for bytes;

  // Gas Receipt
  struct GasReceipt {
    uint256 gasLimit;             // Max amount of gas that can be reimbursed
    uint256 baseGas;              // Base gas cost (includes things like 21k, data encoding, etc.)
    uint256 gasPrice;             // Price denominated in token X per gas unit
    uint256 feeToken;             // Token to pay for gas as `uint256(tokenAddress)`, where 0x0 is MetaETH
    address payable feeRecipient; // Address to send payment to
  }

  /**
   * TO DO:
   *  - Split contract for better oganization
   *  - Review function descriptions
   *  - Review error messages in 1155
   *  - Signature 0x19 pre-fix?
   *  - EIP-712 encoding
   *
   * COULD DO:
   *  - Async nonces
   *  - Cancellable nonces
   *  - Support contract validator signature type
   */

  // Signature nonce per address
  mapping (address => uint256) internal nonces;

  // Meta transfer identifier (no gas reimbursement):
  //    bytes4(keccak256("metaSafeTransferFrom(address,address,uint256,uint256,bytes)"));
  bytes4 internal constant METATRANSFER_FLAG = 0xebc71fa5;

  // Meta transfer identifier (with gas reimbursement):
  //    bytes4(keccak256("metaSafeTransferFromWithGasReceipt(address,address,uint256,uint256,bytes)"));
  bytes4 internal constant METATRANSFER_WITHOUT_GAS_RECEIPT_FLAG = 0x3fed7708;



  /****************************************|
  |     Public Meta Transfer Functions     |
  |_______________________________________*/

  /**
   * @dev Allow anyone with a valid signature to transfer on the bahalf of _from
   * @param _from The address which you want to send tokens from
   * @param _to The address which you want to transfer to
   * @param _id Token id to update balance of - For this implementation, via `uint256(tokenAddress)`.
   * @param _value The amount of tokens of provided token ID to be transferred
   * @param _data Encodes a meta transfer indicator, signature, gas payment receipt and extra transfer data.
   *          _data should be encoded as (bytes4 METATRANSFER_FLAG, (bytes32 r, bytes32 s, uint8 v, SignatureType sigType), (GasReceipt g, bytes data))
   *            i.e. high level encoding should be (bytes4, bytes, bytes), where the latter bytes array is a nested bytes array
   *          METATRANSFER_FLAG should be 0xebc71fa5 for meta transfer with gas reimbursement
   *          METATRANSFER_FLAG should be 0x3fed7708 for meta transfer WITHOUT gas reimbursement (and hence without gasReceipt)
   */
  function safeTransferFrom(address _from, address _to, uint256 _id, uint256 _value, bytes memory _data)
    public
  {
    require(_to != address(0), "ERC1155Meta#safeTransferFrom: INVALID_RECIPIENT");

    // Starting gas value
    uint256 startGas = gasleft();

    if (_data.length < 4) {
      super.safeTransferFrom(_from, _to, _id, _value, _data);

    } else {
      // Get metatransaction tag
      bytes4 metaTag = _data.readBytes4(0);

      // Is NOT metaTransfer - (explicit check)
      if (metaTag != METATRANSFER_FLAG && metaTag != METATRANSFER_WITHOUT_GAS_RECEIPT_FLAG) {
        super.safeTransferFrom(_from, _to, _id, _value, _data);

      } else {
        bytes memory signedData;
        bytes memory transferData;
        GasReceipt memory gasReceipt;

        // If Gas receipt is being passed
        if (metaTag == METATRANSFER_FLAG) {
          signedData = _validateTransferSignature(_from, _to, _id, _value, _data);
          (gasReceipt, transferData) = abi.decode(signedData, (GasReceipt, bytes));

          _safeTransferFrom(_from, _to, _id, _value, transferData);
          _transferGasFee(_from, startGas, gasReceipt);

        } else {
          transferData = _validateTransferSignature(_from, _to, _id, _value, _data);
          _safeTransferFrom(_from, _to, _id, _value, transferData);
        }
      }
    }
  }

  /**
   * @dev transfer objects from different ids to specified address
   * @param _from The address to batchTransfer objects from.
   * @param _to The address to batchTransfer objects to.
   * @param _ids Array of ids to update balance of - For this implementation, via `uint256(tokenAddress)`
   * @param _values Array of amount of object per id to be transferred.
   * @param _data Encodes a meta transfer indicator, signature, gas payment receipt and extra transfer data.
   *          _data should be encoded as (bytes4 METATRANSFER_FLAG, (bytes32 r, bytes32 s, uint8 v, SignatureType sigType), (GasReceipt g, bytes data))
   *            i.e. high level encoding should be (bytes4, bytes, bytes), where the latter bytes array is a nested bytes array
   *            METATRANSFER_FLAG should be 0xebc71fa5 for meta transfer with gas reimbursement
   *            METATRANSFER_FLAG should be 0x3fed7708 for meta transfer WITHOUT gas reimbursement (and hence without gasReceipt)
   */
  function safeBatchTransferFrom(address _from, address _to, uint256[] memory _ids, uint256[] memory _values, bytes memory _data) 
    public 
  {
    // Requirements
    require(_to != address(0), "ERC1155Meta#safeBatchTransferFrom: INVALID_RECIPIENT");

    // Starting gas value
    uint256 startGas = gasleft();

    if (_data.length < 4) {
      super.safeBatchTransferFrom(_from, _to, _ids, _values, _data);

    } else {
      // Get metatransaction tag
      bytes4 metaTag = _data.readBytes4(0);

      // Is NOT metaTransfer - (explicit check)
      if (metaTag != METATRANSFER_FLAG && metaTag != METATRANSFER_WITHOUT_GAS_RECEIPT_FLAG) {
        super.safeBatchTransferFrom(_from, _to, _ids, _values, _data);
      
      } else {
        bytes memory signedData;
        bytes memory transferData;
        GasReceipt memory gasReceipt;

        // If Gas receipt is being passed
        if (metaTag == METATRANSFER_FLAG) {
          signedData = _validateBatchTransferSignature(_from, _to, _ids, _values, _data);
          (gasReceipt, transferData) = abi.decode(signedData, (GasReceipt, bytes));

          // Update balances
          _safeBatchTransferFrom(_from, _to, _ids, _values, transferData);
        
          // Handle gas reimbursement
          _transferGasFee(_from, startGas, gasReceipt);
        
        } else {
          transferData = _validateBatchTransferSignature(_from, _to, _ids, _values, _data);
          _safeBatchTransferFrom(_from, _to, _ids, _values, transferData);
        }
      }
    }
  }



  /****************************************|
  |      Signture Validation Functions     |
  |_______________________________________*/

  /**
   * @dev Verifies if a transfer signature is valid based on data
   * @param _from The address which you want to send tokens from
   * @param _to The address which you want to transfer to
   * @param _id Token id to update balance of - For this implementation, via `uint256(tokenAddress)`.
   * @param _value The amount of tokens of provided token ID to be transferred
   * @param _data Encodes a meta transfer indicator, signature, gas payment receipt and extra transfer data.
   *          _data should be encoded as (bytes4 METATRANSFER_FLAG, (bytes32 r, bytes32 s, uint8 v, SignatureType sigType), (GasReceipt g, bytes data))
   *            i.e. high level encoding should be (bytes4, bytes, bytes), where the latter bytes array is a nested bytes array
   */
  function _validateTransferSignature(
    address _from,
    address _to,
    uint256 _id,
    uint256 _value,
    bytes memory _data)
    internal returns (bytes memory signedData)
  { 
    // Get signature and data to sign
    (bytes4 tag, bytes memory sig, bytes memory signedData) = abi.decode(_data, (bytes4, bytes, bytes));

    // Get signer's currently available nonce
    uint256 nonce = nonces[_from];

    // Get data that formed the hash
    bytes memory data = abi.encodePacked(address(this), _from, _to, _id,  _value, nonce, signedData);

    // Verify if _from is the signer
    require(isValidSignature(_from, data, sig), "ERC1155Meta#_validateTransferSignature: INVALID_SIGNATURE");

    //Update signature nonce
    nonces[_from] += 1;

    return signedData;
  }


  /**
   * @dev Verifies if a transfer signature is valid based on data
   * @param _from The address to batchTransfer objects from.
   * @param _to The address to batchTransfer objects to.
   * @param _ids Array of ids to update balance of - For this implementation, via `uint256(tokenAddress)`
   * @param _values Array of amount of object per id to be transferred.
   * @param _data Encodes a meta transfer indicator, signature, gas payment receipt and extra transfer data.
   *          _data should be encoded as (bytes4 METATRANSFER_FLAG, (bytes32 r, bytes32 s, uint8 v, SignatureType sigType), (GasReceipt g, bytes data))
   *            i.e. high level encoding should be (bytes4, bytes, bytes), where the latter bytes array is a nested bytes array
   */
  function _validateBatchTransferSignature(
    address _from,
    address _to,
    uint256[] memory _ids, 
    uint256[] memory _values, 
    bytes memory _data)
    internal returns (bytes memory signedData)
  { 
    // Get signature and data to sign
    (bytes4 tag, bytes memory sig, bytes memory signedData) = abi.decode(_data, (bytes4, bytes, bytes));

    // Get signer's currently available nonce
    uint256 nonce = nonces[_from];

    // Get data that formed the hash
    bytes memory data = abi.encodePacked(address(this), _from, _to, _ids, _values, nonce, signedData);

    // Verify if _from is the signer
    require(isValidSignature(_from, data, sig), "ERC1155Meta#_validateBatchTransferSignature: INVALID_SIGNATURE");

    //Update signature nonce
    nonces[_from] += 1;

    return signedData;
  }


  /**
   * @dev Verifies is a signature is valid based on data
   * @param _owner Address that wants to set operator status  _spender.
   * @param _operator The address which will act as an operator for _owner.
   * @param _approved _operator"s new operator status (true or false).
   * @param _data Encodes signature and gas payment receipt
   *          _data should be encoded as ((bytes32 r, bytes32 s, uint8 v, SignatureType sigType), (GasReceipt g))
   *            i.e. high level encoding should be (bytes, bytes), where the latter bytes array is a nested bytes array
   */
  function _validateApprovalSignature(
    address _owner,
    address _operator,
    bool _approved,
    bytes memory _data)
    internal returns (bytes memory signedData)
  { 
    // Get signature and data to sign
    (bytes memory sig, bytes memory signedData) = abi.decode(_data, (bytes, bytes));

    // Get signer's currently available nonce
    uint256 nonce = nonces[_owner];

    // Get data that formed the hash
    bytes memory data = abi.encodePacked(address(this), _owner, _operator, _approved, nonce, signedData);

    // Verify if _owner is the signer
    require(isValidSignature(_owner, data, sig), "ERC1155Meta#_validateApprovalSignature: INVALID_SIGNATURE");

    //Update signature nonce
    nonces[_owner] += 1;

    return signedData;
  }


  /**
  * @dev Returns the current nonce associated with a given address
  * @param _signer Address to query signature nonce for
  */
  function getNonce(address _signer)
    external view returns (uint256 nonce)
  {
    return nonces[_signer];
  }



  /***********************************|
  |         Operator Functions        |
  |__________________________________*/

  /**
   * @dev Approve the passed address to spend on behalf of _from if valid signature is provided.
   * @param _owner Address that wants to set operator status  _spender.
   * @param _operator The address which will act as an operator for _owner.
   * @param _approved _operator"s new operator status (true or false).
   * @param _isGasReimbursed Whether gas will be reimbursed or not, with vlid signature
   * @param _data Encodes signature and gas payment receipt
   *          _data should be encoded as ((bytes32 r, bytes32 s, uint8 v, SignatureType sigType), (GasReceipt g))
   *            i.e. high level encoding should be (bytes, bytes), where the latter bytes array is a nested bytes array
   */
  function metaSetApprovalForAll(
    address _owner, 
    address _operator,  
    bool _approved,
    bool _isGasReimbursed,
    bytes memory _data)
    public
  { 
    // Starting gas value
    uint256 startGas = gasleft();
    GasReceipt memory gasReceipt;

    // If gas reimbursement or not
    if (_isGasReimbursed) {
      bytes memory signedData = _validateApprovalSignature(_owner, _operator, _approved, _data);
      gasReceipt = abi.decode(signedData, (GasReceipt));

    } else {
      _validateApprovalSignature(_owner, _operator, _approved, _data);
    }

    // Update operator status
    operators[_owner][_operator] = _approved;

    // Emit event
    emit ApprovalForAll(_owner, _operator, _approved);

    // Handle gas reimbursement
    if (_isGasReimbursed) {
      _transferGasFee(_owner, startGas, gasReceipt);
    }
  }

  /***********************************|
  |    Gas Reimbursement Functions   |
  |__________________________________*/


  function _transferGasFee(address _from, uint256 _startGas, GasReceipt memory g)
      internal
  {
    // Amount of gas consumed
    uint256 gasUsed = _startGas.sub(gasleft()).add(g.baseGas); 

    // Reimburse up to gasLimit (instead of throwing) 
    uint256 fee = gasUsed > g.gasLimit ? g.gasLimit.mul(g.gasPrice): gasUsed.mul(g.gasPrice);
     
    // If receiver is 0x0, then anyone can claim, otherwise, refund addresse provided
    address payable feeRecipient = g.feeRecipient == address(0) ? tx.origin : g.feeRecipient;

    // Paying back in MetaERC20
    _safeTransferFrom(_from, feeRecipient, g.feeToken, fee, ''); 
  }

}

