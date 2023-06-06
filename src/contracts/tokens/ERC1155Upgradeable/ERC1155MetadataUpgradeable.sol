// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;
import '../../interfaces/IERC1155Metadata.sol';
import '../../utils/ERC165.sol';
import '../../utils/Initializable.sol';
import '../../utils/StorageSlot.sol';

/**
 * @notice Contract that handles metadata related methods.
 * @dev Methods assume a deterministic generation of URI based on token IDs.
 *      Methods also assume that URI uses hex representation of token IDs.
 *      This contract uses a separate initializable function.
 */
contract ERC1155MetadataUpgradeable is Initializable, IERC1155Metadata, ERC165 {
  // URI's default URI prefix
  bytes32 private constant _BASEURI_SLOT = keccak256("0xsequence.ERC1155MetadataUpgradeable.baseURI");
  bytes32 private constant _NAME_SLOT = keccak256("0xsequence.ERC1155MetadataUpgradeable.name");

  constructor() initializer {}

  /**
   * @notice Set the initial name and base URI.
   * @dev This function should be called once immediately after deployment.
   */
  function initialize(string memory _name, string memory _baseURI) public virtual initializer {
    _ERC1155MetadataUpgradeable_init(_name, _baseURI);
  }

  /**
   * @notice Set the initial name and base URI.
   * @dev Use this function when extending the contract.
   */
  function _ERC1155MetadataUpgradeable_init(string memory _name, string memory _baseURI) internal virtual onlyInitializing {
    _setContractName(_name);
    _setBaseMetadataURI(_baseURI);
  }

  /***********************************|
  |          Public Functions         |
  |__________________________________*/

  function name() public view virtual returns (string memory) {
    return StorageSlot.getStringSlot(_NAME_SLOT).value;
  }

  function baseURI() public view virtual returns (string memory) {
    return StorageSlot.getStringSlot(_BASEURI_SLOT).value;
  }

  /**
   * @notice A distinct Uniform Resource Identifier (URI) for a given token.
   * @dev URIs are defined in RFC 3986.
   *      URIs are assumed to be deterministically generated based on token ID
   * @return URI string
   */
  function uri(uint256 _id) public virtual override view returns (string memory) {
    return string(abi.encodePacked(baseURI(), _uint2str(_id), ".json"));
  }


  /***********************************|
  |    Metadata Internal Functions    |
  |__________________________________*/

  /**
   * @notice Will emit default URI log event for corresponding token _id
   * @param _tokenIDs Array of IDs of tokens to log default URI
   */
  function _logURIs(uint256[] memory _tokenIDs) internal {
    string memory baseURL = baseURI();
    string memory tokenURI;

    for (uint256 i = 0; i < _tokenIDs.length; i++) {
      tokenURI = string(abi.encodePacked(baseURL, _uint2str(_tokenIDs[i]), ".json"));
      emit URI(tokenURI, _tokenIDs[i]);
    }
  }

  /**
   * @notice Will update the base URL of token's URI
   * @param _baseURI New base URL of token's URI
   */
  function _setBaseMetadataURI(string memory _baseURI) internal {
    StorageSlot.getStringSlot(_BASEURI_SLOT).value = _baseURI;
  }

  /**
   * @notice Will update the name of the contract
   * @param _name New contract name
   */
  function _setContractName(string memory _name) internal {
    StorageSlot.getStringSlot(_NAME_SLOT).value = _name;
  }

  /**
   * @notice Query if a contract implements an interface
   * @param _interfaceID  The interface identifier, as specified in ERC-165
   * @return `true` if the contract implements `_interfaceID` and
   */
  function supportsInterface(bytes4 _interfaceID) public view virtual override returns (bool) {
    if (_interfaceID == type(IERC1155Metadata).interfaceId) {
      return true;
    }
    return super.supportsInterface(_interfaceID);
  }

  /***********************************|
  |    Utility Internal Functions     |
  |__________________________________*/

  function _uint2str(uint _i) internal pure returns (string memory _uintAsString) {
    if (_i == 0) {
      return '0';
    }
    uint j = _i;
    uint len;
    while (j != 0) {
      len++;
      j /= 10;
    }
    bytes memory bstr = new bytes(len);
    uint k = len;
    while (_i != 0) {
      k = k - 1;
      uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
      bytes1 b1 = bytes1(temp);
      bstr[k] = b1;
      _i /= 10;
    }
    return string(bstr);
  }
}
