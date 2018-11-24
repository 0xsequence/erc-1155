const BigNumber = web3.BigNumber;
const Web3Utils = require('web3-utils');
const fromRpcSig = require('ethereumjs-util').fromRpcSig;
const Math = require('math');

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const ERC1155XMock = artifacts.require('ERC1155XMock');
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

contract('ERC1155XMock', function ([_, owner, receiver, anyone, operator]) { 


  var Ntypes = 100;
  var amountToMint = 10
  const typesArray  = Array.apply(null, {length: Ntypes}).map(Number.call, Number);
  const amountArray = Array.apply(null, Array(Ntypes)).map(Number.prototype.valueOf, amountToMint); 

  context('When ERC1155XMock contract is deployed', function (){
    beforeEach(async function () {
      this.token = await ERC1155XMock.new({from: owner});
      //console.log(web3.eth.getTransactionReceipt(this.token.transactionHash).gasUsed);
    });

    describe('mint() function', function () {
      const _type = 666;
      const amount = 11; 

      it('should ALLOW owner to call mint()', async function () {
        let tx = await this.token.mint(receiver, _type, amount, {from: owner}).should.be.fulfilled;
        //console.log(tx.receipt.gasUsed);
      });

      it('should NOT allow anyone to call mint()', async function () {
        await this.token.mint(receiver, _type, amount, {from : anyone}).should.be.rejected;
      });

      it('should increase the balance of receiver  by the right amount', async function() {
        let recipientBalanceA = await this.token.balanceOf(receiver, _type);
        await this.token.mint(receiver, _type, amount, {from: owner});
        let recipientBalanceB = await this.token.balanceOf(receiver, _type);

        recipientBalanceB.should.be.bignumber.equal(recipientBalanceA.plus(amount));
      })

      it('should REVERT if amount is larger than limit', async function () {
        let maxVal = 65536;
        await this.token.mint(receiver, _type, maxVal, {from : owner}).should.be.rejected;
      });

      it('should emit a Transfer event', async function () {
        const { logs } = await this.token.mint(receiver, _type, amount, {from: owner});
        let event = logs[0].event; 
        event.should.be.equal('Transfer');
      });

      it('should have 0x0 as `from` argument in Transfer event', async function () {
        const { logs } = await this.token.mint(receiver, _type, amount, {from: owner});
        let from = logs[0].args.from; 
        from.should.be.equal(ZERO_ADDRESS);
      });

    })

    describe('batchMint() function', function (){
      it('should ALLOW owner to call batchMint()', async function () {
        let tx = await this.token.batchMint(receiver, typesArray, amountArray,  {from: owner}).should.be.fulfilled;
        console.log('Batch mint :' + tx.receipt.gasUsed);
      });

      it('should NOT allow anyone to call batchMint()', async function () {
        await this.token.batchMint(receiver, typesArray, amountArray, {from : anyone}).should.be.rejected;
      });

      it.skip('should increase the balances of receiver by the right amounts', async function() {
        await this.token.batchMint(receiver, typesArray, amountArray, {from: owner});

        let balanceTo;
        
        for (var i = 0; i < typesArray.length; i++){
          balanceTo = await this.token.balanceOf(receiver, typesArray[i]);
          balanceTo.should.be.bignumber.equal(amountArray[i]);
        }
      })

      it('should increase the balances of receiver by the right amounts', async function() {
        await this.token.batchMint(receiver, typesArray, amountArray, {from: owner});

        let balanceTo;
        
        for (var i = 0; i < typesArray.length; i++){
          balanceTo = await this.token.balanceOf(receiver, typesArray[i]);
          balanceTo.should.be.bignumber.equal(amountArray[i]);
        }
      })

      it.skip('should REVERT if an amount is larger than limit', async function () {
        let maxVal = 65536;
        await this.token.batchMint(receiver, [0, 1, 2], [1, maxVal, 2], {from : owner}).should.be.rejected;
      });

      it.skip('should REVERT if a class is out of range', async function () {
        let maxClass = 4294967296;
        await this.token.batchMint(receiver, [0, maxClass, 2], [1, 2, 3], {from : owner}).should.be.rejected;
      });

      it('should emit 1 Transfer events of N transfers', async function () {
          let tx = await this.token.batchMint(receiver, typesArray, amountArray, {from: owner});
          let event = tx.logs[0].event;
          event.should.be.equal('Transfer');
          (typesArray.length).should.be.equal(tx.logs[0].args.ids.length)
      });

      it('should have 0x0 as `from` argument in Transfer events', async function () {
        const { logs } = await this.token.batchMint(receiver, typesArray, amountArray, {from: owner});

        let from = logs[0].args.from;
        from.should.be.equal(ZERO_ADDRESS);
      });

    })


  });
});


