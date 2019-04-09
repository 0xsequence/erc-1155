pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "./ERC1155PackedBalance.sol";
import "../../interfaces/IERC1155.sol";
import "../../interfaces/IERC20.sol";
import "../../utils/LibBytes.sol";
import "../../utils/SignatureValidator.sol";


/**
 * @dev ERC-1155 with native metatransaction methods. These additional functions allow users
 *      to presign function calls and allow third parties to execute these on their behalf.
 */
contract ERC1155MetaPackedBalance is ERC1155PackedBalance, SignatureValidator {
  using LibBytes for bytes;


  /***********************************|
  |       Variables and Structs       |
  |__________________________________*/

  /* 
   * Gas Receipt  
   *   feeTokenData : (bool, address, ?unit256)
   *     1st element should be the address of the token
   *     2nd argument (if ERC-1155) should be the ID of the token 
   *     Last element should be a 0x0 if ERC-20 and 0x1 for ERC-1155
   */
  struct GasReceipt {
    uint256 gasLimit;             // Max amount of gas that can be reimbursed
    uint256 baseGas;              // Base gas cost (includes things like 21k, CALLDATA size, etc.)
    uint256 gasPrice;             // Price denominated in token X per gas unit
    address payable feeRecipient; // Address to send payment to
    bytes feeTokenData;           // Data for token to pay for gas as `uint256(tokenAddress)`
  }

  // Which token standard is used to pay gas fee
  enum FeeTokenType {
    ERC1155,    // 0x00, ERC-1155 token - DEFAULT
    ERC20,      // 0x01, ERC-20 token
    NTypes      // 0x02, number of signature types. Always leave at end.
  }

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
   * @notice Allows anyone with a valid signature to transfer _amount amount of a token _id on the bahalf of _from
   * @param _from    Source address
   * @param _to      Target address
   * @param _id      ID of the token type
   * @param _amount  Transfered amount
   * @param _data    Encodes a meta transfer indicator, signature, gas payment receipt and extra transfer data
   *   _data should be encoded as (bytes4 METATRANSFER_FLAG, (bytes32 r, bytes32 s, uint8 v, SignatureType sigType), (GasReceipt g, bytes data))
   *   i.e. high level encoding should be (bytes4, bytes, bytes), where the latter bytes array is a nested bytes array
   *   METATRANSFER_FLAG should be 0xebc71fa5 for meta transfer with gas reimbursement
   *   METATRANSFER_FLAG should be 0x3fed7708 for meta transfer WITHOUT gas reimbursement (and hence without gasReceipt)
   */
  function safeTransferFrom(address _from, address _to, uint256 _id, uint256 _amount, bytes memory _data)
    public
  {
    require(_to != address(0), "ERC1155Meta#safeTransferFrom: INVALID_RECIPIENT");

    // Starting gas amount
    uint256 startGas = gasleft();

    if (_data.length < 4) {
      super.safeTransferFrom(_from, _to, _id, _amount, _data);

    } else {
      // Get metatransaction tag
      bytes4 metaTag = _data.readBytes4(0);

      // Is NOT metaTransfer - (explicit check)
      if (metaTag != METATRANSFER_FLAG && metaTag != METATRANSFER_WITHOUT_GAS_RECEIPT_FLAG) {
        super.safeTransferFrom(_from, _to, _id, _amount, _data);

      } else {
        bytes memory signedData;
        bytes memory transferData;
        GasReceipt memory gasReceipt;

        // If Gas receipt is being passed
        if (metaTag == METATRANSFER_FLAG) {
          signedData = _validateTransferSignature(_from, _to, _id, _amount, _data);
          (gasReceipt, transferData) = abi.decode(signedData, (GasReceipt, bytes));

          _safeTransferFrom(_from, _to, _id, _amount, transferData);
          _transferGasFee(_from, startGas, gasReceipt);

        } else {
          transferData = _validateTransferSignature(_from, _to, _id, _amount, _data);
          _safeTransferFrom(_from, _to, _id, _amount, transferData);
        }
      }
    }
  }

  /**
   * @notice Allows anyone with a valid signature to transfer multiple types of tokens on the bahalf of _from
   * @param _from     Source addresses
   * @param _to       Target addresses
   * @param _ids      IDs of each token type
   * @param _amounts  Transfer amounts per token type
   * @param _data     Encodes a meta transfer indicator, signature, gas payment receipt and extra transfer data
   *   _data should be encoded as (bytes4 METATRANSFER_FLAG, (bytes32 r, bytes32 s, uint8 v, SignatureType sigType), (GasReceipt g, bytes data))
   *   i.e. high level encoding should be (bytes4, bytes, bytes), where the latter bytes array is a nested bytes array
   *   METATRANSFER_FLAG should be 0xebc71fa5 for meta transfer with gas reimbursement
   *   METATRANSFER_FLAG should be 0x3fed7708 for meta transfer WITHOUT gas reimbursement (and hence without gasReceipt)
   */
  function safeBatchTransferFrom(address _from, address _to, uint256[] memory _ids, uint256[] memory _amounts, bytes memory _data) 
    public 
  {
    require(_to != address(0), "ERC1155Meta#safeBatchTransferFrom: INVALID_RECIPIENT");

    // Starting gas amount
    uint256 startGas = gasleft();

    if (_data.length < 4) {
      super.safeBatchTransferFrom(_from, _to, _ids, _amounts, _data);

    } else {
      // Get metatransaction tag
      bytes4 metaTag = _data.readBytes4(0);

      // Is NOT metaTransfer - (explicit check)
      if (metaTag != METATRANSFER_FLAG && metaTag != METATRANSFER_WITHOUT_GAS_RECEIPT_FLAG) {
        super.safeBatchTransferFrom(_from, _to, _ids, _amounts, _data);
      
      } else {
        bytes memory signedData;
        bytes memory transferData;
        GasReceipt memory gasReceipt;

        // If Gas receipt is being passed
        if (metaTag == METATRANSFER_FLAG) {
          signedData = _validateBatchTransferSignature(_from, _to, _ids, _amounts, _data);
          (gasReceipt, transferData) = abi.decode(signedData, (GasReceipt, bytes));

          // Update balances
          _safeBatchTransferFrom(_from, _to, _ids, _amounts, transferData);
        
          // Handle gas reimbursement
          _transferGasFee(_from, startGas, gasReceipt);
        
        } else {
          transferData = _validateBatchTransferSignature(_from, _to, _ids, _amounts, _data);
          _safeBatchTransferFrom(_from, _to, _ids, _amounts, transferData);
        }
      }
    }
  }


  /***********************************|
  |         Operator Functions        |
  |__________________________________*/

  /**
   * @notice Approve the passed address to spend on behalf of _from if valid signature is provided
   * @param _owner            Address that wants to set operator status  _spender
   * @param _operator         Address to add to the set of authorized operators
   * @param _approved         True if the operator is approved, false to revoke approval
   * @param _isGasReimbursed  Whether gas will be reimbursed or not, with vlid signature
   * @param _data             Encodes signature and gas payment receipt
   *   _data should be encoded as ((bytes32 r, bytes32 s, uint8 v, SignatureType sigType), (GasReceipt g))
   *   i.e. high level encoding should be (bytes, bytes), where the latter bytes array is a nested bytes array
   */
  function metaSetApprovalForAll(
    address _owner, 
    address _operator,  
    bool _approved,
    bool _isGasReimbursed,
    bytes memory _data)
    public
  { 
    // Starting gas amount
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


  /****************************************|
  |      Signture Validation Functions     |
  |_______________________________________*/

  /**
   * @notice Verifies if a transfer signature is valid based on data and update nonce
   * @param _from    Source address
   * @param _to      Target address
   * @param _id      ID of the token type
   * @param _amount  Transfered amount
   * @param _data    Encodes a meta transfer indicator, signature, gas payment receipt and extra transfer data
   *   _data should be encoded as (bytes4 METATRANSFER_FLAG, (bytes32 r, bytes32 s, uint8 v, SignatureType sigType), (GasReceipt g, bytes data))
   *   i.e. high level encoding should be (bytes4, bytes, bytes), where the latter bytes array is a nested bytes array
   */
  function _validateTransferSignature(
    address _from,
    address _to,
    uint256 _id,
    uint256 _amount,
    bytes memory _data)
    internal returns (bytes memory signedData)
  { 
    bytes4 tag;
    bytes memory sig;

    // Get signature and data to sign
    (tag, sig, signedData) = abi.decode(_data, (bytes4, bytes, bytes));

    // Get signer's currently available nonce
    uint256 nonce = nonces[_from];

    // Get data that formed the hash
    bytes memory data = abi.encodePacked(address(this), _from, _to, _id,  _amount, nonce, signedData);

    // Verify if _from is the signer
    require(isValidSignature(_from, data, sig), "ERC1155Meta#_validateTransferSignature: INVALID_SIGNATURE");

    //Update signature nonce
    nonces[_from] += 1;

    return signedData;
  }

  /**
   * @notice Verifies if a batch transfer signature is valid based on data and update nonce
   * @param _from     Source addresses
   * @param _to       Target addresses
   * @param _ids      IDs of each token type
   * @param _amounts  Transfer amounts per token type
   * @param _data     Encodes a meta transfer indicator, signature, gas payment receipt and extra transfer data
   *   _data should be encoded as (bytes4 METATRANSFER_FLAG, (bytes32 r, bytes32 s, uint8 v, SignatureType sigType), (GasReceipt g, bytes data))
   *   i.e. high level encoding should be (bytes4, bytes, bytes), where the latter bytes array is a nested bytes array
   */
  function _validateBatchTransferSignature(
    address _from,
    address _to,
    uint256[] memory _ids, 
    uint256[] memory _amounts, 
    bytes memory _data)
    internal returns (bytes memory signedData)
  { 
    bytes4 tag;
    bytes memory sig;

    // Get signature and data to sign
    (tag, sig, signedData) = abi.decode(_data, (bytes4, bytes, bytes));

    // Get signer's currently available nonce
    uint256 nonce = nonces[_from];

    // Get data that formed the hash
    bytes memory data = abi.encodePacked(address(this), _from, _to, _ids, _amounts, nonce, signedData);

    // Verify if _from is the signer
    require(isValidSignature(_from, data, sig), "ERC1155Meta#_validateBatchTransferSignature: INVALID_SIGNATURE");

    //Update signature nonce
    nonces[_from] += 1;

    return signedData;
  }

  /**
   * @notice Verifies if an approval is a signature is valid based on data and update nonce
   * @param _owner     Address that wants to set operator status  _spender
   * @param _operator  Address to add to the set of authorized operators
   * @param _approved  True if the operator is approved, false to revoke approval
   * @param _data      Encodes signature and gas payment receipt
   *   _data should be encoded as ((bytes32 r, bytes32 s, uint8 v, SignatureType sigType), (GasReceipt g))
   *   i.e. high level encoding should be (bytes, bytes), where the latter bytes array is a nested bytes array
   */
  function _validateApprovalSignature(
    address _owner,
    address _operator,
    bool _approved,
    bytes memory _data)
    internal returns (bytes memory signedData)
  { 
    bytes memory sig;

    // Get signature and data to sign
    (sig, signedData) = abi.decode(_data, (bytes, bytes));

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
   * @notice Returns the current nonce associated with a given address
   * @param _signer Address to query signature nonce for
   */
  function getNonce(address _signer)
    external view returns (uint256 nonce)
  {
    return nonces[_signer];
  }


  /***********************************|
  |    Gas Reimbursement Functions   |
  |__________________________________*/

  /**
   * @notice Will reimburse tx.origin or fee recipient for the gas spent execution a transaction
   *         Can reimbuse in any ERC-20 or ERC-1155 token   
   * @param _from      Address from which the payment will be made from
   * @param _startGas  The gas amount left when gas counter started
   * @param _g         GasReceipt object that contains gas reimbursement information
   */
  function _transferGasFee(address _from, uint256 _startGas, GasReceipt memory _g)
      internal
  {
    // Pop last byte to get token fee type
    uint8 feeTokenTypeRaw = uint8(_g.feeTokenData.popLastByte());

    // Ensure valid fee token type
    require(
      feeTokenTypeRaw < uint8(FeeTokenType.NTypes), 
      "ERC1155Meta#_transferGasFee: UNSUPPORTED_TOKEN"
    );

    // Convert to FeeTokenType corresponding value
    FeeTokenType feeTokenType = FeeTokenType(feeTokenTypeRaw);

    // Declarations
    address tokenAddress;
    address payable feeRecipient;
    uint256 gasUsed;
    uint256 tokenID;
    uint256 fee;

    // Amount of gas consumed
    gasUsed = _startGas.sub(gasleft()).add(_g.baseGas); 

    // Reimburse up to gasLimit (instead of throwing) 
    fee = gasUsed > _g.gasLimit ? _g.gasLimit.mul(_g.gasPrice): gasUsed.mul(_g.gasPrice);
     
    // If receiver is 0x0, then anyone can claim, otherwise, refund addresse provided
    feeRecipient = _g.feeRecipient == address(0) ? tx.origin : _g.feeRecipient;

    // Fee token is ERC1155
    if (feeTokenType == FeeTokenType.ERC1155 ) {
      (tokenAddress, tokenID) = abi.decode(_g.feeTokenData, (address, uint256));

      // Fee is paid from this ERC1155 contract
      if (tokenAddress == address(this)){
        _safeTransferFrom(_from, feeRecipient, tokenID, fee, ""); 
      
      // Fee is paid from another ERC-1155 contract
      } else {
        IERC1155(tokenAddress).safeTransferFrom(_from, feeRecipient, tokenID, fee, "");
      }
    
    // Fee token is ERC20
    } else {
      tokenAddress = abi.decode(_g.feeTokenData, (address));
      require(
        IERC20(tokenAddress).transferFrom(_from, feeRecipient, fee), 
        "ERC1155Meta#_transferGasFee: ERC20_TRANSFER_FAILED"
      );
    } 

  }
}