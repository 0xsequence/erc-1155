pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "./ERC1155.sol";


/**
 * @dev Multi-Fungible Tokens with minting and burning methods. These methods assume
 *      a parent contract to be executed as they are `internal` functions.
 */ 
contract ERC1155MintBurn is ERC1155 { 

  /****************************************|
  |            Minting Functions           |
  |_______________________________________*/

  /**
   * @dev Mint _value of tokens of a given id 
   * @param _to The address to mint tokens to.
   * @param _id token id to mint
   * @param _value The amount to be minted
   */
  function _mint(address _to, uint256 _id, uint256 _value) 
    internal
  {    
    //Add _value
    balances[_to][_id] = balances[_to][_id].add(_value);

    // Emit event
    emit TransferSingle(msg.sender, address(0x0), _to, _id, _value);
  }


  /**
   * @dev Mint tokens for each ids in _ids
   * @param _to The address to mint tokens to.
   * @param _ids Array of ids to mint
   * @param _values Array of amount of tokens to mint per id
   */
  function _batchMint(address _to, uint256[] memory _ids, uint256[] memory _values) 
    internal 
  {
    require(_ids.length == _values.length, "ERC1155MintBurn#batchMint: INVALID_ARRAYS_LENGTH");

    // Number of mints to execute
    uint256 nMint = _ids.length;

     // Executing all minting
    for (uint256 i = 0; i < nMint; i++) {
      // Update storage balance
      balances[_to][_ids[i]] = balances[_to][_ids[i]].add(_values[i]);
    }

    // Emit batch mint event
    emit TransferBatch(msg.sender, address(0x0), _to, _ids, _values);
  }



  /****************************************|
  |            Burning Functions           |
  |_______________________________________*/

  /**
   * @dev burn _value of tokens of a given token id 
   * @param _from The address to burn tokens from.
   * @param _id token id to burn
   * @param _value The amount to be burned
   */
  function _burn(address _from, uint256 _id, uint256 _value) 
    internal
  {    
    //Substract _value
    balances[_from][_id] = balances[_from][_id].sub(_value);

    // Emit event
    emit TransferSingle(msg.sender, _from, address(0x0), _id, _value);
  }

  /**
   * @dev burn _value of tokens of a given token id 
   * @param _from The address to burn tokens from.
   * @param _ids Array of token ids to burn
   * @param _values Array of the amount to be burned
   */
  function _batchBurn(address _from, uint256[] memory _ids, uint256[] memory _values) 
    internal 
  {
    require(_ids.length == _values.length, "ERC1155MintBurn#batchBurn: INVALID_ARRAYS_LENGTH");

    // Number of mints to execute
    uint256 nBurn = _ids.length;

     // Executing all minting
    for (uint256 i = 0; i < nBurn; i++) {
      // Update storage balance
      balances[_from][_ids[i]] = balances[_from][_ids[i]].sub(_values[i]);
    }

    // Emit batch mint event
    emit TransferBatch(msg.sender, _from, address(0x0), _ids, _values);
  }

}

