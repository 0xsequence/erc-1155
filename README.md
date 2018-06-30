# Multi-Fungible-Tokens (MFT) contract for Ethereum

Multi Fungible Token interface and implementation for Ethereum.

# Dev / running the tests

1. Install node v8 or v10 and yarn
2. `yarn install`
3. `yarn test` - executes test suite

# Simple Summary
An implementation example of a standard Multi-Fungible Tokens contract, which contains
multiple types of fungible tokens referenced by IDs. 

# Abstract
The follow standard allows for the implementation of a standard API for MFTs within smart contracts.This standard provides basic functionality to track and transfer MFTs.

MFT contracts keep track of many token balances, which can lead to significant efficiency gains when batch transfering multiple token types simultaneously. This is particularly useful for fungible tokens that are likely to be transfered together, such as gaming items (cards, weapons, parts of objects, minerals, etc.). The possible efficiency gains are even more pronounced if the amount of tokens each address can own is capped, as shown in this implementation examples. 

Our implementation, which pack multiple balances within a single `uint256` using bitwise operations, transfering 100 different token types costs 363,227 gas, an average of 3,632 gas per token transfer. Still using MFTs, but without balance packing, transfering 100 different token types cost 1,757,544 gas, an average of 17,575 gas per token transfer. The latter is already an improvement over transfer multiple fungible tokens that are stored on different contracts, since cross-contract calls have a base cost of 700 gas, which is a minimum additional cost per token type transfered. 


# Other

* See also related work by Enjicoin team at https://github.com/ethereum/EIPs/issues/1155
and https://blog.enjincoin.io/erc-1155-the-crypto-item-standard-ac9cf1c5a226
