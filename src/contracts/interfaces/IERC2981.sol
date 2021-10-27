// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.7.4;
import './IERC165.sol';

interface IERC2981 is IERC165 {
  /**  
    * @notice Called with the sale price to determine how much royalty is owed and to whom.
    * @param _tokenId - the NFT asset queried for royalty information
    * @param _saleCost - the sale cost of the NFT asset specified by _tokenId
    * @return receiver - address of who should be sent the royalty payment
    * @return royaltyAmount - the royalty payment amount for _salePrice
    */
  function royaltyInfo(uint256 _tokenId, uint256 _saleCost) external view returns (address receiver, uint256 royaltyAmount);
}