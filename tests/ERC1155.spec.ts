import { ethers } from 'ethers'

import {
  AbstractContract,
  expect,
  BigNumber,
  RevertError,
  RevertUnsafeMathError,
  createTestWallet,
  HIGH_GAS_LIMIT
} from './utils'

import { ERC1155MetaMintBurnMock, ERC1155ReceiverMock, ERC1155OperatorMock } from 'src'

// init test wallets from package.json mnemonic
import { web3 } from 'hardhat'

const { wallet: ownerWallet, provider: ownerProvider, signer: ownerSigner } = createTestWallet(web3, 0)

const { wallet: receiverWallet, provider: receiverProvider, signer: receiverSigner } = createTestWallet(web3, 2)

const { wallet: operatorWallet, provider: operatorProvider, signer: operatorSigner } = createTestWallet(web3, 4)

describe('ERC1155', () => {
  const MAXVAL = BigNumber.from(2)
    .pow(256)
    .sub(1) // 2**256 - 1
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
  const NAME = 'MyERC1155'
  const METADATA_URI = 'https://example.com/'

  let ownerAddress: string
  let receiverAddress: string
  let operatorAddress: string
  let erc1155Abstract: AbstractContract
  let operatorAbstract: AbstractContract

  let erc1155Contract: ERC1155MetaMintBurnMock
  let operatorERC1155Contract: ERC1155MetaMintBurnMock

  // load contract abi and deploy to test server
  before(async () => {
    ownerAddress = await ownerWallet.getAddress()
    receiverAddress = await receiverWallet.getAddress()
    operatorAddress = await operatorWallet.getAddress()

    erc1155Abstract = await AbstractContract.fromArtifactName('ERC1155MetaMintBurnMock')
    operatorAbstract = await AbstractContract.fromArtifactName('ERC1155OperatorMock')
  })

  // deploy before each test, to reset state of contract
  beforeEach(async () => {
    erc1155Contract = (await erc1155Abstract.deploy(ownerWallet, [NAME, METADATA_URI])) as ERC1155MetaMintBurnMock
    operatorERC1155Contract = (await erc1155Contract.connect(operatorSigner)) as ERC1155MetaMintBurnMock
  })

  describe('Getter functions', () => {
    beforeEach(async () => {
      await erc1155Contract.mintMock(ownerAddress, 5, 256, [])
      await erc1155Contract.mintMock(receiverAddress, 66, 133, [])
    })

    it('balanceOf() should return types balance for queried address', async () => {
      const balance5 = await erc1155Contract.balanceOf(ownerAddress, 5)
      expect(balance5).to.be.eql(BigNumber.from(256))

      const balance16 = await erc1155Contract.balanceOf(ownerAddress, 16)
      expect(balance16).to.be.eql(BigNumber.from(0))
    })

    it('balanceOfBatch() should return types balance for queried addresses', async () => {
      const balances = await erc1155Contract.balanceOfBatch([ownerAddress, receiverAddress], [5, 66])
      expect(balances[0]).to.be.eql(BigNumber.from(256))
      expect(balances[1]).to.be.eql(BigNumber.from(133))

      const balancesNull = await erc1155Contract.balanceOfBatch([ownerAddress, receiverAddress], [1337, 1337])
      expect(balancesNull[0]).to.be.eql(BigNumber.from(0))
      expect(balancesNull[1]).to.be.eql(BigNumber.from(0))
    })

    it('supportsInterface(0x4e2312e0) on receiver should return true', async () => {
      const abstract = await AbstractContract.fromArtifactName('ERC1155ReceiverMock')
      const receiverContract = (await abstract.deploy(ownerWallet)) as ERC1155ReceiverMock
      const returnedValue = await receiverContract.supportsInterface('0x4e2312e0')
      await expect(returnedValue).to.be.equal(true)
    })

    it('supportsInterface(0x01ffc9a7) on receiver should return true', async () => {
      const abstract = await AbstractContract.fromArtifactName('ERC1155ReceiverMock')
      const receiverContract = (await abstract.deploy(ownerWallet)) as ERC1155ReceiverMock
      const returnedValue = await receiverContract.supportsInterface('0x01ffc9a7')
      await expect(returnedValue).to.be.equal(true)
    })

    it('supportsInterface(0x4e2312ee) on receiver should return false', async () => {
      const abstract = await AbstractContract.fromArtifactName('ERC1155ReceiverMock')
      const receiverContract = (await abstract.deploy(ownerWallet)) as ERC1155ReceiverMock
      const returnedValue = await receiverContract.supportsInterface('0x4e2312ee')
      await expect(returnedValue).to.be.equal(false)
    })
  })

  describe('safeTransferFrom() function', () => {
    let receiverContract: ERC1155ReceiverMock
    let operatorContract: ERC1155OperatorMock

    beforeEach(async () => {
      const abstract = await AbstractContract.fromArtifactName('ERC1155ReceiverMock')
      receiverContract = (await abstract.deploy(ownerWallet)) as ERC1155ReceiverMock
      operatorContract = (await operatorAbstract.deploy(operatorWallet)) as ERC1155OperatorMock
      await erc1155Contract.mintMock(ownerAddress, 0, 256, [])
    })

    it('should be able to transfer if sufficient balance', async () => {
      const tx = erc1155Contract.safeTransferFrom(ownerAddress, receiverAddress, 0, 1, [])
      await expect(tx).to.be.fulfilled
    })

    it('should REVERT if insufficient balance', async () => {
      const tx = erc1155Contract.safeTransferFrom(ownerAddress, receiverAddress, 0, 257, [], HIGH_GAS_LIMIT)
      await expect(tx).to.be.rejectedWith(RevertUnsafeMathError())
    })

    it('should REVERT if sending to 0x0', async () => {
      const tx = erc1155Contract.safeTransferFrom(ownerAddress, ZERO_ADDRESS, 0, 1, [], HIGH_GAS_LIMIT)
      await expect(tx).to.be.rejectedWith(RevertError('ERC1155#safeTransferFrom: INVALID_RECIPIENT'))
    })

    it('should REVERT if operator not approved', async () => {
      const tx = operatorERC1155Contract.safeTransferFrom(ownerAddress, receiverAddress, 0, 1, [])
      await expect(tx).to.be.rejectedWith(RevertError('ERC1155#safeTransferFrom: INVALID_OPERATOR'))
    })

    it('should be able to transfer via operator if operator is approved', async () => {
      // owner first gives operatorWallet address approval permission
      await erc1155Contract.setApprovalForAll(operatorAddress, true)

      // operator performs a transfer
      const tx = operatorERC1155Contract.safeTransferFrom(ownerAddress, receiverAddress, 0, 1, [])
      await expect(tx).to.be.fulfilled
    })

    it('should REVERT if transfer leads to overflow', async () => {
      await erc1155Contract.mintMock(receiverAddress, 0, MAXVAL, [])
      const tx = erc1155Contract.safeTransferFrom(ownerAddress, receiverAddress, 0, 1, [], HIGH_GAS_LIMIT)
      expect(tx).to.be.rejectedWith(RevertUnsafeMathError())
    })

    it('should REVERT when sending to non-receiver contract', async () => {
      const tx = erc1155Contract.safeTransferFrom(ownerAddress, erc1155Contract.address, 0, 1, [])
      await expect(tx).to.be.rejectedWith(RevertError('ERC1155MetaMintBurnMock: INVALID_METHOD'))
    })

    it('should REVERT if invalid response from receiver contract', async () => {
      await receiverContract.setShouldReject(true)

      const tx = erc1155Contract.safeTransferFrom(ownerAddress, receiverContract.address, 0, 1, [])
      await expect(tx).to.be.rejectedWith(RevertError('ERC1155#_callonERC1155Received: INVALID_ON_RECEIVE_MESSAGE'))
    })

    it('should pass if valid response from receiver contract', async () => {
      const tx = erc1155Contract.safeTransferFrom(ownerAddress, receiverContract.address, 0, 1, [])
      await expect(tx).to.be.fulfilled
    })

    it('should pass if data is not null to receiver contract', async () => {
      const data = ethers.utils.toUtf8Bytes('Hello from the other side')

      // NOTE: typechain generates the wrong type for `bytes` type at this time
      // see https://github.com/ethereum-ts/TypeChain/issues/123
      // @ts-ignore
      const tx = erc1155Contract.safeTransferFrom(ownerAddress, receiverContract.address, 0, 1, data)
      await expect(tx).to.be.fulfilled
    })

    it('should have balances updated before onERC1155Received is called', async () => {
      const fromPreBalance = await erc1155Contract.balanceOf(ownerAddress, 0)
      const toPreBalance = await erc1155Contract.balanceOf(receiverContract.address, 0)

      // Get event filter to get internal tx event
      const filterFromReceiverContract = receiverContract.filters.TransferSingleReceiver(null, null, null, null)

      await erc1155Contract.safeTransferFrom(ownerAddress, receiverContract.address, 0, 1, [])

      // Get logs from internal transaction event
      // @ts-ignore (https://github.com/ethers-io/ethers.js/issues/204#issuecomment-427059031)
      filterFromReceiverContract.fromBlock = 0

      const logs = await ownerProvider.getLogs(filterFromReceiverContract)
      const args = receiverContract.interface.decodeEventLog(
        receiverContract.interface.events['TransferSingleReceiver(address,address,uint256,uint256)'],
        logs[0].data,
        logs[0].topics
      )

      expect(args._from).to.be.eql(ownerAddress)
      expect(args._to).to.be.eql(receiverContract.address)
      expect(args._fromBalance).to.be.eql(fromPreBalance.sub(1))
      expect(args._toBalance).to.be.eql(toPreBalance.add(1))
    })

    it('should have TransferSingle event emitted before onERC1155Received is called', async () => {
      // Get event filter to get internal tx event
      const tx = await erc1155Contract.safeTransferFrom(ownerAddress, receiverContract.address, 0, 1, [])
      const receipt = await tx.wait(1)

      const firstEventTopic = receipt.logs![0].topics[0]
      const secondEventTopic = receipt.logs![1].topics[0]

      expect(firstEventTopic).to.be.equal(
        erc1155Contract.interface.getEventTopic(
          erc1155Contract.interface.events['TransferSingle(address,address,address,uint256,uint256)']
        )
      )
      expect(secondEventTopic).to.be.equal(
        receiverContract.interface.getEventTopic(
          receiverContract.interface.events['TransferSingleReceiver(address,address,uint256,uint256)']
        )
      )
    })

    context('When successful transfer', () => {
      let tx: ethers.ContractTransaction

      beforeEach(async () => {
        tx = await erc1155Contract.safeTransferFrom(ownerAddress, receiverAddress, 0, 1, [])
      })

      it('should correctly update balance of sender', async () => {
        const balance = await erc1155Contract.balanceOf(ownerAddress, 0)
        expect(balance).to.be.eql(BigNumber.from(255))
      })

      it('should correctly update balance of receiver', async () => {
        const balance = await erc1155Contract.balanceOf(receiverAddress, 0)
        expect(balance).to.be.eql(BigNumber.from(1))
      })

      describe('TransferSingle event', async () => {
        let filterFromOperatorContract: ethers.EventFilter

        it('should emit TransferSingle event', async () => {
          const receipt = await tx.wait(1)
          const ev = receipt.events!.pop()!
          expect(ev.event).to.be.eql('TransferSingle')
        })

        it('should have `msg.sender` as `_operator` field, not _from', async () => {
          await erc1155Contract.setApprovalForAll(operatorAddress, true)

          tx = await operatorERC1155Contract.safeTransferFrom(ownerAddress, receiverAddress, 0, 1, [])
          const receipt = await tx.wait(1)
          const ev = receipt.events!.pop()!

          const args = ev.args! as any
          expect(args._operator).to.be.eql(operatorAddress)
        })

        it('should have `msg.sender` as `_operator` field, not tx.origin', async () => {
          // Get event filter to get internal tx event
          filterFromOperatorContract = erc1155Contract.filters.TransferSingle(operatorContract.address, null, null, null, null)

          // Set approval to operator contract
          await erc1155Contract.setApprovalForAll(operatorContract.address, true)

          // Execute transfer from operator contract
          // @ts-ignore (https://github.com/ethereum-ts/TypeChain/issues/118)
          await operatorContract.safeTransferFrom(
            erc1155Contract.address,
            ownerAddress,
            receiverAddress,
            0,
            1,
            [],
            HIGH_GAS_LIMIT // INCORRECT GAS ESTIMATION
          )

          // Get logs from internal transaction event
          // @ts-ignore (https://github.com/ethers-io/ethers.js/issues/204#issuecomment-427059031)
          filterFromOperatorContract.fromBlock = 0
          const logs = await operatorProvider.getLogs(filterFromOperatorContract)
          const args = erc1155Contract.interface.decodeEventLog(
            erc1155Contract.interface.events['TransferSingle(address,address,address,uint256,uint256)'],
            logs[0].data,
            logs[0].topics
          )

          // operator arg should be equal to msg.sender, not tx.origin
          expect(args._operator).to.be.eql(operatorContract.address)
        })
      })
    })
  })

  describe('safeBatchTransferFrom() function', () => {
    let types: any[], values: any[]
    const nTokenTypes = 30 //560
    const nTokensPerType = 10

    let receiverContract: ERC1155ReceiverMock

    beforeEach(async () => {
      ;(types = []), (values = [])

      // Minting enough values for transfer for each types
      for (let i = 0; i < nTokenTypes; i++) {
        types.push(i)
        values.push(nTokensPerType)
      }
      await erc1155Contract.batchMintMock(ownerAddress, types, values, [])

      const abstract = await AbstractContract.fromArtifactName('ERC1155ReceiverMock')
      receiverContract = (await abstract.deploy(ownerWallet)) as ERC1155ReceiverMock
    })

    it('should be able to transfer tokens if sufficient balances', async () => {
      const tx = erc1155Contract.safeBatchTransferFrom(ownerAddress, receiverAddress, types, values, [])
      await expect(tx).to.be.fulfilled
    })

    it('should PASS if arrays are empty', async () => {
      const tx = erc1155Contract.safeBatchTransferFrom(ownerAddress, receiverAddress, [], [], [])
      await expect(tx).to.be.fulfilled
    })

    it('should REVERT if insufficient balance', async () => {
      const tx = erc1155Contract.safeBatchTransferFrom(ownerAddress, receiverAddress, [0], [11], [], HIGH_GAS_LIMIT)
      await expect(tx).to.be.rejectedWith(RevertUnsafeMathError())
    })

    it('should REVERT if single insufficient balance', async () => {
      const tx = erc1155Contract.safeBatchTransferFrom(ownerAddress, receiverAddress, [0, 15, 30], [1, 9, 11], [], HIGH_GAS_LIMIT)
      await expect(tx).to.be.rejectedWith(RevertUnsafeMathError())
    })

    it('should REVERT if operator not approved', async () => {
      const tx = operatorERC1155Contract.safeBatchTransferFrom(ownerAddress, receiverAddress, types, values, [])
      expect(tx).to.be.rejectedWith(RevertError('ERC1155#safeBatchTransferFrom: INVALID_OPERATOR'))
    })

    it('should REVERT if length of ids and values are not equal', async () => {
      const tx1 = erc1155Contract.safeBatchTransferFrom(ownerAddress, receiverAddress, [0, 15, 30, 0], [1, 9, 10], [])
      await expect(tx1).to.be.rejectedWith(RevertError('ERC1155#_safeBatchTransferFrom: INVALID_ARRAYS_LENGTH'))

      const tx2 = erc1155Contract.safeBatchTransferFrom(ownerAddress, receiverAddress, [0, 15, 30], [1, 9, 10, 0], [])
      await expect(tx2).to.be.rejectedWith(RevertError('ERC1155#_safeBatchTransferFrom: INVALID_ARRAYS_LENGTH'))
    })

    it('should REVERT if sending to 0x0', async () => {
      const tx = erc1155Contract.safeBatchTransferFrom(ownerAddress, ZERO_ADDRESS, types, values, [])
      await expect(tx).to.be.rejectedWith(RevertError('ERC1155#safeBatchTransferFrom: INVALID_RECIPIENT'))
    })

    it('should be able to transfer via operator if operator is approved', async () => {
      await erc1155Contract.setApprovalForAll(operatorAddress, true)

      const tx = operatorERC1155Contract.safeBatchTransferFrom(ownerAddress, receiverAddress, types, values, [])
      await expect(tx).to.be.fulfilled
    })

    it('should REVERT if transfer leads to overflow', async () => {
      await erc1155Contract.mintMock(receiverAddress, 5, MAXVAL, [])

      const tx = erc1155Contract.safeBatchTransferFrom(ownerAddress, receiverAddress, [5], [1], [], HIGH_GAS_LIMIT)
      await expect(tx).to.be.rejectedWith(RevertUnsafeMathError())
    })

    it('should update balances of sender and receiver', async () => {
      await erc1155Contract.safeBatchTransferFrom(ownerAddress, receiverAddress, types, values, [])

      let balanceFrom: ethers.BigNumber
      let balanceTo: ethers.BigNumber

      for (let i = 0; i < types.length; i++) {
        balanceFrom = await erc1155Contract.balanceOf(ownerAddress, types[i])
        balanceTo = await erc1155Contract.balanceOf(receiverAddress, types[i])

        expect(balanceFrom).to.be.eql(BigNumber.from(0))
        expect(balanceTo).to.be.eql(BigNumber.from(values[i]))
      }
    })

    it('should REVERT when sending to non-receiver contract', async () => {
      const tx = erc1155Contract.safeBatchTransferFrom(ownerAddress, erc1155Contract.address, types, values, [], HIGH_GAS_LIMIT)
      await expect(tx).to.be.rejectedWith(RevertError('ERC1155MetaMintBurnMock: INVALID_METHOD'))
    })

    it('should REVERT if invalid response from receiver contract', async () => {
      await receiverContract.setShouldReject(true)
      const tx = erc1155Contract.safeBatchTransferFrom(ownerAddress, receiverContract.address, types, values, [], HIGH_GAS_LIMIT)
      await expect(tx).to.be.rejectedWith(RevertError('ERC1155#_callonERC1155BatchReceived: INVALID_ON_RECEIVE_MESSAGE'))
    })

    it('should pass if valid response from receiver contract', async () => {
      const tx = erc1155Contract.safeBatchTransferFrom(ownerAddress, receiverContract.address, types, values, [], HIGH_GAS_LIMIT)
      await expect(tx).to.be.fulfilled
    })

    it('should pass if data is not null from receiver contract', async () => {
      const data = ethers.utils.toUtf8Bytes('Hello from the other side')

      // TODO: remove ts-ignore when contract declaration is fixed
      // @ts-ignore
      const tx = erc1155Contract.safeBatchTransferFrom(
        ownerAddress,
        receiverContract.address,
        types,
        values,
        data,
        HIGH_GAS_LIMIT
      )
      await expect(tx).to.be.fulfilled
    })

    it('should have balances updated before onERC1155BatchReceived is called', async () => {
      const fromAddresses = Array(types.length).fill(ownerAddress)
      const toAddresses = Array(types.length).fill(receiverContract.address)

      const fromPreBalances = await erc1155Contract.balanceOfBatch(fromAddresses, types)
      const toPreBalances = await erc1155Contract.balanceOfBatch(toAddresses, types)

      // Get event filter to get internal tx event
      const filterFromReceiverContract = receiverContract.filters.TransferBatchReceiver(null, null, null, null)

      await erc1155Contract.safeBatchTransferFrom(ownerAddress, receiverContract.address, types, values, [], HIGH_GAS_LIMIT)

      // Get logs from internal transaction event
      // @ts-ignore (https://github.com/ethers-io/ethers.js/issues/204#issuecomment-427059031)
      filterFromReceiverContract.fromBlock = 0

      const logs = await ownerProvider.getLogs(filterFromReceiverContract)
      const args = receiverContract.interface.decodeEventLog(
        receiverContract.interface.events['TransferBatchReceiver(address,address,uint256[],uint256[])'],
        logs[0].data,
        logs[0].topics
      )

      expect(args._from).to.be.eql(ownerAddress)
      expect(args._to).to.be.eql(receiverContract.address)
      for (let i = 0; i < types.length; i++) {
        expect(args._fromBalances[i]).to.be.eql(fromPreBalances[i].sub(values[i]))
        expect(args._toBalances[i]).to.be.eql(toPreBalances[i].add(values[i]))
      }
    })

    it('should have TransferBatch event emitted before onERC1155BatchReceived is called', async () => {
      // Get event filter to get internal tx event
      const tx = await erc1155Contract.safeBatchTransferFrom(
        ownerAddress,
        receiverContract.address,
        types,
        values,
        [],
        HIGH_GAS_LIMIT
      )
      const receipt = await tx.wait(1)

      const firstEventTopic = receipt.logs![0].topics[0]
      const secondEventTopic = receipt.logs![1].topics[0]

      expect(firstEventTopic).to.be.equal(
        erc1155Contract.interface.getEventTopic(
          erc1155Contract.interface.events['TransferBatch(address,address,address,uint256[],uint256[])']
        )
      )
      expect(secondEventTopic).to.be.equal(
        receiverContract.interface.getEventTopic(
          receiverContract.interface.events['TransferBatchReceiver(address,address,uint256[],uint256[])']
        )
      )
    })

    describe('TransferBatch event', async () => {
      let tx: ethers.ContractTransaction
      let filterFromOperatorContract: ethers.EventFilter
      let operatorContract: ERC1155OperatorMock

      beforeEach(async () => {
        operatorContract = (await operatorAbstract.deploy(operatorWallet)) as ERC1155OperatorMock
      })

      it('should emit 1 TransferBatch events of N transfers', async () => {
        const tx = await erc1155Contract.safeBatchTransferFrom(ownerAddress, receiverAddress, types, values, [])
        const receipt = await tx.wait(1)
        const ev = receipt.events!.pop()!
        expect(ev.event).to.be.eql('TransferBatch')

        const args = ev.args! as any
        expect(args._ids.length).to.be.eql(types.length)
      })

      it('should have `msg.sender` as `_operator` field, not _from', async () => {
        await erc1155Contract.setApprovalForAll(operatorAddress, true)

        tx = await operatorERC1155Contract.safeBatchTransferFrom(ownerAddress, receiverAddress, types, values, [])
        const receipt = await tx.wait(1)
        const ev = receipt.events!.pop()!

        const args = ev.args! as any
        expect(args._operator).to.be.eql(operatorAddress)
      })

      it('should have `msg.sender` as `_operator` field, not tx.origin', async () => {
        // Get event filter to get internal tx event
        filterFromOperatorContract = erc1155Contract.filters.TransferBatch(operatorContract.address, null, null, null, null)

        // Set approval to operator contract
        await erc1155Contract.setApprovalForAll(operatorContract.address, true)

        // Execute transfer from operator contract
        // @ts-ignore (https://github.com/ethereum-ts/TypeChain/issues/118)
        await operatorContract.safeBatchTransferFrom(
          erc1155Contract.address,
          ownerAddress,
          receiverAddress,
          types,
          values,
          [],
          HIGH_GAS_LIMIT // INCORRECT GAS ESTIMATION
        )

        // Get logs from internal transaction event
        // @ts-ignore (https://github.com/ethers-io/ethers.js/issues/204#issuecomment-427059031)
        filterFromOperatorContract.fromBlock = 0
        const logs = await operatorProvider.getLogs(filterFromOperatorContract)
        const args = erc1155Contract.interface.decodeEventLog(
          erc1155Contract.interface.events['TransferBatch(address,address,address,uint256[],uint256[])'],
          logs[0].data,
          logs[0].topics
        )

        // operator arg should be equal to msg.sender, not tx.origin
        expect(args._operator).to.be.eql(operatorContract.address)
      })
    })
  })

  describe('setApprovalForAll() function', () => {
    it('should emit an ApprovalForAll event', async () => {
      const tx = await erc1155Contract.setApprovalForAll(operatorAddress, true)
      const receipt = await tx.wait(1)

      expect(receipt.events![0].event).to.be.eql('ApprovalForAll')
    })

    it('should set the operator status to _status argument', async () => {
      const tx = erc1155Contract.setApprovalForAll(operatorAddress, true)
      await expect(tx).to.be.fulfilled

      const status = await erc1155Contract.isApprovedForAll(ownerAddress, operatorAddress)
      expect(status).to.be.eql(true)
    })

    context('When the operator was already an operator', () => {
      beforeEach(async () => {
        await erc1155Contract.setApprovalForAll(operatorAddress, true)
      })

      it('should leave the operator status to set to true again', async () => {
        const tx = erc1155Contract.setApprovalForAll(operatorAddress, true)
        await expect(tx).to.be.fulfilled

        const status = await erc1155Contract.isApprovedForAll(ownerAddress, operatorAddress)
        expect(status).to.be.eql(true)
      })

      it('should allow the operator status to be set to false', async () => {
        const tx = erc1155Contract.setApprovalForAll(operatorAddress, false)
        await expect(tx).to.be.fulfilled

        const status = await erc1155Contract.isApprovedForAll(operatorAddress, ownerAddress)
        expect(status).to.be.eql(false)
      })
    })
  })

  describe('Supports ERC165', () => {
    describe('supportsInterface()', () => {
      it('should return true for 0x01ffc9a7 (IERC165)', async () => {
        const support = await erc1155Contract.supportsInterface('0x01ffc9a7')
        expect(support).to.be.eql(true)
      })

      it('should return true for 0xd9b67a26 (IERC1155)', async () => {
        const support = await erc1155Contract.supportsInterface('0xd9b67a26')
        expect(support).to.be.eql(true)
      })
    })
  })
})
