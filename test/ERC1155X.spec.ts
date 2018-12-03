import * as ethers from 'ethers'

import { AbstractContract, expect, BigNumber } from './utils'
import * as utils from './utils'

// import { ERC1155Mock } from 'typings/contracts/ERC1155Mock'
// import { ERC1155ReceiverMock } from 'typings/contracts/ERC1155ReceiverMock'

// init test wallets from package.json mnemonic
const web3 = (global as any).web3

const {
  wallet: ownerWallet,
  provider: ownerProvider,
  signer: ownerSigner
} = utils.createTestWallet(web3, 0)

const {
  wallet: receiverWallet,
  provider: receiverProvider,
  signer: receiverSigner
} = utils.createTestWallet(web3, 2)

const {
  wallet: operatorWallet,
  provider: operatorProvider,
  signer: operatorSigner
} = utils.createTestWallet(web3, 4)


contract('ERC1155XMock', (accounts: string[]) => {

  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'


})
