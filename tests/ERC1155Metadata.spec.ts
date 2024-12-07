import { ethers } from 'ethers'

import { AbstractContract, expect, RevertError, HIGH_GAS_LIMIT } from './utils'
import * as utils from './utils'

import { ERC1155MetadataMock, ERC1155MetadataUpgradeableMockV2, ProxyUpgradeableDeployerMock } from 'src'

// init test wallets from package.json mnemonic
import { web3 } from 'hardhat'

const { wallet: ownerWallet } = utils.createTestWallet(web3, 0)

const usingUpgradeable = [false, true]

usingUpgradeable.forEach(upgradeable => {
  describe('ERC1155Metadata' + (upgradeable ? 'Upgradeable': ''), () => {

    let ownerAddress: string

    let erc1155MetadataContract: ERC1155MetadataMock

    context('When ERC1155MetadataMock contract is deployed', () => {
      const BASE_URI = 'https://assets.skyweaver.net/c679a6577c12c47948084dd61a79b9598db17cc5/full-cards/'
      const CONTRACT_NAME = 'MyERC1155'
  
      let abstract: AbstractContract
      let factoryContract: ProxyUpgradeableDeployerMock

      before(async () => {
        ownerAddress = await ownerWallet.getAddress()

        if (upgradeable) {
          abstract = await AbstractContract.fromArtifactName('ERC1155MetadataUpgradeableMock')
          // Create factory
          const factoryAbstract = await AbstractContract.fromArtifactName('ProxyUpgradeableDeployerMock')
          factoryContract = (await factoryAbstract.deploy(ownerWallet, [])) as ProxyUpgradeableDeployerMock
        } else {
          abstract = await AbstractContract.fromArtifactName('ERC1155MetadataMock')
        }
      })

      beforeEach(async () => {
        if (upgradeable) {
          erc1155MetadataContract = (await abstract.deploy(ownerWallet, [])) as ERC1155MetadataMock

          // Create proxy
          let tx = factoryContract.createProxy(erc1155MetadataContract.address, ethers.constants.HashZero, ownerWallet.address);
          await expect(tx).to.be.fulfilled
          const proxyAddr = await factoryContract.predictProxyAddress(erc1155MetadataContract.address, ethers.constants.HashZero, ownerWallet.address);
          erc1155MetadataContract = (await abstract.connect(ownerWallet, proxyAddr)) as ERC1155MetadataMock;
          tx = erc1155MetadataContract.initialize(BASE_URI, CONTRACT_NAME)
          await expect(tx).to.be.fulfilled
        } else {
          erc1155MetadataContract = (await abstract.deploy(ownerWallet, [BASE_URI, CONTRACT_NAME])) as ERC1155MetadataMock
        }
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
          const tx = erc1155MetadataContract.logURIsMock(ids, HIGH_GAS_LIMIT)
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
          const tx = (await erc1155MetadataContract.logURIsMock(ids, HIGH_GAS_LIMIT)) as ethers.ContractTransaction
          const receipt = await tx.wait(1)
          const URIevents = receipt.events!.filter(uri => uri.event === 'URI')
          expect(URIevents.length == ids.length)
        })

        it('should emit URI events with correct information', async () => {
          const tx = (await erc1155MetadataContract.logURIsMock(ids, HIGH_GAS_LIMIT)) as ethers.ContractTransaction
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

      if (upgradeable) {
        describe('Upgradeability', () => {

          beforeEach(async () => {
            // Deploy v2 implementation
            abstract = await AbstractContract.fromArtifactName('ERC1155MetadataUpgradeableMockV2')
            const v2Implementation = await abstract.deploy(ownerWallet, [])

            // Upgrade proxy
            const proxyAbstract = await AbstractContract.fromArtifactName('ProxyUpgradeable')
            const proxyContract = (await proxyAbstract.connect(ownerWallet, erc1155MetadataContract.address)) as ERC1155MetadataMock
            const tx = proxyContract.upgradeTo(v2Implementation.address)
            await expect(tx).to.be.fulfilled
          })

          it('new functionality is present', async () => {
            let uri = await erc1155MetadataContract.uri(0)
            expect(uri).not.to.contain('.json') // v2 removes json extension

            // Use new function
            const v2Abstract = await AbstractContract.fromArtifactName('ERC1155MetadataUpgradeableMockV2')
            const upgradedContract = (await v2Abstract.connect(ownerWallet, erc1155MetadataContract.address)) as ERC1155MetadataUpgradeableMockV2
            let tx = upgradedContract.setIdMapping(0, 1)
            await expect(tx).to.be.fulfilled

            // Use old function
            tx = erc1155MetadataContract.setBaseMetadataURI('HELLOTEST/')
            await expect(tx).to.be.fulfilled

            uri = await erc1155MetadataContract.uri(0)
            expect(uri).to.be.equal('HELLOTEST/1') // New functionality
          })
        })
      }
    })
  })
})
