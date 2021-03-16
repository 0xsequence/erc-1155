import * as ethers from 'ethers'

import { AbstractContract, expect, RevertError } from './utils'
import * as utils from './utils'

import { OwnableMock } from 'src/gen/typechain'

// init test wallets from package.json mnemonic
import { web3 } from 'hardhat'

const { wallet: ownerWallet } = utils.createTestWallet(web3, 0)

const { wallet: userWallet } = utils.createTestWallet(web3, 2)

describe('Ownable Contract', () => {
  let ownableMockAbstract: AbstractContract
  let ownerOwnableMockContract: OwnableMock
  let userOwnableMockContract: OwnableMock

  // load contract abi and deploy to test server
  before(async () => {
    ownableMockAbstract = await AbstractContract.fromArtifactName('OwnableMock')
  })

  // deploy before each test, to reset state of contract
  beforeEach(async () => {
    ownerOwnableMockContract = (await ownableMockAbstract.deploy(ownerWallet)) as OwnableMock
    userOwnableMockContract = (await ownerOwnableMockContract.connect(userWallet)) as OwnableMock
  })

  describe('owner() Function', () => {
    it('should return current owner', async () => {
      const orginalOwner = await ownerOwnableMockContract.owner()
      expect(orginalOwner).to.be.equal(ownerWallet.address)
    })
  })

  describe('ownerCall() Function', () => {
    it('should REVERT if called by a non-owner address', async () => {
      const tx = userOwnableMockContract.ownerCall()
      await expect(tx).to.be.rejectedWith(RevertError('Ownable#onlyOwner: SENDER_IS_NOT_OWNER'))
    })

    it('should PASS if called by owner address', async () => {
      const tx = ownerOwnableMockContract.ownerCall()
      await expect(tx).to.be.fulfilled
    })
  })

  describe('nonOwnerCall() Function', () => {
    it('should PASS if called by a non-owner address', async () => {
      const tx = userOwnableMockContract.nonOwnerCall()
      await expect(tx).to.be.fulfilled
    })

    it('should PASS if called by owner address', async () => {
      const tx = ownerOwnableMockContract.nonOwnerCall()
      await expect(tx).to.be.fulfilled
    })
  })

  describe('transferOwnership() Function', () => {
    it('should REVERT if sender is not owner', async () => {
      const tx = userOwnableMockContract.transferOwnership(userWallet.address)
      await expect(tx).to.be.rejectedWith(RevertError('Ownable#onlyOwner: SENDER_IS_NOT_OWNER'))
    })

    it('should REVERT if new owner is 0x0', async () => {
      const tx = ownerOwnableMockContract.transferOwnership(ethers.constants.AddressZero)
      await expect(tx).to.be.rejectedWith(RevertError('Ownable#transferOwnership: INVALID_ADDRESS'))
    })

    it('should update owner when it passes', async () => {
      const oldOwner = await ownerOwnableMockContract.owner()
      await ownerOwnableMockContract.transferOwnership(userWallet.address)
      const newOwner = await ownerOwnableMockContract.owner()

      expect(oldOwner).to.be.equal(ownerWallet.address)
      expect(newOwner).to.be.equal(userWallet.address)
    })

    context('When Ownership Transfer is Successful', () => {
      let tx: ethers.ContractTransaction

      beforeEach(async () => {
        tx = await ownerOwnableMockContract.transferOwnership(userWallet.address)
      })

      it('should emit OwnershipTransferred event when successful', async () => {
        const receipt = await tx.wait(1)
        const ev = receipt.events!.pop()!
        expect(ev.event).to.be.eql('OwnershipTransferred')
      })

      it('should have old owner as `previousOwner` field', async () => {
        const receipt = await tx.wait(1)
        const ev = receipt.events!.pop()!

        const args = ev.args! as any
        expect(args.previousOwner).to.be.eql(ownerWallet.address)
      })

      it('should have new owner as `newOwner` field', async () => {
        const receipt = await tx.wait(1)
        const ev = receipt.events!.pop()!

        const args = ev.args! as any
        expect(args.newOwner).to.be.eql(userWallet.address)
      })
    })
  })
})
