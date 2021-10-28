// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.7.4;
import "./ERC1155MintBurnMock.sol";
import "../tokens/ERC2981/ERC2981Global.sol";

contract ERC2981GlobalMock is ERC1155MintBurnMock, ERC2981Global {

  // set the initial name and base URI
  constructor(string memory _name, string memory _baseURI) ERC1155MintBurnMock(_name, _baseURI) {}

  /***********************************|
  |         Base URI Functions        |
  |__________________________________*/

  /**
   * @notice Will set the basis point and royalty recipient that is applied to all assets
   * @param _recipient Fee recipient that will receive the royalty payments
   * @param _royaltyBasisPoints Basis points with 3 decimals representing the fee %
   *        e.g. a fee of 2% would be 20 (i.e. 20 / 1000 == 0.02, or 2%)
   */
  function setGlobalRoyaltyInfo(address _recipient, uint256 _royaltyBasisPoints) external {
    _setGlobalRoyaltyInfo(_recipient, _royaltyBasisPoints);
  }

  function supportsInterface(bytes4 _interfaceID) public override(ERC1155MintBurnMock, ERC2981Global) virtual pure returns (bool) {
    return super.supportsInterface(_interfaceID);
  }
}
