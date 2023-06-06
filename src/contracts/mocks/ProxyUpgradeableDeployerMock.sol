// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import {ProxyUpgradeableDeployer} from "../proxies/ERC1967/ProxyUpgradeableDeployer.sol";

contract ProxyUpgradeableDeployerMock is ProxyUpgradeableDeployer {

    /**
     * Creates an upgradeable proxy contract for a given implementation
     * @param implAddr The address of the proxy implementation
     * @param salt The deployment salt
     * @param adminAddr The proxy admin address
     * @return proxyAddr The address of the deployed proxy
     */
    function createProxy(address implAddr, bytes32 salt, address adminAddr) public returns (address proxyAddr) {
        return super.deployProxy(implAddr, salt, adminAddr);
    }

}
