import * as ethers from 'ethers'

import { AbstractContract, assert, expect, RevertError, BigNumber } from './utils'
import * as utils from './utils'

import { ERC1155MetadataMock } from 'src/gen/typechain'

// init test wallets from package.json mnemonic
import { web3 } from 'hardhat'

const { wallet: ownerWallet, provider: ownerProvider, signer: ownerSigner } = utils.createTestWallet(web3, 0)

const { wallet: receiverWallet, provider: receiverProvider, signer: receiverSigner } = utils.createTestWallet(web3, 2)

const { wallet: anyoneWallet, provider: anyoneProvider, signer: anyoneSigner } = utils.createTestWallet(web3, 3)

const { wallet: operatorWallet, provider: operatorProvider, signer: operatorSigner } = utils.createTestWallet(web3, 4)

describe('ERC1155Metadata', () => {
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

  let ownerAddress: string
  let receiverAddress: string
  let anyoneAddress: string
  let operatorAddress: string

  let erc1155MetadataContract: ERC1155MetadataMock
  let anyoneERC1155MetadataContract

  context('When ERC1155MetadataMock contract is deployed', () => {
    const BASE_URI = 'https://assets.skyweaver.net/c679a6577c12c47948084dd61a79b9598db17cc5/full-cards/'
    const CONTRACT_NAME = 'MyERC1155'

    before(async () => {
      ownerAddress = await ownerWallet.getAddress()
      receiverAddress = await receiverWallet.getAddress()
      anyoneAddress = await anyoneWallet.getAddress()
      operatorAddress = await operatorWallet.getAddress()
    })

    beforeEach(async () => {
      const abstract = await AbstractContract.fromArtifactName('ERC1155MetadataMock')
      erc1155MetadataContract = (await abstract.deploy(ownerWallet, [BASE_URI, CONTRACT_NAME])) as ERC1155MetadataMock
      anyoneERC1155MetadataContract = (await erc1155MetadataContract.connect(anyoneSigner)) as ERC1155MetadataMock

      await erc1155MetadataContract.setBaseMetadataURI(BASE_URI)
    })

    describe('Getter functions', () => {
      it('supportsInterface(0x0e89341c) on receiver should return true', async () => {
        const returnedValue = await erc1155MetadataContract.supportsInterface('0x0e89341c')
        await expect(returnedValue).to.be.equal(true)
      })
    })

    describe('_updateBaseMetadataURL() function', () => {
      it('should ALLOW inheriting contract to call _updateBaseMetadataURL()', async () => {
        const tx = erc1155MetadataContract.setBaseMetadataURI('HELLOTEST/')
        await expect(tx).to.be.fulfilled
      })

      it('should update baseMetadataURI when successful', async () => {
        const URI1 = await erc1155MetadataContract.uri(1928374)
        await erc1155MetadataContract.setBaseMetadataURI('HELLOTEST/')
        const URI2 = await erc1155MetadataContract.uri(1928374)
        expect(URI1).to.be.equal(BASE_URI + '1928374.json')
        expect(URI2).to.be.equal('HELLOTEST/1928374.json')
      })

      it('Should revert if called directly by non-parent contract', async () => {
        const transaction = {
          to: erc1155MetadataContract.address,
          data:
            '0x122f94bf00000000000000000000000000000000000000000000000000000000000000' +
            '20000000000000000000000000000000000000000000000000000000000000000a48454c' +
            '4c4f544553542f00000000000000000000000000000000000000000000'
        }
        const tx = ownerWallet.sendTransaction(transaction)
        await expect(tx).to.be.rejectedWith(RevertError('ERC1155MetadataMock: INVALID_METHOD'))
      })
    })

    describe('_logURIs(uint256[]) function', () => {
      const ids = [1, 44, 19283091823]

      it('should ALLOW inheriting contract to call _logURIs()', async () => {
        const tx = erc1155MetadataContract.logURIsMock(ids)
        await expect(tx).to.be.fulfilled
      })

      it('Should revert if called directly by non-parent contract', async () => {
        const transaction = {
          to: erc1155MetadataContract.address,
          data:
            '0x78d76ac2000000000000000000000000000000000000000000000000000000000000002' +
            '0000000000000000000000000000000000000000000000000000000000000000300000000000000' +
            '0000000000000000000000000000000000000000000000000100000000000000000000000000000' +
            '0000000000000000000000000000000002c00000000000000000000000000000000000000000000' +
            '0000000000047d5ca16f'
        }
        const tx = ownerWallet.sendTransaction(transaction)
        await expect(tx).to.be.rejectedWith(RevertError('ERC1155MetadataMock: INVALID_METHOD'))
      })

      it('should emit N URI events', async () => {
        const tx = (await erc1155MetadataContract.logURIsMock(ids)) as ethers.ContractTransaction
        const receipt = await tx.wait(1)
        const URIevents = receipt.events!.filter(uri => uri.event === 'URI')
        expect(receipt.events!.length == ids.length)
      })

      it('should emit URI events with correct information', async () => {
        const tx = (await erc1155MetadataContract.logURIsMock(ids)) as ethers.ContractTransaction
        const receipt = await tx.wait(1)
        receipt
          .events!.filter(uri => uri.event === 'URI')
          .forEach(ev => {
            const args = erc1155MetadataContract.interface.decodeEventLog(
              erc1155MetadataContract.interface.events['URI(string,uint256)'],
              ev.data,
              ev.topics
            )
            expect(args._uri).to.be.equal(BASE_URI + args._id + '.json')
          })
      })
    })
  })
})
