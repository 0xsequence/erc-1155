import * as ethers from 'ethers'

import { AbstractContract, expect, RevertError, ethSign, eip712Sign } from './utils'
import * as utils from './utils'

import { SignatureValidator } from 'typings/contracts/SignatureValidator'
import { ERC1271WalletMock } from 'typings/contracts/ERC1271WalletMock'
import { AddressZero } from 'ethers/constants';

// init test wallets from package.json mnemonic
const web3 = (global as any).web3

const {
  wallet: signerWallet,
  provider: signerProvider,
  signer: signerSigner
} = utils.createTestWallet(web3, 0)

contract('SignatureValidator Contract', (accounts: string[]) => {

  let signerAddress: string
  let signatureValidatorAbstract: AbstractContract
  let ERC1271WalletMockAbstract: AbstractContract
  let signatureValidatorContract: SignatureValidator
  let erc1271WalletMockContract: ERC1271WalletMock

  // load contract abi and deploy to test server
  before(async () => {
    signerAddress = await signerWallet.getAddress()
    signatureValidatorAbstract = await AbstractContract.fromArtifactName('SignatureValidator')
  })

  // deploy before each test, to reset state of contract
  beforeEach(async () => {
    signatureValidatorContract = await signatureValidatorAbstract.deploy(signerWallet) as SignatureValidator 
  })

  describe('isValidSignature() Function', () => {

    let data = ethers.utils.toUtf8Bytes('Did the Ethereum blockchain reach 1TB yet? No.')
    let ethsig: string
    let eip712sig: string

    beforeEach(async () => {
      ethsig = await ethSign(signerWallet, data)
    })

    it('should REVERT if signature is of length 0', async () => {
      // @ts-ignore
      const tx = signatureValidatorContract.functions.isValidSignature(signerAddress, data, [])
      await expect(tx).to.be.rejectedWith( RevertError("SignatureValidator#isValidSignature: LENGTH_GREATER_THAN_0_REQUIRED") )    
    })

    it('should REVERT if expected signer is 0x0', async () => {
      // @ts-ignore
      const tx = signatureValidatorContract.functions.isValidSignature(AddressZero, data, ethsig)
      await expect(tx).to.be.rejectedWith( RevertError("SignatureValidator#isValidSignature: INVALID_SIGNER") )    
    })

    it('should REVERT if signature is illigal (SignatureType: 0x0)', async () => {
      // @ts-ignore
      const tx = signatureValidatorContract.functions.isValidSignature(signerAddress, data, ethsig.slice(0, -2) + '00')
      await expect(tx).to.be.rejectedWith( RevertError("SignatureValidator#isValidSignature: ILLEGAL_SIGNATURE") )    
    })

    it('should REVERT if signatureType is above 05', async () => {
      // @ts-ignore
      const tx = signatureValidatorContract.functions.isValidSignature(signerAddress, data, ethsig.slice(0, -2) + '06')
      await expect(tx).to.be.rejectedWith( RevertError("SignatureValidator#isValidSignature: UNSUPPORTED_SIGNATURE") )    
    })

    describe(`EIP-712 signatures`, () => {

      beforeEach(async () => {
        eip712sig = await eip712Sign(signerWallet, data)
      })

      it('should REVERT if signature length is not 65', async () => {
        // @ts-ignore
        const tx = signatureValidatorContract.functions.isValidSignature(signerAddress, data, '0x1234' + eip712sig.slice(2) )
        await expect(tx).to.be.rejectedWith( RevertError("SignatureValidator#isValidSignature: LENGTH_65_REQUIRED") )    
      })

      it('should return TRUE if signature is valid', async () => {
        // @ts-ignore
        let isValid = await signatureValidatorContract.functions.isValidSignature(signerAddress, data, eip712sig)
        await expect(isValid).to.be.equal(true);   
      })

    })

    describe(`ETH_SIGN signatures`, () => {
      
      it('should REVERT if signature length is not 65', async () => {
        // @ts-ignore
        const tx = signatureValidatorContract.functions.isValidSignature(signerAddress, data, '0x1234' + ethsig.slice(2))
        await expect(tx).to.be.rejectedWith( RevertError("SignatureValidator#isValidSignature: LENGTH_65_REQUIRED") )    
      })

      it('should return TRUE if signature is valid', async () => {
        // @ts-ignore
        let isValid = await signatureValidatorContract.functions.isValidSignature(signerAddress, data, ethsig)
        expect(isValid).to.be.equal(true);   
      })

    })

    describe(`EIP-1271 (bytes) signatures (03)`, () => {
      let erc1271WalletAddress;

      beforeEach( async () => {
        ERC1271WalletMockAbstract = await AbstractContract.fromArtifactName('ERC1271WalletMock')
        erc1271WalletMockContract = await ERC1271WalletMockAbstract.deploy(signerWallet) as ERC1271WalletMock
        erc1271WalletAddress = erc1271WalletMockContract.address;
      })
      
      it('should return FALSE if contract returns incorrect magic value', async () => {
        // @ts-ignore
        let isValid = await signatureValidatorContract.functions.isValidSignature(erc1271WalletAddress, data, ethsig + '03')
        expect(isValid).to.be.equal(false)
      })

      it('should return TRUE if contract returns correct magic value', async () => {
        await erc1271WalletMockContract.functions.setShouldReject(false)

        // @ts-ignore
        let isValid = await signatureValidatorContract.functions.isValidSignature(erc1271WalletAddress, data, ethsig + '03')
        await expect(isValid).to.be.equal(true);   
      })
    })

    describe(`EIP-1271 (bytes32) signatures (04)`, () => {
      let erc1271WalletAddress;

      beforeEach( async () => {
        ERC1271WalletMockAbstract = await AbstractContract.fromArtifactName('ERC1271WalletMock')
        erc1271WalletMockContract = await ERC1271WalletMockAbstract.deploy(signerWallet) as ERC1271WalletMock
        erc1271WalletAddress = erc1271WalletMockContract.address;
      })
      
      it('should return FALSE if contract returns incorrect magic value', async () => {
        // @ts-ignore
        let isValid = await signatureValidatorContract.functions.isValidSignature(erc1271WalletAddress, data, ethsig + '04')
        expect(isValid).to.be.equal(false)
      })

      it('should return TRUE if contract returns correct magic value', async () => {
        await erc1271WalletMockContract.functions.setShouldReject(false)

        // @ts-ignore
        let isValid = await signatureValidatorContract.functions.isValidSignature(erc1271WalletAddress, data, ethsig + '04')
        await expect(isValid).to.be.equal(true);   
      })
    })


  })
})  