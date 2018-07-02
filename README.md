# Multi-Fungible-Tokens (MFT) contract for Ethereum

Multi Fungible Token interface and implementation for Ethereum.

# Dev / running the tests

1. Install node v8 or v10 and yarn
2. `yarn install`
3. `yarn test` - executes test suite

# Simple Summary

An implementation example of a standard **Multi-Fungible Tokens (MFT)** contract, which contains multiple types of fungible tokens referenced by IDs. Standard interface discussion at [ERC-1155](https://github.com/ethereum/EIPs/issues/1155). 

# Abstract

The contracts in this repository follow a standard implementation of an MFT contract. This standard provides basic functionality to track and transfer MFTs and the interface provide an API other contracts and off-chain third parties can use.

MFT contracts keep track of many token balances, which can lead to significant efficiency gains when batch transferring multiple token types simultaneously. This is particularly useful for fungible tokens that are likely to be transfered together, such as gaming items (cards, weapons, parts of objects, minerals, etc.). The possible efficiency gains are more significant if the amount of tokens each address can own is capped, as shown in this implementation examples. 

With the current implementation, which packs multiple balances within a single `uint256` using bitwise operations, transferring 100 different token types costs 363,227 gas, an average of 3,632 gas per token type transfer. Still using MFTs, but without balance packing, transferring 100 different token types costs 1,757,544 gas, an average of 17,575 gas per token transfer. The latter is already an improvement over multiple fungible tokens that are stored on different contracts, since cross-contract calls have a base cost of 700 gas. This is ignoring the cost of initial approvals that would need to be set for each user and existing ERC-20 tokens. MFT contracts also benefit from allowing users to do a single `setApprovalForAll()` call, which will allow an operator to transfer on the users behalf all the contract's token types. 

# Motivation

Various applications would benefit from having a single contract keeping track of multiple token types. MFTs Agreeing on a standard interface allows wallet/broker/auction applications to work with any MFT contract on Ethereum. 

# Specification

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in RFC 2119.

```solidity
pragma solidity ^0.4.24;

/**
* @title ERC-XXXX Multi-Fungible Token Standard
* @dev 
*   Note: the ERC-165 identifier for this interface is ???TODO???
*/
interface ERCXXXX {
  // REQUIRED events 
  event Transfer(address from, address to, uint256 tokenType, uint256 amount);
  event BatchTransfer(address from, address to, uint256[] tokenTypes, uint256[] amounts);
  event ApprovalForAll(address tokensOwner, address operator, bool approved);

  // REQUIRED state functions
  function transferFrom(address _from, address _to, uint256 _tokenType, uint256 _amount) external;
  function safeTransferFrom(address _from, address _to, uint256 _tokenType, uint256 _amount, bytes _data) external;
  function batchTransferFrom(address _to, uint256[] _tokenTypes, uint256[] _amounts) external;
  function safeBatchTransferFrom(address _from, address _to, uint256[] _tokenTypes, uint256[] _amounts, bytes _data) public;
  function setApprovalForAll(address _operator, address _tokenHolder) external;

  // REQUIRED View Functions
  function balanceOf(address _address, uint256 _type) external view returns (uint256);
  function isApprovedForAll(address _owner, address _operator) external view returns (bool isOperator);

  /** Optional View Functions
  function totalSupply(uint256 _tokenType) external view returns (uint256);
  function name(uint256 _tokenType) external view returns (string);
  function symbol(uint256 _tokenType) external view returns (string);
  function decimals(uint256 _tokenType) external view returns (uint8);
  */
}

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

A wallet/broker/auction application MUST implement the **wallet interface** if it will accept safe transfers.

```solidity
 // @dev Note: the ERC-165 identifier for this interface is 0x150b7a02.
interface ERCXXXXTokenReceiver {

  function onERCXXXXReceived(address _operator, address _from, uint256 _tokenType, uint256 _amount, bytes _data) external returns(bytes4);
  function onERCXXXXBatchReceived(address _operator, address _from, uint256[] _tokenTypes, uint256[] _amounts, bytes _data) external returns(bytes4)
}
```

# Rationale

The present interface diverges from the interface proposed in [ERC-1155]( https://github.com/ethereum/EIPs/issues/1155) in a few ways. 



#### 1. Removing the `transfer()` Function

In concordance to [EIP-721](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md), the `transfer()` function has been removed for simplicity and explicitly. `transfer()` is a special case of `transferFrom()` where the `_from == msg.sender`. Removing this special case and encouraging the more explicit transfer function form, `transferFrom()`, both simplifies user experience and reduces the chance of human errors. 

#### 2. Adding `safeTransfer` Methods

As discussed in various ERCs, such as [223](https://github.com/ethereum/EIPs/issues/223), [677](https://github.com/ethereum/EIPs/issues/677) and [721](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md), verifying if the recipient is a contract and if it is, whether it supports a given token standard is both useful and secure. Useful because contracts without a `onERCXXXXReceived()` method can not be notified that some tokens were transfered to it and therefore can not react properly. For instance, [Loom](https://loomx.io/) [released a plasma cash](https://medium.com/loom-network/plasma-cash-initial-release-plasma-backed-nfts-now-available-on-loom-network-sidechains-37976d0cfccd) implementation draft supporting ERC-721 tokens where users need to transfer their tokens by calling the `safeTransferFrom()` function. This function will then call the `deposit()` function on the plasma contract, properly depositing the transfered token. Without the implementation of the ``safeTransferFrom()`, users would first need to call the `approveForAll()` function to set the plasma contract as an operator and then make a second transaction to call the `deposit()` function on the plasma contract. 

Verifying whether the recipient is a contract or not mitigate the risk of transferring tokens to an address where they would be permanently frozen, hence the term `safe`. 

#### 3. Boolean Logic For "Approvals" Instead of Using `uints`

The current [ERC-1155]( https://github.com/ethereum/EIPs/issues/1155) interface uses the [ERC-20](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md) approval logic which is somewhat cumbersome and inefficient. In practice, *approvals* are almost exclusively used when users want to interact with a contract and this contract want to control the users fund on their behalf. Indeed, users usually set an "unlimited allowance" (e.g. `2^256-1`) to contracts so that they only need to set this allowance once (see [0x.js example](https://0xproject.com/docs/0x.js#token-setUnlimitedAllowanceAsync)). In addition, using a quantitative allowance approach means that every `transferFrom()` call will need to update the `allowance()` of each `n` token types transfered, adding a base cost of `n*5000` gas. 

Instead, we propose using a simple boolean mapping via the `setApprovalForAll()` function. This function will set any address as an operator, meaning that it will be able to transfer all the users tokens stored in the MFT contracts on their behalf. This is both simpler and more efficient than the currently proposed approach. In addition, the interface is simplified to one "approval" function instead of six. We would've preferred using the term "operator" in the function name itself, such as `setOperator()`, but decided otherwise to conform to other standards like ERC-721.  Stronger security could be added by only allowing contracts to be operators, although this does not seem necessary.

#### 4. Setting `totalSupply()` as an Optional View Function

Tracking the total supply of each token type on-chain means that minting cost will be increase by at least `5k` gas, up to `20k` gas for initial supply. This increase the minting cost significantly in the case of packed balance MFT contracts, where the current cost of minting 100 token types is around `350k` gas (`3.5k` gas per token type minted) if all balances were at 0. Hence, tracking the total supply would more than double the gas cost per token type minted, which seems unreasonable. 

In addition, it is also not clear how useful it is for third parties to know the total supply of each token type. The only third parties we know of that display total supplies are block chain explorers (e.g. [Etherscan](https://etherscan.io/)) and market trackers (e.g. [CoinMarketCap](https://coinmarketcap.com/)). To the best of our knowledge, we are not aware of any exchange or wallet using this information. 

Regardless of usefulness, since contract event emission is deterministic, it is always possible for anyone to compute the total supply of all token types *off-chain* by syncing a full node and adding up all the minting events since the contract's block creation. Hence, even if not explicitly stored on-chain, anyone has the possibility to calculate accurately the total supply of all token types within an MFT contract. In general, it is our opinion that better off-chain contract state querying tools would greatly benefit the community while significantly decreasing on-chain transaction costs. 

#### 5. Only Fungible Tokens vs Mixed Fungible and Non-Fungible Tokens

The current [ERC-1155]( https://github.com/ethereum/EIPs/issues/1155) standard discusses how this type of contract can support fungible tokens *and* Non-Fungible Tokens (NFTs). While this is an interesting use case, **we believe two standard interfaces would be more appropriate** ; **fungible tokens only** and **mix of fungible tokens and NFTs.** We believe that all mix implementations will implement the "optional" NFT functions proposed, or at the very least the`ownerOf(_itemId)` function. Indeed, the latter is mandatory in the ERC-721 standard, which is currently the most popular NFT standard interface, and is a very useful function when the total number of token ID becomes large. Hence, it make more sense for us to have an explicit difference between fungible tokens only implementations and mixed ones, where the mixed implementation *should* implement the `ownerOf(_itemID)` function among others.

[ERC-165](<https://github.com/ethereum/EIPs/blob/master/EIPS/eip-165.md>) could be used to distinguish these two standards. 

# Backwards Compatibility

This token standard is not backward compatible with most existing token standards.

# Test Cases
**INCOMPLETE** test cases written with truffle can be found in the [test](https://github.com/horizon-games/multi-fungible-tokens/tree/master/test) folder of the current repository. 

# Implementation
Current repository is one implementation example which utilizes balance packing. This implementation has not been audited and should not be used in production without proper security audit.


# References
1. Template EIP : https://github.com/ethereum/EIPs/blob/master/eip-X.md
2. ERC-1155 : https://github.com/ethereum/EIPs/issues/1155
3. Enjicoin Item Standard (ERC-1155) : https://blog.enjincoin.io/erc-1155-the-crypto-item-standard-ac9cf1c5a226
4. RFC 2119 Key words for use in RFCs to Indicate Requirement Levels. https://www.ietf.org/rfc/rfc2119.txt
5. [EIP-721](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md)
6. ERC-223 : https://github.com/ethereum/EIPs/issues/223 
7. ERC-677 : https://github.com/ethereum/EIPs/issues/677
8. Loom Plasma cash release : https://medium.com/loom-network/plasma-cash-initial-release-plasma-backed-nfts-now-available-on-loom-network-sidechains-37976d0cfccd
9. ERC-20 : https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md
10. 0x Unlimited Allowance Function : https://0xproject.com/docs/0x.js#token-setUnlimitedAllowanceAsync
11. ERC-165 - https://github.com/ethereum/EIPs/blob/master/EIPS/eip-165.md 
