import * as ethers from 'ethers'

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
