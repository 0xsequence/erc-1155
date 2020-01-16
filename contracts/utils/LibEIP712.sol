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
pragma solidity ^0.5.16;


contract LibEIP712 {

  /***********************************|
  |             Constants             |
  |__________________________________*/

  // keccak256(
  //   "EIP712Domain(address verifyingContract)"
  // );
  bytes32 internal constant DOMAIN_SEPARATOR_TYPEHASH = 0x035aff83d86937d35b32e04f0ddc6ff469290eef2f1b692d8a815c89404d4749;

  // EIP-191 Header
  string constant internal EIP191_HEADER = "\x19\x01";

  /***********************************|
  |          Hashing Function         |
  |__________________________________*/

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
        EIP191_HEADER,
        keccak256(
          abi.encode(
            DOMAIN_SEPARATOR_TYPEHASH,
            address(this)
          )
        ),
        hashStruct
    ));
  }
}
