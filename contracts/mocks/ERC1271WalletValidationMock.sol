// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.7.4;

import "../interfaces/IERC1271Wallet.sol";
import "../utils/LibBytes.sol";


// Constructor of this LibEIP712 takes domain hash of mock ERC-1155
contract LibEIP712 {

  /***********************************|
  |             Variables             |
  |__________________________________*/

  // keccak256(
  //   "EIP712Domain(address verifyingContract)"
  // );
  bytes32 internal constant DOMAIN_SEPARATOR_TYPEHASH = 0x035aff83d86937d35b32e04f0ddc6ff469290eef2f1b692d8a815c89404d4749;

  // EIP-191 Header
  string constant internal EIP191_HEADER = "\x19\x01";

  // Domain seperator created in constructor
  bytes32 internal EIP712_DOMAIN_HASH;

  // Instantiate EIP712_DOMAIN_HASH
  constructor (bytes32 domain_hash_1155)
    public
  {
    EIP712_DOMAIN_HASH = domain_hash_1155;
  }


  /***********************************|
  |              EIP-712              |
  |__________________________________*/

  /**
   * @dev Calculates EIP712 encoding for a hash struct in this EIP712 Domain.
   * @param hashStruct The EIP712 hash struct.
   * @return result EIP712 hash applied to this EIP712 Domain.
   */
  function hashEIP712Message(bytes32 hashStruct)
      internal
      view
      returns (bytes32 result)
  {
    return keccak256(
      abi.encodePacked(
        EIP191_HEADER,
        EIP712_DOMAIN_HASH,
        hashStruct
    ));
  }
}


