import * as ethers from 'ethers'

import { 
  AbstractContract,  
  RevertError, 
  expect,
  encodeMetaTransferFromData,
  encodeMetaBatchTransferFromData,
  encodeMetaApprovalData,
  GasReceiptType, 
  ethSign 
} from './utils'
import * as utils from './utils'

import { toUtf8Bytes, bigNumberify, BigNumber } from 'ethers/utils'

import { ERC1155MetaMintBurnPackedBalanceMock } from 'typings/contracts/ERC1155MetaMintBurnPackedBalanceMock'
import { ERC1155ReceiverMock } from 'typings/contracts/ERC1155ReceiverMock'
import { ERC1155OperatorMock } from 'typings/contracts/ERC1155OperatorMock'
import { 
  GasReceipt, 
  TransferSignature, 
  ApprovalSignature, 
  BatchTransferSignature 
} from 'typings/txTypes';

// init test wallets from package.json mnemonic
const web3 = (global as any).web3
  
const {
  wallet: ownerWallet,
  provider: ownerProvider,
  signer: ownerSigner
} = utils.createTestWallet(web3, 0)

const {
  wallet: receiverWallet,
  provider: receiverProvider,
  signer: receiverSigner
} = utils.createTestWallet(web3, 2)

const {
  wallet: operatorWallet,
  provider: operatorProvider,
  signer: operatorSigner
} = utils.createTestWallet(web3, 4)

// Lower polling interval for faster tx send
ownerProvider.pollingInterval = 1000;
operatorProvider.pollingInterval = 1000;
receiverProvider.pollingInterval = 1000;

