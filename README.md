# Multi-Token Standard (ERC1155) implementation

An implementation of a Multi-Token contracts where all token types are fungible. 

# Simple Summary

An implementation example of a standard **Multi-Token (MT)** contract, which contains multiple classes of fungible tokens referenced by IDs. Standard interface discussion at [ERC-1155](https://github.com/ethereum/EIPs/issues/1155). 

# Installation

Run `npm install multi-token-standard` or `yarn add multi-token-standard` 

# Usage

To write your custom contracts, import ours and extend them through inheritance.

```javascript
pragma solidity ^0.5.0;

import 'multi-token-standard/contracts/tokens/ERC1155/ERC1155.sol';

contract My1155Token is ERC1155 {
  ...
}
```

# Dev / running the tests

1. Install node v11 and yarn (npm install -g yarn)
2. `yarn install`
3. `yarn ganache`
4. in another terminal run, `yarn test` - executes test suite

# Abstract

The contracts in this repository follow a standard implementation of an MT contract ([ERC-1155](https://github.com/ethereum/EIPs/issues/1155)). This standard provides basic functionality to track and transfer MTs and the interface provide an API other contracts and off-chain third parties can use.

MTs contracts keep track of many token balances, which can lead to significant efficiency gains when batch transferring multiple token classes simultaneously. This is particularly useful for fungible tokens that are likely to be transfered together, such as gaming items (cards, weapons, parts of objects, minerals, etc.). The possible efficiency gains are more significant if the amount of tokens each address can own is capped, as shown in this implementation examples.

With the current implementation, which packs multiple balances within a single `uint256` using bitwise operations, transferring 100 different token classes costs `467,173` gas, an average of `4,671` gas per token type transfer. Still using MT, but without balance packing, transferring 100 different token types costs `2,763,399` gas, an average of `27,633` gas per token transfer. The latter is already an improvement over multiple fungible tokens that are stored on different contracts, since cross-contract calls have a base cost of 700 gas. This is ignoring the cost of initial approvals that would need to be set for each user and existing ERC-20 tokens. This contract also benefit from allowing users to do a single `setApprovalForAll()` call as the current ERC-721 standard proposal, which will allow an operator to transfer on the users behalf all the contract's token classes. 

# Motivation

Various applications would benefit from having a single contract keeping track of multiple token classes. Agreeing on a standard interface allows wallet/broker/auction applications to work with any MTs contract on Ethereum.

# Specification

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in RFC 2119.

```javascript
pragma solidity ^0.5.0;

/**
* @title ERC-1155 Multi-Token Standard
* @dev
*   Note: the ERC-165 identifier for this interface is 0xf23a6e61
*/
contract IERC1155 {

  /**
   * @dev MUST emit when tokens are transferred, including zero value transfers as well as minting or burning.
   * A `Transfer` event to address `0x0` signifies a burning or melting operation. 
   * This MUST emit a zero value, from `0x0` to the creator's address if a token has no initial balance but is being defined/created.
   */
  event TransferSingle(address indexed _operator, address indexed _from, address indexed _to, uint256 _id, uint256 _value);
  event TransferBatch(address indexed _operator, address indexed _from, address indexed _to, uint256[] _ids, uint256[] _values);
  
  /**
   * @dev MUST emit on any successful call to setApprovalForAll(address _operator, bool _approved)
   */
  event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);

  // ----------------- NEVER TRIGGERED  ----------------- //
  event URI(uint256 indexed _id, string _value);
  event Name(uint256 indexed _id, string _value);
  // ---------------------------------------------------- //

  /**
   * @notice Transfers value amount of an _id from the _from address to the _to addresses specified. Each parameter array should be the same length, with each index correlating.
   * @dev MUST emit Transfer event on success.
   * Caller must have sufficient allowance by _from for the _id/_value pair, or isApprovedForAll must be true.
   * Throws if `_to` is the zero address.
   * Throws if `_id` is not a valid token ID.
   * When transfer is complete, this function checks if `_to` is a smart contract (code size > 0). If so, it calls `onERC1155Received` on `_to` and throws if the return value is not `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))`.
   * @param _from    source addresses
   * @param _to      target addresses
   * @param _id      ID of the Token
   * @param _value   transfer amounts
   * @param _data    Additional data with no specified format, sent in call to `_to`
   */
  function safeTransferFrom(address _from, address _to, uint256 _id, uint256 _value, bytes calldata _data) external;

  /**
   * @notice Send multiple types of Tokens from a 3rd party in one transfer (with safety call)
   * @dev MUST emit Transfer event per id on success.
   * Caller must have a sufficient allowance by _from for each of the id/value pairs.
   * Throws on any error rather than return a false flag to minimize user errors.
   * @param _from    Source address
   * @param _to      Target address
   * @param _ids     Types of Tokens
   * @param _values  Transfer amounts per token type
   * @param _data    Additional data with no specified format, sent in call to `_to`
   */
  function safeBatchTransferFrom(address _from, address _to, uint256[] memory _ids, uint256[] memory _values, bytes memory _data) public;
  
  /**
   * @notice Get the balance of an account's Tokens
   * @param _id     ID of the Token
   * @param _owner  The address of the token holder
   * @return        The _owner's balance of the Token type requested
   */   
  function balanceOf(address _owner, uint256 _id) external view returns (uint256);

  /**
   * @dev Get the balance of multiple account/token pairs
   * @param _owners The addresses of the token holders
   * @param _ids    ID of the Tokens
   * @return        The _owner's balance of the Token types requested
   */
  function balanceOfBatch(address[] calldata _owners, uint256[] calldata _ids) external view returns (uint256[] memory);

  /**
   * @notice Enable or disable approval for a third party ("operator") to manage all of `msg.sender`'s tokens.
   * @dev MUST emit the ApprovalForAll event on success.
   * @param _operator  Address to add to the set of authorized operators
   * @param _approved  True if the operator is approved, false to revoke approval
   */
  function setApprovalForAll(address _operator, bool _approved) external;

  /** 
   * @notice Queries the approval status of an operator for a given Token and owner
   * @param _owner     The owner of the Tokens
   * @param _operator  Address of authorized operator
   * @return           True if the operator is approved, false if not
   */
  function isApprovedForAll(address _owner, address _operator) external view returns (bool isOperator);

// @dev Note: the ERC-165 identifier for this interface is 0xe9e5be6a.
interface ERC165 {
    // @notice Query if a contract implements an interface
    // @param interfaceID The interface identifier, as specified in ERC-165
    // @dev Interface identification is specified in ERC-165. This function
    //  uses less than 30,000 gas.
    // @return `true` if the contract implements `interfaceID` and
    //  `interfaceID` is not 0xffffffff, `false` otherwise
    function supportsInterface(bytes4 interfaceID) external view returns (bool);
}

```

```javascript
/**
 * @dev ERC-1155 interface for accepting safe transfers.
 */
interface ERC1155TokenReceiver {

  /**
  * @notice Handle the receipt of a single ERC1155 token type.
  * @dev An ERC1155-compliant smart contract MUST call this function on the token recipient contract, at the end of a `safeTransferFrom` after the balance has been updated.
  * This function MAY throw to revert and reject the transfer.
  * Return of other than the magic value MUST result in the transaction being reverted.
  * Note: The contract address is always the message sender.
  * @param _operator  The address which called the `safeTransferFrom` function
  * @param _from      The address which previously owned the token
  * @param _id        The id of the token being transferred
  * @param _value     The amount of tokens being transferred
  * @param _data      Additional data with no specified format
  * @return           `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))`
  */
  function onERC1155Received(
    address _operator, 
    address _from, 
    uint256 _id, 
    uint256 _value, 
    bytes calldata _data) 
    external returns(bytes4);

  /**
  * @notice Handle the receipt of multiple ERC1155 token types.
  * @dev An ERC1155-compliant smart contract MUST call this function on the token recipient contract, at the end of a `safeBatchTransferFrom` after the balances have been updated.
  * This function MAY throw to revert and reject the transfer.
  * Return of other than the magic value WILL result in the transaction being reverted.
  * Note: The contract address is always the message sender.
  * @param _operator  The address which called the `safeBatchTransferFrom` function
  * @param _from      The address which previously owned the token
  * @param _ids       An array containing ids of each token being transferred
  * @param _values    An array containing amounts of each token being transferred
  * @param _data      Additional data with no specified format
  * @return           `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))`
  */
  function onERC1155BatchReceived(
    address _operator, 
    address _from, 
    uint256[] calldata _ids, 
    uint256[] calldata _values, 
    bytes calldata _data) 
    external returns(bytes4);
}
```

