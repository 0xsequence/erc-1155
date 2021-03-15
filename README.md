ERC-1155: Multi-Token Standard implementation
=============================================

This repository maintains a secure, efficient and standards-compliant implementation of the ERC-1155 token standard for Ethereum. The implementation was created during Horizon Blockchain Games' participation in the coauthoring of the [ERC-1155](https://github.com/ethereum/EIPs/issues/1155) and is used by [Skyweaver](https://www.skyweaver.net), [Opensea](https://github.com/ProjectOpenSea/opensea-erc1155#erc1155-implementation), and many other projects since its release.

The ERC-1155 token standard contains multiple classes of tokens referenced by IDs from non-fungible (max supply=1), to semi-fungible (supply=low), to highly fungible (supply=high). Standard interface discussion at [ERC-1155](https://github.com/ethereum/EIPs/issues/1155). 

## Getting started

### Install

`yarn add @0xsequence/erc-1155` or `npm install @0xsequence/erc-1155`

### Usage

```solidity
pragma solidity ^0.7.4;

import '@0xsequence/erc-1155/contracts/tokens/ERC1155/ERC1155.sol';

contract MyERC1155Token is ERC1155 {
  ...
}
```

## Description

The contracts in this repository follow a standard implementation of an ([ERC-1155](https://github.com/ethereum/EIPs/issues/1155) contract. This standard provides basic functionality to track and transfer multiple tokens and the interface provide an API other contracts and off-chain third parties can use.

ERC-1155 contracts keep track of many token balances, which can lead to significant efficiency gains when batch transferring multiple token classes simultaneously. This is particularly useful for fungible tokens that are likely to be transfered together, such as gaming items (cards, weapons, parts of objects, minerals, etc.). The possible efficiency gains are more significant if the amount of tokens each address can own is capped, as shown in this implementation examples.

This repository contains two main implementations of the ERC-1155 token standards: [ERC1155](<https://github.com/0xsequence/erc-1155/tree/master/contracts/tokens/ERC1155>) and [ERC155PackedBalance](<https://github.com/0xsequence/erc-1155/tree/master/contracts/tokens/ERC1155PackedBalance>). The latter implementation packs multiple balances within a single `uint256` using bitwise operations. This brings the cost of transferring 100 different token classes to `467,173` gas, an average of `4,671` gas per token type transfer. Still using MT, but without balance packing, transferring 100 different token types costs `2,763,399` gas, an average of `27,633` gas per token transfer. The latter is already an improvement over multiple fungible tokens that are stored on different contracts, since cross-contract calls have a base cost of 700 gas. This is ignoring the cost of initial approvals that would need to be set for each user and existing ERC-20 tokens.

## Specification

A detailed specification document can be found at [SPECIFICATIONS.md](<https://github.com/0xsequence/erc-1155/blob/master/SPECIFICATIONS.md>).

## Security Review

`@0xsequence/erc-1155` has been audited by two independant parties and all issues discovered were addressed. 
- [Agustín Aguilar**](https://github.com/0xsequence/erc-1155/blob/master/audits/Security_Audit_Horizon_Games_23-12-19_2.pdf)
- [Consensys Diligence](https://github.com/0xsequence/erc-1155/blob/master/audits/horizon-games-audit-2020-02.pdf) 

** Agustín was hired as a full-time employee at Horizon after the audit was completed. Agustín did not take part in the writing of multi-token-standard contracts.


## Dev env & release

This repository is configured as a yarn workspace, and has multiple pacakge.json files. Specifically,
we have the root ./package.json for the development environment, contract compilation and testing. Contract
source code and distribution files are packaged in "src/package.json".

To release a new version, make sure to bump the version, tag it, and run `yarn release`. The `release` command
will publish the `@0xsequence/erc-1155` package in the "src/" folder, separate from the root package. The advantage
here is that application developers who consume `@0xsequence/erc-1155` aren't required to install any of the devDependencies
in their toolchains as our build and contract packages are separated.

## LICENSE

Copyright (c) 2017-present [Horizon Blockchain Games Inc](https://horizon.io).

Licensed under [Apache-2.0](./LICENSE)
