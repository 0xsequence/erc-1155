import * as ethers from 'ethers'
import { SigningKey } from 'ethers/utils/signing-key';
import { joinSignature, toUtf8Bytes, defaultAbiCoder, BigNumber } from 'ethers/utils'
import { 
  GasReceipt,
  TransferSignature,
  ApprovalSignature, 
  BatchTransferSignature 
} from 'typings/txTypes'

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
  let prefix = 'VM Exception while processing transaction: revert'
  return errorMessage ? prefix + ' ' + errorMessage : prefix
}

// Take a message, hash it and sign it with ETH_SIGN SignatureType
export async function ethSign(wallet: ethers.Wallet, message: string | Uint8Array) {
  let hash = ethers.utils.keccak256(message)
  let hashArray = ethers.utils.arrayify(hash) 
  let ethsigNoType = await wallet.signMessage(hashArray)
  return ethsigNoType + '02'
}

export async function ethSignTypedData(wallet: ethers.Wallet, domainHash: string,  hashStruct: string | Uint8Array) {
  const EIP191_HEADER = '0x1901000000000000000000000000000000000000000000000000000000000000'
  const preHash = ethers.utils.solidityPack(['bytes', 'bytes32'], [EIP191_HEADER, domainHash])
  const hash = ethers.utils.keccak256(ethers.utils.solidityPack(
      ['bytes', 'bytes32'], 
      [preHash, hashStruct]
    ))

  const hashArray = ethers.utils.arrayify(hash) 
  let ethsigNoType = await wallet.signMessage(hashArray)
  return ethsigNoType + '02'
}

export const GasReceiptType = `tuple(
    uint256 gasLimit,
    uint256 baseGas,
    uint256 gasPrice,
    address feeRecipient,
    bytes feeTokenData
  )`

// Will encode a gasReceipt
export function encodeGasReceipt(g: GasReceipt) { 
  return defaultAbiCoder.encode([GasReceiptType], [g])
}

// Encode data that is passed to safeTransferFrom() for metaTransfers
export async function encodeMetaTransferFromData(s: TransferSignature, domainHash: string, gasReceipt?: GasReceipt | null) 
{
  const META_TX_TYPEHASH = '0xda41aee141786e5a994acb21bcafccf68ed6e07786cb44008c785a06f2819038';

  /** Three encoding scenario
   *  1. Gas receipt and transfer data:
   *   txData: ( '0xebc71fa5', signature,  gasReceipt, transferData)
   * 
   *  2. Gas receipt without transfer data:
   *   txData: ('0xebc71fa5', signature,  gasReceipt)
   * 
   *  3. No gasReceipt with transferData 
   *   txData: ('0x3fed7708', signature, transferData)
   * 
   *  4. No gasReceipt without transferData
   *   txData: ('0x3fed7708', signature)
   */ 

  let sigData;     // Data to sign
  let txDataTypes; // Types of data to encode
  let sig;         // Signature

  // Struct Data type
  const sigArgTypes = [
    'bytes32', // META_TX_TYPEHASH
    'address', // _from
    'address', // _to
    'uint256', // _id
    'uint256', // _amount
    'uint256', // nonce
  // bytes32   // hash of signed data
    ];
  
  let signer = await s.signerWallet.getAddress()

  // Packed encoding of transfer signature message
  sigData = ethers.utils.solidityPack(sigArgTypes, [
    META_TX_TYPEHASH,
    signer,
    s.receiver,
    s.id,
    s.amount,
    s.nonce,
  ])

  txDataTypes = ['bytes', 'bytes']; // (sig, (gasReceipt, transferData))

  // When gas receipt is included
  if (gasReceipt && gasReceipt !== null) {

    // 1. 
    if (s.transferData !== null) {
      let gasAndTransferData = defaultAbiCoder.encode([GasReceiptType, 'bytes'], [gasReceipt, s.transferData])   
      sigData = ethers.utils.keccak256(ethers.utils.solidityPack(
        ['bytes', 'bytes32'], 
        [sigData, ethers.utils.keccak256(gasAndTransferData)] //Hash of _data
      ))
      sig = await ethSignTypedData(s.signerWallet, domainHash, sigData)
      return defaultAbiCoder.encode(txDataTypes, [sig, gasAndTransferData])
    
    // 2.
    } else {
      let gasAndTransferData = defaultAbiCoder.encode([GasReceiptType, 'bytes'], [gasReceipt, toUtf8Bytes('')])
      sigData = ethers.utils.keccak256(ethers.utils.solidityPack(
        ['bytes', 'bytes32'], 
        [sigData, ethers.utils.keccak256(gasAndTransferData)] //Hash of _data
      ))
      sig = await ethSignTypedData(s.signerWallet, domainHash, sigData)
      return  defaultAbiCoder.encode(txDataTypes, [sig, gasAndTransferData])
    }

  } else { 

    // 3.
    if (s.transferData !== null) {
      sigData = ethers.utils.keccak256(ethers.utils.solidityPack(
        ['bytes', 'bytes32'], 
        [sigData, ethers.utils.keccak256(s.transferData)] //Hash of _data
      ))
      sig = await ethSignTypedData(s.signerWallet, domainHash, sigData)
      return  defaultAbiCoder.encode(txDataTypes, [sig, s.transferData])
    
    // 4.
    } else { 
      let emptyTransferData = defaultAbiCoder.encode(['bytes'], [toUtf8Bytes('')])
      sigData = ethers.utils.keccak256(ethers.utils.solidityPack(
        ['bytes', 'bytes32'], 
        [sigData, ethers.utils.keccak256(emptyTransferData)] //Hash of _data
      ))
      sig = await ethSignTypedData(s.signerWallet, domainHash, sigData)
      return  defaultAbiCoder.encode(txDataTypes, [sig, emptyTransferData])
    }

  }
}

