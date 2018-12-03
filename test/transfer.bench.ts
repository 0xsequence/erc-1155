import * as ethers from 'ethers'

import { AbstractContract, assert, expect, BigNumber } from './utils'
import * as utils from './utils'

import { ERC721Mock } from 'typings/contracts/ERC721Mock'
import { ERC20Mock } from 'typings/contracts/ERC20Mock'
import { ERC1155Mock } from 'typings/contracts/ERC1155Mock'
import { ERC1155MockNoBalancePacking } from 'typings/contracts/ERC1155MockNoBalancePacking'


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
  wallet: receiver2,
  provider: receiver2Provider,
  signer: receiver2Signer
} = utils.createTestWallet(web3, 3)

const {
  wallet: anyone,
  provider: anyoneProvider,
  signer: anyoneSigner
} = utils.createTestWallet(web3, 4)

// TO DO
// Check over/under flow for both uin256 and uint16
// Modify existing ERC20 and basic token related tests
// Test the _updatetypesBalance operations


contract('Efficiency Comparison Tests', (accounts: string[]) => {

  const nTransfers = 5
  const toTransfer = 30 // Amount to transfer per transfer
  const toMint = 15 // Amount to mint per transfer

  // Array of amount
  const IDArray  = Array.apply(null, {length: nTransfers}).map(Number.call, Number)
  const amountArray = Array.apply(null, Array(nTransfers)).map(Number.prototype.valueOf, toTransfer)

  let erc721Contract: ERC721Mock

  describe('ERC721 Tokens', () => {

    beforeEach(async () => {
      let abstract = await AbstractContract.fromArtifactName('ERC721Mock')
      erc721Contract = await abstract.deploy(owner) as ERC721Mock

      for (let i = 0; i < nTransfers; i++) {
        await erc721Contract.functions.mockMint(owner.address, i)
      }
    })

    describe('Transferring 30 ERC721 tokens in different transaction calls', () => {
      it('', async () => {
        let sumGasCost = 0

        for (let i = 0; i < nTransfers; i++) {
          const tx = await erc721Contract.functions.transferFrom(owner.address, receiver.address, i)
          const receipt = await tx.wait()
          sumGasCost += receipt.gasUsed!.toNumber()
        }

        console.log('Total gas cost  : ', sumGasCost)
        console.log('Per Tx Gas cost : ', sumGasCost / nTransfers)
      })
    })

    describe('Transferring 30 ERC721 tokens with wrapper contract', () => {
      it('', async () => {
        const tx = await erc721Contract.functions.batchTransferFrom(owner.address, receiver.address, IDArray)
        const receipt = await tx.wait()

        console.log('Total gas cost  : ', receipt.gasUsed!.toNumber())
        console.log('Per Tx Gas cost : ', receipt.gasUsed!.toNumber() / nTransfers)
      })
    })

  })


  describe('ERC20 Tokens', () => {

    let tokenContracts: ERC20Mock[]

    beforeEach(async () => {
      tokenContracts = []
      let abstract = await AbstractContract.fromArtifactName('ERC20Mock')

      for (let i = 0; i < nTransfers; i++) {
        const contract = await abstract.deploy(owner) as ERC20Mock
        const tx = contract.functions.mockMint(owner.address, toMint)
        await expect(tx).to.be.fulfilled
        tokenContracts.push(contract)
      }
    })

    describe('Transferring 30 ERC20 tokens in different transaction calls', () => {
      it('', async () => {
        let sumGasCost = 0

        for (let i = 0; i < nTransfers; i++) {
          const tx = await tokenContracts[i].functions.transfer(receiver.address, toTransfer)
          const receipt = await tx.wait()
          sumGasCost += receipt.gasUsed!.toNumber()
        }

        console.log('Total gas cost  : ', sumGasCost)
        console.log('Per Tx Gas cost : ', sumGasCost / nTransfers)
      })
    })

    describe('Transferring 30 ERC20s tokens with wrapper contract', () => {

      it('', async () => {
        let tokenAddresses: string[] = []

        let abstract = await AbstractContract.fromArtifactName('ERC20Mock')
        const metaToken = await abstract.deploy(owner) as ERC20Mock

        for (let i = 0; i < nTransfers; i++) {
          const tx = tokenContracts[i].functions.mockMint(metaToken.address, toMint)
          await expect(tx).to.be.fulfilled
          tokenAddresses.push(tokenContracts[i].address)
        }

        // @ts-ignore
        const gas = await metaToken.estimate.batchTransfer(tokenAddresses, receiver2.address, amountArray)
        // console.log('estimate:', gas.toNumber())

        // TODO: review, ganache/ethers fails to estimate a proper gas amount and reverts
        // without the override below
        const overrides = {
          gasLimit: gas.toNumber() + 1000
        }

        // @ts-ignore
        const tx = await metaToken.functions.batchTransfer(tokenAddresses, receiver2.address, amountArray, overrides)
        const receipt = await tx.wait()

        console.log('Total gas cost  : ', receipt.gasUsed!.toNumber())
        console.log('Per Tx Gas cost : ', receipt.gasUsed!.toNumber() / nTransfers)
      })

    })

  })

  describe('ERC1155 Tokens', () => {

    let erc1155NoBalancePackingContract: ERC1155MockNoBalancePacking

    beforeEach(async () => {
      let abstract = await AbstractContract.fromArtifactName('ERC1155MockNoBalancePacking')
      erc1155NoBalancePackingContract = await abstract.deploy(owner) as ERC1155MockNoBalancePacking

      for (let i = 0; i < nTransfers; i++) {
        await erc1155NoBalancePackingContract.functions.mockMint(owner.address, i, toMint)
      }
    })

    describe('Transferring 100 ERC1155 tokens', () => {
      it('', async () => {
        const tx = await erc1155NoBalancePackingContract.functions.batchTransferFrom(owner.address, receiver.address, IDArray, amountArray)
        const receipt = await tx.wait()

        console.log('Total gas cost  : ', receipt.gasUsed!.toNumber())
        console.log('Per Tx Gas cost : ', receipt.gasUsed!.toNumber() / nTransfers)
      })
    })

  })


  describe('ERC-1155 "packed Balance" Tokens', () => {

    let erc1155Contract: ERC1155Mock

    beforeEach(async () => {
      let abstract = await AbstractContract.fromArtifactName('ERC1155Mock')
      erc1155Contract = await abstract.deploy(owner) as ERC1155Mock

      for (let i = 0; i < nTransfers; i++) {
        await erc1155Contract.functions.mockMint(owner.address, i, toMint)
      }
    })

    describe('Transferring 30 ERC1155 tokens with packed balance', () => {
      it('', async () => {
        const tx = await erc1155Contract.functions.safeBatchTransferFrom(owner.address, receiver.address, IDArray, amountArray, [])
        const receipt = await tx.wait()

        console.log('Total gas cost  : ', receipt.gasUsed!.toNumber())
        console.log('Per Tx Gas cost : ', receipt.gasUsed!.toNumber() / nTransfers)
      })
    })

  })

})
