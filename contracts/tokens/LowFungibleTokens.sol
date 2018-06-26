pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract LowFungibleTokens is Ownable { 
  using SafeMath for uint256; 

  /** 
  * TO DO
  *  - Optimize bin, index quering - Maybe struct? smaller uint for bin and index?
  *  - Implement transferAndCall (or safeTransfer)
  *  - Optimize everything 
  *  - Need to make sure that all the signature stuff works if holder is contract
  *  - Double check order of operator mapping
  *  - Need a proxy contract that keeps Operators. 
  *  - Need to support ERC-165
  * 
  * =================>>>>> Card Bundling <<<<<=================
  *
  *  - Unbundle decks progressively when card is used in other decks?
  *
  * =================>>>>> Batch transfer & transferFrom <<<<<=================
  *
  *  - SingleMintBatch or not? Prob not
  *  - Check if delegate transfer works if contract is card holder
  *  - Add delay to sensitive functions (e.g. change ownership)
  *  
  */

  // ----------------------------------------------------- //
  //             Declaring Variables and Events            //
  // ----------------------------------------------------- //

  // Constants
  uint8 public decimals = 0;  // No decimals ?  

  uint256 constant public NUMBER_OF_CLASSES   = 2**32;                   // Maximum number of object classes (higher is bigger deployment cost)
  uint256 constant public CLASSES_BITS_SIZE   = 4;                       // Max size of each object
  uint256 constant public CLASSES_PER_UINT256 = 256 / CLASSES_BITS_SIZE; // 256 / CLASSES_BITS_SIZE

  // Deployment cost
  // 2**16 : 3,488,299
  // 2**64 : 3,507,993

  // Operations for _updateClassBalance 
  enum Operations {Add, Sub, Replace}

  // Objects total supply
  mapping(uint256 => uint256) public totalSupply; 

  // Objects balances ; balances[address][class] => balance (using array instead of mapping for efficiency)
  mapping (address => uint256[NUMBER_OF_CLASSES / CLASSES_PER_UINT256]) balances;

  // Signature nonce per address
  mapping (address => uint256) nonces;

  // Operators
  mapping (address => mapping(address => bool)) operators;                                     

  // Events
  event Transfer(address from, address to, uint256 class, uint256 amount);
  event BatchTransfer(address from, address to, uint256[] classes, uint256[] amounts);
  event Mint(address to, uint256 class, uint256 amount);
  event BatchMint(address to, uint256[] classes);
  event OperatorStatusUpdated(address tokensHolder, address operator, bool status);



  // ----------------------------------------------------- //
  //               Transfer Related Functions              //
  // ----------------------------------------------------- //

  /**
   * @dev Allow an operator to transfer tokens from one address to another
   * @param _from address The address which you want to send tokens from
   * @param _to address The address which you want to transfer to
   * @param _class Class to update balance of 
   * @param _amount uint256 the amount of tokens to be transferred
   */
  function transferFrom(address _from, address _to, uint256 _class, uint256 _amount) public {

    // Requirements
    require( (msg.sender == _from) || isOperatorFor(msg.sender, _from), 'msg.sender is neither _from nor operator');
    require(_to != address(0),                                          'Invalid recipient');
  //  require(_amount <= balances);  Not necessary since checked with .sub16 method

    // Update balances
    _updateClassBalance(_from, _class, _amount, Operations.Sub); // Subtract value
    _updateClassBalance(_to, _class, _amount, Operations.Add);   // Add value

    // Emit transfer Event
    emit Transfer(_from, _to, _class, _amount);
  }

 /**
  * @dev transfer objects from different classes to specified address
  * @param _from The address to BatchTransfer objects from.  
  * @param _to The address to batchTransfer objects to.
  * @param _classes Array of classes to update balance of 
  * @param _amounts Array of amount of object per class to be transferred. 
  * Note:  Arrays should be sorted so that all classes in a same bin are adjacent (more efficient).
  */
  function batchTransferFrom(address _from, address _to, uint256[] _classes, uint256[] _amounts) public {

    // Requirements
    require( (msg.sender == _from) || isOperatorFor(msg.sender, _from), 'msg.sender is neither sender or operator');
    require(_classes.length == _amounts.length,                         'Inconsistent array length between args');
    require(_to != address(0),                                          'Invalid recipient');

    // Load first bin and index where the object balance exists
    (uint256 bin, uint256 index) = getClassBinIndex(_classes[0]);

    // Balance for current bin in memory (initialized with first transfer)
    uint256 balFrom = _viewUpdateClassBalance(balances[_from][bin], index, _amounts[0], Operations.Sub); 
    uint256 balTo   = _viewUpdateClassBalance(balances[_to][bin],   index, _amounts[0], Operations.Add);  

    // Number of transfer to execute
    uint256 nTransfer = _classes.length;
    
    // Last bin updated
    uint256 lastBin = bin;

    for (uint256 i = 1; i < nTransfer; i++){
      (bin, index) = getClassBinIndex(_classes[i]);

      // If new bin
      if (bin != lastBin) {
        // Update storage balance of previous bin
        //balances[_from][lastBin] = balFrom;
        //balances[_to][lastBin] = balTo;

        // Load current bin balance in memory
        balFrom = balances[_from][bin];
        balTo = balances[_to][bin];

        // Bin will be the most recent bin
        lastBin = bin;
      }

      // Update memory balance
//    require(_amounts[i] <= 2**16-1);  Not required since checked in SafeMathUint16
//    require(_amounts[i] <= balFrom);  Not required since checked with .sub16 method
      //balFrom = _viewUpdateClassBalance(balFrom, index, _amounts[i], Operations.Sub); 
      //balTo   = _viewUpdateClassBalance(balTo,   index, _amounts[i], Operations.Add);
    } 

    // Update storage of the last bin visited
    //balances[_from][bin] = balFrom;
    //balances[_to][bin] = balTo;

    // Emit batchTransfer event
    emit BatchTransfer(_from, _to, _classes, _amounts);
  }



  // ----------------------------------------------------- //
  //               Operator Related Functions              //
  // ----------------------------------------------------- //

  /**
  * @dev Will set _operator operator status to true or false
  * @param _operator Address to changes operator status.
  * @param _status  _operator's new operator status (true or false)
  */
  function updateOperatorStatus(address _operator, bool _status) public {
    // Update operator status
    operators[msg.sender][_operator] = _status;
    emit OperatorStatusUpdated(msg.sender, _operator, _status);
  }

  /**
  * @dev Approve the passed address to spend on behalf of _from if valid signature is provided.
  * @param _tokensHolder Address that wants to set operator status  _spender.
  * @param _operator The address which will act as an operator for _tokensHolder.
  * @param _status  _operator's new operator status (true or false). 
  * @param _sigPrefix Signature prefix message (e.g. "\x19Ethereum Signed Message:\n32");
  * @param _r r variable from ECDSA signature.
  * @param _s s variable from ECDSA signature.
  * @param _v v variable from ECDSA signature.
  *
  *  *** require approval to be 0? ***
  */
  function sigUpdateOperatorStatus(
    address _tokensHolder,
    address _operator, 
    bool    _status,    
    string _sigPrefix,
    bytes32 _r,
    bytes32 _s, 
    uint8   _v) public 
  {
    // Verify if _tokensHolder is the signer
    require(_tokensHolder == recoverOperatorUpdateSigner(_operator, _status, nonces[_tokensHolder], 
                                                         _sigPrefix, _r, _s, _v) );
    // Update signature nonce of _tokensHolder
    nonces[_tokensHolder] += 1; 

    // Update operator status
    operators[_tokensHolder][_operator] = _status;

    emit OperatorStatusUpdated(_tokensHolder, _operator, _status);
  }

  /**
  * @dev Function that verifies whether _operator is an authorized operator of _tokenHolder.
  * @param _operator The address of the operator to query status of
  * @param _tokenHolder Address of the tokenHolder
  * @return A uint256 specifying the amount of tokens still available for the spender.
  */
  function isOperatorFor(address _operator, address _tokenHolder) public view returns (bool isOperator) {
    return operators[_tokenHolder][_operator];
  }



  // ----------------------------------------------------- //
  //                 Mint Related Functions                //
  // ----------------------------------------------------- //

  /**
  * @dev Mint _amount of objects of a given class 
  * @param _to The address to mint objects to.
  * @param _class Object class to mint
  * @param _amount The amount to be minted
  */
  function mintObject(address _to, uint256 _class, uint256 _amount) onlyOwner public {
//  require(_class < NUMBER_OF_CLASSES); Not required since out of range will throw
//  require(_amount <= 2**16-1);         Not required since checked in SafeMathUint16  
    
    //Add _amount
    _updateClassBalance(_to, _class, _amount, Operations.Add);   

    // Emit event
    emit Mint(_to, _class, _amount);
  }

  /**
  * @dev Mint 1 of object for each class in _classes
  * @param _to The address to mint objects to.
  * @param _classes Array of classes to mint 
  *
  * Should it be single minting? It ends up being cheaper if little duplicates.
  */
  function batchMintObject(address _to, uint256[] _classes) onlyOwner public {

    //require(_classes.length == _amounts.length, 'Inconsistent array length between args');

    // Load first bin and index where the object balance exists
    (uint256 bin, uint256 index) = getClassBinIndex(_classes[0]);

    uint256 nMints = _classes.length; // Number of mints to execute
    uint256 lastBin = bin;            // Last bin updated

    // Balance for current bin in memory (initialized with first mint)
    uint256 balTo = _viewUpdateClassBalance(balances[_to][bin], index, 1, Operations.Add); 

    for (uint256 i = 1; i < nMints; i++){

        (bin, index) = getClassBinIndex(_classes[i]);

        // If new bin
        if (bin != lastBin) {
          // Update storage balance of previous bin
          balances[_to][lastBin] = balTo;

          // Load current bin balance in memory
          balTo = balances[_to][bin];

          // Bin will be the most recent bin
          lastBin = bin;
        } 

        // Update memory balance
        balTo = _viewUpdateClassBalance(balTo, index, 1, Operations.Add);
    } 

    // Update storage of the last bin visited
    balances[_to][bin] = balTo;

    // Emit batchTransfer event
    emit BatchMint(_to, _classes); 
  }


  function manyBatchMintObject(address _to, uint256[] _classes, uint256[] _amounts) onlyOwner public {

    //require(_classes.length == _amounts.length, 'Inconsistent array length between args');

    // Load first bin and index where the object balance exists
    (uint256 bin, uint256 index) = getClassBinIndex(_classes[0]);

    uint256 nMints = _classes.length; // Number of mints to execute
    uint256 lastBin = bin;            // Last bin updated

    // Balance for current bin in memory (initialized with first mint)
    uint256 balTo = _viewUpdateClassBalance(balances[_to][bin], index, _amounts[0], Operations.Add); 

    for (uint256 i = 1; i < nMints; i++){

        (bin, index) = getClassBinIndex(_classes[i]);

        // If new bin
        if (bin != lastBin) {
          // Update storage balance of previous bin
          balances[_to][lastBin] = balTo;

          // Load current bin balance in memory
          balTo = balances[_to][bin];

          // Bin will be the most recent bin
          lastBin = bin;
        } 

        // Update memory balance
        balTo = _viewUpdateClassBalance(balTo, index, _amounts[i], Operations.Add);
    } 

    // Update storage of the last bin visited
    balances[_to][bin] = balTo;

    // Emit batchTransfer event
    emit BatchMint(_to, _classes); 
  }



  // ----------------------------------------------------- //
  //                Signature View Functions               //
  // ----------------------------------------------------- //

  /**
  * @dev Returns the address of the private key that signed the approve message
  * @param _operator The address which will act as an operator for _tokensHolder.
  * @param _status  _operator's new operator status (true or false)
  * @param _nonce Signature nonce for _from.
  * @param _sigPrefix Signature prefix (e..g "\x19Ethereum Signed Message:\n32")
  * @param _r r variable from ECDSA signature.
  * @param _s s variable from ECDSA signature.
  * @param _v v variable from ECDSA signature.
  * @return Address that signed the hash.
  *
  * Is prefix bytes32 ok? What if no prefix? Need to hash twice?
  * 
  */

  // Replace most these arguments with a encoded argument and function calls?

  function recoverOperatorUpdateSigner( 
    address _operator,
    bool    _status,
    uint256 _nonce,
    string  _sigPrefix,
    bytes32 _r,
    bytes32 _s, 
    uint8   _v)
      public view returns (address signer)
  { 
    bytes32 prefixedHash;
    bytes32 hash = keccak256( abi.encodePacked(address(this), _operator, _status, _nonce) );

    // If prefix provided, hash with prefix, else ignore prefix 
    prefixedHash = keccak256( abi.encodePacked(_sigPrefix, hash) );

    // return signer recovered
    return recoverHashSigner(prefixedHash, _r, _s, _v);
  }

  /**
  * @dev Returns the address of associated with the private key that signed _hash
  * @param _hash Hash that was signed.
  * @param _r r variable from ECDSA signature.
  * @param _s s variable from ECDSA signature.
  * @param _v v variable from ECDSA signature.
  * @return Address that signed the hash.
  */
  function recoverHashSigner(
      bytes32 _hash,
      bytes32 _r,
      bytes32 _s,
      uint8 _v)
      public pure returns (address signer)
  {
    // Version of signature should be 27 or 28, but 0 and 1 are also possible versions
    if (_v < 27) {
      _v += 27;
    }

    // Recover who signed the hash
    signer = ecrecover( _hash, _v, _r, _s);

    // Makes sure signer is not 0x0. This is to prevent signer appearing to be 0x0.
    assert(signer != 0x0);

    // Return recovered signer address
    return signer;
  }

  /**
  * @dev Returns the current nonce associated with a given address
  * @param _signer Address to query signature nonce for
  */
  function getNonce(address _signer) view public returns (uint256 nonce) {
    return nonces[_signer];
  }



  // ----------------------------------------------------- //
  //         Objects and Classes Related Functions         //
  // ----------------------------------------------------- //

  /**
  * @dev update the balance of a class for a given address
  * @param _address Address to update class balance
  * @param _class Class to update balance of 
  * @param _amount Value to update the class balance
  * @param _operation Which operation to conduct : 
  *     Operations.Replace : Replace class balance with _amount
  *     Operations.Add     : Add _amount to class balance
  *     Operations.Sub     : Substract _amount from class balance
  */
  function _updateClassBalance(
    address _address, 
    uint256 _class, 
    uint256 _amount,
    Operations _operation) internal 
  {  
    uint256 bin;
    uint256 index;

    // Get bin and index of _class
    (bin, index) = getClassBinIndex(_class);

    // Update balance
    balances[_address][bin] = _viewUpdateClassBalance( balances[_address][bin], index, 
                                                       _amount, _operation );
  }

  /**
  * @dev update the balance of a class provided in _binBalances
  * @param _binBalances Uint256 containing the balances of objects
  * @param _index Index of the object in the provided bin
  * @param _amount Value to update the class balance
  * @param _operation Which operation to conduct : 
  *     Operations.Replace : Replace class balance with _amount
  *     Operations.Add     : Add _amount to class balance
  *     Operations.Sub     : Substract _amount from class balance
  */
  function _viewUpdateClassBalance(
    uint256 _binBalances,
    uint256 _index,
    uint256 _amount,
    Operations _operation) internal pure returns (uint256 newBinBalance) 
  {  
    if (_operation == Operations.Add) {
      
        uint256 objectBalance = getValueInBin(_binBalances, _index);
        newBinBalance = writeValueInBin(_binBalances, _index, objectBalance.add(_amount));

    } else if (_operation == Operations.Sub) {

        objectBalance = getValueInBin(_binBalances, _index);
        newBinBalance = writeValueInBin(_binBalances, _index, objectBalance.sub(_amount));

    } else if (_operation == Operations.Replace){

        newBinBalance = writeValueInBin(_binBalances, _index, _amount);

    } else {
      revert('Invalid operation'); //Bad operation
    }

    return newBinBalance;
  }

  /**
  * @dev return the _class class' balance of _address
  * @param _address Address to query balance of
  * @param _class Class to query balance of 
  * @return Amount of objects of a given class ID
  */
  function balanceOf(address _address, uint256 _class) public view returns (uint256) {
    uint256 bin;
    uint256 index;

    //Get bin and index of _IF
    (bin, index) = getClassBinIndex(_class);
    return getValueInBin(balances[_address][bin], index);
  }

  /**
  * @dev Return the bin number and index within that bin where ID is
  * @param _class Object class 
  * @return (Bin number, ID's index within that bin)
  */
  function getClassBinIndex(uint256 _class) pure public returns (uint256 bin, uint256 index) {
     bin   = _class * CLASSES_BITS_SIZE / 256;
     index = _class % CLASSES_PER_UINT256;
     return (bin, index);
  }

  /*
  * @dev return value in _binValue at position _index
  * @param _binValue uint256 containing the balances of CLASSES_PER_UINT256 classes
  * @param _index index at which to retrieve value
  * @return Value at given _index in _bin
  */
  function getValueInBin(uint256 _binValue, uint256 _index) pure public returns (uint256) {
    
    //Mask to retrieve data for a given binData
    uint256 mask = (uint256(1) << CLASSES_BITS_SIZE) - 1;
    
    //Shift amount
    uint256 rightShift = 256 - CLASSES_BITS_SIZE*(_index + 1);
    return (_binValue >> rightShift) & mask;
  }

  /**
  * @dev return the updated _binValue after writing _amount at _index 
  * @param _binValue uint256 containing the balances of CLASSES_PER_UINT256 classes
  * @param _index Index at which to retrieve value
  * @param _amount Value to store at _index in _bin
  * @return Value at given _index in _bin
  */
  function writeValueInBin(uint256 _binValue, uint256 _index, uint256 _amount) pure public returns (uint256) {
    require(_amount >= 0, 'Amount to write in bin needs to be positive');           // Probably can remove ???
    require(_amount < 2**CLASSES_BITS_SIZE, 'Amount to write in bin is too large');

    //Mask to retrieve data for a given binData
    uint256 mask = (uint256(1) << CLASSES_BITS_SIZE) - 1;

    //Shift amount
    uint256 leftShift = 256 - CLASSES_BITS_SIZE*(_index + 1);
    return (_binValue & ~(mask << leftShift) ) | (_amount << leftShift);
  }



  // ----------------------------------------------------- //
  //             sigTransferFrom() Functions               //
  // ----------------------------------------------------- //

  /**
  * @dev Transfers objects from _from to _to if valid signature from _from is provided.
  * @param _from Address who signed the message that wants to transfer  rom.
  * @param _to Address to send tokens to. If 0x1, signer did not specify a _to address.
  * @param _class Object class to transfer
  * @param _amount Amount of object of given _class to transfer.
  * @param _maxValue Maximum amount of object of given _class to transfer allowd by signer.
  * @param _sigPrefix Signature prefix message (e.g. "\x19Ethereum Signed Message:\n32");
  * @param _r r variable from ECDSA signature.
  * @param _s s variable from ECDSA signature.
  * @param _v v variable from ECDSA signature.
  * @return Address that signed the hash.
  *
  *  *** Potential attack when from is 0x0, since recoverTransferFromSigner can return 0x0 ***
  *
  */
  function sigTransferFrom(
    address _from, 
    address _to, 
    uint256 _class, 
    uint256 _amount,
    uint256 _maxValue,
    string _sigPrefix,
    bytes32 _r,
    bytes32 _s, 
    uint8   _v) public 
  {
    require(_to != address(0), 'Invalid recipient');
    require(_amount <= _maxValue, '_amount is larger than maximum approved value by signer');
 // require(_amount <= balanceFrom);  Not necessary since checked with .sub16 method

    //Sender nonce
    uint256 nonce = nonces[_from];

    // If valid, signer did not specify recipient
    if( _from != recoverTransferFromSigner( _from, msg.sender, 0x1,
        _class, _maxValue, nonce, _sigPrefix, _r, _s, _v )) 
    {
      // If valid, signer specified recipient
      if( _from != recoverTransferFromSigner( _from, msg.sender, _to,
        _class, _maxValue, nonce, _sigPrefix, _r, _s, _v )) 
      {
        revert('Invalid signature');
      }
    }

    //Update signature nonce
    nonces[_from] += 1; 

    // Update balances
    _updateClassBalance(_from, _class, _amount, Operations.Sub); // Subtract value
    _updateClassBalance(_to, _class, _amount, Operations.Add);   // Add value

    // Emit event
    emit Transfer(_from, _to, _class, _amount);
  } 


    /**
  * @dev Returns the address of associated with the private key that signed _hash
  * @param _from Address who signed the message that wants to transfer from.
  * @param _delegate Address that can execute the transfer on the behalf of _from.
  * @param _to Address to send tokens to.
  * @param _class Object class to transfer
  * @param _maxValue Maximum amount of object of given _class to transfer.
  * @param _nonce Signature nonce for _from.
  * @param _sigPrefix Signature prefix (e..g "\x19Ethereum Signed Message:\n32")
  * @param _r r variable from ECDSA signature.
  * @param _s s variable from ECDSA signature.
  * @param _v v variable from ECDSA signature.
  * @return Address that signed the hash.
  *
  *
  * Is prefix bytes32 ok? What if no prefix? Need to hash twice?
  * 
  */

  // Replace most these arguments with a encoded argument and function calls?

  function recoverTransferFromSigner( 
      address _from,
      address _delegate,
      address _to,
      uint256 _class,
      uint256 _maxValue,
      uint256 _nonce,
      string _sigPrefix,
      bytes32 _r,
      bytes32 _s, 
      uint8 _v)
      public view returns (address signer)
  { 
    bytes32 prefixedHash;
    bytes32 hash = keccak256( abi.encodePacked(address(this), _from,  _delegate, 
          _to, _class, _maxValue, _nonce) );

    // If prefix provided, hash with prefix, else ignore prefix 
    prefixedHash = keccak256(abi.encodePacked(_sigPrefix, hash));

    // return signer recovered
    return recoverHashSigner(prefixedHash, _r, _s, _v);
  }
    
}