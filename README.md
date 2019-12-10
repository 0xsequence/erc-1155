# Multi-Token Standard (ERC1155) implementation

An implementation of a Multi-Token contracts where all token types are fungible. 

# Simple Summary

An implementation example of a standard **Multi-Token (MT)** contract, which contains multiple classes of fungible tokens referenced by IDs. Standard interface discussion at [ERC-1155](https://github.com/ethereum/EIPs/issues/1155). 

# Installation

Run `npm install multi-token-standard` or `yarn add multi-token-standard` 

# Usage

To write your custom contracts, import ours and extend them through inheritance.

```solidity
pragma solidity ^0.5.0;

import 'multi-token-standard/contracts/tokens/ERC1155/ERC1155.sol';

contract MyERC1155Token is ERC1155 {
  ...
}
```

# Dev / running the tests

1. Install node v11 and yarn (npm install -g yarn)
2. `yarn install`
3. `yarn ganache`
4. in another terminal run, `yarn test` - executes test suite

# Abstract

The contracts in this repository follow a standard implementation of an ([ERC-1155](https://github.com/ethereum/EIPs/issues/1155) contract. This standard provides basic functionality to track and transfer multiple tokens and the interface provide an API other contracts and off-chain third parties can use.

ERC-1155 contracts keep track of many token balances, which can lead to significant efficiency gains when batch transferring multiple token classes simultaneously. This is particularly useful for fungible tokens that are likely to be transfered together, such as gaming items (cards, weapons, parts of objects, minerals, etc.). The possible efficiency gains are more significant if the amount of tokens each address can own is capped, as shown in this implementation examples.

This repository contains two main implementations of the ERC-1155 token standards: [ERC1155](<https://github.com/arcadeum/multi-token-standard/tree/master/contracts/tokens/ERC1155>) and [ERC155PackedBalance](<https://github.com/arcadeum/multi-token-standard/tree/master/contracts/tokens/ERC1155PackedBalance>). The latter implementation packs multiple balances within a single `uint256` using bitwise operations. This brings the cost of transferring 100 different token classes to `467,173` gas, an average of `4,671` gas per token type transfer. Still using MT, but without balance packing, transferring 100 different token types costs `2,763,399` gas, an average of `27,633` gas per token transfer. The latter is already an improvement over multiple fungible tokens that are stored on different contracts, since cross-contract calls have a base cost of 700 gas. This is ignoring the cost of initial approvals that would need to be set for each user and existing ERC-20 tokens.

# Specification

A detailed specification document can be found at [SPECIFICATIONS.md](<https://github.com/arcadeum/multi-token-standard/blob/master/SPECIFICATIONS.md>).
