@0xsequence/erc-1155
====================

Sequence ERC-1155 contracts. For more information see, [github.com/0xsequence/erc-1155](https://github.com/0xsequence/erc-1155).


## Getting started

### Install

`yarn add @0xsequence/erc-1155` or `npm install @0xsequence/erc-1155`

### Usage from Solidity

```solidity
pragma solidity ^0.7.4;

import '@0xsequence/erc-1155/contracts/tokens/ERC1155/ERC1155.sol';

contract MyERC1155Token is ERC1155 {
  ...
}
```

## NOTES

`@0xsequence/erc-1155` includes the following files in its package distribution:

* `artifacts` -- hardhat output of contract compilation
* `typings` -- ethers v5 typings for easier interfacing with the contract abis


## LICENSE

Copyright (c) 2017-present [Horizon Blockchain Games Inc](https://horizon.io).

Licensed under [Apache-2.0](https://github.com/0xsequence/erc-1155/blob/master/LICENSE)
