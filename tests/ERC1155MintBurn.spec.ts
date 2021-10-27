import * as ethers from 'ethers'

import { AbstractContract, expect, RevertError, BigNumber } from './utils'
import * as utils from './utils'

import {
  ERC1155MetaMintBurnMock,
  ERC1155ReceiverMock
} from 'src/gen/typechain'

// init test wallets from package.json mnemonic
import { web3 } from 'hardhat'

const { wallet: ownerWallet, provider: ownerProvider, signer: ownerSigner } = utils.createTestWallet(web3, 1)

const { wallet: receiverWallet, provider: receiverProvider, signer: receiverSigner } = utils.createTestWallet(web3, 2)

const { wallet: anyoneWallet, provider: anyoneProvider, signer: anyoneSigner } = utils.createTestWallet(web3, 3)

const { wallet: operatorWallet, provider: operatorProvider, signer: operatorSigner } = utils.createTestWallet(web3, 4)

describe('ERC1155MintBurn', () => {
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
  const NAME = "MyERC1155"
  const METADATA_URI = "https://example.com/"

  let ownerAddress: string
  let receiverAddress: string
  let anyoneAddress: string
  let operatorAddress: string

  let erc1155MintBurnContract: ERC1155MetaMintBurnMock
  let anyoneERC1155MintBurnContract: ERC1155MetaMintBurnMock
  let receiverContract: ERC1155ReceiverMock

  context('When ERC1155MintBurn contract is deployed', () => {
    before(async () => {
      ownerAddress = await ownerWallet.getAddress()
      receiverAddress = await receiverWallet.getAddress()
      anyoneAddress = await anyoneWallet.getAddress()
      operatorAddress = await operatorWallet.getAddress()
    })

    beforeEach(async () => {
      const abstractReceiver = await AbstractContract.fromArtifactName('ERC1155ReceiverMock')
      receiverContract = (await abstractReceiver.deploy(ownerWallet)) as ERC1155ReceiverMock

      const abstract = await AbstractContract.fromArtifactName('ERC1155MetaMintBurnMock')
      erc1155MintBurnContract = (await abstract.deploy(ownerWallet, [NAME, METADATA_URI])) as ERC1155MetaMintBurnMock
      anyoneERC1155MintBurnContract = (await erc1155MintBurnContract.connect(anyoneSigner)) as ERC1155MetaMintBurnMock
    })

    describe('_mint() function', () => {
      const tokenID = 666
      const amount = 11

      it('should ALLOW inheriting contract to call _mint()', async () => {
        const tx = erc1155MintBurnContract.mintMock(receiverAddress, tokenID, amount, [])
        await expect(tx).to.be.fulfilled
      })

      it('should NOT allow anyone to call _mint()', async () => {
        const transaction = {
          to: erc1155MintBurnContract.address,
          data:
            '0x7776afa0000000000000000000000000b87213121fb89cbd8b877cb1bb3ff84dd2869cfa' +
            '000000000000000000000000000000000000000000000000000000000000029a0000000000000000' +
            '00000000000000000000000000000000000000000000000b'
        }
        const tx = anyoneWallet.sendTransaction(transaction)
        await expect(tx).to.be.rejectedWith(RevertError('ERC1155MetaMintBurnMock: INVALID_METHOD'))
      })

      it('should increase the balance of receiver by the right amount', async () => {
        const recipientBalanceA = await erc1155MintBurnContract.balanceOf(receiverAddress, tokenID)
        await erc1155MintBurnContract.mintMock(receiverAddress, tokenID, amount, [])

        const recipientBalanceB = await erc1155MintBurnContract.balanceOf(receiverAddress, tokenID)

        expect(recipientBalanceB).to.be.eql(recipientBalanceA.add(amount))
      })

      it('should REVERT if added amount leads to overflow', async () => {
        const val = BigNumber.from(2)
          .pow(256)
          .sub(1)
        await erc1155MintBurnContract.mintMock(receiverAddress, tokenID, val, [])
        const tx = erc1155MintBurnContract.mintMock(receiverAddress, tokenID, 1, [])
        await expect(tx).to.be.rejectedWith(RevertError('SafeMath#add: OVERFLOW'))
      })

      it('should REVERT when sending to non-receiver contract', async () => {
        const tx = erc1155MintBurnContract.mintMock(erc1155MintBurnContract.address, tokenID, amount, [])
        await expect(tx).to.be.rejectedWith(RevertError('ERC1155MetaMintBurnMock: INVALID_METHOD'))
      })

      it('should REVERT if invalid response from receiver contract', async () => {
        await receiverContract.setShouldReject(true)

        const tx = erc1155MintBurnContract.mintMock(receiverContract.address, tokenID, amount, [])
        await expect(tx).to.be.rejectedWith(RevertError('ERC1155#_callonERC1155Received: INVALID_ON_RECEIVE_MESSAGE'))
      })

      it('should pass if valid response from receiver contract', async () => {
        const tx = erc1155MintBurnContract.mintMock(receiverContract.address, tokenID, amount, [])
        await expect(tx).to.be.fulfilled
      })

      it('should pass if data is not null to receiver contract', async () => {
        const data = ethers.utils.toUtf8Bytes('Hello from the other side')

        // NOTE: typechain generates the wrong type for `bytes` type at this time
        // see https://github.com/ethereum-ts/TypeChain/issues/123
        // @ts-ignore
        const tx = erc1155MintBurnContract.mintMock(receiverContract.address, tokenID, amount, data)
        await expect(tx).to.be.fulfilled
      })

      it('should have balances updated before onERC1155Received is called', async () => {
        const toPreBalance = await erc1155MintBurnContract.balanceOf(receiverContract.address, tokenID)

        // Get event filter to get internal tx event
        const filterFromReceiverContract = receiverContract.filters.TransferSingleReceiver(null, null, null, null)

        await erc1155MintBurnContract.mintMock(receiverContract.address, tokenID, amount, [])

        // Get logs from internal transaction event
        // @ts-ignore (https://github.com/ethers-io/ethers.js/issues/204#issuecomment-427059031)
        filterFromReceiverContract.fromBlock = 0

        const logs = await ownerProvider.getLogs(filterFromReceiverContract)
        const args = receiverContract.interface.decodeEventLog(
          receiverContract.interface.events['TransferSingleReceiver(address,address,uint256,uint256)'],
          logs[0].data,
          logs[0].topics
        )

        expect(args._from).to.be.eql(ZERO_ADDRESS)
        expect(args._to).to.be.eql(receiverContract.address)
        expect(args._toBalance).to.be.eql(toPreBalance.add(amount))
      })

      it('should have TransferSingle event emitted before onERC1155Received is called', async () => {
        // Get event filter to get internal tx event
        const tx = await erc1155MintBurnContract.mintMock(receiverContract.address, tokenID, amount, [])
        const receipt = await tx.wait(1)

        const firstEventTopic = receipt.logs![0].topics[0]
        const secondEventTopic = receipt.logs![1].topics[0]

        expect(firstEventTopic).to.be.equal(
          erc1155MintBurnContract.interface.getEventTopic(
            erc1155MintBurnContract.interface.events['TransferSingle(address,address,address,uint256,uint256)']
          )
        )
        expect(secondEventTopic).to.be.equal(
          receiverContract.interface.getEventTopic(
            receiverContract.interface.events['TransferSingleReceiver(address,address,uint256,uint256)']
          )
        )
      })

      it('should emit a Transfer event', async () => {
        const tx = await erc1155MintBurnContract.mintMock(receiverAddress, tokenID, amount, [])
        const receipt = await tx.wait(1)

        const ev = receipt.events![0]
        expect(ev.event).to.be.eql('TransferSingle')
      })

      it('should have 0x0 as `from` argument in Transfer event', async () => {
        const tx = await erc1155MintBurnContract.mintMock(receiverAddress, tokenID, amount, [])
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
      const typesArray = Array.apply(null, { length: Ntypes }).map(Number.call, Number)
      const amountArray = Array.apply(null, Array(Ntypes)).map(Number.prototype.valueOf, amountToMint)

      it('should ALLOW inheriting contract to call _batchMint()', async () => {
        const req = erc1155MintBurnContract.batchMintMock(receiverAddress, typesArray, amountArray, [])
        await expect(req).to.be.fulfilled
      })

      it('should PASS if arrays are empty', async () => {
        const tx = erc1155MintBurnContract.batchMintMock(receiverAddress, [], [], [])
        await expect(tx).to.be.fulfilled
      })

      it('should NOT allow anyone to call _batchMint()', async () => {
        const transaction = {
          to: erc1155MintBurnContract.address,
          data:
            '0x2589aeae00000000000000000000000035ef07393b57464e93deb59175ff72e6499450cf' +
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
        await erc1155MintBurnContract.batchMintMock(receiverAddress, typesArray, amountArray, [])

        for (let i = 0; i < typesArray.length; i++) {
          const balanceTo = await erc1155MintBurnContract.balanceOf(receiverAddress, typesArray[i])
          expect(balanceTo).to.be.eql(BigNumber.from(amountArray[i]))
        }
      })

      it('should REVERT when sending to non-receiver contract', async () => {
        const tx = erc1155MintBurnContract.batchMintMock(erc1155MintBurnContract.address, typesArray, amountArray, [], {
          gasLimit: 2000000
        })
        await expect(tx).to.be.rejectedWith(RevertError('ERC1155MetaMintBurnMock: INVALID_METHOD'))
      })

      it('should REVERT if invalid response from receiver contract', async () => {
        await receiverContract.setShouldReject(true)
        const tx = erc1155MintBurnContract.batchMintMock(receiverContract.address, typesArray, amountArray, [], {
          gasLimit: 2000000
        })
        await expect(tx).to.be.rejectedWith(RevertError('ERC1155#_callonERC1155BatchReceived: INVALID_ON_RECEIVE_MESSAGE'))
      })

      it('should pass if valid response from receiver contract', async () => {
        const tx = erc1155MintBurnContract.batchMintMock(receiverContract.address, typesArray, amountArray, [], {
          gasLimit: 2000000
        })
        await expect(tx).to.be.fulfilled
      })

      it('should pass if data is not null from receiver contract', async () => {
        const data = ethers.utils.toUtf8Bytes('Hello from the other side')

        // TODO: remove ts-ignore when contract declaration is fixed
        // @ts-ignore
        const tx = erc1155MintBurnContract.batchMintMock(receiverContract.address, typesArray, amountArray, data, {
          gasLimit: 2000000
        })
        await expect(tx).to.be.fulfilled
      })

      it('should have balances updated before onERC1155BatchReceived is called', async () => {
        const toAddresses = Array(typesArray.length).fill(receiverContract.address)

        const toPreBalances = await erc1155MintBurnContract.balanceOfBatch(toAddresses, typesArray)

        // Get event filter to get internal tx event
        const filterFromReceiverContract = receiverContract.filters.TransferBatchReceiver(null, null, null, null)

        await erc1155MintBurnContract.batchMintMock(receiverContract.address, typesArray, amountArray, [], { gasLimit: 2000000 })

        // Get logs from internal transaction event
        // @ts-ignore (https://github.com/ethers-io/ethers.js/issues/204#issuecomment-427059031)
        filterFromReceiverContract.fromBlock = 0

        const logs = await ownerProvider.getLogs(filterFromReceiverContract)
        const args = receiverContract.interface.decodeEventLog(
          receiverContract.interface.events['TransferBatchReceiver(address,address,uint256[],uint256[])'],
          logs[0].data,
          logs[0].topics
        )

        expect(args._from).to.be.eql(ZERO_ADDRESS)
        expect(args._to).to.be.eql(receiverContract.address)
        for (let i = 0; i < typesArray.length; i++) {
          expect(args._toBalances[i]).to.be.eql(toPreBalances[i].add(amountArray[i]))
        }
      })

      it('should have TransferBatch event emitted before onERC1155BatchReceived is called', async () => {
        // Get event filter to get internal tx event
        const tx = await erc1155MintBurnContract.batchMintMock(receiverContract.address, typesArray, amountArray, [], {
          gasLimit: 2000000
        })
        const receipt = await tx.wait(1)

        const firstEventTopic = receipt.logs![0].topics[0]
        const secondEventTopic = receipt.logs![1].topics[0]

        expect(firstEventTopic).to.be.equal(
          erc1155MintBurnContract.interface.getEventTopic(
            erc1155MintBurnContract.interface.events['TransferBatch(address,address,address,uint256[],uint256[])']
          )
        )
        expect(secondEventTopic).to.be.equal(
          receiverContract.interface.getEventTopic(
            receiverContract.interface.events['TransferBatchReceiver(address,address,uint256[],uint256[])']
          )
        )
      })

      it('should emit 1 Transfer events of N transfers', async () => {
        const tx = await erc1155MintBurnContract.batchMintMock(receiverAddress, typesArray, amountArray, [])
        const receipt = await tx.wait()
        const ev = receipt.events![0]
        expect(ev.event).to.be.eql('TransferBatch')

        const args = ev.args! as any
        expect(args._ids.length).to.be.eql(typesArray.length)
      })

      it('should have 0x0 as `from` argument in Transfer events', async () => {
        const tx = await erc1155MintBurnContract.batchMintMock(receiverAddress, typesArray, amountArray, [])
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
        await erc1155MintBurnContract.mintMock(receiverAddress, tokenID, initBalance, [])
      })

      it('should ALLOW inheriting contract to call _burn()', async () => {
        const tx = erc1155MintBurnContract.burnMock(receiverAddress, tokenID, amountToBurn)
        await expect(tx).to.be.fulfilled
      })

      it('should NOT allow anyone to call _burn()', async () => {
        const transaction = {
          to: erc1155MintBurnContract.address,
          data:
            '0x464a5ffb00000000000000000000000008970fed061e7747cd9a38d680a601510cb659fb' +
            '000000000000000000000000000000000000000000000000000000000000029a0000000000000000' +
            '00000000000000000000000000000000000000000000000a'
        }
        const tx = anyoneWallet.sendTransaction(transaction)
        await expect(tx).to.be.rejectedWith(RevertError('ERC1155MetaMintBurnMock: INVALID_METHOD'))
      })

      it('should decrease the balance of receiver by the right amount', async () => {
        const recipientBalanceA = await erc1155MintBurnContract.balanceOf(receiverAddress, tokenID)
        await erc1155MintBurnContract.burnMock(receiverAddress, tokenID, amountToBurn)

        const recipientBalanceB = await erc1155MintBurnContract.balanceOf(receiverAddress, tokenID)

        expect(recipientBalanceB).to.be.eql(recipientBalanceA.sub(amountToBurn))
      })

      it('should REVERT if amount is hgher than balance', async () => {
        const invalidVal = initBalance + 1
        const tx = erc1155MintBurnContract.burnMock(receiverAddress, tokenID, invalidVal)
        await expect(tx).to.be.rejectedWith(RevertError('SafeMath#sub: UNDERFLOW'))
      })

      it('should emit a Transfer event', async () => {
        const tx = await erc1155MintBurnContract.burnMock(receiverAddress, tokenID, amountToBurn)
        const receipt = await tx.wait(1)

        const ev = receipt.events![0]
        expect(ev.event).to.be.eql('TransferSingle')
      })

      it('should have 0x0 as `to` argument in Transfer event', async () => {
        const tx = await erc1155MintBurnContract.burnMock(receiverAddress, tokenID, amountToBurn)
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
      const typesArray = Array.apply(null, { length: Ntypes }).map(Number.call, Number)
      const burnAmountArray = Array.apply(null, Array(Ntypes)).map(Number.prototype.valueOf, amountToBurn)
      const initBalanceArray = Array.apply(null, Array(Ntypes)).map(Number.prototype.valueOf, initBalance)

      beforeEach(async () => {
        await erc1155MintBurnContract.batchMintMock(receiverAddress, typesArray, initBalanceArray, [])
      })

      it('should ALLOW inheriting contract to call _batchBurn()', async () => {
        const req = erc1155MintBurnContract.batchBurnMock(receiverAddress, typesArray, burnAmountArray)
        const tx = (await expect(req).to.be.fulfilled) as ethers.ContractTransaction
        // const receipt = await tx.wait()
        // console.log('Batch mint :' + receipt.gasUsed)
      })

      // Should call mock's fallback function
      it('should NOT allow anyone to call _batchBurn()', async () => {
        const transaction = {
          to: erc1155MintBurnContract.address,
          data:
            '0xb389c3bb000000000000000000000000dc04977a2078c8ffdf086d618d1f961b6c546222' +
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
        await erc1155MintBurnContract.batchBurnMock(receiverAddress, typesArray, burnAmountArray)

        for (let i = 0; i < typesArray.length; i++) {
          const balanceTo = await erc1155MintBurnContract.balanceOf(receiverAddress, typesArray[i])
          expect(balanceTo).to.be.eql(BigNumber.from(initBalance - burnAmountArray[i]))
        }
      })

      it('should emit 1 Transfer events of N transfers', async () => {
        const tx = await erc1155MintBurnContract.batchBurnMock(receiverAddress, typesArray, burnAmountArray)
        const receipt = await tx.wait()
        const ev = receipt.events![0]
        expect(ev.event).to.be.eql('TransferBatch')

        const args = ev.args! as any
        expect(args._ids.length).to.be.eql(typesArray.length)
      })

      it('should have 0x0 as `to` argument in Transfer events', async () => {
        const tx = await erc1155MintBurnContract.batchBurnMock(receiverAddress, typesArray, burnAmountArray)
        const receipt = await tx.wait()
        const args = receipt.events![0].args! as any
        expect(args._to).to.be.eql(ZERO_ADDRESS)
      })
    })
  })
})
