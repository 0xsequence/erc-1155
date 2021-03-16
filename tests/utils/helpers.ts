import * as ethers from 'ethers'
import { BigNumber, utils } from 'ethers'
import { ExternalProvider } from '@ethersproject/providers'
import { Networkish } from '@ethersproject/networks'
import { 
  GasReceipt,
  TransferSignature,
  ApprovalSignature, 
  BatchTransferSignature 
} from 'src/typings/tx-types'

export const UNIT_ETH = ethers.utils.parseEther('1')
export const HIGH_GAS_LIMIT = { gasLimit: 6e9 }

// createTestWallet creates a new wallet
export const createTestWallet = (web3: any, addressIndex: number = 0) => {
  const provider = new Web3DebugProvider(web3.currentProvider)
  
  const wallet = ethers.Wallet
    .fromMnemonic(process.env.npm_package_config_mnemonic!, `m/44'/60'/0'/0/${addressIndex}`)
    .connect(provider)

  const signer = provider.getSigner(addressIndex)

  return { wallet, provider, signer }
}

// Check if tx was Reverted with specified message
export function RevertError(errorMessage?: string) {
  const prefix = 'VM Exception while processing transaction: revert'
  return errorMessage ? RegExp(`${prefix + ' ' + errorMessage}`) : RegExp(`${prefix}`)
}

// Take a message, hash it and sign it with ETH_SIGN SignatureType
export async function ethSign(wallet: ethers.Wallet, message: string | Uint8Array) {
  const hash = ethers.utils.keccak256(message)
  const hashArray = ethers.utils.arrayify(hash) 
  const ethsigNoType = await wallet.signMessage(hashArray)
  return ethsigNoType + '02' 
}

export async function ethSignTypedData(
  wallet: ethers.Wallet, 
  domainHash: string,  
  hashStruct: string | Uint8Array, 
  nonce: BigNumber, 
  sigType?: string) 
{
  const EIP191_HEADER = "0x1901"
  const preHash = ethers.utils.solidityPack(['bytes', 'bytes32'], [EIP191_HEADER, domainHash])
  const hash = ethers.utils.keccak256(ethers.utils.solidityPack(
      ['bytes', 'bytes32'], 
      [preHash, hashStruct]
    ))

  const hashArray = ethers.utils.arrayify(hash) 
  const ethsigNoType = await wallet.signMessage(hashArray)
  const paddedNonce = ethers.utils.solidityPack(['uint256'], [nonce])
  const ethsigNoType_nonce = ethsigNoType + paddedNonce.slice(2) // encode packed the nonce
  return sigType ? ethsigNoType_nonce + sigType : ethsigNoType_nonce + '02'
}

export const GasReceiptType = `tuple(
    uint256 gasFee,
    uint256 gasLimitCallback,
    address feeRecipient,
    bytes feeTokenData
  )`

// Will encode a gasReceipt
export function encodeGasReceipt(g: GasReceipt) { 
  return utils.defaultAbiCoder.encode([GasReceiptType], [g])
}

