// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

interface IERC1967 {
    event Upgraded(address indexed implementation);
    event AdminChanged(address previousAdmin, address newAdmin);
    event BeaconUpgraded(address indexed beacon);
}
