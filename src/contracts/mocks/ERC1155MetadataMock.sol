// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.7.4;
pragma experimental ABIEncoderV2;

import "../tokens/ERC1155/ERC1155MintBurn.sol";
import "../tokens/ERC1155/ERC1155Metadata.sol";

contract ERC1155MetadataMock is ERC1155MintBurn, ERC1155Metadata {

  // set the initial name and base URI
  constructor(string memory _name, string memory _baseURI) ERC1155Metadata(_name, _baseURI) {}

  /***********************************|
  |         Base URI Functions        |
  |__________________________________*/

  /**
   * @notice Will update the base URL of token's URI
   * @param _newBaseMetadataURI New base URL of token's URI
   */
  function setBaseMetadataURI(string memory _newBaseMetadataURI) public {
    super._setBaseMetadataURI(_newBaseMetadataURI);
  }

  /***********************************|
  |         Log URI Functions         |
  |__________________________________*/

  /**
   * @notice Will emit default URI log event for corresponding token _id
   * @param _tokenIDs Array of IDs of tokens to log default URI
   */
  function logURIsMock(uint256[] memory _tokenIDs) public {
    super._logURIs(_tokenIDs);
  }

  /***********************************|
  |       Unsupported Functions       |
  |__________________________________*/

  fallback () external {
    revert('ERC1155MetadataMock: INVALID_METHOD');
  }


  /***********************************|
  |         ERC-165 Functions         |
  |__________________________________*/

  /**
   * @notice Query if a contract implements an interface
   * @dev Parent contract inheriting multiple contracts with supportsInterface()
   *      need to implement an overriding supportsInterface() function specifying
   *      all inheriting contracts that have a supportsInterface() function.
   * @param _interfaceID The interface identifier, as specified in ERC-165
   * @return `true` if the contract implements `_interfaceID`
   */
  function supportsInterface(
    bytes4 _interfaceID
  ) public override(
    ERC1155,
    ERC1155Metadata
  ) pure virtual returns (bool) {
    return super.supportsInterface(_interfaceID);
  }
}