// Encode data that is passed to safeTransferFrom() for metaTransfers
export async function encodeMetaTransferFromData(s: TransferSignature, domainHash: string, gasReceipt?: GasReceipt | null, sigType?: string) 
{
  const META_TX_TYPEHASH = '0xce0b514b3931bdbe4d5d44e4f035afe7113767b7db71949271f6a62d9c60f558';

  /** Three encoding scenario
   *  1. Gas receipt and transfer data:
   *   txData: ((bytes32 r, bytes32 s, uint8 v, SignatureType sigType), (GasReceipt g, bytes transferData))
   * 
   *  2. Gas receipt without transfer data:
   *   txData: ((bytes32 r, bytes32 s, uint8 v, SignatureType sigType), (GasReceipt g))
   * 
   *  3. No gasReceipt with transferData 
   *   txData: ((bytes32 r, bytes32 s, uint8 v, SignatureType sigType), (bytes transferData))
   * 
   *  4. No gasReceipt without transferData
   *   txData: ((bytes32 r, bytes32 s, uint8 v, SignatureType sigType))
   */ 

  let sigData;     // Data to sign
  let txDataTypes; // Types of data to encode
  let sig;         // Signature

  // Struct Data type
  const sigArgTypes = [
    'bytes32', // META_TX_TYPEHASH
    'uint256', // _from: uint256(address)
    'uint256', // _to:   uint256(address)
    'uint256', // _id
    'uint256', // _amount
    'uint256', // _isGasFee: uint256(bool)
    'uint256', // nonce
 // 'bytes32', // hash of transfer data (added below, if any)
    ];
  
  const signer = s.from ? s.from : await s.signerWallet.getAddress()
  const is_gas_Fee_hex = s.isGasFee ? '0x1' : '0x0'

  // Packed encoding of transfer signature message
  sigData = ethers.utils.solidityPack(sigArgTypes, [
    META_TX_TYPEHASH,
    signer,
    s.receiver,
    s.id,
    s.amount,
    is_gas_Fee_hex,
    s.nonce,
  ])

  txDataTypes = ['bytes', 'bytes']; // (sig, (gasReceipt, transferData))

  // When gas receipt is included
  if (gasReceipt && gasReceipt !== null) {

    // 1. 
    if (s.transferData !== null) {
      const gasAndTransferData = utils.defaultAbiCoder.encode([GasReceiptType, 'bytes'], [gasReceipt, s.transferData])   
      sigData = ethers.utils.keccak256(ethers.utils.solidityPack(
        ['bytes', 'bytes32'], 
        [sigData, ethers.utils.keccak256(gasAndTransferData)] //Hash of _data
      ))
      sig = await ethSignTypedData(s.signerWallet, domainHash, sigData, s.nonce, sigType)
      return utils.defaultAbiCoder.encode(txDataTypes, [sig, gasAndTransferData])
    
    // 2.
    } else {
      const gasAndTransferData = utils.defaultAbiCoder.encode([GasReceiptType, 'bytes'], [gasReceipt, []])
      sigData = ethers.utils.keccak256(ethers.utils.solidityPack(
        ['bytes', 'bytes32'], 
        [sigData, ethers.utils.keccak256(gasAndTransferData)] //Hash of _data
      ))
      sig = await ethSignTypedData(s.signerWallet, domainHash,  sigData, s.nonce, sigType)
      return  utils.defaultAbiCoder.encode(txDataTypes, [sig, gasAndTransferData])
    }

  } else { 

    // 3.
    if (s.transferData !== null) {
      sigData = ethers.utils.keccak256(ethers.utils.solidityPack(
        ['bytes', 'bytes32'], 
        [sigData, ethers.utils.keccak256(s.transferData)] //Hash of _data
      ))
      sig = await ethSignTypedData(s.signerWallet, domainHash,  sigData, s.nonce, sigType)
      return  utils.defaultAbiCoder.encode(txDataTypes, [sig, s.transferData])
    
    // 4.
    } else { 
      const emptyTransferData = []
      sigData = ethers.utils.keccak256(ethers.utils.solidityPack(
        ['bytes', 'bytes32'], 
        [sigData, ethers.utils.keccak256(emptyTransferData)] //Hash of _data
      ))
      sig = await ethSignTypedData(s.signerWallet, domainHash,  sigData, s.nonce, sigType)
      return  utils.defaultAbiCoder.encode(txDataTypes, [sig, emptyTransferData])
    }

  }
}

