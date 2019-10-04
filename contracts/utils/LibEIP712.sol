/**
 * Copyright 2018 ZeroEx Intl.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *   http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
pragma solidity ^0.5.12;


contract LibEIP712 {

  // keccak256(
  //   "EIP712Domain(address verifyingContract)"
  // );
  bytes32 internal constant DOMAIN_SEPARATOR_TYPEHASH = 0x035aff83d86937d35b32e04f0ddc6ff469290eef2f1b692d8a815c89404d4749;

  // Domain seperator created in constructor
  bytes32 internal EIP712_DOMAIN_HASH;

  // Instantiate EIP712_DOMAIN_HASH
  constructor ()
    public
  {
    EIP712_DOMAIN_HASH = keccak256(abi.encodePacked(DOMAIN_SEPARATOR_TYPEHASH, address(this)));
  }

  /**
   * @dev Calculates EIP712 encoding for a hash struct in this EIP712 Domain.
   * @param hashStruct The EIP712 hash struct.
   * @return EIP712 hash applied to this EIP712 Domain.
   */
  function hashEIP712Message(bytes32 hashStruct)
      internal
      view
      returns (bytes32 result)
  {

    return keccak256(
      abi.encodePacked(
        bytes32(0x1901000000000000000000000000000000000000000000000000000000000000),
        EIP712_DOMAIN_HASH,
        hashStruct
    ));

    //bytes32 eip712DomainHash = EIP712_DOMAIN_HASH;
    // Assembly for more efficient computing:
    // assembly {
    //   // Load free memory pointer
    //   let memPtr := mload(64)

    //   mstore(memPtr, 0x1901000000000000000000000000000000000000000000000000000000000000)  // EIP191 header
    //   mstore(add(memPtr, 2), eip712DomainHash)                                            // EIP712 domain hash
    //   mstore(add(memPtr, 34), hashStruct)                                                 // Hash of struct

    //   // Compute hash
    //   result := keccak256(memPtr, 66)
    // }
    // return result;
  }
}
