import * as ethers from 'ethers'

import { AbstractContract, assert, expect, BigNumber } from './utils'
import * as utils from './utils'

import { ERC1155XMock } from 'typings/contracts/ERC1155XMock'

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


contract('ERC1155XMock', (accounts: string[]) => {

  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

  let ownerAddress: string
  let receiverAddress: string
  let anyoneAddress: string
  let operatorAddress: string

  let erc1155XContract: ERC1155XMock
  let anyoneERC1155XContract: ERC1155XMock

  context('When ERC1155XMock contract is deployed', () => {
    before(async () => {
      ownerAddress = await ownerWallet.getAddress()
      receiverAddress = await receiverWallet.getAddress()
      anyoneAddress = await anyoneWallet.getAddress()
      operatorAddress = await operatorWallet.getAddress()
    })

    beforeEach(async () => {
      let abstract = await AbstractContract.fromArtifactName('ERC1155XMock')
      erc1155XContract = await abstract.deploy(ownerWallet) as ERC1155XMock
      anyoneERC1155XContract = await erc1155XContract.connect(anyoneSigner) as ERC1155XMock
    })

    describe('mint() function', () => {
      const tokenID = 666
      const amount = 11

      it('should ALLOW owner to call mint()', async () => {
        const tx = erc1155XContract.functions.mint(receiverAddress, tokenID, amount)
        await expect(tx).to.be.fulfilled
      })

      it('should NOT allow anyone to call mint()', async () => {
        const tx = anyoneERC1155XContract.functions.mint(receiverAddress, tokenID, amount)
        await expect(tx).to.be.rejected
      })

      it('should increase the balance of receiver by the right amount', async () => {
        const recipientBalanceA = await erc1155XContract.functions.balanceOf(receiverAddress, tokenID)
        await erc1155XContract.functions.mint(receiverAddress, tokenID, amount)

        const recipientBalanceB = await erc1155XContract.functions.balanceOf(receiverAddress, tokenID)

        expect(recipientBalanceB).to.be.eql(recipientBalanceA.add(amount))
      })

      it('should REVERT if amount is larger than limit', async () => {
        const maxVal = 2**16
        const tx = erc1155XContract.functions.mint(receiverAddress, tokenID, maxVal)
        await expect(tx).to.be.rejected
      })

      it('should emit a Transfer event', async () => {
        const tx = await erc1155XContract.functions.mint(receiverAddress, tokenID, amount)
        const receipt = await tx.wait(1)

        const ev = receipt.events![0]
        expect(ev.event).to.be.eql('TransferSingle')
      })

      it('should have 0x0 as `from` argument in Transfer event', async () => {
        const tx = await erc1155XContract.functions.mint(receiverAddress, tokenID, amount)
        const receipt = await tx.wait(1)

        // TODO: this form can be improved eventually as ethers improves its api
        // or we write a wrapper function to parse the tx
        const ev = receipt.events![0]
        const args = ev.args! as any

        expect(args._from).to.be.eql(ZERO_ADDRESS)
      })

    })

    describe('batchMint() function', () => {
      const Ntypes = 100
      const amountToMint = 10
      const typesArray  = Array.apply(null, {length: Ntypes}).map(Number.call, Number)
      const amountArray = Array.apply(null, Array(Ntypes)).map(Number.prototype.valueOf, amountToMint)

      it('should ALLOW owner to call batchMint()', async () => {        
        let req = erc1155XContract.functions.batchMint(receiverAddress, typesArray, amountArray)
        let tx = await expect(req).to.be.fulfilled as ethers.ContractTransaction
        // const receipt = await tx.wait()
        // console.log('Batch mint :' + receipt.gasUsed)
      })

      it('should NOT allow anyone to call batchMint()', async () => {
        const tx = anyoneERC1155XContract.functions.batchMint(receiverAddress, typesArray, amountArray)
        await expect(tx).to.be.rejected
      })

      it.skip('should increase the balances of receiver by the right amounts', async () => {
        // await this.token.batchMint(receiver, typesArray, amountArray, {from: owner});

        // let balanceTo;
        
        // for (var i = 0; i < typesArray.length; i++){
        //   balanceTo = await this.token.balanceOf(receiver, typesArray[i]);
        //   balanceTo.should.be.bignumber.equal(amountArray[i]);
        // }
      })

      it('should increase the balances of receiver by the right amounts', async () => {
        await erc1155XContract.functions.batchMint(receiverAddress, typesArray, amountArray)

        for (let i = 0; i < typesArray.length; i++) {
          const balanceTo = await erc1155XContract.functions.balanceOf(receiverAddress, typesArray[i])
          expect(balanceTo).to.be.eql(new BigNumber(amountArray[i]))
        }
      })

      it.skip('should REVERT if an amount is larger than limit', async () => {
        // let maxVal = 65536;
        // await this.token.batchMint(receiver, [0, 1, 2], [1, maxVal, 2], {from : owner}).should.be.rejected;
      })

      it.skip('should REVERT if a class is out of range', async () => {
        // let maxClass = 4294967296;
        // await this.token.batchMint(receiver, [0, maxClass, 2], [1, 2, 3], {from : owner}).should.be.rejected;
      })

      it('should emit 1 Transfer events of N transfers', async () => {
        const tx = await erc1155XContract.functions.batchMint(receiverAddress, typesArray, amountArray)
        const receipt = await tx.wait()
        const ev = receipt.events![0]
        expect(ev.event).to.be.eql('TransferBatch')

        const args = ev.args! as any
        expect(args._ids.length).to.be.eql(typesArray.length)
      })

      it('should have 0x0 as `from` argument in Transfer events', async () => {
        const tx = await erc1155XContract.functions.batchMint(receiverAddress, typesArray, amountArray)
        const receipt = await tx.wait()
        const args = receipt.events![0].args! as any
        expect(args._from).to.be.eql(ZERO_ADDRESS)
      })

    })

  })

})
