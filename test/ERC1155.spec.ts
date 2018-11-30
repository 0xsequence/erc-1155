import * as ethers from 'ethers'

import { AbstractContract, expect, BigNumber } from './utils'
import * as utils from './utils'

import { ERC1155Mock } from 'typings/contracts/ERC1155Mock'

// init test wallets from package.json mnemonic
const web3 = (global as any).web3

const {
  wallet: ownerWallet,
  provider: ownerProvider,
  signer: ownerSigner
} = utils.createTestWallet(web3, 0)


contract('ERC1155Mock', (accounts: string[]) => {

  const LARGEVAL = new BigNumber(2).pow(256).sub(2) // 2**256 - 2
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

  let ownerAddress: string
  let erc1155Abstract: AbstractContract
  let erc1155Contract: ERC1155Mock
  
  // load contract abi and deploy to test server
  before(async () => {
    ownerAddress = await ownerWallet.getAddress()

    erc1155Abstract = await AbstractContract.fromArtifactName('ERC1155Mock')
    erc1155Contract = (await erc1155Abstract.deploy(ownerWallet)) as ERC1155Mock
  })


  describe('Bitwise functions', async () => {

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

  describe('Getter functions', async () => {

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

  describe('safeTransferFrom() function', async () => {

  })

  describe('safeBatchTransferFrom() function', async () => {
  })

  describe('setApprovalForAll() function', async () => {
  })

  describe('Supports ERC165', async () => {
  })

})
