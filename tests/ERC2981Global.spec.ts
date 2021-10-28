import * as ethers from 'ethers'

import { AbstractContract, assert, expect, RevertError, BigNumber } from './utils'
import * as utils from './utils'

import { ERC2981GlobalMock } from 'src/gen/typechain'

// init test wallets from package.json mnemonic
import { web3 } from 'hardhat'

const { wallet: ownerWallet, provider: ownerProvider, signer: ownerSigner } = utils.createTestWallet(web3, 0)

const { wallet: receiverWallet, provider: receiverProvider, signer: receiverSigner } = utils.createTestWallet(web3, 2)

const { wallet: anyoneWallet, provider: anyoneProvider, signer: anyoneSigner } = utils.createTestWallet(web3, 3)

const { wallet: operatorWallet, provider: operatorProvider, signer: operatorSigner } = utils.createTestWallet(web3, 4)

describe('ERC2981Global', () => {
  let ownerAddress: string
  let receiverAddress: string
  let anyoneAddress: string
  let operatorAddress: string

  let tokenContract: ERC2981GlobalMock
  let anyoneERC1155MetadataContract

  const BASE_FEE = 20 // 2%
  const NAME = "MyERC1155"
  const METADATA_URI = "https://example.com/"

  context('When ERC2981GlobalMock contract is deployed', () => {
    before(async () => {
      ownerAddress = await ownerWallet.getAddress()
      receiverAddress = await receiverWallet.getAddress()
      anyoneAddress = await anyoneWallet.getAddress()
      operatorAddress = await operatorWallet.getAddress()
    })

    beforeEach(async () => {
      const abstract = await AbstractContract.fromArtifactName('ERC2981GlobalMock')
      tokenContract = (await abstract.deploy(ownerWallet, [NAME, METADATA_URI])) as ERC2981GlobalMock
      anyoneERC1155MetadataContract = (await tokenContract.connect(anyoneSigner)) as ERC2981GlobalMock
    })

    describe('Getter functions', () => {
      it('supportsInterface(0x2a55205a) on receiver should return true', async () => {
        const returnedValue = await tokenContract.supportsInterface('0x2a55205a')
        await expect(returnedValue).to.be.equal(true)
      })
    })

    describe('_setGlobalRoyaltyInfo() function', () => {
      it('should ALLOW inheriting contract to call _setGlobalRoyaltyInfo()', async () => {
        const tx = tokenContract.setGlobalRoyaltyInfo(receiverAddress, BASE_FEE)
        await expect(tx).to.be.fulfilled
      })

      it('should REVERT if recipient address is 0x0', async () => {
        const tx = tokenContract.setGlobalRoyaltyInfo(ethers.constants.AddressZero, BASE_FEE)
        await expect(tx).to.be.rejectedWith(RevertError('ERC2981Global#_setGlobalRoyalty: RECIPIENT_IS_0x0'))
      })

      it('should revert if fee is above 100%', async () => {
        const tx = tokenContract.setGlobalRoyaltyInfo(receiverAddress, 1001)
        await expect(tx).to.be.rejectedWith(RevertError('ERC2981Global#_setGlobalRoyalty: FEE_IS_ABOVE_100_PERCENT'))
      })

      it('should update globalRoyaltyInfo when successful', async () => {
        const pre_info = await tokenContract.globalRoyaltyInfo()
        expect(pre_info.receiver).to.be.eql(ethers.constants.AddressZero)
        expect(pre_info.feeBasisPoints).to.be.eql(BigNumber.from(0))

        await tokenContract.setGlobalRoyaltyInfo(receiverAddress, BASE_FEE)

        const info = await tokenContract.globalRoyaltyInfo()
        expect(info.receiver).to.be.eql(receiverAddress)
        expect(info.feeBasisPoints).to.be.eql(BigNumber.from(BASE_FEE))
      })

      it('should return the correct fee amount', async () => {
        const cost = BigNumber.from(1337).mul(BigNumber.from(10).pow(18))
        const expected_fee = cost.mul(BASE_FEE).div(1000)

        const pre_info = await tokenContract.royaltyInfo(123123, cost)
        expect(pre_info.receiver).to.be.eql(ethers.constants.AddressZero)
        expect(pre_info.royaltyAmount).to.be.eql(BigNumber.from(0))

        await tokenContract.setGlobalRoyaltyInfo(receiverAddress, BASE_FEE)

        const info = await tokenContract.royaltyInfo(123123, cost)
        expect(info.receiver).to.be.eql(receiverAddress)
        expect(info.royaltyAmount).to.be.eql(BigNumber.from(expected_fee))
      })
    })
  })
})
