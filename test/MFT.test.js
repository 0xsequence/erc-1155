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
// Test the _updateClassBalance operations

const MFTMock = artifacts.require('MFTMock');
const RegularToken = artifacts.require('RegularToken');

const LARGEVAL = 100792082237306195423570985008687907853269984665640564039457584007913129639934;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

contract.only('MFTMock', function ([_, owner, player1, player2, anyone, operator]) { 

  context('When MFTMock contract is deployed', function (){
    beforeEach(async function () {
      this.token = await MFTMock.new({from: owner});
      //console.log(web3.eth.getTransactionReceipt(this.token.transactionHash).gasUsed);
    });

    describe('Bitwise functions', function () { 

      it('getValueInBin should return expected balance for given class', async function () {
        let expected = 57046;
        let balance = await this.token.getValueInBin(LARGEVAL, 0);
        balance.should.be.bignumber.equal(expected);
      });

      it('writeValueInBin should write expected value at given class', async function () {
        let targetVal  = 666;
        let writtenBin = await this.token.writeValueInBin(LARGEVAL, 0, targetVal); 
        let balance = await this.token.getValueInBin(writtenBin, 0);
        balance.should.be.bignumber.equal(targetVal);
      });

      it('writeValueInBin should throw if value is above 2**16', async function () {
        let targetVal  = 2**16+1;
        let writtenBin = await this.token.writeValueInBin(LARGEVAL, 0, targetVal).should.be.rejected;
      });

      it('getClassBinIndex should return the correct bin and respective index', async function () {
        var bin;
        var index; 

        [bin, index] = await this.token.getClassBinIndex(0);
        bin.should.be.bignumber.equal(0);
        index.should.be.bignumber.equal(0);

        [bin, index] = await this.token.getClassBinIndex(6);
        bin.should.be.bignumber.equal(0);
        index.should.be.bignumber.equal(6);

        [bin, index] = await this.token.getClassBinIndex(16);
        bin.should.be.bignumber.equal(1);
        index.should.be.bignumber.equal(0);

        [bin, index] = await this.token.getClassBinIndex(31);
        bin.should.be.bignumber.equal(1);
        index.should.be.bignumber.equal(15);
      });

    })

    describe('Getter functions', function () {

      it('totalSupply() should return the number of object for given class', async function () {
        let totalSupply5 = await this.token.totalSupply(5);
        totalSupply5.should.be.bignumber.equal(256);
      });

      it('balanceOf() should return class balance for queried address', async function () {
        let balance6 = await this.token.balanceOf(owner, 6);
        balance6.should.be.bignumber.equal(256);

        let balance16 = await this.token.balanceOf(owner, 16);
        balance16.should.be.bignumber.equal(0);
      });

    })

    describe('transferFrom() function', function () {

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

    describe.only('batchTransferFrom() function', function () {

      /* 

      TEST TO DO ; 

      + Make sure all transfers are valid
      + Event generated for each

      throw if invalid?
      return bool if invalid?
      break if invalid?

      */
      //    bins :   -- 0 --  ---- 1 ----  ---- 2 ----  ---- 3 ---- 
      var classes = []; //[0,1,2,3, 16,17,18,19, 32,33,34,35, 48,49,50,51];  
      var values  = []; //[0,1,2,3, 12,13,14,15, 11,12,13,14, 11,12,13,14]; 

      //classes = [12, 111];
      //values  = [666, 11];

      beforeEach(async function (){
        //Minting enough values for transfer for each class
        for (var i = 0; i < 100; i++){
          await this.token.mint(owner, i, 10);
          classes.push(i);
          values.push(10);
        }
      })

      it('Should update balances of sender and receiver', async function (){
        await this.token.batchTransferFrom(owner, player1, classes, values, {from: owner});

        let balanceFrom;
        let balanceTo;
        
        for (var i = 0; i < classes.length; i++){
          balanceFrom = await this.token.balanceOf(owner, classes[i]);
          balanceTo   = await this.token.balanceOf(player1, classes[i]);

          if (classes[i] < 16) {
            balanceFrom.should.be.bignumber.equal(256);
          } else {
            balanceFrom.should.be.bignumber.equal(0);          
          }
          balanceTo.should.be.bignumber.equal(values[i]);
        }

      })

      it.only('BatchTransfer 100 gas cost', async function () {
          let tx = await this.token.batchTransferFrom(owner, player1, classes, values, {from: owner});
          console.log('BatchTransferFrom single gas :' + tx.receipt.gasUsed)
      });

      it.only('Transfer single gas cost', async function () {
          let tx = await this.token.transferFrom(owner, player1, 0, 5, {from: owner});
          console.log('transferFrom single gas :' + tx.receipt.gasUsed)
      });

      it('should emit BatchTransfer event', async function () {
          let tx = await this.token.batchTransferFrom(owner, player1, classes, values, {from: owner});
          let event = tx.logs[0].event;
          event.should.be.equal('BatchTransfer');
      });

      it('efficiency test load: ordered bin visted', async function (){
        let tx = await this.token.batchTransferFrom(owner, player1, classes, values, {from: owner});
        let gasPerBalance = tx.receipt.gasUsed / classes.length;
        console.log('gasUsed:', tx.receipt.gasUsed);
        console.log('gasPerClass:', gasPerBalance);
      })

      it('efficiency test regular ERC-20', async function (){
        let ERC20 = await RegularToken.new(10000000000, {from: owner});

        for (var i = 0; i < classes.length; i++){
          await ERC20.mint(owner, classes[i], values[i]);
        }

        let tx = await ERC20.batchTransfer(player1, classes, values, {from: owner});
        let gasPerBalance = tx.receipt.gasUsed / classes.length;
        console.log('gasUsed:', tx.receipt.gasUsed);
        console.log('gasPerClass:', gasPerBalance);
      })


    })

    describe('mintObject() function', function () {
      const receiver = player1;
      const _class = 666;
      const amount = 11; 

      it('should ALLOW owner to call mintObject()', async function () {
        let tx = await this.token.mintObject(receiver, _class, amount, {from: owner}).should.be.fulfilled;
        console.log(tx.receipt.gasUsed);
      });

      it('should NOT allow anyone to call mintObject()', async function () {
        await this.token.mintObject(receiver, _class, amount, {from : anyone}).should.be.rejected;
      });

      it('should increase the balance of receiver  by the right amount', async function() {
        let recipientBalanceA = await this.token.balanceOf(receiver, _class);
        await this.token.mintObject(receiver, _class, amount, {from: owner});
        let recipientBalanceB = await this.token.balanceOf(receiver, _class);

        recipientBalanceB.should.be.bignumber.equal(recipientBalanceA.plus(amount));
      })

      it('should REVERT if amount is larger than limit', async function () {
        let maxVal = 65536;
        await this.token.mintObject(receiver, _class, maxVal, {from : owner}).should.be.rejected;
      });

      it('should REVERT if _class is out of range', async function () {
        let maxClass = 4294967296;
        await this.token.mintObject(receiver, maxClass, amount, {from : owner}).should.be.rejected;
      });

      it('should emit an Mint event', async function () {
        const { logs } = await this.token.mintObject(receiver, _class, amount, {from: owner});
        let event = logs[0].event; 
        event.should.be.equal('Mint');
      });

    })

    describe('batchMintObject() function', function () {
      const receiver = player1;
      const classes = [0, 1, 2, 16, 17];
      const classesUnfolded = [0, 1, 2, 16, 17]
      const amounts  = [1, 1, 1, 1, 1]; 
      var arr = [];

      it('should ALLOW owner to call single batchMintObject()', async function () {
        let tx = await this.token.batchMintObject(receiver, classesUnfolded, {from: owner}).should.be.fulfilled;
        console.log('single batch mint :' + tx.receipt.gasUsed);
      });

      it('should ALLOW owner to call many batchMintObject()', async function () {

        let tx = await this.token.manyBatchMintObject(receiver, classes, amounts, {from: owner}).should.be.fulfilled;
        console.log('many batch mint :' + tx.receipt.gasUsed);
      });

      it('should NOT allow anyone to call batchMintObject()', async function () {
        await this.token.batchMintObject(receiver, classesUnfolded, {from : anyone}).should.be.rejected;
      });

      it.skip('should increase the balances of receiver by the right amounts', async function() {
        await this.token.batchMintObject(receiver, classes, {from: owner});

        let balanceTo;
        
        for (var i = 0; i < classes.length; i++){
          balanceTo = await this.token.balanceOf(receiver, classes[i]);
          balanceTo.should.be.bignumber.equal(amounts[i]);
        }
      })

      it('should increase the balances of receiver by the right amounts', async function() {
        await this.token.batchMintObject(receiver, classesUnfolded, {from: owner});

        let balanceTo;
        
        for (var i = 0; i < classes.length; i++){
          balanceTo = await this.token.balanceOf(receiver, classes[i]);
          balanceTo.should.be.bignumber.equal(amounts[i]);
        }
      })

      it.skip('should REVERT if an amount is larger than limit', async function () {
        let maxVal = 65536;
        await this.token.batchMintObject(receiver, [0, 1, 2], [1, maxVal, 2], {from : owner}).should.be.rejected;
      });

      it.skip('should REVERT if a class is out of range', async function () {
        let maxClass = 4294967296;
        await this.token.batchMintObject(receiver, [0, maxClass, 2], [1, 2, 3], {from : owner}).should.be.rejected;
      });

      it('should emit an BatchMint event', async function () {
        const { logs } = await this.token.batchMintObject(receiver, classesUnfolded, {from: owner});
        let event = logs[0].event; 
        event.should.be.equal('BatchMint');
      });

    })

    describe('updateOperatorStatus() function', function () {

      it('should emit an OperatorStatusUpdated event', async function () {
        const { logs } = await this.token.updateOperatorStatus(operator, true, { from: owner });
        let event = logs[0].event; 
        event.should.be.equal('OperatorStatusUpdated');
      });


      it('should set the operator status to _status argument', async function () {
        await this.token.updateOperatorStatus(operator, true, { from: owner }).should.be.fulfilled;

        const status = await this.token.isOperatorFor(operator, owner);
        status.should.be.equal(true);
      });


      context('When the operator was already an operator', function () {
        beforeEach(async function () {
          await this.token.updateOperatorStatus(operator, true, { from: owner });
        });

        it('should leave the operator status to set to true again', async function () {
          await this.token.updateOperatorStatus(operator, true, { from: owner }).should.be.fulfilled;

          const status = await this.token.isOperatorFor(operator, owner);
          status.should.be.equal(true);
        });

        it('should allow the operator status to be set to false', async function () {
          await this.token.updateOperatorStatus(operator, false, { from: owner }).should.be.fulfilled;

          const status = await this.token.isOperatorFor(operator, owner);
          status.should.be.equal(false);
        });
      });
    });

    describe('recoverOperatorUpdateSigner() function', function () {

      var sig;
      var r;
      var s;
      var v;
      const signer  = owner;
      const status  = true; 
      const nonce   = 0;
      var sigPrefix = '\x19Ethereum Signed Message:\n32';

      beforeEach(async function () {
        //Hashed message
        const m = await Web3Utils.soliditySha3(
                          this.token.address, 
                          operator,
                          status,         
                          nonce              
                        );

        sig = await web3.eth.sign(signer, m);
        r = sig.substr(0, 66);
        s = '0x' + sig.substr(66, 64);
        v = '0x' + sig.substr(130,2);
      })
    
      it('should recover valid signer', async function () {
        let recoveredSigner = await this.token.recoverOperatorUpdateSigner(operator, status, 
                nonce, sigPrefix, r, s, v);
        recoveredSigner.should.be.equal(signer);
      });

    });

    describe('sigUpdateOperatorStatus() function', function () {

      var sig;
      var r;
      var s;
      var v;
      const signer  = player1;
      const status  = true; 
      const nonce   = 0;
      var sigPrefix = '\x19Ethereum Signed Message:\n32';

      context('when signature is valid', function () { 

        beforeEach(async function () {
          //Hashed message
          const m = await Web3Utils.soliditySha3(
                 this.token.address, operator, status, nonce);


          sig = await web3.eth.sign(signer, m);
          r = sig.substr(0, 66);
          s = '0x' + sig.substr(66, 64);
          v = '0x' + sig.substr(130,2);
        })

        it('should allow ANYONE to set the tokenholder operator status to _status argument', async function () {
          await this.token.sigUpdateOperatorStatus(signer, operator, status, 
                    sigPrefix, r, s, v, {from: anyone}).should.be.fulfilled;

          const isOperator = await this.token.isOperatorFor(operator, signer);
          isOperator.should.be.equal(true);
        });

        it('should emit an OperatorStatusUpdated event', async function () {
          const { logs } = await this.token.sigUpdateOperatorStatus(signer, operator, status,
             sigPrefix, r, s, v, {from: anyone}).should.be.fulfilled;

          let event = logs[0].event; 
          event.should.be.equal('OperatorStatusUpdated');
        });

        it('should increment signer nonce by one', async function () {
          let nonce1 = await this.token.getNonce(signer);

          await this.token.sigUpdateOperatorStatus(signer, operator, status,
             sigPrefix, r, s, v, {from: anyone});

          let nonce2 = await this.token.getNonce(signer);

          nonce2.should.be.bignumber.equal(nonce1.plus(1));
        })

        context('When the operator was already an operator', function () {
          beforeEach(async function () {
            await this.token.sigUpdateOperatorStatus(signer, operator, status, 
                    sigPrefix, r, s, v, {from: anyone});
          });

          it('should leave the operator status to set to true again', async function () {

           const m = await Web3Utils.soliditySha3(
                  this.token.address, operator, status, nonce +1);

            sig = await web3.eth.sign(signer, m);
            r = sig.substr(0, 66);
            s = '0x' + sig.substr(66, 64);
            v = '0x' + sig.substr(130,2);


            await this.token.sigUpdateOperatorStatus(signer, operator, status, 
                    sigPrefix, r, s, v, {from: anyone}).should.be.fulfilled;

            const isOperator = await this.token.isOperatorFor(operator, signer);
            isOperator.should.be.equal(true);
          });

          it('should allow the operator status to be set to false', async function () {

           const m = await Web3Utils.soliditySha3(
                  this.token.address, operator, false, nonce +1);

            sig = await web3.eth.sign(signer, m);
            r = sig.substr(0, 66);
            s = '0x' + sig.substr(66, 64);
            v = '0x' + sig.substr(130,2);

            var isOperator = await this.token.isOperatorFor(operator, signer);
            isOperator.should.be.equal(true);

            await this.token.sigUpdateOperatorStatus(signer, operator, false, 
                    sigPrefix, r, s, v, {from: anyone}).should.be.fulfilled;

            isOperator = await this.token.isOperatorFor(operator, signer);
            isOperator.should.be.equal(false);
          });
        });
      });

      context('when signature is INVALID', function () {

        const sigPrefixFake = '\x19Ethereum Signed Message:\n31';

        beforeEach(async function () {
          //Hashed message
          const m = await Web3Utils.soliditySha3(
                 this.token.address, operator, true, nonce);


          sig = await web3.eth.sign(signer, m);
          r = sig.substr(0, 66);
          s = '0x' + sig.substr(66, 64);
          v = '0x' + sig.substr(130,2);
        })

        it('should REVERT', async function () {
          await this.token.sigUpdateOperatorStatus(signer, operator, status, 
                    sigPrefixFake, r, s, v, {from: anyone}).should.be.rejected;
        });

        it('should REVERT if recovered signer is 0x0', async function() {
          await this.token.sigUpdateOperatorStatus(ZERO_ADDRESS, operator,
                            nonce, sigPrefix, '0x0', '0x0', '0x0').should.be.rejected;
        });
      });
    });

    describe('recoverHashSigner() Function', function () {
      var m = Web3Utils.soliditySha3('hello!');
      var prefixedM = Web3Utils.soliditySha3('\x19Ethereum Signed Message:\n32', m);
      var signer = player1;
      var sig;
      var r;
      var s;
      var v;

      beforeEach(async function () {
        sig = await web3.eth.sign(signer, m);
        r = sig.substr(0, 66);
        s = '0x' + sig.substr(66, 64);
        v = '0x' + sig.substr(130,2);

      })

      it('should return signer if valid signature', async function() {
        let recoveredSigner = await this.token.recoverHashSigner(prefixedM, r, s, v);
        recoveredSigner.should.be.equal(signer);
      })

      it('should REVERT if recovered signer is 0x0', async function() {
        await this.token.recoverHashSigner(prefixedM, '0x0', '0x0', '0x0').should.be.rejected;
      });
    })

    describe('recoverTransferFromSigner() Function', function () {
      var sig;
      var r;
      var s;
      var v;
      const signer   = owner;
      const spender  = player1;
      const to       = player2;
      const _class   = 0;
      const maxValue = 100;
      const nonce    = 0;
      var sigPrefix  = '\x19Ethereum Signed Message:\n32';

      beforeEach(async function () {
        //Hashed message
        const m = await Web3Utils.soliditySha3(
                        this.token.address, //
                        signer,             // _from
                        spender,            // _delegate
                        to,                 // _to
                        _class,             // _class
                        maxValue,           // _maxValue
                        nonce               // _nonce
                        );

        sig = await web3.eth.sign(signer, m);
        r = sig.substr(0, 66);
        s = '0x' + sig.substr(66, 64);
        v = '0x' + sig.substr(130,2);
      })

      it('should return signer if valid signature', async function() {
        let recoveredSigner = await this.token.recoverTransferFromSigner(signer, spender, to, _class, maxValue, 
                                                                        nonce, sigPrefix, r, s, v);
        recoveredSigner.should.be.equal(signer);
      })

      it('should REVERT if recovered signer is 0x0', async function() {
        await this.token.recoverTransferFromSigner(ZERO_ADDRESS, spender, to, _class, maxValue, 
                            nonce, sigPrefix, '0x0', '0x0', '0x0').should.be.rejected;
      });
    })

    describe('sigTransferFrom() function', function () {
      var sig;
      var r;
      var s;
      var v;

      const spender = player1;
      const _class  = 0;
      const signer   = owner;
      const maxValue = 100;
      const nonce    = 0;
      var sigPrefix  = '\x19Ethereum Signed Message:\n32';

      context('When the recipient is not the zero address', function () {
        var to = player2;

        context('When the owner has enough balance & signature is valid', function () {
          const amount = 25;

          beforeEach(async function () {
            //Hashed message
            const m = await Web3Utils.soliditySha3(
                            this.token.address, //
                            signer,             // _from
                            spender,            // _delegate
                            to,                 // _to
                            _class,             // _class
                            maxValue,           // _maxValue
                            nonce               // _nonce
                            );

            sig = await web3.eth.sign(signer, m);
            r = sig.substr(0, 66);
            s = '0x' + sig.substr(66, 64);
            v = '0x' + sig.substr(130,2);
          })

          it('should transfer the requested amount if below maxValue', async function () {
            await this.token.sigTransferFrom(signer, to, _class, amount, maxValue, sigPrefix, 
                                             r, s, v, { from: spender });

            const senderBalance = await this.token.balanceOf(owner, _class);
            senderBalance.should.be.bignumber.equal(256 - amount);

            const recipientBalance = await this.token.balanceOf(to, _class);
            recipientBalance.should.be.bignumber.equal(amount); 
          });

          it('should transfer the requested amount if equal maxValue', async function () {
            await this.token.sigTransferFrom(signer, to, _class, maxValue, maxValue, sigPrefix, 
                                             r, s, v, { from: spender });

            const senderBalance = await this.token.balanceOf(owner, _class);
            senderBalance.should.be.bignumber.equal(256 - maxValue);

            const recipientBalance = await this.token.balanceOf(to, _class);
            recipientBalance.should.be.bignumber.equal(maxValue); 
          });

          it('should REVERT if the requested amount if higher than maxValue', async function () {
            await this.token.sigTransferFrom(signer, to, _class, maxValue+1, maxValue, sigPrefix, 
                                             r, s, v, { from: spender }).should.be.rejected;
          });

          it('should emit a Transfer event', async function () {
            const { logs } = await this.token.sigTransferFrom(signer, to, _class, amount, maxValue, sigPrefix, 
                                             r, s, v, { from: spender });
            let event = logs[0].event; 
            event.should.be.equal('Transfer');
          });

          it('should increment signer nonce', async function () {
            let nonce0 = await this.token.getNonce(signer);

            await this.token.sigTransferFrom(signer, to, _class, amount, maxValue, sigPrefix, 
                                             r, s, v, { from: spender });

            let nonce1 = await this.token.getNonce(signer);

            nonce0.should.be.bignumber.equal(0);
            nonce1.should.be.bignumber.equal(1);
          });

          it('should REVERT if transferFrom leads to overflow in recipient', async function () {
            await this.token.mint(to, 0, 2**16-1);
            await this.token.sigTransferFrom(signer, to, _class, 1, maxValue, sigPrefix, 
                                             r, s, v, { from: spender }).should.be.rejected;
          });
        });

        context('When signer does not specify recipient', function () {
          const amount = 10;
          const noRecipient = '0x0000000000000000000000000000000000000001';

          it('should allow recipient to be anyone', async function () {
            const m = await Web3Utils.soliditySha3(
                            this.token.address, signer, spender,     
                            noRecipient, _class, maxValue, nonce);

            sig = await web3.eth.sign(signer, m);
            r = sig.substr(0, 66); s = '0x' + sig.substr(66, 64); v = '0x' + sig.substr(130,2);

            await this.token.sigTransferFrom(signer, anyone, _class, amount, maxValue, sigPrefix, 
                                             r, s, v, { from: spender }).should.be.fulfilled;
          });
        });

        context('When the owner does not have enough balance', function () {
          const amount = 257;

          it('should REVERT', async function () {
            //Hashed message
            const m = await Web3Utils.soliditySha3(
                            this.token.address, signer, spender,     
                            to, _class, 10000, nonce);

            sig = await web3.eth.sign(signer, m);
            r = sig.substr(0, 66);
            s = '0x' + sig.substr(66, 64);
            v = '0x' + sig.substr(130,2);

            await this.token.sigTransferFrom(signer, to, _class, amount, 10000, sigPrefix, 
                                             r, s, v, { from: spender }).should.be.rejected;
          });
        });

        context('When signature does not match arguments', function () {
          const amount = 10;

          it('should REVERT', async function () {
            //Hashed message
            const m = await Web3Utils.soliditySha3(
                            this.token.address, signer, spender,     
                            to, _class, maxValue, nonce);

            sig = await web3.eth.sign(signer, m);
            r = sig.substr(0, 66);
            s = '0x' + sig.substr(66, 64);
            v = '0x' + sig.substr(130,2);
            
            await this.token.sigTransferFrom(signer, to, _class, amount, maxValue+1, sigPrefix, 
                                             r, s, v, { from: spender }).should.be.rejected;
          });

          it('should REVERT if recovered signer is 0x0', async function() {
            await this.token.sigTransferFrom(ZERO_ADDRESS, to, _class, 1, maxValue, sigPrefix, 
                                  '0x0', '0x0', '0x0').should.be.rejected;
          });

        });
      });
    });

  });
});