// Encode data that is passed to safeTransferFrom() for metaTransfers
export async function encodeMetaBatchTransferFromData(s: BatchTransferSignature, domainHash: string, gasReceipt?: GasReceipt | null, sigType?: string) 
{
  const META_BATCH_TX_TYPEHASH = '0xa3d4926e8cf8fe8e020cd29f514c256bc2eec62aa2337e415f1a33a4828af5a0';

  /** Three encoding scenario
   *  1. Gas receipt and transfer data:
   *   txData: ((bytes32 r, bytes32 s, uint8 v, SignatureType sigType), (GasReceipt g, bytes transferData))
   * 
   *  2. Gas receipt without transfer data:
   *   txData: ((bytes32 r, bytes32 s, uint8 v, SignatureType sigType), (GasReceipt g))
   * 
   *  3. No gasReceipt with transferData 
   *   txData: ((bytes32 r, bytes32 s, uint8 v, SignatureType sigType), (bytes transferData))
   * 
   *  4. No gasReceipt without transferData
   *   txData: ((bytes32 r, bytes32 s, uint8 v, SignatureType sigType))
   */  



  let sigData;     // Data to sign
  let txDataTypes; // Types of data to encode
  let sig;         // Signature

  // Struct Data type
  const sigArgTypes = [
    'bytes32', // META_TX_TYPEHASH
    'uint256', // _from: uint256(address)
    'uint256', // _to: uint256(address)
    'bytes32', // keccak256(_ids)
    'bytes32', // keccak256(_amounts)
    'uint256', // _isGasFee: uint256(bool)
    'uint256', // nonce
 // 'bytes32', // hash of transfer data (added below, if any)
    ];
  

  const signer = s.from ? s.from : await s.signerWallet.getAddress()
  const is_gas_Fee_hex = s.isGasFee ? '0x1' : '0x0'

  // Packed encoding of transfer signature message
  sigData = ethers.utils.solidityPack(sigArgTypes, [
    META_BATCH_TX_TYPEHASH,
    signer,
    s.receiver,
    ethers.utils.keccak256(ethers.utils.solidityPack(['uint256[]'], [s.ids])),
    ethers.utils.keccak256(ethers.utils.solidityPack(['uint256[]'], [s.amounts])),
    is_gas_Fee_hex,
    s.nonce,
  ])

  txDataTypes = ['bytes', 'bytes']; // (sig, (gasReceipt, transferData))

  // When gas receipt is included
  if (gasReceipt && gasReceipt !== null) {

    // 1. 
    if (s.transferData !== null) {
      const gasAndTransferData = utils.defaultAbiCoder.encode([GasReceiptType, 'bytes'], [gasReceipt, s.transferData])   
      sigData = ethers.utils.keccak256(ethers.utils.solidityPack(
        ['bytes', 'bytes32'], 
        [sigData, ethers.utils.keccak256(gasAndTransferData)] //Hash of _data
      ))
      sig = await ethSignTypedData(s.signerWallet, domainHash,  sigData, s.nonce, sigType)
      return utils.defaultAbiCoder.encode(txDataTypes, [sig, gasAndTransferData])

    // 2.
    } else {
      const gasAndTransferData = utils.defaultAbiCoder.encode([GasReceiptType, 'bytes'], [gasReceipt, []])
      sigData = ethers.utils.keccak256(ethers.utils.solidityPack(
        ['bytes', 'bytes32'], 
        [sigData, ethers.utils.keccak256(gasAndTransferData)] //Hash of _data
      ))
      sig = await ethSignTypedData(s.signerWallet, domainHash,  sigData, s.nonce, sigType)
      return  utils.defaultAbiCoder.encode(txDataTypes, [sig, gasAndTransferData])
    }

  } else { 

    // 3.
    if (s.transferData !== null) {
      sigData = ethers.utils.keccak256(ethers.utils.solidityPack(
        ['bytes', 'bytes32'], 
        [sigData, ethers.utils.keccak256(s.transferData)] //Hash of _data
      ))
      sig = await ethSignTypedData(s.signerWallet, domainHash,  sigData, s.nonce, sigType)
      return  utils.defaultAbiCoder.encode(txDataTypes, [sig, s.transferData])

    // 4.
    } else { 
      const emptyTransferData = []
      sigData = ethers.utils.keccak256(ethers.utils.solidityPack(
        ['bytes', 'bytes32'], 
        [sigData, ethers.utils.keccak256(emptyTransferData)] //Hash of _data
      ))
      sig = await ethSignTypedData(s.signerWallet, domainHash,  sigData, s.nonce, sigType)
      return  utils.defaultAbiCoder.encode(txDataTypes, [sig, emptyTransferData])
    }
  }
}

