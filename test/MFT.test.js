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

const MFTMock = artifacts.require('MFTMock');
const RegularToken = artifacts.require('RegularToken');

const LARGEVAL = 100792082237306195423570985008687907853269984665640564039457584007913129639934;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

contract('MFTMock', function ([_, owner, player1, player2, anyone, operator]) { 

  context('When MFTMock contract is deployed', function (){
    beforeEach(async function () {
      this.token = await MFTMock.new({from: owner});
      //console.log(web3.eth.getTransactionReceipt(this.token.transactionHash).gasUsed);
    });

    describe('Bitwise functions', function () { 

      it('getValueInBin should return expected balance for given types', async function () {
        let expected = 57046;
        let balance = await this.token.getValueInBin(LARGEVAL, 0);
        balance.should.be.bignumber.equal(expected);
      });

      it('writeValueInBin should write expected value at given types', async function () {
        let targetVal  = 666;
        let writtenBin = await this.token.writeValueInBin(LARGEVAL, 0, targetVal); 
        let balance = await this.token.getValueInBin(writtenBin, 0);
        balance.should.be.bignumber.equal(targetVal);
      });

      it('writeValueInBin should throw if value is above 2**16', async function () {
        let targetVal  = 2**16+1;
        let writtenBin = await this.token.writeValueInBin(LARGEVAL, 0, targetVal).should.be.rejected;
      });

      it('getTypeBinIndex should return the correct bin and respective index', async function () {
        var bin;
        var index; 

        [bin, index] = await this.token.getTypeBinIndex(0);
        bin.should.be.bignumber.equal(0);
        index.should.be.bignumber.equal(0);

        [bin, index] = await this.token.getTypeBinIndex(6);
        bin.should.be.bignumber.equal(0);
        index.should.be.bignumber.equal(6);

        [bin, index] = await this.token.getTypeBinIndex(16);
        bin.should.be.bignumber.equal(1);
        index.should.be.bignumber.equal(0);

        [bin, index] = await this.token.getTypeBinIndex(31);
        bin.should.be.bignumber.equal(1);
        index.should.be.bignumber.equal(15);
      });

    })

    describe('Getter functions', function () {

      beforeEach(async function () {
        await this.token.mint(owner, 5, 256, {gasPrice: 1});
      })

      /*
      it('totalSupply() should return the number of object for given types', async function () {
        let totalSupply5 = await this.token.totalSupply(5);
        totalSupply5.should.be.bignumber.equal(256);
      });
      */

      it('balanceOf() should return types balance for queried address', async function () {
        let balance6 = await this.token.balanceOf(owner, 5);
        balance6.should.be.bignumber.equal(256);

        let balance16 = await this.token.balanceOf(owner, 16);
        balance16.should.be.bignumber.equal(0);
      });

    })

    describe('transferFrom() function', function () {

      beforeEach(async function () {
        await this.token.mint(owner, 0, 256, {gasPrice: 1});
      })

      it('should be able to transfer if sufficient balance', async function () {
        await this.token.transferFrom(owner, player1, 0, 1, {from: owner}).should.be.fulfilled;
      });

      it('should REVERT if insufficient balance', async function () {
        await this.token.transferFrom(owner, player1, 0, 257, {from: owner}).should.be.rejected;
      });

      it('should REVERT if transfer leads to overflow', async function () {
        await this.token.mint(player1, 0, 2**16-1);
        await this.token.transferFrom(owner, player1, 0, 1, {from: owner}).should.be.rejected;
      });

      it('should REVERT if sending to 0x0', async function () {
        await this.token.transferFrom(owner, ZERO_ADDRESS, 0, 1, {from: owner}).should.be.rejected;
      })

      context('When successful transfer', function () {
        let tx; 

        beforeEach(async function () {
          tx = await this.token.transferFrom(owner, player1, 0, 1, {from: owner});
        })

        it('should correctly update balance of sender', async function () {
          let balance = await this.token.balanceOf(owner, 0);
          balance.should.be.bignumber.equal(255);
        });

        it('should correctly update balance of receiver', async function () {
          let balance = await this.token.balanceOf(player1, 0);
          balance.should.be.bignumber.equal(1);
        });

        it('should emit Transfer event', async function () {
          let balance = await this.token.balanceOf(player1, 0);
          let event = tx.logs[0].event;
          event.should.be.equal('Transfer');
        });

      })
    })

    describe('batchTransferFrom() function', function () {

      /* 
        TEST TO DO ; 

        + Make sure all transfers are valid
        + Event generated for each

        throw if invalid?
        return bool if invalid?
        break if invalid?

      */

      var types, values;

      var nTokenTypes    = 20;
      var nTokensPerType = 10;

      //types = [12, 111];
      //values  = [666, 11];

      beforeEach(async function (){

        //       bins :   -- 0 --  ---- 1 ----  ---- 2 ----  ---- 3 ---- 
        types  = []; //[0,1,2,3, 16,17,18,19, 32,33,34,35, 48,49,50,51];  
        values = []; //[0,1,2,3, 12,13,14,15, 11,12,13,14, 11,12,13,14]; 

        //Minting enough values for transfer for each types
        for (var i = 0; i < nTokenTypes; i++){
          await this.token.mint(owner, i, nTokensPerType, {gasPrice: 1});
          types.push(i);
          values.push(nTokensPerType);
        }
      })

      it('Should update balances of sender and receiver', async function (){
        await this.token.batchTransferFrom(owner, player1, types, values, {from: owner});

        let balanceFrom;
        let balanceTo;
        
        for (var i = 0; i < types.length; i++){
          balanceFrom = await this.token.balanceOf(owner, types[i]);
          balanceTo   = await this.token.balanceOf(player1, types[i]);

          balanceFrom.should.be.bignumber.equal(0);
          balanceTo.should.be.bignumber.equal(values[i]);
        }

      })

      it('BatchTransfer 100 gas cost', async function () {
          let tx = await this.token.batchTransferFrom(owner, player1, types, values, {from: owner});
          console.log('BatchTransferFrom single gas :' + tx.receipt.gasUsed)
      });

      it('Transfer single gas cost', async function () {
          let tx = await this.token.transferFrom(owner, player1, 0, 5, {from: owner});
          console.log('transferFrom single gas :' + tx.receipt.gasUsed)
      });

      it('should emit BatchTransfer event', async function () {
          let tx = await this.token.batchTransferFrom(owner, player1, types, values, {from: owner});
          let event = tx.logs[0].event;
          event.should.be.equal('BatchTransfer');
      });

      it('efficiency test load: ordered bin visted', async function (){
        let tx = await this.token.batchTransferFrom(owner, player1, types, values, {from: owner});
        let gasPerBalance = tx.receipt.gasUsed / types.length;
        console.log('gasUsed:', tx.receipt.gasUsed);
        console.log('gasPerType:', gasPerBalance);
      })

      it('efficiency test regular ERC-20', async function (){
        let ERC20 = await RegularToken.new(10000000000, {from: owner});

        for (var i = 0; i < types.length; i++){
          await ERC20.mint(owner, types[i], values[i]);
        }

        let tx = await ERC20.batchTransfer(player1, types, values, {from: owner});
        let gasPerBalance = tx.receipt.gasUsed / types.length;
        console.log('gasUsed:', tx.receipt.gasUsed);
        console.log('gasPerType:', gasPerBalance);
      })


    })

    describe('setApprovalForAll() function', function () {

      it('should emit an ApprovalForAll event', async function () {
        const { logs } = await this.token.setApprovalForAll(operator, true, { from: owner });
        let event = logs[0].event; 
        event.should.be.equal('ApprovalForAll');
      });


      it('should set the operator status to _status argument', async function () {
        await this.token.setApprovalForAll(operator, true, { from: owner }).should.be.fulfilled;

        const status = await this.token.isApprovedForAll(owner, operator);
        status.should.be.equal(true);
      });


      context('When the operator was already an operator', function () {
        beforeEach(async function () {
          await this.token.setApprovalForAll(operator, true, { from: owner });
        });

        it('should leave the operator status to set to true again', async function () {
          await this.token.setApprovalForAll(operator, true, { from: owner }).should.be.fulfilled;

          const status = await this.token.isApprovedForAll(owner, operator);
          status.should.be.equal(true);
        });

        it('should allow the operator status to be set to false', async function () {
          await this.token.setApprovalForAll(operator, false, { from: owner }).should.be.fulfilled;

          const status = await this.token.isApprovedForAll(operator, owner);
          status.should.be.equal(false);
        });
      });
    });

  });
});
