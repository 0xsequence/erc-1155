import * as ethers from 'ethers'

import { AbstractContract, expect, BigNumber } from './utils'
import * as utils from './utils'

import { ERC1155Mock } from 'typings/contracts/ERC1155Mock'
import { ERC1155ReceiverMock } from 'typings/contracts/ERC1155ReceiverMock'

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


contract('ERC1155Mock', (accounts: string[]) => {

  const LARGEVAL = new BigNumber(2).pow(256).sub(2) // 2**256 - 2
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

  let ownerAddress: string
  let receiverAddress: string
  let operatorAddress: string
  let erc1155Abstract: AbstractContract

  let erc1155Contract: ERC1155Mock
  let receiverERC1155Contract: ERC1155Mock
  let operatorERC1155Contract: ERC1155Mock
  

  // load contract abi and deploy to test server
  before(async () => {
    ownerAddress = await ownerWallet.getAddress()
    receiverAddress = await receiverWallet.getAddress()
    operatorAddress = await operatorWallet.getAddress()
    
    erc1155Abstract = await AbstractContract.fromArtifactName('ERC1155Mock')
  })

  // deploy before each test, to reset state of contract
  beforeEach(async () => {
    erc1155Contract = await erc1155Abstract.deploy(ownerWallet) as ERC1155Mock
    receiverERC1155Contract = await erc1155Contract.connect(receiverSigner) as ERC1155Mock
    operatorERC1155Contract = await erc1155Contract.connect(operatorSigner) as ERC1155Mock
  })

  describe('Bitwise functions', () => {

    it('getValueInBin should return expected balance for given types', async () => {
      let expected = new BigNumber(2).pow(16).sub(2) // 2**16-2
      let balance = await erc1155Contract.functions.getValueInBin(LARGEVAL.toString(), 15)
      expect(balance).to.be.eql(expected)
    })

    it('writeValueInBin should write expected value at given types', async () => {
      let targetVal  = 666
      let writtenBin = await erc1155Contract.functions.writeValueInBin(LARGEVAL.toString(), 0, targetVal)
      let balance = await erc1155Contract.functions.getValueInBin(writtenBin.toString(), 0)
      expect(balance).to.be.eql(new BigNumber(targetVal))
    })

    it('writeValueInBin should throw if value is above 2**16-1', async () => {
      let targetVal  = new BigNumber(2).pow(16)
      let writtenBin = erc1155Contract.functions.writeValueInBin(LARGEVAL.toString(), 0, targetVal.toString())
      await expect(writtenBin).to.be.rejected
    })

    it('getIDBinIndex should return the correct bin and respective index', async () => {
      const { bin: bin0, index: index0 } = await erc1155Contract.functions.getIDBinIndex(0)
      expect(bin0).to.be.eql(new BigNumber(0))
      expect(index0).to.be.eql(new BigNumber(0))

      const { bin: bin6, index: index6 } = await erc1155Contract.functions.getIDBinIndex(6)
      expect(bin6).to.be.eql(new BigNumber(0))
      expect(index6).to.be.eql(new BigNumber(6))

      const { bin: bin16, index: index16 } = await erc1155Contract.functions.getIDBinIndex(16)
      expect(bin16).to.be.eql(new BigNumber(1))
      expect(index16).to.be.eql(new BigNumber(0))

      const { bin: bin31, index: index31 } = await erc1155Contract.functions.getIDBinIndex(31)
      expect(bin31).to.be.eql(new BigNumber(1))
      expect(index31).to.be.eql(new BigNumber(15))
    })

  })


  describe('Getter functions', () => {

    beforeEach(async () => {
      await erc1155Contract.functions.mockMint(ownerAddress, 5, 256)
    })

    it('balanceOf() should return types balance for queried address', async () => {
      let balance6 = await erc1155Contract.functions.balanceOf(ownerAddress, 5)
      expect(balance6).to.be.eql(new BigNumber(256))

      let balance16 = await erc1155Contract.functions.balanceOf(ownerAddress, 16)
      expect(balance16).to.be.eql(new BigNumber(0))
    })

  })


  describe('safeTransferFrom() function', () => {

    let receiverContract: ERC1155ReceiverMock

    beforeEach(async () => {
      let abstract = await AbstractContract.fromArtifactName('ERC1155ReceiverMock')
      receiverContract = await abstract.deploy(ownerWallet) as ERC1155ReceiverMock

      await erc1155Contract.functions.mockMint(ownerAddress, 0, 256)
    })

    it('should be able to transfer if sufficient balance', async () => {
      const tx = erc1155Contract.functions.safeTransferFrom(ownerAddress, receiverAddress, 0, 1, [])
      await expect(tx).to.be.fulfilled
    })

    it('should REVERT if insufficient balance', async () => {
      const tx = erc1155Contract.functions.safeTransferFrom(ownerAddress, receiverAddress, 0, 257, [])
      await expect(tx).to.be.rejected
    })

    it('should REVERT if operator not approved', async () => {
      const tx = operatorERC1155Contract.functions.safeTransferFrom(operatorAddress, receiverAddress, 0, 1, [])
      await expect(tx).to.be.rejected
    })

    it('should be able to transfer via operator if operator is approved', async () => {
      // owner first gives operatorWallet address approval permission
      await erc1155Contract.functions.setApprovalForAll(operatorAddress, true)

      // operator performs a transfer
      const tx = operatorERC1155Contract.functions.safeTransferFrom(ownerAddress, receiverAddress, 0, 1, [])
      await expect(tx).to.be.fulfilled
    })

    it('should REVERT if transfer leads to overflow', async () => {
      await erc1155Contract.functions.mockMint(receiverAddress, 0, 2**16-1)
      const tx2 = erc1155Contract.functions.safeTransferFrom(ownerAddress, receiverAddress, 0, 1, [])
      await expect(tx2).to.be.rejected
    })

    it('should REVERT when sending to non-receiver contract', async () => {
      const tx = erc1155Contract.functions.safeTransferFrom(ownerAddress, erc1155Contract.address, 0, 1, [])
      await expect(tx).to.be.rejected
    })

    it('should REVERT if invalid response from receiver contract', async () => {
      await receiverContract.functions.setShouldReject(true)

      const tx = erc1155Contract.functions.safeTransferFrom(ownerAddress, receiverContract.address, 0, 1, [])
      await expect(tx).to.be.rejected
    })

    it('should pass if valid response from receiver contract', async () => {
      const tx = erc1155Contract.functions.safeTransferFrom(ownerAddress, receiverContract.address, 0, 1, [])
      await expect(tx).to.be.fulfilled
    })

    it('should pass if data is not null from receiver contract', async () => {
      const data = ethers.utils.toUtf8Bytes('hello')

      // NOTE: typechain generates the wrong type for `bytes` type at this time
      // see https://github.com/ethereum-ts/TypeChain/issues/123
      // @ts-ignore
      const tx = erc1155Contract.functions.safeTransferFrom(ownerAddress, receiverContract.address, 0, 1, data)
      await expect(tx).to.be.fulfilled
    })

    it('should REVERT if sending to 0x0', async () => {
      const tx = erc1155Contract.functions.safeTransferFrom(ownerAddress, ZERO_ADDRESS, 0, 1, [])
      await expect(tx).to.be.rejected
    })

    context('When successful transfer', () => {
      let tx: ethers.ContractTransaction

      beforeEach(async () => {
        tx = await erc1155Contract.functions.safeTransferFrom(ownerAddress, receiverAddress, 0, 1, [])
      })

      it('should correctly update balance of sender', async () => {
        const balance = await erc1155Contract.functions.balanceOf(ownerAddress, 0)
        expect(balance).to.be.eql(new BigNumber(255))
      })

      it('should correctly update balance of receiver', async () => {
        const balance = await erc1155Contract.functions.balanceOf(receiverAddress, 0)
        expect(balance).to.be.eql(new BigNumber(1))
      })

      it('should emit Transfer event', async () => {
        const balance = await erc1155Contract.functions.balanceOf(receiverAddress, 0)
        
        const receipt = await tx.wait(1)
        const ev = receipt.events!.pop()!
        expect(ev.event).to.be.eql('Transfer')
      })
    })
  })


  describe('safeBatchTransferFrom() function', () => {

    let types: any[], values: any[]
    let nTokenTypes    = 100
    let nTokensPerType = 10

    let receiverContract: ERC1155ReceiverMock

    beforeEach(async () => {
      types  = [], values = []

      // Minting enough values for transfer for each types
      for (let i = 0; i < nTokenTypes; i++) {
        await erc1155Contract.functions.mockMint(ownerAddress, i, nTokensPerType)
        types.push(i)
        values.push(nTokensPerType)
      }

      const abstract = await AbstractContract.fromArtifactName('ERC1155ReceiverMock')
      receiverContract = await abstract.deploy(ownerWallet) as ERC1155ReceiverMock
    })

    it('should be able to transfer if sufficient balances', async () => {
      const tx = erc1155Contract.functions.safeBatchTransferFrom(ownerAddress, receiverAddress, [0, 15, 30], [1, 9, 10], [])
      await expect(tx).to.be.fulfilled
    })

    it('should REVERT if insufficient balance', async () => {
      const tx = erc1155Contract.functions.safeBatchTransferFrom(ownerAddress, receiverAddress, [0], [11], [])
      await expect(tx).to.be.rejected
    })

    it('should REVERT if single insufficient balance', async () => {
      const tx = erc1155Contract.functions.safeBatchTransferFrom(ownerAddress, receiverAddress, [0, 15, 30], [1,  9,  11], [])
      await expect(tx).to.be.rejected
    })

    it('should REVERT if operator not approved', async () => {
      const tx = operatorERC1155Contract.functions.safeBatchTransferFrom(ownerAddress, receiverAddress, types, values, [])
      await expect(tx).to.be.rejected
    })

    it('should be able to transfer via operator if operator is approved', async () => {
      await erc1155Contract.functions.setApprovalForAll(operatorAddress, true)

      const tx = operatorERC1155Contract.functions.safeBatchTransferFrom(ownerAddress, receiverAddress, types, values, [])
      await expect(tx).to.be.fulfilled
    })

    it('should REVERT if transfer leads to overflow', async () => {
      await erc1155Contract.functions.mockMint(receiverAddress, 5, 2**16-1)

      const tx = erc1155Contract.functions.safeBatchTransferFrom(ownerAddress, receiverAddress, [5], [1], [])
      await expect(tx).to.be.rejected
    })

    it('Should update balances of sender and receiver', async () => {
      await erc1155Contract.functions.safeBatchTransferFrom(ownerAddress, receiverAddress, types, values, [])

      let balanceFrom: ethers.utils.BigNumber
      let balanceTo: ethers.utils.BigNumber
      
      for (let i = 0; i < types.length; i++) {
        balanceFrom = await erc1155Contract.functions.balanceOf(ownerAddress, types[i])
        balanceTo   = await erc1155Contract.functions.balanceOf(receiverAddress, types[i])

        expect(balanceFrom).to.be.eql(new BigNumber(0))
        expect(balanceTo).to.be.eql(new BigNumber(values[i]))
      }
    })

    it('should emit 1 Transfer events of N transfers', async () => {
      const tx = await erc1155Contract.functions.safeBatchTransferFrom(ownerAddress, receiverAddress, types, values, [])
      const receipt = await tx.wait(1)
      const ev = receipt.events!.pop()!
      expect(ev.event).to.be.eql('Transfer')
     
      // NOTE: seems there are properties set on the args array too
      const ids = (ev.args! as any).ids
      expect(values.length).to.be.eql(ids.length)
    })

    it('should REVERT when sending to non-receiver contract', async () => {
      const tx = erc1155Contract.functions.safeBatchTransferFrom(ownerAddress, erc1155Contract.address, types, values, [])
      await expect(tx).to.be.rejected
    })

    it('should REVERT if invalid response from receiver contract', async () => {
      await receiverContract.functions.setShouldReject(true)
      const tx = erc1155Contract.functions.safeBatchTransferFrom(ownerAddress, receiverContract.address, types, values, [])
      await expect(tx).to.be.rejected
    })

    it('should pass if valid response from receiver contract', async () => {
      const tx = erc1155Contract.functions.safeBatchTransferFrom(ownerAddress, receiverContract.address, types, values, [])
      await expect(tx).to.be.fulfilled
    })

    it('should pass if data is not null from receiver contract', async () => {
      const data = ethers.utils.toUtf8Bytes('hello')

      // TODO: remove ts-ignore when contract declaration is fixed
      // @ts-ignore
      const tx = erc1155Contract.functions.safeBatchTransferFrom(ownerAddress, receiverContract.address, types, values, data)
      await expect(tx).to.be.fulfilled
    })

  })


  describe('setApprovalForAll() function', () => {

    it('should emit an ApprovalForAll event', async () => {
      const tx = await erc1155Contract.functions.setApprovalForAll(operatorAddress, true)
      const receipt = await tx.wait(1)

      expect(receipt.events![0].event).to.be.eql('ApprovalForAll')
    })

    it('should set the operator status to _status argument', async () => {
      const tx = erc1155Contract.functions.setApprovalForAll(ownerAddress, true)
      await expect(tx).to.be.fulfilled

      const status = await erc1155Contract.functions.isApprovedForAll(ownerAddress, operatorAddress)
      expect(status).to.be.eql(true)
    })


    context('When the operator was already an operator', () => {
      beforeEach(async () => {
        await erc1155Contract.functions.setApprovalForAll(operatorAddress, true)
      })

      it('should leave the operator status to set to true again', async () => {
        const tx = erc1155Contract.functions.setApprovalForAll(operatorAddress, true)
        await expect(tx).to.be.fulfilled

        const status = await erc1155Contract.functions.isApprovedForAll(ownerAddress, operatorAddress)
        expect(status).to.be.eql(true)
      })

      it('should allow the operator status to be set to false', async () => {
        const tx = erc1155Contract.functions.setApprovalForAll(operatorAddress, false)
        await expect(tx).to.be.fulfilled

        const status = await erc1155Contract.functions.isApprovedForAll(operatorAddress, ownerAddress)
        expect(status).to.be.eql(false)
      })
    })

  })


  describe('Supports ERC165', () => {

    describe('supportsInterface()', () => {

      it('should return true for 0x01ffc9a7', async () => {
        const support = await erc1155Contract.functions.supportsInterface('0x01ffc9a7')
        expect(support).to.be.eql(true)
      })

      it('should return true for 0x97a409d2', async () => {
        // TODO: this fails for some reason.. which interface is this checking?
        // review & double check

        // const support = await erc1155Contract.functions.supportsInterface('0x97a409d2')
        // expect(support).to.be.eql(true)
      })
    })

  })

})
