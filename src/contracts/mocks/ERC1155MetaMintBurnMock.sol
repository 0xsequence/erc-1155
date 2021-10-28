// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.7.4;
pragma experimental ABIEncoderV2;

import "../tokens/ERC1155/ERC1155Meta.sol";
import "../tokens/ERC1155/ERC1155MintBurn.sol";
import "../tokens/ERC1155/ERC1155Metadata.sol";


contract ERC1155MetaMintBurnMock is ERC1155Meta, ERC1155MintBurn, ERC1155Metadata {

  // set the initial name and base URI
  constructor(string memory _name, string memory _baseURI) ERC1155Metadata(_name, _baseURI) {}

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

  /***********************************|
  |         Minting Functions         |
  |__________________________________*/

  /**
   * @dev Mint _value of tokens of a given id
   * @param _to The address to mint tokens to.
   * @param _id token id to mint
   * @param _value The amount to be minted
   * @param _data Data to be passed if receiver is contract
   */
  function mintMock(address _to, uint256 _id, uint256 _value, bytes memory _data)
    public
  {
    super._mint(_to, _id, _value, _data);
  }

  /**
   * @dev Mint tokens for each ids in _ids
   * @param _to The address to mint tokens to.
   * @param _ids Array of ids to mint
   * @param _values Array of amount of tokens to mint per id
   * @param _data Data to be passed if receiver is contract
   */
  function batchMintMock(address _to, uint256[] memory _ids, uint256[] memory _values, bytes memory _data)
    public
  {
    super._batchMint(_to, _ids, _values, _data);
  }


  /***********************************|
  |         Burning Functions         |
  |__________________________________*/

  /**
   * @dev burn _value of tokens of a given token id
   * @param _from The address to burn tokens from.
   * @param _id token id to burn
   * @param _value The amount to be burned
   */
  function burnMock(address _from, uint256 _id, uint256 _value)
    public
  {
    super._burn(_from, _id, _value);
  }

  /**
   * @dev burn _value of tokens of a given token id
   * @param _from The address to burn tokens from.
   * @param _ids Array of token ids to burn
   * @param _values Array of the amount to be burned
   */
  function batchBurnMock(address _from, uint256[] memory _ids, uint256[] memory _values)
    public
  {
    super._batchBurn(_from, _ids, _values);
  }
  
  /***********************************|
  |       Unsupported Functions       |
  |__________________________________*/

  fallback () virtual external {
    revert("ERC1155MetaMintBurnMock: INVALID_METHOD");
  }
}
