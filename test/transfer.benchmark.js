const BigNumber = web3.BigNumber;
const Web3Utils = require('web3-utils');
const fromRpcSig = require('ethereumjs-util').fromRpcSig;
const Math = require('math');

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();


// TO DO
// Check over/under flow for both uin256 and uint16
// Modify existing ERC20 and basic token related tests
// Test the _updatetypesBalance operations

const ERC721Mock  = artifacts.require('ERC721Mock');
const ERC20Mock   = artifacts.require('ERC20Mock');
const ERC1155MockNoBalancePacking = artifacts.require('ERC1155MockNoBalancePacking');
const ERC1155Mock = artifacts.require('ERC1155Mock');


contract('Efficiency Comparaison Tests', function ([_, owner, receiver, receiver2, anyone]) {

  const nTransfers = 30;
  const toTransfer = 10; // Amount to transfer per transfer
  const toMint = 15; // Amount to mint per transfer

  // Array of amount
  const IDArray  = Array.apply(null, {length: nTransfers}).map(Number.call, Number);
  const amountArray = Array.apply(null, Array(nTransfers)).map(Number.prototype.valueOf, toTransfer); 

  describe('ERC721 Tokens', function (){

    beforeEach(async function () {
      token = await ERC721Mock.new({from: owner});
      
      for (var i = 0; i < nTransfers; i ++){
        await token.mockMint(owner, i, {from : owner});
      }
    });

    describe('Transferring 100 ERC721 tokens in different transaction calls',function () {

      it('', async function () {

        var sumGasCost = 0;
        var tx;

        for (var i = 0; i < nTransfers; i++){
          tx = await token.transferFrom(owner, receiver, i, {from: owner});
          sumGasCost += tx.receipt.gasUsed;
        }

        console.log('Total gas cost  : ', sumGasCost);
        console.log('Per Tx Gas cost : ', sumGasCost/nTransfers);
      }); 

    })

    describe('Transferring 100 ERC721 tokens with wrapper contract',function () {

      it('', async function () {
        let tx = await token.batchTransferFrom(owner, receiver, IDArray, {from: owner});
        
        console.log('Total gas cost  : ', tx.receipt.gasUsed);
        console.log('Per Tx Gas cost : ', tx.receipt.gasUsed / nTransfers);
      }); 

    })

  })

 describe('ERC20 Tokens', function (){

    tokens = []

    beforeEach(async function () {
      for (var i = 0; i < nTransfers; i ++){
        let token = await ERC20Mock.new({from: owner});
        await token.mockMint(owner, toMint, {from : owner});
        tokens.push(token);
      }
    });

    describe('Transferring 100 ERC20 tokens in different transaction calls',function () {

      it('', async function () {

        var sumGasCost = 0;
        var tx;

        for (var i = 0; i < nTransfers; i++){
          tx = await tokens[i].transfer(receiver, toTransfer, {from: owner});
          sumGasCost += tx.receipt.gasUsed;
        }

        console.log('Total gas cost  : ', sumGasCost);
        console.log('Per Tx Gas cost : ', sumGasCost/nTransfers);
      }); 

    })

    describe('Transferring 100 ERC20s tokens with wrapper contract',function () {

      it('', async function () {

        tokenAddresses = []

        metaToken = await ERC20Mock.new({from: owner});
        for (var i = 0; i < nTransfers; i ++){
          await tokens[i].mockMint(metaToken.address, toMint, {from : owner});
          tokenAddresses.push(tokens[i].address);
        }

        let tx = await metaToken.batchTransfer(tokenAddresses, receiver2, amountArray, {from: owner});
        
        console.log('Total gas cost  : ', tx.receipt.gasUsed);
        console.log('Per Tx Gas cost : ', tx.receipt.gasUsed / nTransfers);

        //(10).should.be.equal(2);
      }); 

    })

  })

  describe('ERC1155 Tokens', function (){

    beforeEach(async function () {
      token = await ERC1155MockNoBalancePacking.new({from: owner});
      
      for (var i = 0; i < nTransfers; i ++){
        await token.mockMint(owner, i, toMint, {from : owner});
      }
    });

    describe('Transferring 100 ERC1155 tokens',function () {

      it('', async function () {
        let tx = await token.batchTransferFrom(owner, receiver, IDArray, amountArray, {from: owner});
        
        console.log('Total gas cost  : ', tx.receipt.gasUsed);
        console.log('Per Tx Gas cost : ', tx.receipt.gasUsed / nTransfers);
      }); 

    })

  })


  describe('ERC-1155 "packed Balance" Tokens', function (){

    beforeEach(async function () {
      token = await ERC1155Mock.new({from: owner});
      
      for (var i = 0; i < nTransfers; i ++){
        await token.mockMint(owner, i, toMint, {from : owner});
      }
    });

    describe('Transferring 30 ERC1155 tokens with packed balance',function () {

      it('', async function () {
        let tx = await token.safeBatchTransferFrom(owner, receiver, IDArray, amountArray, '', {from: owner});
        
        console.log('Total gas cost  : ', tx.receipt.gasUsed);
        console.log('Per Tx Gas cost : ', tx.receipt.gasUsed / nTransfers);
      }); 

    })

  })

});