contract('ERC1155MetaPackedBalance', (accounts: string[]) => {

  const MAXVAL = new BigNumber(2).pow(16).sub(1) // 2**16 - 1
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

  let ownerAddress: string
  let receiverAddress: string
  let operatorAddress: string
  let erc1155Abstract: AbstractContract
  let operatorAbstract: AbstractContract

  let erc1155Contract: ERC1155MetaMintBurnPackedBalanceMock
  let operatorERC1155Contract: ERC1155MetaMintBurnPackedBalanceMock
  let receiverERC1155Contract: ERC1155MetaMintBurnPackedBalanceMock


  // load contract abi and deploy to test server
  before(async () => {
    ownerAddress = await ownerWallet.getAddress()
    receiverAddress = await receiverWallet.getAddress()
    operatorAddress = await operatorWallet.getAddress()

    erc1155Abstract = await AbstractContract.fromArtifactName('ERC1155MetaMintBurnPackedBalanceMock')
    operatorAbstract = await AbstractContract.fromArtifactName('ERC1155OperatorMock')
  })

  // deploy before each test, to reset state of contract
  beforeEach(async () => {
    erc1155Contract = await erc1155Abstract.deploy(ownerWallet) as ERC1155MetaMintBurnPackedBalanceMock 
    operatorERC1155Contract = await erc1155Contract.connect(operatorSigner) as ERC1155MetaMintBurnPackedBalanceMock
    receiverERC1155Contract = await erc1155Contract.connect(receiverSigner) as ERC1155MetaMintBurnPackedBalanceMock
  })
  



  describe('safeTransferFrom() (Meta) Function', () => {
    let receiverContract: ERC1155ReceiverMock
    let operatorContract: ERC1155OperatorMock
    let METATRANSFER_IDENTIFIER = '0xebc71fa5';
    
    let transferData: string | null = 'Hello from the other side'
    let initBalance = 100;
    let amount = 10;
    let nonce = 0;
    let id = 66;

    let isGasReceipt: boolean = true;
    let feeTokenInitBalance = new BigNumber(30000);
    let feeIsERC1155 = true
    let feeTokenID = 666   
    let feeToken : BigNumber;
    let feeTokenAddress : string
    let feeTokenDataERC1155: string | Uint8Array

    let transferObj: TransferSignature;
    let gasReceipt : GasReceipt | null;
    let data : string;

    let conditions = [
      [transferData, true, 'Gas receipt & transfer data'],  
      [null, true, 'Gas receipt w/o transfer data'], 
      [transferData, false, 'Transfer data w/o gas receipt '],  
      [null, false, 'No Gas receipt & No transfer data']  
    ]

    conditions.forEach(function(condition) {
      context(condition[2] as string, () => {

        beforeEach(async () => {

          // Get conditions
          transferData = condition[0] as string | null
          isGasReceipt = condition[1] as boolean

          // Deploy contracts
          let abstract = await AbstractContract.fromArtifactName('ERC1155ReceiverMock')
          receiverContract = await abstract.deploy(ownerWallet) as ERC1155ReceiverMock
          operatorContract = await operatorAbstract.deploy(operatorWallet) as ERC1155OperatorMock

          feeTokenAddress = erc1155Contract.address

          feeTokenDataERC1155 = ethers.utils.defaultAbiCoder.encode(
            ['bool', 'address', 'uint256'], 
            [feeIsERC1155,  feeTokenAddress,  feeTokenID]
          )

          // Gas Receipt
          gasReceipt = {
            gasLimit: 10000,
            baseGas: 1000,
            gasPrice: 1,
            feeRecipient: operatorAddress,
            feeTokenData: feeTokenDataERC1155,
          }

          // Check if gas receipt is included
          gasReceipt = isGasReceipt ? gasReceipt : null
          
          // Transfer Signature Object
          transferObj = {
            contractAddress: erc1155Contract.address,
            signerWallet: ownerWallet,
            receiver: receiverAddress,
            id: id,
            amount: amount,
            transferData: transferData === null ? null : toUtf8Bytes(transferData),
            nonce: nonce
          }

          // Mint tokens
          await erc1155Contract.functions.mintMock(ownerAddress, id, initBalance)

          // Mint tokens used to pay for gas
          await erc1155Contract.functions.mintMock(ownerAddress, feeToken, feeTokenInitBalance)

          // Data to pass in transfer method
          data = await encodeMetaTransferFromData(transferObj, gasReceipt)
        })

        it('should call parent function if empty data', async () => {
          let dataUint8 = toUtf8Bytes("")
          data = '0xebc71fa4' + bigNumberify(dataUint8).toHexString().slice(2)

          // Check if data lelngth is less than 70
          expect(ethers.utils.arrayify(data).length).to.be.at.most(69)

          // NOTE: typechain generates the wrong type for `bytes` type at this time
          // see https://github.com/ethereum-ts/TypeChain/issues/123
          // @ts-ignore
          const tx = erc1155Contract.functions.safeTransferFrom(ownerAddress, receiverContract.address, id, amount, data)
          await expect(tx).to.be.fulfilled
        })

        it('should call parent function if data without metaTransfer identifier', async () => {
          let dataUint8 = toUtf8Bytes("Breakthroughs! over the river! flips and crucifixions! gone down the flood!")
          let data = '0xebc71fa4' + bigNumberify(dataUint8).toHexString().slice(2)

          // Check if data lelngth is more than 696
          expect(ethers.utils.arrayify(data).length).to.be.at.least(70)
    
          // @ts-ignore
          const tx = erc1155Contract.functions.safeTransferFrom(ownerAddress, receiverContract.address, id, amount, data)
          await expect(tx).to.be.fulfilled
        })

        it("should REVERT if data first 4 bytes are '0xebc71fa5' and random encoded data the rest", async () => {
          let dataUint8 = toUtf8Bytes("Breakthroughs! over the river! flips and crucifixions! gone down the flood!")
          let data = METATRANSFER_IDENTIFIER + bigNumberify(dataUint8).toHexString().slice(2)

          // Check if data lelngth is more than 69
          expect(ethers.utils.arrayify(data).length).to.be.at.least(70)

          // @ts-ignore
          const tx = erc1155Contract.functions.safeTransferFrom(ownerAddress, receiverContract.address, id, amount, data)
          await expect(tx).to.be.rejected;  
        })

        it("should REVERT if contract address is incorrect", async () => {
          transferObj.contractAddress = receiverContract.address;
          data = await encodeMetaTransferFromData(transferObj, gasReceipt)

          // @ts-ignore
          const tx = operatorERC1155Contract.functions.safeTransferFrom(ownerAddress, receiverAddress, id, amount, data)
          await expect(tx).to.be.rejectedWith( RevertError("ERC1155Meta#_validateTransferSignature: INVALID_SIGNATURE") )    
        })

        it("should REVERT if signer address is incorrect", async () => {
          transferObj.signerWallet = operatorWallet;
          data = await encodeMetaTransferFromData(transferObj, gasReceipt)

          // @ts-ignore
          const tx = operatorERC1155Contract.functions.safeTransferFrom(ownerAddress, receiverAddress, id, amount, data)
          await expect(tx).to.be.rejectedWith( RevertError("ERC1155Meta#_validateTransferSignature: INVALID_SIGNATURE") )  
        })

        it("should REVERT if receiver address is incorrect", async () => {
          transferObj.receiver = ownerAddress;
          data = await encodeMetaTransferFromData(transferObj, gasReceipt)

          // @ts-ignore
          const tx = operatorERC1155Contract.functions.safeTransferFrom(ownerAddress, receiverAddress, id, amount, data)
          await expect(tx).to.be.rejectedWith( RevertError("ERC1155Meta#_validateTransferSignature: INVALID_SIGNATURE") )  
        })

        it("should REVERT if token id is incorrect", async () => {
          transferObj.id = id+1;
          data = await encodeMetaTransferFromData(transferObj, gasReceipt)

          // @ts-ignore
          const tx = operatorERC1155Contract.functions.safeTransferFrom(ownerAddress, receiverAddress, id, amount, data)
          await expect(tx).to.be.rejectedWith( RevertError("ERC1155Meta#_validateTransferSignature: INVALID_SIGNATURE") )  
        })

        it("should REVERT if token amount is incorrect", async () => {
          transferObj.amount = amount + 1;
          data = await encodeMetaTransferFromData(transferObj, gasReceipt)

          // @ts-ignore
          const tx = operatorERC1155Contract.functions.safeTransferFrom(ownerAddress, receiverAddress, id, amount, data)
          await expect(tx).to.be.rejectedWith( RevertError("ERC1155Meta#_validateTransferSignature: INVALID_SIGNATURE") )  
        })

        it("should REVERT if transfer data is incorrect", async () => {
          const sigArgTypes = ['address', 'address', 'address', 'uint256', 'uint256', 'uint256'];
          const txDataTypes = ['bytes4', 'bytes', 'bytes'];
        
          let signer = await transferObj.signerWallet.getAddress()
          
          // Packed encoding of transfer signature message
          let sigData = ethers.utils.solidityPack(sigArgTypes, [
            transferObj.contractAddress, signer, transferObj.receiver, transferObj.id, 
            transferObj.amount, transferObj.nonce
          ])

          let transferData = transferObj.transferData == null ? toUtf8Bytes('') : transferObj.transferData
          let goodGasAndTransferData;
          let badGasAndTransferData;

          // Correct and incorrect transferData
          if (isGasReceipt) {
            goodGasAndTransferData = ethers.utils.defaultAbiCoder.encode([GasReceiptType, 'bytes'], [gasReceipt, transferData])
            badGasAndTransferData = ethers.utils.defaultAbiCoder.encode([GasReceiptType, 'bytes'], [gasReceipt, toUtf8Bytes('Goodbyebyebye')])
          } else {
            goodGasAndTransferData = ethers.utils.defaultAbiCoder.encode(['bytes'], [transferData])
            badGasAndTransferData = ethers.utils.defaultAbiCoder.encode(['bytes'], [toUtf8Bytes('Goodbyebyebye')])
          }

          // Encode normally the whole thing
          sigData = ethers.utils.solidityPack(['bytes', 'bytes'], [sigData, goodGasAndTransferData])
        
          // Get signature
          let sig = await ethSign(transferObj.signerWallet, sigData)
        
          // PASS BAD DATA
          data = ethers.utils.defaultAbiCoder.encode(txDataTypes, ['0xebc71fa5', sig, badGasAndTransferData])

          // @ts-ignore
          const tx = operatorERC1155Contract.functions.safeTransferFrom(ownerAddress, receiverAddress, id, amount, data)
          await expect(tx).to.be.rejectedWith( RevertError("ERC1155Meta#_validateTransferSignature: INVALID_SIGNATURE") )
        })

        it("should REVERT if nonce is incorrect", async () => {
          transferObj.nonce = nonce + 1;
          data = await encodeMetaTransferFromData(transferObj, gasReceipt)

          // @ts-ignore
          const tx = operatorERC1155Contract.functions.safeTransferFrom(ownerAddress, receiverAddress, id, amount, data)
          await expect(tx).to.be.rejectedWith( RevertError("ERC1155Meta#_validateTransferSignature: INVALID_SIGNATURE") )  
        })

        it("should PASS if signature is valid", async () => {
          // @ts-ignore
          const tx = operatorERC1155Contract.functions.safeTransferFrom(ownerAddress, receiverAddress, id, amount, data)
          await expect(tx).to.be.fulfilled
        })

        it('should pass if no gas receipt and no transfer data is included, with 0x3fed7708 as a flag', async () => {
          transferObj.transferData = toUtf8Bytes('');
          data = await encodeMetaTransferFromData(transferObj)

          // @ts-ignore
          const tx = operatorERC1155Contract.functions.safeTransferFrom(ownerAddress, receiverAddress, id, amount, data)
          await expect(tx).to.be.fulfilled

        })

        describe('When signature is valid', () => {

          it('should REVERT if insufficient balance', async () => {
            transferObj.amount = initBalance+1;
            data = await encodeMetaTransferFromData(transferObj, gasReceipt)

            // @ts-ignore
            const tx = operatorERC1155Contract.functions.safeTransferFrom(ownerAddress, receiverAddress, id, initBalance+1, data)
            await expect(tx).to.be.rejectedWith( RevertError("SafeMath#sub: UNDERFLOW") ) 
          })

          it('should REVERT if sending to 0x0', async () => {
            transferObj.receiver = ZERO_ADDRESS;
            data = await encodeMetaTransferFromData(transferObj, gasReceipt)

            // @ts-ignore
            const tx = operatorERC1155Contract.functions.safeTransferFrom(ownerAddress, ZERO_ADDRESS, id, amount, data)
            await expect(tx).to.be.rejectedWith( RevertError("ERC1155Meta#safeTransferFrom: INVALID_RECIPIENT") ) 
          })

          it('should REVERT if transfer leads to overflow', async () => {
            await erc1155Contract.functions.mintMock(receiverAddress, id, MAXVAL)
            // @ts-ignore
            const tx = operatorERC1155Contract.functions.safeTransferFrom(ownerAddress, receiverAddress, id, amount, data)
            await expect(tx).to.be.rejectedWith( RevertError("ERC1155PackedBalance#writeValueInBin: OVERFLOW") ) 
          })

          it('should REVERT when sending to non-receiver contract', async () => {
            transferObj.receiver = erc1155Contract.address;
            data = await encodeMetaTransferFromData(transferObj, gasReceipt)

            // @ts-ignore
            const tx = operatorERC1155Contract.functions.safeTransferFrom(ownerAddress, erc1155Contract.address, id, amount, data)
            await expect(tx).to.be.rejected 
          })

          it('should REVERT if invalid response from receiver contract', async () => {
            transferObj.receiver = receiverContract.address;
            data = await encodeMetaTransferFromData(transferObj, gasReceipt)

            // Force invalid response
            await receiverContract.functions.setShouldReject(true)

            // @ts-ignore
            const tx = operatorERC1155Contract.functions.safeTransferFrom(ownerAddress, receiverContract.address, id, amount, data)
            await expect(tx).to.be.rejectedWith( RevertError("ERC1155PackedBalance#_safeTransferFrom: INVALID_ON_RECEIVE_MESSAGE") )
          })

          it('should PASS if valid response from receiver contract', async () => {
            transferObj.receiver = receiverContract.address;
            data = await encodeMetaTransferFromData(transferObj, gasReceipt)

            // @ts-ignore
            const tx = operatorERC1155Contract.functions.safeTransferFrom(ownerAddress, receiverContract.address, id, amount, data)
            
            //await expect(tx).to.be.fulfilled
            await expect(tx).to.be.fulfilled
          })

          describe('When gas is reimbursed', () => {

            before(async function () {
              if (!condition[1]){
                this.test!.parent!.pending = true;
                this.skip();
              }
            });
 
            it('should reimburse gasReceipt.gasLimit if gas used exceeds limit', async () => {
              let lowGasLimit = 11;
              gasReceipt!.gasLimit = lowGasLimit

              data = await encodeMetaTransferFromData(transferObj, gasReceipt)

              // @ts-ignore
              await operatorERC1155Contract.functions.safeTransferFrom(ownerAddress, receiverAddress, id, amount, data)

              let senderBalance = await erc1155Contract.functions.balanceOf(ownerAddress, feeToken)
              let executorBalance = await erc1155Contract.functions.balanceOf(operatorAddress, feeToken)

              expect(senderBalance.toNumber()).to.be.eql(feeTokenInitBalance.sub(lowGasLimit).toNumber())
              expect(executorBalance.toNumber()).to.be.eql(lowGasLimit)
            })

            it('should send gas fee to tx.origin is fee recipient ix 0x0', async () => {
              gasReceipt!.feeRecipient = ZERO_ADDRESS;

              data = await encodeMetaTransferFromData(transferObj, gasReceipt)

              // @ts-ignore
              await receiverERC1155Contract.functions.safeTransferFrom(ownerAddress, receiverAddress, id, amount, data)

              let receiverBalance = await erc1155Contract.functions.balanceOf(receiverAddress, feeToken)

              expect(gasReceipt!.baseGas).to.be.lessThan(receiverBalance.toNumber())
            })

            it("should send gas fee to specified fee recipient (if not 0x0), not tx.origin", async () => {
              // @ts-ignore
              await receiverERC1155Contract.functions.safeTransferFrom(ownerAddress, receiverAddress, id, amount, data)
              let operatorBalance = await erc1155Contract.functions.balanceOf(operatorAddress, feeToken)

              expect(gasReceipt!.baseGas).to.be.lessThan(operatorBalance.toNumber())
            })

            it("should REVERT if gasReceipt is incorrect", async () => {
              const sigArgTypes = ['address', 'address', 'address', 'uint256', 'uint256', 'uint256'];
              const txDataTypes = ['bytes4', 'bytes', 'bytes'];
            
              let signer = await transferObj.signerWallet.getAddress()
              
              // Packed encoding of transfer signature message
              let sigData = ethers.utils.solidityPack(sigArgTypes, [
                transferObj.contractAddress, signer, transferObj.receiver, transferObj.id, 
                transferObj.amount, transferObj.nonce
              ])
  
              // Form bad gas receipt
              let badGasReceipt = {...gasReceipt, gasPrice: 109284123}
  
              let transferData = transferObj.transferData == null ? toUtf8Bytes('') : transferObj.transferData
  
              
              // Correct and incorrect transferData
              let goodGasAndTransferData = ethers.utils.defaultAbiCoder.encode([GasReceiptType, 'bytes'], [gasReceipt, transferData])
              let badGasAndTransferData = ethers.utils.defaultAbiCoder.encode([GasReceiptType, 'bytes'], [badGasReceipt, transferData])
  
              // Encode normally the whole thing
              sigData = ethers.utils.solidityPack(['bytes', 'bytes'], [sigData, goodGasAndTransferData])
            
              // Get signature
              let sig = await ethSign(transferObj.signerWallet, sigData)
            
              // PASS BAD DATA
              data = ethers.utils.defaultAbiCoder.encode(txDataTypes, ['0xebc71fa5', sig, badGasAndTransferData])
  
              // @ts-ignore
              const tx = operatorERC1155Contract.functions.safeTransferFrom(ownerAddress, receiverAddress, id, amount, data)
              await expect(tx).to.be.rejectedWith( RevertError("ERC1155Meta#_validateTransferSignature: INVALID_SIGNATURE") )
            })
          })

          context('When successful transfer', () => {
            let tx: ethers.ContractTransaction

            beforeEach(async () => {
              //@ts-ignore
              tx = await operatorERC1155Contract.functions.safeTransferFrom(ownerAddress, receiverAddress, id, amount, data)
            })

            it('should correctly update balance of sender', async () => {
              const balance = await erc1155Contract.functions.balanceOf(ownerAddress, id)
              expect(balance).to.be.eql(new BigNumber(initBalance - amount))
            })

            it('should correctly update balance of receiver', async () => {
              const balance = await erc1155Contract.functions.balanceOf(receiverAddress, id)
              expect(balance).to.be.eql(new BigNumber(amount))
            })

            describe('When gas is reimbursed', () => {
              before(async function () {
                if (!condition[1]){
                  this.test!.parent!.pending = true;
                  this.skip();
                }
              });

              it('should update gas token balance of sender', async () => {
                const senderBalance = await erc1155Contract.functions.balanceOf(ownerAddress, feeToken)
                //@ts-ignore
                expect(senderBalance.toNumber()).to.be.lessThan(feeTokenInitBalance.toNumber() - gasReceipt!.baseGas)
              })

              it('should update gas token balance of executor', async () => {
                const balance = await erc1155Contract.functions.balanceOf(operatorAddress, feeToken)
                expect(gasReceipt!.baseGas).to.be.lessThan(balance.toNumber());
              })
            })

            describe('TransferSingle event', async () => {

              let filterFromOperatorContract: ethers.ethers.EventFilter

              it('should emit TransferSingle event', async () => {
                const receipt = await tx.wait(1)
                const ev = receipt.events!.pop()!
                expect(ev.event).to.be.eql('TransferSingle')
              })

              it('should have `msg.sender` as `_operator` field, not _from', async () => {
                const receipt = await tx.wait(1)
                const ev = receipt.events!.pop()!

                const args = ev.args! as any
                expect(args._operator).to.be.eql(operatorAddress)
              })

              it('should have `msg.sender` as `_operator` field, not tx.origin', async () => {

                // Get event filter to get internal tx event
                filterFromOperatorContract = erc1155Contract.filters.TransferSingle(operatorContract.address, null, null, null, null);

                // Increment nonce because it's the second transfer
                transferObj.nonce = nonce + 1;
                data = await encodeMetaTransferFromData(transferObj, gasReceipt)

                // Execute transfer from operator contract
                // @ts-ignore (https://github.com/ethereum-ts/TypeChain/issues/118)
                await operatorContract.functions.safeTransferFrom(erc1155Contract.address, ownerAddress, receiverAddress, id, amount, data,
                  {gasLimit: 1000000} // INCORRECT GAS ESTIMATION
                )

                // Get logs from internal transaction event
                // @ts-ignore (https://github.com/ethers-io/ethers.js/issues/204#issuecomment-427059031)
                filterFromOperatorContract.fromBlock = 0;
                let logs = await operatorProvider.getLogs(filterFromOperatorContract);
                let args = erc1155Contract.interface.events.TransferSingle.decode(logs[0].data, logs[0].topics)

                // operator arg should be equal to msg.sender, not tx.origin
                expect(args._operator).to.be.eql(operatorContract.address)
              })
            })
          })
        })
      })
    })
  })





  describe('safeBatchTransferFrom() (Meta) Function', () => {
    let receiverContract: ERC1155ReceiverMock
    let operatorContract: ERC1155OperatorMock
    let METATRANSFER_IDENTIFIER = '0xebc71fa5';
    
    let transferData: string | null = 'Hello from the other side'
    let initBalance = 100;
    let amount = 10;
    let nonce = 0;

    // Parameters for balances
    let ids: any[], amounts: any[]
    let nTokenTypes = 33

    let isGasReceipt: boolean = true;
    let feeTokenInitBalance = new BigNumber(30000);
    let feeIsERC1155 = true
    let feeTokenID= 666   
    let feeToken : BigNumber;
    let feeTokenAddress : string
    let feeTokenDataERC1155: string | Uint8Array

    let transferObj: BatchTransferSignature;
    let gasReceipt : GasReceipt | null;
    let data : string;

    let conditions = [
      [transferData, true, 'Gas receipt & transfer data'],
      [null, true, 'Gas receipt w/o transfer data'], 
      [transferData, false, 'Transfer data w/o gas receipt '],  
      [null, false, 'No Gas receipt & No transfer data']  
    ]

    conditions.forEach(function(condition) {
      context(condition[2] as string, () => {

        beforeEach(async () => {

          // Get conditions
          transferData = await condition[0] as string | null
          isGasReceipt = await condition[1] as boolean

          // Deploy contracts
          let abstract = await AbstractContract.fromArtifactName('ERC1155ReceiverMock')
          receiverContract = await abstract.deploy(ownerWallet) as ERC1155ReceiverMock
          operatorContract = await operatorAbstract.deploy(operatorWallet) as ERC1155OperatorMock

          // Mint tokens
          ids = [], amounts = []

          // Minting enough amounts for transfer for each types
          for (let i = 0; i < nTokenTypes; i++) {
            await erc1155Contract.functions.mintMock(ownerAddress, i, initBalance)
            ids.push(i)
            amounts.push(amount)
          }

          feeTokenAddress = erc1155Contract.address

          feeTokenDataERC1155 = ethers.utils.defaultAbiCoder.encode(
            ['bool', 'address', 'uint256'], 
            [feeIsERC1155,  feeTokenAddress,  feeTokenID]
          )

          // Gas Receipt
          gasReceipt = {
            gasLimit: 10000,
            baseGas: 2000,
            gasPrice: 1,
            feeRecipient: operatorAddress,
            feeTokenData: feeTokenDataERC1155,
          }

          // fee token in uint
          feeToken = new BigNumber(feeTokenID)

          // Check if gas receipt is included
          gasReceipt = isGasReceipt ? gasReceipt : null
          
          // Transfer Signature Object
          transferObj = {
            contractAddress: erc1155Contract.address,
            signerWallet: ownerWallet,
            receiver: receiverAddress,
            ids: ids.slice(0),
            amounts: amounts.slice(0),
            transferData: transferData === null ? null : toUtf8Bytes(transferData),
            nonce: nonce
          }

          // Mint tokens used to pay for gas
          await erc1155Contract.functions.mintMock(ownerAddress, feeToken, feeTokenInitBalance)

          // Data to pass in transfer method
          data = await encodeMetaBatchTransferFromData(transferObj, gasReceipt)
        })

        it('should call parent function if empty data', async () => {
          let dataUint8 = toUtf8Bytes("")

          // Check if data lelngth is less than 4
          expect(ethers.utils.arrayify(dataUint8).length).to.be.at.most(3)

          // NOTE: typechain generates the wrong type for `bytes` type at this time
          // see https://github.com/ethereum-ts/TypeChain/issues/123
          // @ts-ignore
          const tx = erc1155Contract.functions.safeBatchTransferFrom(ownerAddress, receiverAddress, ids, amounts, dataUint8)
          await expect(tx).to.be.fulfilled
        })

        it('should call parent function if data without metaTransfer identifier', async () => {
          let dataUint8 = toUtf8Bytes("Breakthroughs! over the river! flips and crucifixions! gone down the flood!")
          let data = '0xebc71fa4' + bigNumberify(dataUint8).toHexString().slice(2)

          // Check if data lelngth is more than 696
          expect(ethers.utils.arrayify(data).length).to.be.at.least(70)
    
          // @ts-ignore
          const tx = erc1155Contract.functions.safeBatchTransferFrom(ownerAddress, receiverAddress, ids, amounts, data)
          await expect(tx).to.be.fulfilled
        })

        it("should REVERT if data first 4 bytes are '0xebc71fa5' and random encoded data the rest", async () => {
          let dataUint8 = toUtf8Bytes("Breakthroughs! over the river! flips and crucifixions! gone down the flood!")
          let data = METATRANSFER_IDENTIFIER + bigNumberify(dataUint8).toHexString().slice(2)

          // Check if data lelngth is more than 69
          expect(ethers.utils.arrayify(data).length).to.be.at.least(70)

          // @ts-ignore
          const tx = erc1155Contract.functions.safeBatchTransferFrom(ownerAddress, receiverAddress, ids, amounts, data)
          await expect(tx).to.be.rejected
        })

        it("should REVERT if contract address is incorrect", async () => {
          transferObj.contractAddress = receiverContract.address;
          data = await encodeMetaBatchTransferFromData(transferObj, gasReceipt)

          // @ts-ignore
          const tx = operatorERC1155Contract.functions.safeBatchTransferFrom(ownerAddress, receiverAddress, ids, amounts, data)
          await expect(tx).to.be.rejectedWith( RevertError("ERC1155Meta#_validateBatchTransferSignature: INVALID_SIGNATURE") )    
        })

        it("should REVERT if signer address is incorrect", async () => {
          transferObj.signerWallet = operatorWallet;
          data = await encodeMetaBatchTransferFromData(transferObj, gasReceipt)

          // @ts-ignore
          const tx = operatorERC1155Contract.functions.safeBatchTransferFrom(ownerAddress, receiverAddress, ids, amounts, data)
          await expect(tx).to.be.rejectedWith( RevertError("ERC1155Meta#_validateBatchTransferSignature: INVALID_SIGNATURE") )  
        })

        it("should REVERT if receiver address is incorrect", async () => {
          transferObj.receiver = ownerAddress;
          data = await encodeMetaBatchTransferFromData(transferObj, gasReceipt)

          // @ts-ignore
          const tx = operatorERC1155Contract.functions.safeBatchTransferFrom(ownerAddress, receiverAddress, ids, amounts, data)
          await expect(tx).to.be.rejectedWith( RevertError("ERC1155Meta#_validateBatchTransferSignature: INVALID_SIGNATURE") )  
        })

        it("should REVERT if token id is incorrect", async () => {
          transferObj.ids[0] = 6;
          data = await encodeMetaBatchTransferFromData(transferObj, gasReceipt)

          // @ts-ignore
          const tx = operatorERC1155Contract.functions.safeBatchTransferFrom(ownerAddress, receiverAddress, ids, amounts, data)
          await expect(tx).to.be.rejectedWith( RevertError("ERC1155Meta#_validateBatchTransferSignature: INVALID_SIGNATURE") )  
        })

        it("should REVERT if token amount is incorrect", async () => {
          transferObj.amounts[0] = amount + 1;
          data = await encodeMetaBatchTransferFromData(transferObj, gasReceipt)

          // @ts-ignore
          const tx = operatorERC1155Contract.functions.safeBatchTransferFrom(ownerAddress, receiverAddress, ids, amounts, data)
          await expect(tx).to.be.rejectedWith( RevertError("ERC1155Meta#_validateBatchTransferSignature: INVALID_SIGNATURE") )  
        })

        it("should REVERT if transfer data is incorrect", async () => {
          const sigArgTypes = ['address', 'address', 'address', 'uint256[]', 'uint256[]', 'uint256'];
          const txDataTypes = ['bytes4', 'bytes', 'bytes'];
        
          let signer = await transferObj.signerWallet.getAddress()
          
          // Packed encoding of transfer signature message
          let sigData = ethers.utils.solidityPack(sigArgTypes, [
            transferObj.contractAddress, signer, transferObj.receiver, transferObj.ids, 
            transferObj.amounts, transferObj.nonce
          ])

          let transferData = transferObj.transferData == null ? toUtf8Bytes('') : transferObj.transferData
          let goodGasAndTransferData;
          let badGasAndTransferData;

          // Correct and incorrect transferData
          if (isGasReceipt) {
            goodGasAndTransferData = ethers.utils.defaultAbiCoder.encode([GasReceiptType, 'bytes'], [gasReceipt, transferData])
            badGasAndTransferData = ethers.utils.defaultAbiCoder.encode([GasReceiptType, 'bytes'], [gasReceipt, toUtf8Bytes('Goodbyebyebye')])
          } else {
            goodGasAndTransferData = ethers.utils.defaultAbiCoder.encode(['bytes'], [transferData])
            badGasAndTransferData = ethers.utils.defaultAbiCoder.encode(['bytes'], [toUtf8Bytes('Goodbyebyebye')])
          }

          // Encode normally the whole thing
          sigData = ethers.utils.solidityPack(['bytes', 'bytes'], [sigData, goodGasAndTransferData])
        
          // Get signature
          let sig = await ethSign(transferObj.signerWallet, sigData)
        
          // PASS BAD DATA
          data = ethers.utils.defaultAbiCoder.encode(txDataTypes, ['0xebc71fa5', sig, badGasAndTransferData])

          // @ts-ignore
          const tx = operatorERC1155Contract.functions.safeBatchTransferFrom(ownerAddress, receiverAddress, ids, amounts, data)
          await expect(tx).to.be.rejectedWith( RevertError("ERC1155Meta#_validateBatchTransferSignature: INVALID_SIGNATURE") )
        })

        it("should REVERT if nonce is incorrect", async () => {
          transferObj.nonce = nonce + 1;
          data = await encodeMetaBatchTransferFromData(transferObj, gasReceipt)

          // @ts-ignore
          const tx = operatorERC1155Contract.functions.safeBatchTransferFrom(ownerAddress, receiverAddress, ids, amounts, data)
          await expect(tx).to.be.rejectedWith( RevertError("ERC1155Meta#_validateBatchTransferSignature: INVALID_SIGNATURE") )  
        })

        it("should PASS if signature is valid", async () => {
          // @ts-ignore
          const tx = operatorERC1155Contract.functions.safeBatchTransferFrom(ownerAddress, receiverAddress, ids, amounts, data)
          await expect(tx).to.be.fulfilled
        })

        it('should pass if no gas receipt and no transfer data is included, with 0x3fed7708 as a flag', async () => {
          transferObj.transferData = toUtf8Bytes('');
          data = await encodeMetaBatchTransferFromData(transferObj)

          // @ts-ignore
          const tx = operatorERC1155Contract.functions.safeBatchTransferFrom(ownerAddress, receiverAddress, ids, amounts, data)
          await expect(tx).to.be.fulfilled

        })

        describe('When signature is valid', () => {

          it('should REVERT if insufficient balance', async () => {
            transferObj.amounts[0] = initBalance+1;
            amounts[0] = initBalance+1;
            data = await encodeMetaBatchTransferFromData(transferObj, gasReceipt)

            // @ts-ignore
            const tx = operatorERC1155Contract.functions.safeBatchTransferFrom(ownerAddress, receiverAddress, ids, amounts, data)
            await expect(tx).to.be.rejectedWith( RevertError("SafeMath#sub: UNDERFLOW") ) 
          })

          it('should REVERT if sending to 0x0', async () => {
            transferObj.receiver = ZERO_ADDRESS;
            data = await encodeMetaBatchTransferFromData(transferObj, gasReceipt)

            // @ts-ignore
            const tx = operatorERC1155Contract.functions.safeBatchTransferFrom(ownerAddress, ZERO_ADDRESS, ids, amounts, data)
            await expect(tx).to.be.rejectedWith( RevertError("ERC1155Meta#safeBatchTransferFrom: INVALID_RECIPIENT") ) 
          })

          it('should REVERT if transfer leads to overflow', async () => {
            await operatorERC1155Contract.functions.mintMock(receiverAddress, ids[0], MAXVAL)
            // @ts-ignore
            const tx = operatorERC1155Contract.functions.safeBatchTransferFrom(ownerAddress, receiverAddress, ids, amounts, data)
            await expect(tx).to.be.rejectedWith( RevertError("ERC1155PackedBalance#writeValueInBin: OVERFLOW") ) 
          })

          it('should REVERT when sending to non-receiver contract', async () => {
            transferObj.receiver = erc1155Contract.address;
            data = await encodeMetaBatchTransferFromData(transferObj, gasReceipt)

            // @ts-ignore
            const tx = operatorERC1155Contract.functions.safeBatchTransferFrom(ownerAddress, erc1155Contract.address, ids, amounts, data)
            await expect(tx).to.be.rejected;
          })

          it('should REVERT if invalid response from receiver contract', async () => {
            transferObj.receiver = receiverContract.address;
            data = await encodeMetaBatchTransferFromData(transferObj, gasReceipt)

            // Force invalid response
            await receiverContract.functions.setShouldReject(true)

            // @ts-ignore
            const tx = operatorERC1155Contract.functions.safeBatchTransferFrom(ownerAddress, receiverContract.address, ids, amounts, data)
            await expect(tx).to.be.rejectedWith( RevertError("ERC1155PackedBalance#_safeBatchTransferFrom: INVALID_ON_RECEIVE_MESSAGE") )
          })

          it('should PASS if valid response from receiver contract', async () => {
            transferObj.receiver = receiverContract.address;
            data = await encodeMetaBatchTransferFromData(transferObj, gasReceipt)

            // @ts-ignore
            const tx = operatorERC1155Contract.functions.safeBatchTransferFrom(ownerAddress, receiverContract.address, ids, amounts, data)

            //await expect(tx).to.be.fulfilled
            await expect(tx).to.be.fulfilled
          })

          describe('When gas is reimbursed', () => {

            before(async function () {
              if (!condition[1]){
                this.test!.parent!.pending = true;
                this.skip();
              }
            });
 
            it('should reimburse gasReceipt.gasLimit if gas used exceeds limit', async () => {
              let lowGasLimit = 11;
              gasReceipt!.gasLimit = lowGasLimit

              data = await encodeMetaBatchTransferFromData(transferObj, gasReceipt)

              // @ts-ignore
              await operatorERC1155Contract.functions.safeBatchTransferFrom(ownerAddress, receiverAddress, ids, amounts, data)

              let senderBalance = await operatorERC1155Contract.functions.balanceOf(ownerAddress, feeToken)
              let executorBalance = await operatorERC1155Contract.functions.balanceOf(operatorAddress, feeToken)

              expect(senderBalance.toNumber()).to.be.eql(feeTokenInitBalance.sub(lowGasLimit).toNumber())
              expect(executorBalance.toNumber()).to.be.eql(lowGasLimit)
            })

            it('should send gas fee to tx.origin is fee recipient ix 0x0', async () => {
              gasReceipt!.feeRecipient = ZERO_ADDRESS;

              data = await encodeMetaBatchTransferFromData(transferObj, gasReceipt)

              // @ts-ignore
              await receiverERC1155Contract.functions.safeBatchTransferFrom(ownerAddress, receiverAddress, ids, amounts, data)

              let receiverBalance = await operatorERC1155Contract.functions.balanceOf(receiverAddress, feeToken)

              expect(gasReceipt!.baseGas).to.be.lessThan(receiverBalance.toNumber())
            })

            it("should send gas fee to specified fee recipient (if not 0x0), not tx.origin", async () => {
              // @ts-ignore
              await operatorERC1155Contract.functions.safeBatchTransferFrom(ownerAddress, receiverAddress, ids, amounts, data)
              let operatorBalance = await operatorERC1155Contract.functions.balanceOf(operatorAddress, feeToken)

              expect(gasReceipt!.baseGas).to.be.lessThan(operatorBalance.toNumber())
            })

            it("should REVERT if gasReceipt is incorrect", async () => {
              const sigArgTypes = ['address', 'address', 'address', 'uint256[]', 'uint256[]', 'uint256'];
              const txDataTypes = ['bytes4', 'bytes', 'bytes'];
            
              let signer = await transferObj.signerWallet.getAddress()
              
              // Packed encoding of transfer signature message
              let sigData = ethers.utils.solidityPack(sigArgTypes, [
                transferObj.contractAddress, signer, transferObj.receiver, transferObj.ids, 
                transferObj.amounts, transferObj.nonce
              ])
  
              // Form bad gas receipt
              let badGasReceipt = {...gasReceipt, gasPrice: 109284123}
  
              let transferData = transferObj.transferData == null ? toUtf8Bytes('') : transferObj.transferData
  
              // Correct and incorrect transferData
              let goodGasAndTransferData = ethers.utils.defaultAbiCoder.encode([GasReceiptType, 'bytes'], [gasReceipt, transferData])
              let badGasAndTransferData = ethers.utils.defaultAbiCoder.encode([GasReceiptType, 'bytes'], [badGasReceipt, transferData])
  
              // Encode normally the whole thing
              sigData = ethers.utils.solidityPack(['bytes', 'bytes'], [sigData, goodGasAndTransferData])
            
              // Get signature
              let sig = await ethSign(transferObj.signerWallet, sigData)
            
              // PASS BAD DATA
              data = ethers.utils.defaultAbiCoder.encode(txDataTypes, ['0xebc71fa5', sig, badGasAndTransferData])
  
              // @ts-ignore
              const tx = operatorERC1155Contract.functions.safeBatchTransferFrom(ownerAddress, receiverAddress, ids, amounts, data)
              await expect(tx).to.be.rejectedWith( RevertError("ERC1155Meta#_validateBatchTransferSignature: INVALID_SIGNATURE") )
            })
          })

          context('When successful transfer', () => {
            let tx: ethers.ContractTransaction

            beforeEach(async () => {
              //@ts-ignore
              tx = await operatorERC1155Contract.functions.safeBatchTransferFrom(ownerAddress, receiverAddress, ids, amounts, data)
            })

            it('should correctly update balance of sender and receiver', async () => {
              let balanceFrom: ethers.utils.BigNumber
              let balanceTo: ethers.utils.BigNumber
        
              for (let i = 0; i < ids.length; i++) {
                balanceFrom = await operatorERC1155Contract.functions.balanceOf(ownerAddress, ids[i])
                balanceTo   = await operatorERC1155Contract.functions.balanceOf(receiverAddress, ids[i])
        
                expect(balanceFrom).to.be.eql(new BigNumber(initBalance - amounts[i]))
                expect(balanceTo).to.be.eql(new BigNumber(amounts[i]))
              }
            })

            describe('When gas is reimbursed', () => {
              before(async function () {
              if (!condition[1]){
                  this.test!.parent!.pending = true;
                  this.skip();
                }
              });

              it('should update gas token balance of sender', async () => {
                const senderBalance = await operatorERC1155Contract.functions.balanceOf(ownerAddress, feeToken)
                //@ts-ignore
                expect(senderBalance.toNumber()).to.be.lessThan(feeTokenInitBalance.toNumber() - gasReceipt!.baseGas)
              })

              it('should update gas token balance of executor', async () => {
                const balance = await operatorERC1155Contract.functions.balanceOf(operatorAddress, feeToken)
                expect(gasReceipt!.baseGas).to.be.lessThan(balance.toNumber());
              })
            })

            describe('TransferBatch event', async () => {
              let filterFromOperatorContract: ethers.ethers.EventFilter
              let operatorContract: ERC1155OperatorMock
        
              beforeEach(async () => {
                operatorContract = await operatorAbstract.deploy(operatorWallet) as ERC1155OperatorMock
              })
        
              it('should emit 1 TransferBatch events of N transfers', async () => {
                const receipt = await tx.wait(1)
                const ev = receipt.events![0]
                expect(ev.event).to.be.eql('TransferBatch')
        
                const args = ev.args! as any
                expect(args._ids.length).to.be.eql(ids.length)
              })
        
              it('should have `msg.sender` as `_operator` field, not _from', async () => {                
                //@ts-ignore
                const receipt = await tx.wait(1)
                const ev = receipt.events!.pop()!
        
                const args = ev.args! as any
                expect(args._operator).to.be.eql(operatorAddress)
              })
        
              it('should have `msg.sender` as `_operator` field, not tx.origin', async () => {
        
                // Get event filter to get internal tx event
                filterFromOperatorContract = erc1155Contract.filters.TransferBatch(operatorContract.address, null, null, null, null);

                //Increment nonce because it's the second transfer
                transferObj.nonce = nonce + 1;
                data = await encodeMetaBatchTransferFromData(transferObj, gasReceipt)
        
                // Execute transfer from operator contract
                // @ts-ignore (https://github.com/ethereum-ts/TypeChain/issues/118)
                await operatorContract.functions.safeBatchTransferFrom(erc1155Contract.address, ownerAddress, receiverAddress, ids, amounts, data, 
                  {gasLimit: 2000000} // INCORRECT GAS ESTIMATION
                )
        
                // Get logs from internal transaction event
                // @ts-ignore (https://github.com/ethers-io/ethers.js/issues/204#issuecomment-427059031)
                filterFromOperatorContract.fromBlock = 0;
                let logs = await operatorProvider.getLogs(filterFromOperatorContract);
                let args = erc1155Contract.interface.events.TransferBatch.decode(logs[0].data, logs[0].topics)
        
        
                // operator arg should be equal to msg.sender, not tx.origin
                expect(args._operator).to.be.eql(operatorContract.address)
              })
            })
          })
        })
      })
    })
  })







  describe('metaSetApprovalForAll() function', () => {

    let initBalance = 100;
    let isGasReimbursed = true;
    let approved = true;
    let nonce = 0;
    let id = 66;

    let approvalObj: ApprovalSignature;
    let gasReceipt : GasReceipt | null;
    let data: string;

    let isGasReceipt: boolean = true;
    let feeTokenInitBalance = new BigNumber(30000);
    let feeIsERC1155 = true
    let feeTokenID = 666   
    let feeToken : BigNumber;
    let feeTokenAddress : string
    let feeTokenDataERC1155: string | Uint8Array

    let conditions = [
      [true, 'Gas receipt'],  
      [false, 'No Gas receipt']  
    ]

    conditions.forEach(function(condition) {
      context(condition[1] as string, () => {
        beforeEach(async () => {
          isGasReceipt = condition[0] as boolean

          feeTokenAddress = erc1155Contract.address

          feeTokenDataERC1155 = ethers.utils.defaultAbiCoder.encode(
            ['bool', 'address', 'uint256'], 
            [feeIsERC1155,  feeTokenAddress,  feeTokenID]
          )

          // Gas Receipt
          gasReceipt = {
            gasLimit: 10000,
            baseGas: 1100,
            gasPrice: 1,
            feeRecipient: operatorAddress,
            feeTokenData: feeTokenDataERC1155,
          }

          // fee token in uint
          feeToken = new BigNumber(feeTokenID)

          // Check if gas receipt is included
          gasReceipt = isGasReceipt ? gasReceipt : null
          isGasReimbursed = isGasReceipt ? true : false

          // Approval Signture Object
          approvalObj = {
            contractAddress: erc1155Contract.address,
            signerWallet: ownerWallet,
            operator: operatorAddress,
            approved: approved,
            nonce: nonce
          }

          // Mint tokens
          await erc1155Contract.functions.mintMock(ownerAddress, id, initBalance)

          // Mint tokens used to pay for gas
          await erc1155Contract.functions.mintMock(ownerAddress, feeToken, feeTokenInitBalance)

          // Data to pass in approval method
          data = await encodeMetaApprovalData(approvalObj, gasReceipt)
        })

        it("should PASS if signature is valid", async () => {
          // @ts-ignore
          let tx = operatorERC1155Contract.functions.metaSetApprovalForAll(ownerAddress, operatorAddress, approved, isGasReimbursed, data)
          await expect(tx).to.be.fulfilled
        })

        it("should PASS if gas received is passed, but not claimed", async () => {
          // @ts-ignore
          let tx = operatorERC1155Contract.functions.metaSetApprovalForAll(ownerAddress, operatorAddress, approved, false, data)
          await expect(tx).to.be.fulfilled
        })

        it("should PASS if gas received is not passed and not claimed", async () => {
          data = await encodeMetaApprovalData(approvalObj)

          // @ts-ignore
          let tx = operatorERC1155Contract.functions.metaSetApprovalForAll(ownerAddress, operatorAddress, approved, false, data)
          await expect(tx).to.be.fulfilled
        })

        it("should REVERT if gas received is not passed, but is claimed", async () => {
          data = await encodeMetaApprovalData(approvalObj)

          // @ts-ignore
          let tx = operatorERC1155Contract.functions.metaSetApprovalForAll(ownerAddress, operatorAddress, approved, true, data)
          await expect(tx).to.be.rejected;
        })

        it("should REVERT if contract address is incorrect", async () => {
          approvalObj.contractAddress = receiverAddress;
          data = await encodeMetaApprovalData(approvalObj, gasReceipt)

          // @ts-ignore
          let tx = operatorERC1155Contract.functions.metaSetApprovalForAll(ownerAddress, operatorAddress, approved, isGasReimbursed, data)
          await expect(tx).to.be.rejectedWith( RevertError("ERC1155Meta#_validateApprovalSignature: INVALID_SIGNATURE") )    
        })

        it("should REVERT if operator address is incorrect", async () => {
          approvalObj.operator = receiverAddress;   
          data = await encodeMetaApprovalData(approvalObj, gasReceipt)

          // @ts-ignore
          let tx = operatorERC1155Contract.functions.metaSetApprovalForAll(ownerAddress, operatorAddress, approved, isGasReimbursed, data)
          await expect(tx).to.be.rejectedWith( RevertError("ERC1155Meta#_validateApprovalSignature: INVALID_SIGNATURE") )    
        })

        it("should REVERT if approved value is incorrect", async () => {
          approvalObj.approved = false;
          data = await encodeMetaApprovalData(approvalObj, gasReceipt)

          // @ts-ignore
          let tx = operatorERC1155Contract.functions.metaSetApprovalForAll(ownerAddress, operatorAddress, approved, isGasReimbursed, data)
          await expect(tx).to.be.rejectedWith( RevertError("ERC1155Meta#_validateApprovalSignature: INVALID_SIGNATURE") )    
        })

        it("should REVERT if nonce is incorrect", async () => {
          approvalObj.nonce = nonce+1;
          data = await encodeMetaApprovalData(approvalObj, gasReceipt)

          // @ts-ignore
          let tx = operatorERC1155Contract.functions.metaSetApprovalForAll(ownerAddress, operatorAddress, approved, isGasReimbursed, data)
          await expect(tx).to.be.rejectedWith( RevertError("ERC1155Meta#_validateApprovalSignature: INVALID_SIGNATURE") )    
        })


        it('should emit an ApprovalForAll event', async () => {
          // @ts-ignore
          let tx = await operatorERC1155Contract.functions.metaSetApprovalForAll(ownerAddress, operatorAddress, approved, isGasReimbursed, data)
          const receipt = await tx.wait(1)

          expect(receipt.events![0].event).to.be.eql('ApprovalForAll')
        })

        it('should set the operator status to _status argument', async () => {
          // @ts-ignore
          let tx = operatorERC1155Contract.functions.metaSetApprovalForAll(ownerAddress, operatorAddress, approved, isGasReimbursed, data)
          await expect(tx).to.be.fulfilled

          const status = await erc1155Contract.functions.isApprovedForAll(ownerAddress, operatorAddress)
          expect(status).to.be.eql(true)
        })

        context('When the operator was already an operator', () => {
          beforeEach(async () => {
            // @ts-ignore
            let tx = await operatorERC1155Contract.functions.metaSetApprovalForAll(ownerAddress, operatorAddress, approved, isGasReimbursed, data)

            // Update nonce of approval signature object for subsequent tests
            approvalObj.nonce = nonce + 1;
          })

          it('should leave the operator status to set to true again', async () => {
            data = await encodeMetaApprovalData(approvalObj, gasReceipt)

            // @ts-ignore
            let tx = operatorERC1155Contract.functions.metaSetApprovalForAll(ownerAddress, operatorAddress, approved, isGasReimbursed, data)
            await expect(tx).to.be.fulfilled

            const status = await erc1155Contract.functions.isApprovedForAll(ownerAddress, operatorAddress)
            expect(status).to.be.eql(true)
          })

          it('should allow the operator status to be set to false', async () => {
            approvalObj.approved = false;
            data = await encodeMetaApprovalData(approvalObj, gasReceipt)

            // @ts-ignore
            let tx = operatorERC1155Contract.functions.metaSetApprovalForAll(ownerAddress, operatorAddress, false, isGasReimbursed, data)
            await expect(tx).to.be.fulfilled

            const status = await erc1155Contract.functions.isApprovedForAll(operatorAddress, ownerAddress)
            expect(status).to.be.eql(false)
          })
        })

      })
    })
  })
})