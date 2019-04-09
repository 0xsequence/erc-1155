pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "../tokens/ERC1155/ERC1155Metadata.sol";


contract ERC1155MetadataMock is ERC1155Metadata {

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

  /**
   * @notice Will emit a specific URI log event for corresponding token
   * @param _tokenIDs IDs of the token corresponding to the _uris logged
   * @param _URIs    The URIs of the specified _tokenIDs
   */
  function logURIsMock2(uint256[] memory _tokenIDs, string[] memory _URIs) public {
    super._logURIs(_tokenIDs, _URIs);
  }


  /***********************************|
  |       Unsupported Functions       |
  |__________________________________*/

  function () external {
    revert('ERC1155MetadataMock: INVALID_METHOD');
  } 
}