// Encode data that is passed to safeTransferFrom() for metaTransfers
export async function encodeMetaBatchTransferFromData(s: BatchTransferSignature, domainHash: string, gasReceipt?: GasReceipt | null) 
{
  const META_BATCH_TX_TYPEHASH = '0xa358be8ef28a8eef7877f5d78ce30ff1cada344474e3d550ee9f4be9151f84f7';

  /** Three encoding scenario
   *  1. Gas receipt and transfer data:
   *   txData: ( '0xebc71fa5', signature,  gasReceipt, transferData)
   * 
   *  2. Gas receipt without transfer data:
   *   txData: ('0xebc71fa5', signature,  gasReceipt)
   * 
   *  3. No gasReceipt with transferData 
   *   txData: ('0x3fed7708', signature, transferData)
   * 
   *  4. No gasReceipt without transferData
   *   txData: ('0x3fed7708', signature)
   */  



  let sigData;     // Data to sign
  let txDataTypes; // Types of data to encode
  let sig;         // Signature

  // Struct Data type
  const sigArgTypes = [
    'bytes32', // META_TX_TYPEHASH
    'address', // _from
    'address', // _to
    'bytes32', // keccak256(_ids)
    'bytes32', // keccak256(_amounts)
    'uint256', // nonce
  // bytes32   // hash of signed data
    ];
  

  let signer = await s.signerWallet.getAddress()

  // Packed encoding of transfer signature message
  sigData = ethers.utils.solidityPack(sigArgTypes, [
    META_BATCH_TX_TYPEHASH,
    signer,
    s.receiver,
    ethers.utils.keccak256(ethers.utils.solidityPack(['uint256[]'], [s.ids])),
    ethers.utils.keccak256(ethers.utils.solidityPack(['uint256[]'], [s.amounts])),
    s.nonce,
  ])

  txDataTypes = ['bytes', 'bytes']; // (sig, (gasReceipt, transferData))

  // When gas receipt is included
  if (gasReceipt && gasReceipt !== null) {

    // 1. 
    if (s.transferData !== null) {
      let gasAndTransferData = defaultAbiCoder.encode([GasReceiptType, 'bytes'], [gasReceipt, s.transferData])   
      sigData = ethers.utils.keccak256(ethers.utils.solidityPack(
        ['bytes', 'bytes32'], 
        [sigData, ethers.utils.keccak256(gasAndTransferData)] //Hash of _data
      ))
      sig = await ethSignTypedData(s.signerWallet, domainHash, sigData)
      return defaultAbiCoder.encode(txDataTypes, [sig, gasAndTransferData])

    // 2.
    } else {
      let gasAndTransferData = defaultAbiCoder.encode([GasReceiptType, 'bytes'], [gasReceipt, toUtf8Bytes('')])
      sigData = ethers.utils.keccak256(ethers.utils.solidityPack(
        ['bytes', 'bytes32'], 
        [sigData, ethers.utils.keccak256(gasAndTransferData)] //Hash of _data
      ))
      sig = await ethSignTypedData(s.signerWallet, domainHash, sigData)
      return  defaultAbiCoder.encode(txDataTypes, [sig, gasAndTransferData])
    }

  } else { 

    // 3.
    if (s.transferData !== null) {
      sigData = ethers.utils.keccak256(ethers.utils.solidityPack(
        ['bytes', 'bytes32'], 
        [sigData, ethers.utils.keccak256(s.transferData)] //Hash of _data
      ))
      sig = await ethSignTypedData(s.signerWallet, domainHash, sigData)
      return  defaultAbiCoder.encode(txDataTypes, [sig, s.transferData])

    // 4.
    } else { 
      let emptyTransferData = defaultAbiCoder.encode(['bytes'], [toUtf8Bytes('')])
      sigData = ethers.utils.keccak256(ethers.utils.solidityPack(
        ['bytes', 'bytes32'], 
        [sigData, ethers.utils.keccak256(emptyTransferData)] //Hash of _data
      ))
      sig = await ethSignTypedData(s.signerWallet, domainHash, sigData)
      return  defaultAbiCoder.encode(txDataTypes, [sig, emptyTransferData])
    }
  }
}

