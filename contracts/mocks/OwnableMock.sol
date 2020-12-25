// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.7.4;

import "../utils/Ownable.sol";


/**
 * @dev Contract that is ownable
 */
contract OwnableMock is Ownable {
  uint256 internal mockStateOwner = 0;
  uint256 internal mockStateNonOwner = 0;

  function ownerCall() external onlyOwner() {
    mockStateOwner += 1;
  }

  function nonOwnerCall() external {
    mockStateNonOwner += 1;
  }
}
