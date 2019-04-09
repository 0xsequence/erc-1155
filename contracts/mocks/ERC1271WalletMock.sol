pragma solidity ^0.5.0;

import "../interfaces/IERC1271Wallet.sol";


// Contract to test safe transfer behavior.
contract ERC1271WalletMock is IERC1271Wallet {
  bytes4 constant public ERC1271_MAGIC_VAL = 0x20c13b0b;
  bytes4 constant public ERC1271_INVALID = 0x0; 

  // Keep values from last received contract.
  bool public shouldReject;

  // Set rejection to true by default
  constructor () public {
    shouldReject = true;
  }

  function setShouldReject(bool _value) public {
    shouldReject = _value;
  }

  /**
   * @dev Should return whether the signature provided is valid for the provided data
   * @param _data Arbitrary length data signed on the behalf of address(this)
   * @param _signature Signature byte array associated with _data
   *
   * MUST return the bytes4 magic value 0x20c13b0b when function passes.
   * MUST NOT modify state (using STATICCALL for solc < 0.5, view modifier for solc > 0.5)
   */ 
  function isValidSignature(
    bytes calldata _data, 
    bytes calldata _signature)
    external
    view 
    returns (bytes4 magicValue)
  {
    magicValue = shouldReject ? ERC1271_INVALID : ERC1271_MAGIC_VAL;
    return magicValue;
  }


  /**
   * @dev Should return whether the signature provided is valid for the provided hash
   * @param _hash keccak256 hash that was signed
   * @param _signature Signature byte array associated with _data
   *
   * MUST return the bytes4 magic value 0x20c13b0b when function passes.
   * MUST NOT modify state (using STATICCALL for solc < 0.5, view modifier for solc > 0.5)
   */ 
  function isValidSignature(
    bytes32 _hash, 
    bytes calldata _signature)
    external
    view 
    returns (bytes4 magicValue)
  { 
    magicValue = shouldReject ? ERC1271_INVALID : ERC1271_MAGIC_VAL;
    return magicValue;
  }

}