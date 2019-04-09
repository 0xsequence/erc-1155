import * as ethers from 'ethers'

import { AbstractContract, expect, RevertError, BigNumber } from './utils'
import * as utils from './utils'

import { ERC1155MetaMintBurnMock } from 'typings/contracts/ERC1155MetaMintBurnMock'

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
  wallet: anyoneWallet,
  provider: anyoneProvider,
  signer: anyoneSigner
} = utils.createTestWallet(web3, 3)

const {
  wallet: operatorWallet,
  provider: operatorProvider,
  signer: operatorSigner
} = utils.createTestWallet(web3, 4)


contract('ERC1155MintBurn', (accounts: string[]) => {

  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

  let ownerAddress: string
  let receiverAddress: string
  let anyoneAddress: string
  let operatorAddress: string

  let erc1155MintBurnContract: ERC1155MetaMintBurnMock
  let anyoneERC1155MintBurnContract: ERC1155MetaMintBurnMock

  context('When ERC1155MintBurn contract is deployed', () => {
    before(async () => {
      ownerAddress = await ownerWallet.getAddress()
      receiverAddress = await receiverWallet.getAddress()
      anyoneAddress = await anyoneWallet.getAddress()
      operatorAddress = await operatorWallet.getAddress()
    })

    beforeEach(async () => {
      let abstract = await AbstractContract.fromArtifactName('ERC1155MetaMintBurnMock')
      erc1155MintBurnContract = await abstract.deploy(ownerWallet) as ERC1155MetaMintBurnMock
      anyoneERC1155MintBurnContract = await erc1155MintBurnContract.connect(anyoneSigner) as ERC1155MetaMintBurnMock
    })

    describe('_mint() function', () => {
      const tokenID = 666
      const amount = 11

      it('should ALLOW inheriting contract to call _mint()', async () => {
        const tx = erc1155MintBurnContract.functions.mintMock(receiverAddress, tokenID, amount)
        await expect(tx).to.be.fulfilled
      })

      it('should NOT allow anyone to call _mint()', async () => {
        const transaction = {
          to: erc1155MintBurnContract.address,
          data: '0x7776afa0000000000000000000000000b87213121fb89cbd8b877cb1bb3ff84dd2869cfa' +
          '000000000000000000000000000000000000000000000000000000000000029a0000000000000000' + 
          '00000000000000000000000000000000000000000000000b'
        } 
        const tx = anyoneWallet.sendTransaction(transaction)
        await expect(tx).to.be.rejectedWith(RevertError('ERC1155MetaMintBurnMock: INVALID_METHOD'))
      })

      it('should increase the balance of receiver by the right amount', async () => {
        const recipientBalanceA = await erc1155MintBurnContract.functions.balanceOf(receiverAddress, tokenID)
        await erc1155MintBurnContract.functions.mintMock(receiverAddress, tokenID, amount)

        const recipientBalanceB = await erc1155MintBurnContract.functions.balanceOf(receiverAddress, tokenID)

        expect(recipientBalanceB).to.be.eql(recipientBalanceA.add(amount))
      })

      it('should REVERT if amount is larger than limit', async () => {
        const maxVal = 2**256
        const tx = erc1155MintBurnContract.functions.mintMock(receiverAddress, tokenID, maxVal)
        await expect(tx).to.be.rejected
      })

      it('should emit a Transfer event', async () => {
        const tx = await erc1155MintBurnContract.functions.mintMock(receiverAddress, tokenID, amount)
        const receipt = await tx.wait(1)

        const ev = receipt.events![0]
        expect(ev.event).to.be.eql('TransferSingle')
      })

      it('should have 0x0 as `from` argument in Transfer event', async () => {
        const tx = await erc1155MintBurnContract.functions.mintMock(receiverAddress, tokenID, amount)
        const receipt = await tx.wait(1)

        // TODO: this form can be improved eventually as ethers improves its api
        // or we write a wrapper function to parse the tx
        const ev = receipt.events![0]
        const args = ev.args! as any

        expect(args._from).to.be.eql(ZERO_ADDRESS)
      })

    })

    describe('_batchMint() function', () => {
      const Ntypes = 32
      const amountToMint = 10
      const typesArray  = Array.apply(null, {length: Ntypes}).map(Number.call, Number)
      const amountArray = Array.apply(null, Array(Ntypes)).map(Number.prototype.valueOf, amountToMint)

      it('should ALLOW inheriting contract to call _batchMint()', async () => {        
        let req = erc1155MintBurnContract.functions.batchMintMock(receiverAddress, typesArray, amountArray)
        await expect(req).to.be.fulfilled
      })

      it('should NOT allow anyone to call _batchMint()', async () => {
        const transaction = {
          to: erc1155MintBurnContract.address,
          data: '0x2589aeae00000000000000000000000035ef07393b57464e93deb59175ff72e6499450cf'  +
          '00000000000000000000000000000000000000000000000000000000000000600000000000000000' +
          '0000000000000000000000000000000000000000000000c000000000000000000000000000000000' + 
          '00000000000000000000000000000002000000000000000000000000000000000000000000000000' +
          '00000000000000010000000000000000000000000000000000000000000000000000000000000002' +
          '00000000000000000000000000000000000000000000000000000000000000020000000000000000' +
          '00000000000000000000000000000000000000000000000a00000000000000000000000000000000' +
          '0000000000000000000000000000000a'
        } 

        const tx = anyoneWallet.sendTransaction(transaction)
        await expect(tx).to.be.rejectedWith(RevertError('ERC1155MetaMintBurnMock: INVALID_METHOD'))
      })

      it('should increase the balances of receiver by the right amounts', async () => {
        await erc1155MintBurnContract.functions.batchMintMock(receiverAddress, typesArray, amountArray)

        for (let i = 0; i < typesArray.length; i++) {
          const balanceTo = await erc1155MintBurnContract.functions.balanceOf(receiverAddress, typesArray[i])
          expect(balanceTo).to.be.eql(new BigNumber(amountArray[i]))
        }
      })

      it('should emit 1 Transfer events of N transfers', async () => {
        const tx = await erc1155MintBurnContract.functions.batchMintMock(receiverAddress, typesArray, amountArray)
        const receipt = await tx.wait()
        const ev = receipt.events![0]
        expect(ev.event).to.be.eql('TransferBatch')

        const args = ev.args! as any
        expect(args._ids.length).to.be.eql(typesArray.length)
      })

      it('should have 0x0 as `from` argument in Transfer events', async () => {
        const tx = await erc1155MintBurnContract.functions.batchMintMock(receiverAddress, typesArray, amountArray)
        const receipt = await tx.wait()
        const args = receipt.events![0].args! as any
        expect(args._from).to.be.eql(ZERO_ADDRESS)
      })

    })

    describe('_burn() function', () => {
      const tokenID = 666
      const initBalance = 100
      const amountToBurn = 10

      beforeEach(async () => {
        await erc1155MintBurnContract.functions.mintMock(receiverAddress, tokenID, initBalance);
      })

      it('should ALLOW inheriting contract to call _burn()', async () => {
        const tx = erc1155MintBurnContract.functions.burnMock(receiverAddress, tokenID, amountToBurn)
        await expect(tx).to.be.fulfilled
      })

      it('should NOT allow anyone to call _burn()', async () => {
        const transaction = {
          to: erc1155MintBurnContract.address,
          data: '0x464a5ffb00000000000000000000000008970fed061e7747cd9a38d680a601510cb659fb' + 
          '000000000000000000000000000000000000000000000000000000000000029a0000000000000000' + 
          '00000000000000000000000000000000000000000000000a'
        } 
        const tx = anyoneWallet.sendTransaction(transaction)
        await expect(tx).to.be.rejectedWith(RevertError('ERC1155MetaMintBurnMock: INVALID_METHOD'))
      })

      it('should decrease the balance of receiver by the right amount', async () => {
        const recipientBalanceA = await erc1155MintBurnContract.functions.balanceOf(receiverAddress, tokenID)
        await erc1155MintBurnContract.functions.burnMock(receiverAddress, tokenID, amountToBurn)

        const recipientBalanceB = await erc1155MintBurnContract.functions.balanceOf(receiverAddress, tokenID)

        expect(recipientBalanceB).to.be.eql(recipientBalanceA.sub(amountToBurn))
      })

      it('should REVERT if amount is hgher than balance', async () => {
        const invalidVal = initBalance + 1 
        const tx = erc1155MintBurnContract.functions.burnMock(receiverAddress, tokenID, invalidVal)
        await expect(tx).to.be.rejected
      })

      it('should emit a Transfer event', async () => {
        const tx = await erc1155MintBurnContract.functions.burnMock(receiverAddress, tokenID, amountToBurn)
        const receipt = await tx.wait(1)

        const ev = receipt.events![0]
        expect(ev.event).to.be.eql('TransferSingle')
      })

      it('should have 0x0 as `to` argument in Transfer event', async () => {
        const tx = await erc1155MintBurnContract.functions.burnMock(receiverAddress, tokenID, amountToBurn)
        const receipt = await tx.wait(1)

        // TODO: this form can be improved eventually as ethers improves its api
        // or we write a wrapper function to parse the tx
        const ev = receipt.events![0]
        const args = ev.args! as any

        expect(args._to).to.be.eql(ZERO_ADDRESS)
      })

    })

    describe('batchBurn() function', () => {
      const Ntypes = 32
      const initBalance = 100
      const amountToBurn = 30
      const typesArray  = Array.apply(null, {length: Ntypes}).map(Number.call, Number)
      const burnAmountArray = Array.apply(null, Array(Ntypes)).map(Number.prototype.valueOf, amountToBurn)
      const initBalanceArray = Array.apply(null, Array(Ntypes)).map(Number.prototype.valueOf, initBalance)

      beforeEach(async () => {
        await erc1155MintBurnContract.functions.batchMintMock(receiverAddress, typesArray, initBalanceArray)
      })

      it('should ALLOW inheriting contract to call _batchBurn()', async () => {        
        let req = erc1155MintBurnContract.functions.batchBurnMock(receiverAddress, typesArray, burnAmountArray)
        let tx = await expect(req).to.be.fulfilled as ethers.ContractTransaction
        // const receipt = await tx.wait()
        // console.log('Batch mint :' + receipt.gasUsed)
        
      })

      // Should call mock's fallback function
      it('should NOT allow anyone to call _batchBurn()', async () => {
        const transaction = {
          to: erc1155MintBurnContract.address,
          data: '0xb389c3bb000000000000000000000000dc04977a2078c8ffdf086d618d1f961b6c546222' + 
          '00000000000000000000000000000000000000000000000000000000000000600000000000000000' + 
          '0000000000000000000000000000000000000000000000c000000000000000000000000000000000' + 
          '00000000000000000000000000000002000000000000000000000000000000000000000000000000' + 
          '00000000000000010000000000000000000000000000000000000000000000000000000000000003' + 
          '00000000000000000000000000000000000000000000000000000000000000020000000000000000' + 
          '00000000000000000000000000000000000000000000001e00000000000000000000000000000000' + 
          '0000000000000000000000000000001e'
        } 
        const tx = anyoneWallet.sendTransaction(transaction)
        await expect(tx).to.be.rejectedWith(RevertError('ERC1155MetaMintBurnMock: INVALID_METHOD'))
      })

      it('should decrease the balances of receiver by the right amounts', async () => {
        await erc1155MintBurnContract.functions.batchBurnMock(receiverAddress, typesArray, burnAmountArray)

        for (let i = 0; i < typesArray.length; i++) {
          const balanceTo = await erc1155MintBurnContract.functions.balanceOf(receiverAddress, typesArray[i])
          expect(balanceTo).to.be.eql(new BigNumber(initBalance - burnAmountArray[i]))
        }
      })

      it('should emit 1 Transfer events of N transfers', async () => {
        const tx = await erc1155MintBurnContract.functions.batchBurnMock(receiverAddress, typesArray, burnAmountArray)
        const receipt = await tx.wait()
        const ev = receipt.events![0]
        expect(ev.event).to.be.eql('TransferBatch')

        const args = ev.args! as any
        expect(args._ids.length).to.be.eql(typesArray.length)
      })

      it('should have 0x0 as `to` argument in Transfer events', async () => {
        const tx = await erc1155MintBurnContract.functions.batchBurnMock(receiverAddress, typesArray, burnAmountArray)
        const receipt = await tx.wait()
        const args = receipt.events![0].args! as any
        expect(args._to).to.be.eql(ZERO_ADDRESS)
      })

    })

  })

})
