// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

import {Proxy} from "./Proxy.sol";
import {StorageSlot} from "../../utils/StorageSlot.sol";

error InvalidCaller();

contract ProxyUpgradeable is Proxy {
    bytes32 internal constant _ADMIN_SLOT = bytes32(uint256(keccak256("eip1967.proxy.admin")) - 1);

    constructor(address _implementation, address _admin) Proxy(_implementation) {
        _setAdmin(_admin);
    }

    modifier onlyAdmin() {
        if (_getAdmin() != msg.sender) {
            revert InvalidCaller();
        }
        _;
    }

    //
    // Upgrade logic
    //
    function upgradeTo(address _implementation) external onlyAdmin {
        _setImplementation(_implementation);
        emit Upgraded(_implementation);
    }

    //
    // Admin logic
    //
    function updateAdmin(address _admin) external onlyAdmin {
        emit AdminChanged(_getAdmin(), _admin);
        _setAdmin(_admin);
    }

    /**
     * Set the admin address.
     */
    function _setAdmin(address _admin) internal {
        StorageSlot.getAddressSlot(_ADMIN_SLOT).value = _admin;
    }

    /**
     * @dev Returns the current admin.
     */
    function _getAdmin() internal view returns (address) {
        return StorageSlot.getAddressSlot(_ADMIN_SLOT).value;
    }
}
