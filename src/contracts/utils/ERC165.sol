pragma solidity ^0.8.0;
import "../interfaces/IERC165.sol";

abstract contract ERC165 is IERC165 {
  /**
   * @notice Query if a contract implements an interface
   * @param _interfaceID The interface identifier, as specified in ERC-165
   * @return `true` if the contract implements `_interfaceID`
   */
  function supportsInterface(bytes4 _interfaceID) virtual override public pure returns (bool) {
    return _interfaceID == this.supportsInterface.selector;
  }
}
