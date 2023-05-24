// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "../tokens/ERC1155Upgradeable/ERC1155MintBurnUpgradeable.sol";
import "../tokens/ERC1155Upgradeable/ERC1155MetadataUpgradeable.sol";

contract ERC1155MetadataUpgradeableMock is ERC1155MintBurnUpgradeable, ERC1155MetadataUpgradeable {

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
    ERC1155Upgradeable,
    ERC1155MetadataUpgradeable
  ) view virtual returns (bool) {
    return super.supportsInterface(_interfaceID);
  }
}

/**
 * A v2 implementation to test upgradeability.
 */
contract ERC1155MetadataUpgradeableMockV2 is ERC1155MetadataUpgradeableMock {
  mapping(uint256 => uint256) private idMapping;

  function setIdMapping(uint256 _id, uint256 _mappedId) public {
    idMapping[_id] = _mappedId;
  }

  function uri(uint256 _id) public override view returns (string memory) {
    return string(abi.encodePacked(baseURI, _uint2str(idMapping[_id]))); // Removes .json extension, swaps ids
  }
}
