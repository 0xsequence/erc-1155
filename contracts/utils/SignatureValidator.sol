pragma solidity 0.7.4;

import "../interfaces/IERC1271Wallet.sol";
import "./LibBytes.sol";
import "./LibEIP712.sol";


/**
 * @dev Contains logic for signature validation.
 * Signatures from wallet contracts assume ERC-1271 support (https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1271.md)
 * Notes: Methods are strongly inspired by contracts in https://github.com/0xProject/0x-monorepo/blob/development/
 */
contract SignatureValidator is LibEIP712 {
  using LibBytes for bytes;

  /***********************************|
  |             Variables             |
  |__________________________________*/

  // bytes4(keccak256("isValidSignature(bytes,bytes)"))
  bytes4 constant internal ERC1271_MAGICVALUE = 0x20c13b0b;

  // bytes4(keccak256("isValidSignature(bytes32,bytes)"))
  bytes4 constant internal ERC1271_MAGICVALUE_BYTES32 = 0x1626ba7e;

  // Allowed signature types.
  enum SignatureType {
    Illegal,         // 0x00, default value
    EIP712,          // 0x01
    EthSign,         // 0x02
    WalletBytes,     // 0x03 To call isValidSignature(bytes, bytes) on wallet contract
    WalletBytes32,   // 0x04 To call isValidSignature(bytes32, bytes) on wallet contract
    NSignatureTypes  // 0x05, number of signature types. Always leave at end.
  }


  /***********************************|
  |        Signature Functions        |
  |__________________________________*/

  /**
   * @dev Verifies that a hash has been signed by the given signer.
   * @param _signerAddress  Address that should have signed the given hash.
   * @param _hash           Hash of the EIP-712 encoded data
   * @param _data           Full EIP-712 data structure that was hashed and signed
   * @param _sig            Proof that the hash has been signed by signer.
   *      For non wallet signatures, _sig is expected to be an array tightly encoded as
   *      (bytes32 r, bytes32 s, uint8 v, uint256 nonce, SignatureType sigType)
   * @return isValid True if the address recovered from the provided signature matches the input signer address.
   */
  function isValidSignature(
    address _signerAddress,
    bytes32 _hash,
    bytes memory _data,
    bytes memory _sig
  )
    public
    view
    returns (bool isValid)
  {
    require(
      _sig.length > 0,
      "SignatureValidator#isValidSignature: LENGTH_GREATER_THAN_0_REQUIRED"
    );

    require(
      _signerAddress != address(0x0),
      "SignatureValidator#isValidSignature: INVALID_SIGNER"
    );

    // Pop last byte off of signature byte array.
    uint8 signatureTypeRaw = uint8(_sig.popLastByte());

    // Ensure signature is supported
    require(
      signatureTypeRaw < uint8(SignatureType.NSignatureTypes),
      "SignatureValidator#isValidSignature: UNSUPPORTED_SIGNATURE"
    );

    // Extract signature type
    SignatureType signatureType = SignatureType(signatureTypeRaw);

    // Variables are not scoped in Solidity.
    uint8 v;
    bytes32 r;
    bytes32 s;
    address recovered;

    // Always illegal signature.
    // This is always an implicit option since a signer can create a
    // signature array with invalid type or length. We may as well make
    // it an explicit option. This aids testing and analysis. It is
    // also the initialization value for the enum type.
    if (signatureType == SignatureType.Illegal) {
      revert("SignatureValidator#isValidSignature: ILLEGAL_SIGNATURE");


    // Signature using EIP712
    } else if (signatureType == SignatureType.EIP712) {
      require(
        _sig.length == 97,
        "SignatureValidator#isValidSignature: LENGTH_97_REQUIRED"
      );
      r = _sig.readBytes32(0);
      s = _sig.readBytes32(32);
      v = uint8(_sig[64]);
      recovered = ecrecover(_hash, v, r, s);
      isValid = _signerAddress == recovered;
      return isValid;


    // Signed using web3.eth_sign() or Ethers wallet.signMessage()
    } else if (signatureType == SignatureType.EthSign) {
      require(
        _sig.length == 97,
        "SignatureValidator#isValidSignature: LENGTH_97_REQUIRED"
      );
      r = _sig.readBytes32(0);
      s = _sig.readBytes32(32);
      v = uint8(_sig[64]);
      recovered = ecrecover(
        keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _hash)),
        v,
        r,
        s
      );
      isValid = _signerAddress == recovered;
      return isValid;


    // Signature verified by wallet contract with data validation.
    } else if (signatureType == SignatureType.WalletBytes) {
      isValid = ERC1271_MAGICVALUE == IERC1271Wallet(_signerAddress).isValidSignature(_data, _sig);
      return isValid;


    // Signature verified by wallet contract without data validation.
    } else if (signatureType == SignatureType.WalletBytes32) {
      isValid = ERC1271_MAGICVALUE_BYTES32 == IERC1271Wallet(_signerAddress).isValidSignature(_hash, _sig);
      return isValid;
    }

    // Anything else is illegal (We do not return false because
    // the signature may actually be valid, just not in a format
    // that we currently support. In this case returning false
    // may lead the caller to incorrectly believe that the
    // signature was invalid.)
    revert("SignatureValidator#isValidSignature: UNSUPPORTED_SIGNATURE");
  }
}
