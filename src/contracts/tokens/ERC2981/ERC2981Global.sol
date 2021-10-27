// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.7.4;
import "../../utils/ERC165.sol";
import "../../utils/SafeMath.sol";
import "../../interfaces/IERC2981.sol";

/**
 * @notice Contract return royalty information for tokens of this contract
 * @dev This contract sets a global fee information for all token ids.
 */
contract ERC2981Global is IERC2981, ERC165 {
  using SafeMath for uint256;

  struct FeeInfo {
    address receiver;
    uint256 feeBasisPoints;
  }

  // Royalty Fee information struct
  FeeInfo public globalRoyaltyInfo;

  /**
   * @notice Will set the basis point and royalty recipient that is applied to all assets
   * @param _receiver Fee recipient that will receive the royalty payments
   * @param _royaltyBasisPoints Basis points with 3 decimals representing the fee %
   *        e.g. a fee of 2% would be 20 (i.e. 20 / 1000 == 0.02, or 2%)
   */
  function _setGlobalRoyaltyInfo(address _receiver, uint256 _royaltyBasisPoints) internal {
    require(_receiver != address(0x0), "ERC2981Global#_setGlobalRoyalty: RECIPIENT_IS_0x0");
    require(_royaltyBasisPoints <= 1000, "ERC2981Global#_setGlobalRoyalty: FEE_IS_ABOVE_100_PERCENT");
    globalRoyaltyInfo.receiver = _receiver;
    globalRoyaltyInfo.feeBasisPoints = _royaltyBasisPoints;
  }


  /***********************************|
  |         ERC-2981 Functions        |
  |__________________________________*/

    /**  
    * @notice Called with the sale price to determine how much royalty is owed and to whom.
    * @param _saleCost - the sale cost of the NFT asset specified by _tokenId
    * @return receiver - address of who should be sent the royalty payment
    * @return royaltyAmount - the royalty payment amount for _salePrice
    */
  function royaltyInfo(
    uint256, 
    uint256 _saleCost
  ) external view override returns (address receiver, uint256 royaltyAmount) 
  {
    FeeInfo memory info = globalRoyaltyInfo;
    return (info.receiver, _saleCost.mul(info.feeBasisPoints).div(1000));
  }


  /***********************************|
  |         ERC-165 Functions         |
  |__________________________________*/

  /**
   * @notice Query if a contract implements an interface
   * @param _interfaceID  The interface identifier, as specified in ERC-165
   * @return `true` if the contract implements `_interfaceID` and
   */
  function supportsInterface(bytes4 _interfaceID) public override(ERC165, IERC165) virtual pure returns (bool) {
    if (_interfaceID == type(IERC2981).interfaceId) {
      return true;
    }
    return super.supportsInterface(_interfaceID);
  }
}