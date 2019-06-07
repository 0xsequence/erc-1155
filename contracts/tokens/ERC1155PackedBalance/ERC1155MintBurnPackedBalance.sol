pragma solidity ^0.5.9;
pragma experimental ABIEncoderV2;

import "./ERC1155PackedBalance.sol";


/**
 * @dev Multi-Fungible Tokens with minting and burning methods. These methods assume
 *      a parent contract to be executed as they are `internal` functions.
 */
contract ERC1155MintBurnPackedBalance is ERC1155PackedBalance {


  /****************************************|
  |            Minting Functions           |
  |_______________________________________*/

  /**
   * @notice Mint _amount of tokens of a given id
   * @param _to      The address to mint tokens to
   * @param _id      Token id to mint
   * @param _amount  The amount to be minted
   */
  function _mint(address _to, uint256 _id, uint256 _amount)
    internal
  {
    //Add _amount
    _updateIDBalance(_to,   _id, _amount, Operations.Add); // Add amount to recipient

    // Emit event
    emit TransferSingle(msg.sender, address(0x0), _to, _id, _amount);
  }

  /**
   * @notice Mint tokens for each (_ids[i], _amounts[i]) pair
   * @param _to       The address to mint tokens to
   * @param _ids      Array of ids to mint
   * @param _amounts  Array of amount of tokens to mint per id
   */
  function _batchMint(address _to, uint256[] memory _ids, uint256[] memory _amounts)
    internal
  {
    require(_ids.length == _amounts.length, "ERC1155MintBurnPackedBalance#_batchMint: INVALID_ARRAYS_LENGTH");

    // Load first bin and index where the token ID balance exists
    (uint256 bin, uint256 index) = getIDBinIndex(_ids[0]);

    // Balance for current bin in memory (initialized with first transfer)
    uint256 balTo = _viewUpdateIDBalance(balances[_to][bin], index, _amounts[0], Operations.Add);

    // Number of transfer to execute
    uint256 nTransfer = _ids.length;

    // Last bin updated
    uint256 lastBin = bin;

    for (uint256 i = 1; i < nTransfer; i++) {
      (bin, index) = getIDBinIndex(_ids[i]);

      // If new bin
      if (bin != lastBin) {
        // Update storage balance of previous bin
        balances[_to][lastBin] = balTo;
        balTo = balances[_to][bin];
        // Bin will be the most recent bin
        lastBin = bin;
      }

    //   // Update memory balance
      balTo = _viewUpdateIDBalance(balTo, index, _amounts[i], Operations.Add);
    }

    // Update storage of the last bin visited
    balances[_to][bin] = balTo;

    // //Emit event
    emit TransferBatch(msg.sender, address(0x0), _to, _ids, _amounts);

    // Pass data if recipient is contract
    if (_to.isContract()) {
      bytes4 retval = IERC1155TokenReceiver(_to).onERC1155BatchReceived(msg.sender, address(0x0), _ids, _amounts, "");
      require(retval == ERC1155_BATCH_RECEIVED_VALUE, "ERC1155PackedBalance#_batchMint: INVALID_ON_RECEIVE_MESSAGE");
    }
  }


  /****************************************|
  |            Burning Functions           |
  |_______________________________________*/

  /**
   * @notice Burn _amount of tokens of a given token id
   * @param _from    The address to burn tokens from
   * @param _id      Token id to burn
   * @param _amount  The amount to be burned
   */
  function _burn(address _from, uint256 _id, uint256 _amount)
    internal
  {
    //Substract _amount
    _updateIDBalance(_from, _id, _amount, Operations.Sub);

    // Emit event
    emit TransferSingle(msg.sender, _from, address(0x0), _id, _amount);
  }


   // USE EFFICIENT BURN IF POSSIBLE

  /**
   * @notice Burn tokens of given token id for each (_ids[i], _amounts[i]) pair
   * @param _from     The address to burn tokens from
   * @param _ids      Array of token ids to burn
   * @param _amounts  Array of the amount to be burned
   */
  function _batchBurn(address _from, uint256[] memory _ids, uint256[] memory _amounts)
    internal
  {
    require(_ids.length == _amounts.length, "ERC1155MintBurnPackedBalance#batchBurn: INVALID_ARRAYS_LENGTH");

    // Number of mints to execute
    uint256 nBurn = _ids.length;

     // Executing all minting
    for (uint256 i = 0; i < nBurn; i++) {
      // Update storage balance
      _updateIDBalance(_from,   _ids[i], _amounts[i], Operations.Sub); // Add amount to recipient
    }

    // Emit batch mint event
    emit TransferBatch(msg.sender, _from, address(0x0), _ids, _amounts);
  }

}