// Encode data that is passed to safeTransferFrom() for metaTransfers
export async function encodeMetaApprovalData(a: ApprovalSignature, domainHash: string, gasReceipt?: GasReceipt | null) 
{
  const META_APPROVAL_TYPEHASH = "0xd72d507eb90d918a375b250ea7bfc291be59526e94e2baa2fe3b35daa72a0b15";

  let sigData: string; // Data to sign
  let txDataTypes: string[]; // Types of data to encode
  let sig: string; // Signature

  // Struct Data type
  const sigArgTypes = [
    'bytes32',   // META_TX_TYPEHASH
    'address',   // _owner
    'address',   // _operator
    'bool',      // _approved
    'uint256',   // nonce
  // bytes32     // hash of signed data
  ];
  
  // Get signer
  let signer = await a.signerWallet.getAddress()

  // Packed encoding of transfer signature message
  sigData = ethers.utils.solidityPack(sigArgTypes, [
    META_APPROVAL_TYPEHASH,
    signer,
    a.operator,
    a.approved,
    a.nonce,
  ])

  txDataTypes = ['bytes', 'bytes']; // (sig, (gasReceipt))
  
  // When gas receipt is included
  if (gasReceipt && gasReceipt !== null) {
    let gasData = defaultAbiCoder.encode([GasReceiptType], [gasReceipt])
    sigData = ethers.utils.keccak256(ethers.utils.solidityPack(
      ['bytes', 'bytes32'], 
      [sigData, ethers.utils.keccak256(gasData)] //Hash of _data
    ))
    sig = await ethSignTypedData(a.signerWallet, domainHash, sigData)
    return  defaultAbiCoder.encode(txDataTypes, [sig, gasData])
    
  } else { 
    let emptyTransferData = defaultAbiCoder.encode(['bytes'], [toUtf8Bytes('')])
    sigData = ethers.utils.keccak256(ethers.utils.solidityPack(
      ['bytes', 'bytes32'], 
      [sigData, ethers.utils.keccak256(emptyTransferData)] //Hash of _data
    ))
    sig = await ethSignTypedData(a.signerWallet, domainHash, sigData)
    return  defaultAbiCoder.encode(txDataTypes, [sig, emptyTransferData])
  }

}


// Take a message, hash it and sign it with EIP_712_SIG SignatureType
export function eip712Sign(wallet: ethers.Wallet, message: string | Uint8Array) {
  let hash = ethers.utils.keccak256(message)
  let signerSigningKey = new SigningKey(wallet.privateKey)
  let eip712sig = joinSignature(signerSigningKey.signDigest(hash))
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

  readonly _web3Provider: ethers.providers.AsyncSendable
  private _sendAsync: (request: any, callback: (error: any, response: any) => void) => void

  constructor(web3Provider: ethers.providers.AsyncSendable, network?: ethers.utils.Networkish) {
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
        ethers.errors.throwError(
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
      let request = {
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
          let error: any = new Error(result.error.message)
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