# Rationale

Here, some design decisions are explained.

#### 1. Balance packing efficiency gains
Every optimization claim should be backed by some tests and you will find these in this section. We transferred 100 token types using each token standard discussed in this post and we show the total gas cost and the gas cost per token type. In the case of ERC-721, each token type is a different NFT. In the case of ERC-20, each token type is a different ERC-20 token, stored in different contracts. For both ERC-721 and ERC-20, we also wrote a wrapper contract that transfer on the behalf of users, saving on the base transaction cost. The cost here does not include the approval call cost that such wrapping contracts would necessitate. 

*Transferring 30 ERC-721 tokens in different transaction calls:*
- **Total gas cost :** 1,341,056
- **Gas Cost Per Transfer :** 44,701

*Transferring 30 ERC-721 tokens with batchTransfer method:*
- **Total gas cost :** 671,553
- **Gas Cost Per Transfer :** 22,385

*Transferring 30 ERC-20 tokens in different transaction calls:*
- **Total gas cost :** 1,543,170
- **Gas Cost Per Transfer :** 51,439

*Transferring 30 ERC-20 tokens with wrapper contract:*
- **Total gas cost :** 990,777
- **Gas Cost Per Transfer :** 33,025

*Transferring 30 fungible tokens from MT contract without balance packing:*
- **Total gas cost :** 852,055
- **Gas Cost Per Transfer :** 28,401

