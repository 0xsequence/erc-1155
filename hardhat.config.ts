import { HardhatUserConfig } from 'hardhat/config'

import '@nomiclabs/hardhat-truffle5'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-web3'
import 'hardhat-gas-reporter'
import 'solidity-coverage'

const config: HardhatUserConfig = {
  solidity: {
    version: '0.7.4',
    settings: {
      optimizer: {
        enabled: true,
        runs: 100000,
        details: {
          yul: true,
          constantOptimizer: false
        }
      }
    }
  },
  paths: {
    root: 'src',
    tests: '../tests'
  },
  networks: {
    hardhat: {
      chainId: 127001,
      accounts: {
        mnemonic: 'test test test test test test test test test test test junk'
      },
    },
    ganache: {
      url: 'http://127.0.0.1:8545',
      blockGasLimit: 10000000
    }
  },
  gasReporter: {
    enabled: !!process.env.REPORT_GAS === true,
    currency: 'USD',
    gasPrice: 10,
    showTimeSpent: true
  }
}

export default config
