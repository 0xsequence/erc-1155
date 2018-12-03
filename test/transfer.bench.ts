import * as ethers from 'ethers'

import { AbstractContract, assert, expect, BigNumber } from './utils'
import * as utils from './utils'

import { ERC721Mock } from 'typings/contracts/ERC721Mock'

// init test wallets from package.json mnemonic
const web3 = (global as any).web3

const {
  wallet: owner,
  provider: ownerProvider,
  signer: ownerSigner
} = utils.createTestWallet(web3, 0)

const {
  wallet: receiver,
  provider: receiverProvider,
  signer: receiverSigner
} = utils.createTestWallet(web3, 2)

const {
  wallet: anyone,
  provider: anyoneProvider,
  signer: anyoneSigner
} = utils.createTestWallet(web3, 3)

const {
  wallet: operator,
  provider: operatorProvider,
  signer: operatorSigner
} = utils.createTestWallet(web3, 4)


// TO DO
// Check over/under flow for both uin256 and uint16
// Modify existing ERC20 and basic token related tests
// Test the _updatetypesBalance operations


contract('Efficiency Comparison Tests', (accounts: string[]) => {

  const nTransfers = 30
  const toTransfer = 10 // Amount to transfer per transfer
  const toMint = 15 // Amount to mint per transfer

  // Array of amount
  const IDArray  = Array.apply(null, {length: nTransfers}).map(Number.call, Number)
  const amountArray = Array.apply(null, Array(nTransfers)).map(Number.prototype.valueOf, toTransfer);

  let erc721Contract: ERC721Mock

  describe('ERC721 Tokens', () => {

    beforeEach(async () => {
      let abstract = await AbstractContract.fromArtifactName('ERC721Mock')
      erc721Contract = await abstract.deploy(owner) as ERC721Mock

      for (let i = 0; i < nTransfers; i++) {
        await erc721Contract.functions.mockMint(owner.address, i)
      }
    })

    describe('Transferring 100 ERC721 tokens in different transaction calls', () => {

      it('', async () => {
        let sumGasCost = 0

        for (let i = 0; i < nTransfers; i++) {
          const tx = await erc721Contract.functions.transferFrom(owner.address, receiver.address, i)
          const receipt = await tx.wait()
          sumGasCost += receipt.gasUsed!.toNumber()
        }

        console.log('Total gas cost  : ', sumGasCost)
        console.log('Per Tx Gas cost : ', sumGasCost/nTransfers)
      })

    })

    describe('Transferring 100 ERC721 tokens with wrapper contract', () => {

      it('', async () => {
        // let tx = await token.batchTransferFrom(owner, receiver, IDArray, {from: owner});
        
        // console.log('Total gas cost  : ', tx.receipt.gasUsed);
        // console.log('Per Tx Gas cost : ', tx.receipt.gasUsed / nTransfers);
      })

    })

  })


})