*Transferring 30 fungible tokens from MT contract with balance packing:*
- **Total gas cost :** 160,168
- **Gas Cost Per Transfer :** 5,338

Note that the balance packing calculation assumes tokens are IDs are neighbours, hence the result above is a cost lower bound. We can see that the balance packing can offer significant efficiency gain under the right circumstances, up to 10x saving compared to regular transfers and 5x–7x when using wrapper contracts for batch transfers. In addition, we are fairly convinced optimizing further these functions is possible without adding much complexity.

#### 2. Boolean Logic For "Approvals" Instead of Using `uints`
In practice, *approvals* are almost exclusively used when users want to interact with a contract and this contract want to control the users fund on their behalf (blogpost on this coming soon). Indeed, users usually set an "unlimited allowance" (e.g. `2^256-1`) to contracts so that they only need to set this allowance once (see [0x.js example](https://0xproject.com/docs/0x.js#token-setUnlimitedAllowanceAsync)). In addition, using a quantitative allowance approach means that every `transferFrom()` call will need to update the `allowance()` of each `n` token types transfered, adding a base cost of `n*5000` gas.

Instead, we use a simple boolean mapping via the `setApprovalForAll()` function. This function will set any address as an operator, meaning that it will be able to transfer all the users tokens stored in the MT contracts on their behalf. This is both simpler and more efficient than the currently proposed approach.

#### 3. Setting `totalSupply()` as an Optional View Function

Tracking the total supply of each token type on-chain means that minting cost will be increase by at least `5k` gas, up to `20k` gas for initial supply. This increases the minting cost significantly in the case of packed balance MT contracts, where the current cost of minting 100 token types is around `350k` gas (`3.5k` gas per token type minted) if all balances were at 0. Hence, tracking the total supply would more than double the gas cost per token type minted, which seems unreasonable. 

Regardless of usefulness, since contract event emission is deterministic, it is always possible for anyone to compute the total supply of all token types *off-chain* by syncing a full node and adding up all the minting events since the contract's block creation. Hence, even if not explicitly stored on-chain, anyone has the possibility to calculate accurately the total supply of all token types within an MT contract. In general, it is our opinion that better off-chain contract state querying tools would greatly benefit the community while significantly decreasing on-chain transaction costs. 

#### 4. Custodial limitations
In our implementation of the ERC-1155 standard, we restrict the amount of tokens a given address can hold for a given token ID. This is necessary for balance packing, which offers significant efficiency gains as shown above. However, this limitation can become a problem for custodial addresses like custodial decentralized exchanges, side-chains, plasma chains, etc. Indeed, a given contract is also limited by how many tokens it can hold without hitting overflow errors. This should be considered when choosing what the maximum balance per token ID should be, which is defined by the `IDS_BITS_SIZE` constant in [ERC1155.sol](https://github.com/horizon-games/multi-token-standard/blob/b671fd2a30ef5481ba1766887e7fd7ce97e9442a/contracts/token/ERC1155.sol#L38).

# Backwards Compatibility

This token standard is not backward compatible with most existing token standards.

# Test Cases
**INCOMPLETE** test cases written with truffle can be found in the [test](https://github.com/horizon-games/multi-token-standard/tree/master/test) folder of the current repository.

# Implementation
Current repository is one implementation example which utilizes balance packing. This implementation has not been audited and should not be used in production without proper security audit.


# References
1. **Template EIP** : https://github.com/ethereum/EIPs/blob/master/eip-X.md
2. **ERC-1155** : https://github.com/ethereum/EIPs/issues/1155
3. **Enjicoin Item Standard (ERC-1155)** : https://blog.enjincoin.io/erc-1155-the-crypto-item-standard-ac9cf1c5a226
4. **RFC 2119 Key Requirement Levels Words** : https://www.ietf.org/rfc/rfc2119.txt
5. **ERC-721** : [EIP-721](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md)
6. **ERC-223** : https://github.com/ethereum/EIPs/issues/223
7. **ERC-677** : https://github.com/ethereum/EIPs/issues/677
8. **Loom Plasma Cash Release** : https://medium.com/loom-network/plasma-cash-initial-release-plasma-backed-nfts-now-available-on-loom-network-sidechains-37976d0cfccd
9. **ERC-20** : https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md
10. **0x Unlimited Allowance Function** : https://0xproject.com/docs/0x.js#token-setUnlimitedAllowanceAsync
11. **ERC-165** : https://github.com/ethereum/EIPs/blob/master/EIPS/eip-165.md
