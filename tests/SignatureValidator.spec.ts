import * as ethers from 'ethers'

import { AbstractContract, expect, RevertError, ethSign, eip712Sign } from './utils'
import * as utils from './utils'

import {
  SignatureValidator,
  ERC1271WalletValidationMock  
} from 'src/gen/typechain'

// init test wallets from package.json mnemonic
import { web3 } from 'hardhat'

const { wallet: signerWallet, provider: signerProvider, signer: signerSigner } = utils.createTestWallet(web3, 0)

const { wallet: randomSignerWallet, provider: randomSignerProvider, signer: randomSignerSigner } = utils.createTestWallet(web3, 1)

describe('SignatureValidator Contract', () => {
  let signerAddress: string
  let signatureValidatorAbstract: AbstractContract
  let ERC1271WalletValidationMockAbstract: AbstractContract
  let signatureValidatorContract: SignatureValidator
  let erc1271WalletValidationMockContract: ERC1271WalletValidationMock

  // load contract abi and deploy to test server
  before(async () => {
    signerAddress = await signerWallet.getAddress()
    signatureValidatorAbstract = await AbstractContract.fromArtifactName('SignatureValidator')
  })

  // deploy before each test, to reset state of contract
  beforeEach(async () => {
    signatureValidatorContract = (await signatureValidatorAbstract.deploy(signerWallet)) as SignatureValidator
  })

  describe('isValidSignature() Function', () => {
    const data = ethers.utils.toUtf8Bytes('Did the Ethereum blockchain reach 1TB yet? No.')
    const dataHash = ethers.utils.keccak256(data)
    let ethsig: string
    let eip712sig: string

    beforeEach(async () => {
      ethsig = await ethSign(signerWallet, data)
    })

    it('should REVERT if signature is of length 0', async () => {
      const tx = signatureValidatorContract.isValidSignature(signerAddress, dataHash, data, [])
      await expect(tx).to.be.rejectedWith(RevertError('SignatureValidator#isValidSignature: LENGTH_GREATER_THAN_0_REQUIRED'))
    })

    it('should REVERT if expected signer is 0x0', async () => {
      const tx = signatureValidatorContract.isValidSignature(ethers.constants.AddressZero, dataHash, data, ethsig)
      await expect(tx).to.be.rejectedWith(RevertError('SignatureValidator#isValidSignature: INVALID_SIGNER'))
    })

    it('should REVERT if signature is illigal (SignatureType: 0x0)', async () => {
      const tx = signatureValidatorContract.isValidSignature(signerAddress, dataHash, data, ethsig.slice(0, -2) + '00')
      await expect(tx).to.be.rejectedWith(RevertError('SignatureValidator#isValidSignature: ILLEGAL_SIGNATURE'))
    })

    it('should REVERT if signatureType is above 05', async () => {
      const tx = signatureValidatorContract.isValidSignature(signerAddress, dataHash, data, ethsig.slice(0, -2) + '06')
      await expect(tx).to.be.rejectedWith(RevertError('SignatureValidator#isValidSignature: UNSUPPORTED_SIGNATURE'))
    })

    describe(`EIP-712 signatures`, () => {
      beforeEach(async () => {
        const paddedNonce = ethers.utils.solidityPack(['uint256'], [ethers.BigNumber.from(0)]).slice(2)
        eip712sig = (await eip712Sign(signerWallet, data)).slice(0, -2) + paddedNonce + '01'
      })

      it('should REVERT if signature length is not 97', async () => {
        const tx = signatureValidatorContract.isValidSignature(signerAddress, dataHash, data, '0x1234' + eip712sig.slice(2))
        await expect(tx).to.be.rejectedWith(RevertError('SignatureValidator#isValidSignature: LENGTH_97_REQUIRED'))
      })

      it('should return TRUE if signature is valid', async () => {
        const isValid = await signatureValidatorContract.isValidSignature(signerAddress, dataHash, data, eip712sig)
        await expect(isValid).to.be.equal(true)
      })
    })

    describe(`ETH_SIGN signatures`, () => {
      beforeEach(async () => {
        const paddedNonce = ethers.utils.solidityPack(['uint256'], [ethers.BigNumber.from(0)]).slice(2)
        ethsig = (await ethSign(signerWallet, data)).slice(0, -2) + paddedNonce + '02'
      })

      it('should REVERT if signature length is not 97', async () => {
        const tx = signatureValidatorContract.isValidSignature(signerAddress, dataHash, data, '0x1234' + ethsig.slice(2))
        await expect(tx).to.be.rejectedWith(RevertError('SignatureValidator#isValidSignature: LENGTH_97_REQUIRED'))
      })

      it('should return TRUE if signature is valid', async () => {
        const isValid = await signatureValidatorContract.isValidSignature(signerAddress, dataHash, data, ethsig)
        expect(isValid).to.be.equal(true)
      })
    })

    describe(`EIP-1271 signatures`, () => {
      let erc1271WalletAddress

      beforeEach(async () => {
        ERC1271WalletValidationMockAbstract = await AbstractContract.fromArtifactName('ERC1271WalletValidationMock')
        erc1271WalletValidationMockContract = (await ERC1271WalletValidationMockAbstract.deploy(signerWallet, [
          dataHash
        ])) as ERC1271WalletValidationMock
        erc1271WalletAddress = erc1271WalletValidationMockContract.address
      })

      describe(`EIP-1271 (bytes) signatures (03)`, () => {
        it('should return FALSE if signature is invalid', async () => {
          let bad_eip712sig = await ethSign(randomSignerWallet, data)
          bad_eip712sig = bad_eip712sig.slice(0, bad_eip712sig.length - 2) + '03'
          const isValid = await signatureValidatorContract.isValidSignature(erc1271WalletAddress, dataHash, data, bad_eip712sig)
          expect(isValid).to.be.equal(false)
        })

        it('should return TRUE if signature is valid', async () => {
          let good_eip712sig = await ethSign(signerWallet, data)
          good_eip712sig = good_eip712sig.slice(0, good_eip712sig.length - 2) + '03'
          const isValid = await signatureValidatorContract.isValidSignature(erc1271WalletAddress, dataHash, data, good_eip712sig)
          await expect(isValid).to.be.equal(true)
        })
      })

      describe(`EIP-1271 (bytes32) signatures (04)`, () => {
        it('should return FALSE if signature is invalid', async () => {
          let bad_eip712sig = await ethSign(randomSignerWallet, data)
          bad_eip712sig = bad_eip712sig.slice(0, bad_eip712sig.length - 2) + '04'
          const isValid = await signatureValidatorContract.isValidSignature(erc1271WalletAddress, dataHash, data, bad_eip712sig)
          expect(isValid).to.be.equal(false)
        })

        it('should return TRUE if signature is valid', async () => {
          let good_eip712sig = await ethSign(signerWallet, data)
          good_eip712sig = good_eip712sig.slice(0, good_eip712sig.length - 2) + '04'
          const isValid = await signatureValidatorContract.isValidSignature(erc1271WalletAddress, dataHash, data, good_eip712sig)
          await expect(isValid).to.be.equal(true)
        })
      })
    })
  })
})