// Contract to test safe transfer behavior and verify content of signed meta-tx
// Will actively check the signature
contract ERC1271WalletValidationMock is LibEIP712 {
  using LibBytes for bytes;

  /***********************************|
  |             Variables             |
  |__________________________________*/

  bytes4 constant public ERC1271_MAGIC_VAL = 0x20c13b0b;
  bytes4 constant public ERC1271_MAGICVALUE_BYTES32 = 0x1626ba7e;
  bytes4 constant public ERC1271_INVALID = 0xdeadbeef;

  address public owner;

  // keccak256(
  //   "metaSafeTransferFrom(address,address,uint256,uint256,bool,bytes)"
  // );
  bytes32 internal constant META_TX_TYPEHASH = 0xce0b514b3931bdbe4d5d44e4f035afe7113767b7db71949271f6a62d9c60f558;
  

  /***********************************|
  |            Constructor            |
  |__________________________________*/

  // Set rejection to true by default
  constructor (bytes32 domain_hash_1155) public LibEIP712(domain_hash_1155) {
    owner = msg.sender;
  }


  /***********************************|
  |        Signature Validation       |
  |__________________________________*/

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
    // Get bytes32 of what data represents
    bytes32 data_signature = _data.readBytes32(0);
    bytes32 signedHash;
    bytes memory data;
    bytes memory signedData;

    // Check if amount is less than 100
    // Check if ID is 66
    // Need to read last bytes array to hash it for EIP-712 hashstruct
    if (data_signature == META_TX_TYPEHASH) {

      // Get data without last byte array
      data = slice(_data, 0, 0xe0);

      // Get amount and ID
      uint256 id = uint256(data.readBytes32(0x60));
      uint256 amount = uint256(data.readBytes32(0x80));

      // Check requirements
      if (id != 66 || amount > 100) {
        return ERC1271_INVALID;
      }

      // Get byte array
      signedData = slice(_data, 0xe0, _data.length);

      // Get hash struct
      signedHash = hashEIP712Message(
        keccak256(
          abi.encodePacked(
            data,
            keccak256(signedData)
          )
        )
      );

    } else {
      signedHash = keccak256(_data);
    }

    bytes32 r = _signature.readBytes32(0);
    bytes32 s = _signature.readBytes32(32);
    uint8 v = uint8(_signature[64]);
    address recovered = ecrecover(
      keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", signedHash)),
      v,
      r,
      s
    );

    return owner == recovered ? ERC1271_MAGIC_VAL : ERC1271_INVALID;
  }

  /**
   * @dev Should return whether the signature provided is valid for the provided hash
   * @param _hash keccak256 hash that was signed
   * @param _signature Signature byte array associated with _data
   *
   * MUST return the bytes4 magic value 0x1626ba7e when function passes.
   * MUST NOT modify state (using STATICCALL for solc < 0.5, view modifier for solc > 0.5)
   */
  function isValidSignature(
    bytes32 _hash,
    bytes calldata _signature)
    external
    view
    returns (bytes4 magicValue)
  {
    bytes32 r = _signature.readBytes32(0);
    bytes32 s = _signature.readBytes32(32);
    uint8 v = uint8(_signature[64]);
    address recovered = ecrecover(
      keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _hash)),
      v,
      r,
      s
    );

    return owner == recovered ? ERC1271_MAGICVALUE_BYTES32 : ERC1271_INVALID;
  }


  /***********************************|
  |              Receiver             |
  |__________________________________*/

  function onERC1155Received(address _operator, address _from, uint256 _id, uint256 _value, bytes memory _data)
    public returns(bytes4)
  {
    return 0xf23a6e61;
  }

  function onERC1155BatchReceived(address _operator, address _from, uint256[] memory _ids, uint256[] memory _values, bytes memory _data)
    public returns(bytes4)
  {
    return 0xbc197c81;
  }

  /***********************************|
  |          Bytes Functions          |
  |__________________________________*/

  /**
   * @dev Returns a slices from a byte array.
   * @param b The byte array to take a slice from.
   * @param from The starting index for the slice (inclusive).
   * @param to The final index for the slice (exclusive).
   * @return result The slice containing bytes at indices [from, to)
   */
  function slice(bytes memory b, uint256 from, uint256 to)
    internal pure returns (bytes memory result)
  {
    // Ensure that the from and to positions are valid positions for a slice within
    // the byte array that is being used.
    if (from > to) {
      revert("ERC1271WalletMock#slice: Error");
    }
    if (to > b.length) {
      revert("ERC1271WalletMock#slice: Error");
    }

    // Create a new bytes structure and copy contents
    result = new bytes(to - from);
    memCopy(
      contentAddress(result),
      contentAddress(b) + from,
      result.length
    );
    return result;
  }

  /**
   * @dev Copies `length` bytes from memory location `source` to `dest`.
   * @param dest memory address to copy bytes to.
   * @param source memory address to copy bytes from.
   * @param length number of bytes to copy.
   */
  function memCopy(uint256 dest, uint256 source, uint256 length)
    internal
    pure
  {
    if (length < 32) {
      // Handle a partial word by reading destination and masking
      // off the bits we are interested in.
      // This correctly handles overlap, zero lengths and source == dest
      assembly {
        let mask := sub(exp(256, sub(32, length)), 1)
        let s := and(mload(source), not(mask))
        let d := and(mload(dest), mask)
        mstore(dest, or(s, d))
      }
    } else {
      // Skip the O(length) loop when source == dest.
      if (source == dest) {
        return;
      }

      // For large copies we copy whole words at a time. The final
      // word is aligned to the end of the range (instead of after the
      // previous) to handle partial words. So a copy will look like this:
      //
      //  ####
      //      ####
      //          ####
      //            ####
      //
      // We handle overlap in the source and destination range by
      // changing the copying direction. This prevents us from
      // overwriting parts of source that we still need to copy.
      //
      // This correctly handles source == dest
      //
      if (source > dest) {
        assembly {
          // We subtract 32 from `sEnd` and `dEnd` because it
          // is easier to compare with in the loop, and these
          // are also the addresses we need for copying the
          // last bytes.
          length := sub(length, 32)
          let sEnd := add(source, length)
          let dEnd := add(dest, length)

          // Remember the last 32 bytes of source
          // This needs to be done here and not after the loop
          // because we may have overwritten the last bytes in
          // source already due to overlap.
          let last := mload(sEnd)

          // Copy whole words front to back
          // Note: the first check is always true,
          // this could have been a do-while loop.
          // solhint-disable-next-line no-empty-blocks
          for {} lt(source, sEnd) {} {
            mstore(dest, mload(source))
            source := add(source, 32)
            dest := add(dest, 32)
          }

          // Write the last 32 bytes
          mstore(dEnd, last)
        }
      } else {
        assembly {
          // We subtract 32 from `sEnd` and `dEnd` because those
          // are the starting points when copying a word at the end.
          length := sub(length, 32)
          let sEnd := add(source, length)
          let dEnd := add(dest, length)

          // Remember the first 32 bytes of source
          // This needs to be done here and not after the loop
          // because we may have overwritten the first bytes in
          // source already due to overlap.
          let first := mload(source)

          // Copy whole words back to front
          // We use a signed comparisson here to allow dEnd to become
          // negative (happens when source and dest < 32). Valid
          // addresses in local memory will never be larger than
          // 2**255, so they can be safely re-interpreted as signed.
          // Note: the first check is always true,
          // this could have been a do-while loop.
          // solhint-disable-next-line no-empty-blocks
          for {} slt(dest, dEnd) {} {
            mstore(dEnd, mload(sEnd))
            sEnd := sub(sEnd, 32)
            dEnd := sub(dEnd, 32)
          }

          // Write the first 32 bytes
          mstore(dest, first)
        }
      }
    }
  }

  /**
   * @dev Gets the memory address for the contents of a byte array.
   * @param input Byte array to lookup.
   * @return memoryAddress Memory address of the contents of the byte array.
   */
  function contentAddress(bytes memory input) internal pure returns (uint256 memoryAddress)
  {
    assembly {
      memoryAddress := add(input, 32)
    }
    return memoryAddress;
  }
}