// Encode data that is passed to safeTransferFrom() for metaTransfers
export async function encodeMetaApprovalData(a: ApprovalSignature, domainHash: string, gasReceipt?: GasReceipt | null, sigType?: string) 
{
  const META_APPROVAL_TYPEHASH = "0xf5d4c820494c8595de274c7ff619bead38aac4fbc3d143b5bf956aa4b84fa524";

  let sigData: string; // Data to sign
  let txDataTypes: string[]; // Types of data to encode
  let sig: string; // Signature

  const approved_hex = a.approved ? '0x1' : '0x0'
  const is_gas_Fee_hex = a.isGasFee ? '0x1' : '0x0'

  // Struct Data type
  const sigArgTypes = [
    'bytes32', // META_TX_TYPEHASH
    'uint256', // _owner: uint256(address)
    'uint256', // _operator: uint256(address)
    'uint256', // _approved: uint256(bool)
    'uint256', // _isGasFee: uint256(bool)
    'uint256', // nonce
  ];
  
  // Get signer
  const signer = a.owner ? a.owner : await a.signerWallet.getAddress()

  // Packed encoding of transfer signature message
  sigData = ethers.utils.solidityPack(sigArgTypes, [
    META_APPROVAL_TYPEHASH,
    signer,
    a.operator,
    approved_hex,
    is_gas_Fee_hex,
    a.nonce,
  ])

  txDataTypes = ['bytes', 'bytes']; // (sig, (gasReceipt))
  
  // When gas receipt is included
  if (gasReceipt && gasReceipt !== null) {
    const gasData = utils.defaultAbiCoder.encode([GasReceiptType], [gasReceipt])
    sigData = ethers.utils.keccak256(ethers.utils.solidityPack(
      ['bytes', 'bytes32'], 
      [sigData, ethers.utils.keccak256(gasData)] //Hash of _data
    ))
    sig = await ethSignTypedData(a.signerWallet, domainHash,  sigData, a.nonce, sigType)
    return  utils.defaultAbiCoder.encode(txDataTypes, [sig, gasData])
    
  } else { 
    const emptyTransferData = []
    sigData = ethers.utils.keccak256(ethers.utils.solidityPack(
      ['bytes', 'bytes32'], 
      [sigData, ethers.utils.keccak256(emptyTransferData)] //Hash of _data
    ))
    sig = await ethSignTypedData(a.signerWallet, domainHash,  sigData, a.nonce, sigType)
    return  utils.defaultAbiCoder.encode(txDataTypes, [sig, emptyTransferData])
  }

}


// Take a message, hash it and sign it with EIP_712_SIG SignatureType
export function eip712Sign(wallet: ethers.Wallet, message: string | Uint8Array) {
  const hash = ethers.utils.keccak256(message)
  const signerSigningKey = new utils.SigningKey(wallet.privateKey)
  const eip712sig = utils.joinSignature(signerSigningKey.signDigest(hash))
  return eip712sig + '01'
}

export interface JSONRPCRequest {
  jsonrpc: string
  id: number
  method: any
  params: any
}

export class Web3DebugProvider extends ethers.providers.JsonRpcProvider {

  public reqCounter = 0
  public reqLog: JSONRPCRequest[] = []

  readonly _web3Provider: ExternalProvider
  private _sendAsync: (request: any, callback: (error: any, response: any) => void) => void

  constructor(web3Provider: ExternalProvider, network?: Networkish) {
      // HTTP has a host; IPC has a path.
      super(web3Provider.host || web3Provider.path || '', network)

      if (web3Provider) {
        if (web3Provider.sendAsync) {
          this._sendAsync = web3Provider.sendAsync.bind(web3Provider)
        } else if (web3Provider.send) {
          this._sendAsync = web3Provider.send.bind(web3Provider)
        }
      }

      if (!web3Provider || !this._sendAsync) {
        ethers.logger.throwError(
          'invalid web3Provider',
          ethers.errors.INVALID_ARGUMENT,
          { arg: 'web3Provider', value: web3Provider }
        )
      }

      ethers.utils.defineReadOnly(this, '_web3Provider', web3Provider)
  }

  send(method: string, params: any): Promise<any> {

    this.reqCounter++

    return new Promise((resolve, reject) => {
      const request = {
        method: method,
        params: params,
        id: this.reqCounter,
        jsonrpc: '2.0'
      } as JSONRPCRequest
      this.reqLog.push(request)

      this._sendAsync(request, function(error, result) {
        if (error) {
          reject(error)
          return
        }

        if (result.error) {
          // @TODO: not any
          const error: any = new Error(result.error.message)
          error.code = result.error.code
          error.data = result.error.data
          reject(error)
          return
        }

        resolve(result.result)
      })
    })
  }

  getPastRequest(reverseIndex: number = 0): JSONRPCRequest {
    if (this.reqLog.length === 0) {
      return { jsonrpc: '2.0', id: 0, method: null, params: null }
    }
    return this.reqLog[this.reqLog.length-reverseIndex-1]
  }

}
