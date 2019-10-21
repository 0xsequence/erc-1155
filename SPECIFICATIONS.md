# 0x protocol 2.0.0 specification

## Table of contents

1.  [Overview](#overview)
1.  [Contracts](#contracts)
    1.  [Exchange](#exchange)
    1.  [AssetProxy](#assetproxy)
        1. [ERC20Proxy](#erc20proxy)
        1. [ERC721Proxy](#erc721proxy)
        1. [MultiAssetProxy](#multiassetproxy)
    1.  [AssetProxyOwner](#assetproxyowner)
1.  [Contract Interactions](#contract-interactions)
    1.  [Trade settlement](#trade-settlement)
    1.  [Upgrading the Exchange contract](#upgrading-the-exchange-contract)
    1.  [Upgrading the AssetProxyOwner contract](#upgrading-the-assetproxyowner-contract)
    1.  [Adding new AssetProxy contracts](#adding-new-assetproxy-contracts)
1.  [Orders](#orders)
    1.  [Message format](#order-message-format)
    1.  [Hashing an order](#hashing-an-order)
    1.  [Creating an order](#creating-an-order)
    1.  [Filling orders](#filling-orders)
    1.  [Cancelling orders](#cancelling-orders)
    1.  [Querying state of an order](#querying-state-of-an-order)
1.  [Transactions](#transactions)
    1.  [Message format](#transaction-message-format)
    1.  [Hash of a transaction](#hash-of-a-transaction)
    1.  [Creating a transaction](#creating-a-transaction)
    1.  [Executing a transaction](#executing-a-transaction)
    1.  [Filter contracts](#filter-contracts)
1.  [Signatures](#signatures)
    1.  [Validating signatures](#validating-signatures)
    1.  [Signature types](#signature-types)
1.  [Events](#events)
    1.  [Exchange events](#exchange-events)
    1.  [AssetProxy events](#assetproxy-events)
    1.  [AssetProxyOwner events](#assetproxyowner-events)
1.  [ithTypes](#types)
1.  [Standard relayer API](#standard-relayer-api)
1.  [Miscellaneous](#miscellaneous)
    1.  [EIP712 usage](#eip712-usage)
    1.  [Optimizing calldata](#optimizing-calldata)
    1.  [ecrecover usage](#ecrecover-usage)
    1.  [Reentrancy protection](#reentrancy-protection)

# Overview

This repository contains two implementations of the **ERC-1155** token standard. The main difference compared to **ERC-20** and **ERC-721** is that while **ERC-20** has a logic of `erc20.transfer(to, amount)` and **ERC-721** a logic of `erc721.transfer(to, id)`, **ERC-1155** has a logic of `erc1155.transfer(to, id, amount)` enabling the management of multiple fungible assets in a single contract. Some token ids in ERC-1155 could have a maximum supply of 1 (hence unique) while other could have no maximum supply and behave like a typical fungible token.

One of the **ERC-1155** implementation in this repository has a "packed balance" approach, meaning that some token IDs share the same uint256 storage slot. This permits cheaper balance update since token id balances can be updated in a single SSTORE operation, but it impose a lower maximum supply on tokens. The other implementation does not have this "packed balance" approach hence each token id use a full `uint256` storage slot for the balances.

In addition to the methods specified in the [ERC-1155 standard](<https://github.com/ethereum/eips/issues/1155>), the implementations in this repository support native-metatransactions methods, meaning that methods can be called on behalf of any users so long as they provide a corresponding valid signature. This enable users to delegate the transaction execution to a third party securely. Meta-transactions can be executed for a fee specified by the user, paid in arbitrary ERC-20 or ERC-1155 tokens, but these fees can be omitted if desired.

# Contracts

### ERC1155.sol & ERC1155PackedBalance.sol

The main purpose of this contract is to manage transfer, balances and approval methods. For an in-depth specification of this contract, see the [ERC-1155 official specification](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1155.md). The ERC1155PackedBalance.sol contract uses a packed balance approach (see [#???](???) for more information on packed balance approach).

### ERC1155Meta.sol & ERC1155MetaPackedBalance.sol

This contract is an extension of the previous contract, [ERC1155](#erc1155). This contract implements meta-transaction methods, enabling users to delegate their transfers and approvals to a third party via corresponding valid signed messages. The contract enables any address to transfer and set an approval on behalf of a user given that user signed a corresponding message. See [???](???) for more information on the message and signature formatting for metatransactions. The ERC1155MetaPackedBalance.sol contract uses a packed balance approach (see [#???](???) for more information on packed balance approach).

### ERC1155Metadata.sol 

This contract handles metadata related methods, which are not mandatory with respect to the ERC-1155 standard. It enables logging URI changes for certain ID and assumes a static base URL and deterministic URI for the various IDs (e.g. `https://mymetadata.net/id/X` where X is an arbitrary ID) .

### ERC1155MintBurn.sol & ERC1155MintBurnPackedBalance.sol

This contract is an extension of the previous contract, [ERC1155](#erc1155). This contract implements minting and burning related methods, which are not mandated by the ERC-1155 standard. The minting and burning methods are `internal` and a parent contract must invoke them. This design choice was made to let developers using these methods set their own authentication gates. The ERC1155MintBurnPackedBalance.sol contract uses a packed balance approach (see [#???](???) for more information on packed balance approach).





```solidity
// 0x02571792
bytes4 ERC721_SELECTOR = bytes4(keccak256("ERC721Token(address,uint256)"));
```

The data is then encoded as:

| Offset | Length | Contents                                         |
| ------ | ------ | ------------------------------------------------ |
| 0x00   | 4      | ERC721 proxy id (always 0x02571792)              |
| 0x04   | 32     | Address of ERC721 token, left padded with zeroes |
| 0x24   | 32     | tokenId of ERC721 token                          |



# Contract Interactions

All methods should be free of arithmetic overflows and underflows.

## Transferring Tokens

All methods that change the balance(s) of an (or multiple) address(es) are referred as transfers. 

In [ERC1155.sol & ERC1155PackedBalance.sol](#erc1155.sol-&-erc1155packedbalance.sol), there are two methods to transfer tokens:

```Solidity
/**
 * @notice Transfers amount of an _id from the _from address to the _to address specified
 * @dev MUST emit TransferSingle event on success
 * Caller MUST be approved to manage the _from account's tokens (see isApprovedForAll)
 * MUST throw if `_to` is the zero address
 * MUST throw if balance of sender for token `_id` is lower than the `_amount` sent
 * MUST throw on any other error
 * When transfer is complete, this function MUST check if `_to` is a smart contract (code size > 0). If so, it MUST call `onERC1155Received` on `_to` and revert if the return amount is not `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))`
 * @param _from    Source address
 * @param _to      Target address
 * @param _id      ID of the token type
 * @param _amount  Transfered amount
 * @param _data    Additional data with no specified format, sent in call to `_to`
 */
function safeTransferFrom(address _from, address _to, uint256 _id, uint256 _amount, bytes calldata _data) external;

/**
 * @notice Send multiple types of Tokens from the _from address to the _to address (with safety call)
 * @dev MUST emit TransferBatch event on success
 * Caller MUST be approved to manage the _from account's tokens (see isApprovedForAll)
 * MUST throw if `_to` is the zero address
 * MUST throw if length of `_ids` is not the same as length of `_amounts`
 * MUST throw if any of the balance of sender for token `_ids` is lower than the respective `_amounts` sent
 * MUST throw on any other error
 * When transfer is complete, this function MUST check if `_to` is a smart contract (code size > 0). If so, it MUST call `onERC1155BatchReceived` on `_to` and revert if the return amount is not `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))`
 * Transfers and events MUST occur in the array order they were submitted (_ids[0] before _ids[1], etc)
 * @param _from     Source addresses
 * @param _to       Target addresses
 * @param _ids      IDs of each token type
 * @param _amounts  Transfer amounts per token type
 * @param _data     Additional data with no specified format, sent in call to `_to`
 */
function safeBatchTransferFrom(address _from, address _to, uint256[] calldata _ids, uint256[] calldata _amounts, bytes calldata _data) external;
```

---

[ERC1155Meta.sol & ERC1155MetaPackedBalance.sol](#erc1155meta.sol-&-erc1155metapackedbalance.sol) have two additional methods to transfer tokens. These methods MUST follow the conditions specified in `safeTransferFrom()` and `safeBatchTransferFrom()`, in addition to other conditions specified below:

```
/**
 * @notice Allows anyone with a valid signature to transfer _amount amount of a token _id on the bahalf of _from
 * @dev MUST meet the conditions specified in safeTransferFrom()
 * @dev Signature provided MUST be valid (See Signature section)
 * @dev Gas consumed MUST be reimbursed according to signed message if _isGasFee is true
 * @param _from     Source address
 * @param _to       Target address
 * @param _id       ID of the token type
 * @param _amount   Transfered amount
 * @param _isGasFee Whether gas is reimbursed to executor or not
 * @param _data     Encodes a meta transfer indicator, signature, gas payment receipt and extra transfer data
 */
function metaSafeTransferFrom(address _from, address _to, uint256 _id, uint256 _amount, bool _isGasFee, bytes calldata _data) external;

/**
 * @notice Allows anyone with a valid signature to transfer multiple types of tokens on the bahalf of _from
 * @dev MUST meet the conditions specified in safeBatchTransferFrom()
 * @dev Signature provided MUST be valid (See Signature section)
 * @dev Gas consumed MUST be reimbursed according to signed message if _isGasFee is true
 * @param _from     Source addresses
 * @param _to       Target addresses
 * @param _ids      IDs of each token type
 * @param _amounts  Transfer amounts per token type
 * @param _data     Encodes a meta transfer indicator, signature, gas payment receipt and extra transfer data
 */
function metaSafeBatchTransferFrom(address _from, address _to, uint256[] calldata _ids, uint256[] calldata _amounts, bool _isGasFee, bytes calldata _data) external;
```

For how the data must be encoded in the `_data` byte arrays, see [???](???). 

For what constitutes a valid signature, see [???](???).

---

[ERC1155MintBurn.sol & ERC1155MintBurnPackedBalance.sol](#erc1155mintburn.sol-&-erc1155mintburnpackedbalance.sol) have four methods that modify balances. These methods need to be inherited by a child contract and these child contract should have tight access control. The supply logic for token ids should be specified by child contract. 

```solidity
/****************************************|
|            Minting Functions           |
|_______________________________________*/

/**
 * @notice Mint _amount of tokens of a given id
 * @dev MUST emit a TransferSingle event on success with _from field set as address 0x0
 * When transfer is complete, this function MUST check if `_to` is a smart contract (code size > 0). If so, it MUST call `onERC1155Received` on `_to` and revert if the return amount is not `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))`
 * MUST increase the balance of id by the correct amount
 * @param _to     The address to mint tokens to
 * @param _id     Token id to mint
 * @param _amount The amount to be minted
 * @param _data   Data to pass if receiver is a contract
 */
function _mint(address _to, uint256 _id, uint256 _amount, bytes memory _data) internal;

/**
 * @notice Mint tokens for each ids in _ids
 * @dev MUST emit TransferBatch event on success with _from field set as address 0x0
 * When transfer is complete, this function MUST check if `_to` is a smart contract (code size > 0). If so, it MUST call `onERC1155BatchReceived` on `_to` and revert if the return amount is not `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))`
 * MUST increase the balance of each id by the correct amount
 * @param _to      The address to mint tokens to
 * @param _ids     Array of ids to mint
 * @param _amounts Array of amount of tokens to mint per id
 * @param _data    Data to pass if receiver is contract
 */
function _batchMint(address _to, uint256[] memory _ids, uint256[] memory _amounts, bytes memory _data) internal;

/****************************************|
|            Burning Functions           |
|_______________________________________*/

/**
 * @notice Burn _amount of tokens of a given token id
 * @dev MUST emit a TransferSingle event on success with _to field set as address 0x0
 * MUST decrease the balance of id by the correct amount
 * @param _from    The address to burn tokens from
 * @param _id      Token id to burn
 * @param _amount  The amount to be burned
 */
function _burn(address _from, uint256 _id, uint256 _amount) internal;
  
/**
 * @notice Burn tokens of given token id for each (_ids[i], _amounts[i]) pair
 * @dev MUST emit TransferBatch event on success with _to field set as address 0x0
 * MUST decrease the balance of each id by the correct amount
 * @param _from     The address to burn tokens from
 * @param _ids      Array of token ids to burn
 * @param _amounts  Array of the amount to be burned
 */
function _batchBurn(address _from, uint256[] memory _ids, uint256[] memory _amounts) internal;
```



## Managing Approvals

In [ERC1155.sol & ERC1155PackedBalance.sol](#erc1155.sol-&-erc1155packedbalance.sol), there is one method to set approvals:

```solidity
/**
 * @notice Enable or disable approval for a third party ("operator") to manage all of caller's tokens
 * @dev MUST emit the ApprovalForAll event on success
 * @param _operator  Address to add to the set of authorized operators
 * @param _approved  True if the operator is approved, false to revoke approval
 */
function setApprovalForAll(address _operator, bool _approved) external;
```



## Managing Metadata

The methods to manage token id metadata can be found in the [ERC1155Metadata.sol](#erc1155metadata.sol) contract. URI are assumed to be deterministically determined based on a `baseURL` and their id, such that `uri(id) => baseURL + id + ".json"`. For instance, if the baseURL is `https://ethereum.net/metadata/id/` and the id is `77`, then `uri(77)` should return `https://ethereum.net/metadata/id/77.json`. A child contract must call these methods for them to be used.

```solidity
/**
 * @notice Will update the base URL of token's URI
 * @param _newBaseMetadataURI New base URL of token's URI
 */
function _setBaseMetadataURI(string memory _newBaseMetadataURI) internal;

/**
 * @notice Will emit default URI log event for corresponding token _id
 * @param _tokenIDs Array of IDs of tokens to log default URI
 */
function _logURIs(uint256[] memory _tokenIDs) internal;
```

# Packed Balance

Here will be described how balance packing works in this implementation of the ERC-1155 token standard. While normally each token balance uses a single `uint256` storage slot, with balance packing multiple token ids will share the same `uint256` storage slot. In the contract code, we refer to these `uint256` storage slots as "bins", where each bins contains multiple values. This permits cheaper balance storage updates and reads since only one `SSTORE` and `SLOAD` operations are used to update or read multiple token ids balance for a given address. How many ids will be stored per `uint256` is specified by 

```solidity
uint256 internal constant IDS_BITS_SIZE = 32;
```

In this example, each token id balance uses 32 bits, or 1/8 of a `uint256` storage slot:

```
0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
  [ ID 7 ][ ID 6 ][ ID 5 ][ ID 4 ][ ID 3 ][ ID 2 ][ ID 1 ][ ID 0 ]
```

For instance, if Bob had **four** token **#0**, **seven** token **#3** and **twenty-seven** token **#7**, the value at the storage slot they share should be 

```
0x0000001b00000000000000000000000000000007000000000000000000000004
  [ ID 7 ][ ID 6 ][ ID 5 ][ ID 4 ][ ID 3 ][ ID 2 ][ ID 1 ][ ID 0 ]
```

Since each of these balance values are limited to IDS_BITS_SIZE bits per token ID, this means that values in each bin can't exceed an amount of $2^{z-1}$ , where $z$ is the `IDS_BITS_SIZE`. Overflow and underflow MUST lead to a revert. It is important to note that `mint` and `burn` operations respect these rules and not lead to overflows nor underflows.

## Relevant Methods

Most important methods that handle the balance packing logic can be found in the [ERC1155PackedBalance.sol](???) contract.

### *getIDBinIndex(uint256 _id)*

This method will return the `uint256` storage slot and the index within that storage slot token `_id` occupies. 

### *getValueInBin(uint256 _binAmount, uint256 _index)*

This method will return the value at position `_index` for the provided `uint256` bin referred to as `_binAmount`. 

### *_viewUpdateBinValue(uint256 _binValues, uint256 _index, uint256 _amount, Operations _operation)*

This method will return the updated `_binValues` after the value at `_index` was updated. `_amount` can either be added to or subtracted from the value at `_index`. Whether `_amount` is added or subtracted is specified by `_operation`. This method does not perform an `SSTORE` nor an `SLOAD` operation.

```solidity
// Operations for _updateIDBalance
enum Operations { Add, Sub }
```

The `_viewUpdateBinValue()` method verifies for overflows or underflows depending on whether the operation is an addition or subtraction :

```solidity
if (_operation == Operations.Add) {
  require(((_binValues >> shift) & mask) + _amount < 2**IDS_BITS_SIZE);
  ...

} else if (_operation == Operations.Sub) {
  require(((_binValues >> shift) & mask) >= _amount);
  ...
}
```

### *_updateIDBalance(address _address, uint256 _id, uint256 _amount, Operations _operation)*

This method will directly update the corresponding storage slot where `_id` is registered for the user `_address`. The `_amount` provided will either be added or subtracted based on the `_operation` provided. This methods directly update the storage slot via an `SSTORE` operation. 

### _safeBatchTransferFrom(...) and _batchMint(...)

These method in the [ERC1155PackedBalance](???)  and [ERC1155MintBurnPackedBalance.sol](???) contracts (respectively) take advantage of the packed balances by trying to only read and write once per storage slot when transferring or minting multiple assets. To achieve this, the methods assume the `_ids` provided as argument are sorted in such a way that ids in the same storage slots are consecutive. 

```solidity
for (uint256 i = 1; i < nTransfer; i++) {
  // Get the storage slot (or bin) and corresponding index for _ids[i]
  (bin, index) = getIDBinIndex(_ids[i]);

  // If new storage slot
  if (bin != lastBin) {
    // Update storage balance of previous bin
    balances[_from][lastBin] = balFrom;
    balances[_to][lastBin] = balTo;
	
	// Load in memory new bins
    balFrom = balances[_from][bin];
    balTo = balances[_to][bin];

    // lastBin updated to be the most recent bin queried
    lastBin = bin;
  }

  ...
}
```



# Meta-transactions

## Order message format

An order message consists of the following parameters:

| Parameter                       | Type    | Description                                                                                                                                     |
| ------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| makerAddress                    | address | Address that created the order.                                                                                                                 |
| takerAddress                    | address | Address that is allowed to fill the order. If set to 0, any address is allowed to fill the order.                                               |
| feeRecipientAddress             | address | Address that will receive fees when order is filled.                                                                                            |
| [senderAddress](#senderaddress) | address | Address that is allowed to call Exchange contract methods that affect this order. If set to 0, any address is allowed to call these methods.    |
| makerAssetAmount                | uint256 | Amount of makerAsset being offered by maker. Must be greater than 0.                                                                            |
| takerAssetAmount                | uint256 | Amount of takerAsset being bid on by maker. Must be greater than 0.                                                                             |
| makerFee                        | uint256 | Amount of ZRX paid to feeRecipient by maker when order is filled. If set to 0, no transfer of ZRX from maker to feeRecipient will be attempted. |
| takerFee                        | uint256 | Amount of ZRX paid to feeRecipient by taker when order is filled. If set to 0, no transfer of ZRX from taker to feeRecipient will be attempted. |
| expirationTimeSeconds           | uint256 | Timestamp in seconds at which order expires.                                                                                                    |
| [salt](#salt)                   | uint256 | Arbitrary number to facilitate uniqueness of the order's hash.                                                                                  |
| [makerAssetData](#assetdata)    | bytes   | ABIv2 encoded data that can be decoded by a specified proxy contract when transferring makerAsset.                                              |
| [takerAssetData](#assetdata)    | bytes   | ABIv2 encoded data that can be decoded by a specified proxy contract when transferring takerAsset.                                              |

### senderAddress

If the `senderAddress` of an order is not set to 0, only that address may call [`Exchange`](#exchange) contract methods that affect that order. See the [filter contracts examples](#filter-contracts) for more information.

### salt

An order's `salt` parameter has two main usecases:

- To ensure uniqueness within an order's hash.
- To be used in combination with [`cancelOrdersUpTo`](#cancelordersupto). When creating an order, the `salt` value _should_ be equal to the value of the current timestamp in milliseconds. This allows maker to create 1000 orders with the same parameters per second. Note that although this is part of the protocol specification, there is currently no way to enforce this usage and `salt` values should _not_ be relied upon as a source of truth.

### assetData

The `makerAssetData` and `takerAssetData` fields of an order contain information specific to that asset. These fields are encoded using [ABIv2](http://solidity.readthedocs.io/en/latest/abi-spec.html) with a 4 byte id that references the proxy that is intended to decode the data. See the [`ERC20Proxy`](#erc20proxy) and [`ERC721Proxy`](#erc721proxy) sections for the layouts of the `assetData` fields for each `AssetProxy` contract.

## Hashing an order

The hash of an order is used as a unique identifier of that order. An order is hashed according to the [EIP712 specification](#https://github.com/ethereum/EIPs/pull/712/files). See the [EIP712 Usage](#eip712-usage) section for information on how to calculate the required domain separator for hashing an order.

```
bytes32 constant EIP712_ORDER_SCHEMA_HASH = keccak256(abi.encodePacked(
    "Order(",
    "address makerAddress,",
    "address takerAddress,",
    "address feeRecipientAddress,",
    "address senderAddress,",
    "uint256 makerAssetAmount,",
    "uint256 takerAssetAmount,",
    "uint256 makerFee,",
    "uint256 takerFee,",
    "uint256 expirationTimeSeconds,",
    "uint256 salt,",
    "bytes makerAssetData,",
    "bytes takerAssetData",
    ")"
));

bytes32 orderHash = keccak256(abi.encodePacked(
    EIP191_HEADER,
    EIP712_DOMAIN_HASH,
    keccak256(abi.encodePacked(
        EIP712_ORDER_SCHEMA_HASH,
        bytes32(order.makerAddress),
        bytes32(order.takerAddress),
        bytes32(order.feeRecipientAddress),
        bytes32(order.senderAddress),
        order.makerAssetAmount,
        order.takerAssetAmount,
        order.makerFee,
        order.takerFee,
        order.expirationTimeSeconds,
        order.salt,
        keccak256(order.makerAssetData),
        keccak256(order.takerAssetData)
    ))
));
```

## Creating an order

An order may only be filled if it can be paired with an associated valid signature. Signatures are only validated the first time an order is filled. For later fills, no signature must be submitted. An order's hash must be signed with a [supported signature type](#signature-types).



## Cancelling orders

### cancelOrder

`cancelOrder` cancels the specified order. Partial cancels are not allowed.

`cancelOrder` will revert under the following conditions:

- The `makerAssetAmount` or `takerAssetAmount` specified in the order are equal to 0.
- The caller of `cancelOrder` is different from the `senderAddress` specified in the order (unless `senderAddress == address(0)`).
- The maker of the order has not authorized the cancel, either by calling `cancelOrder` through an Ethereum transaction or a [0x transaction](#transactions).
- The order has expired.
- The order has already been cancelled.

If successful, `cancelOrder` will emit a [`Cancel`](#cancel) event.

```
/// @dev After calling, the order can not be filled anymore.
/// @param order Order struct containing order specifications.
/// @return True if the order state changed to cancelled.
///         False if the transaction was already cancelled or expired.
function cancelOrder(Order memory order)
    public;
```



# Transactions

Transaction messages exist for the purpose of calling methods on the [`Exchange`](#exchange) contract in the context of another address (see [ZEIP18](https://github.com/0xProject/ZEIPs/issues/18)). This is especially useful for implementing [filter contracts](#filter-contracts).

## Transaction message format

| Parameter     | Type    | Description                                                                      |
| ------------- | ------- | -------------------------------------------------------------------------------- |
| signerAddress | address | Address of transaction signer                                                    |
| salt          | uint256 | Arbitrary number to facilitate uniqueness of the transactions's hash.            |
| data          | bytes   | The calldata that is to be executed. This must call an Exchange contract method. |

## Hash of a transaction

The hash of a transaction is used as a unique identifier for that transaction. A transaction is hashed according to the [EIP712 specification](#https://github.com/ethereum/EIPs/pull/712/files). See the [EIP712 Usage](#eip712-usage) section for information on how to calculate the required domain separator for hashing an order.

```
// Hash for the EIP712 ZeroEx Transaction Schema
bytes32 constant internal EIP712_ZEROEX_TRANSACTION_SCHEMA_HASH = keccak256(abi.encodePacked(
    "ZeroExTransaction(",
    "uint256 salt,",
    "address signerAddress,",
    "bytes data",
    ")"
));

bytes32 transactionHash = keccak256(abi.encodePacked(
    EIP191_HEADER,
    EIP712_DOMAIN_HASH,
    keccak256(abi.encodePacked(
        EIP712_ZEROEX_TRANSACTION_SCHEMA_HASH,
        salt,
        bytes32(signerAddress),
        keccak256(data)
    ))
));
```

## Creating a transaction

A transaction may only be executed if it can be paired with an associated valid signature. A transaction's hash must be signed with a [supported signature type](#signature-types).

## Executing a transaction

A transaction may only be executed by calling the `executeTransaction` method of the Exchange contract. `executeTransaction` attempts to execute any function on the Exchange contract in the context of the transaction signer (rather than `msg.sender`).

`executeTransaction` will revert under the following conditions:

- Reentrancy is attempted (e.g `executeTransaction` calls `executeTransaction` again).
- A transaction with an equivalent hash has already been executed.
- An invalid signature is submitted.
- The execution of the provided data reverts.

```
/// @dev Executes an exchange method call in the context of signer.
/// @param salt Arbitrary number to ensure uniqueness of transaction hash.
/// @param signerAddress Address of transaction signer.
/// @param data AbiV2 encoded calldata.
/// @param signature Proof that transaction has been signed by signer.
function executeTransaction(
    uint256 salt,
    address signerAddress,
    bytes data,
    bytes signature
)
    external;
```

# Signatures

## Validating signatures

The `Exchange` contract includes a public method `isValidSignature` for validating signatures. This method has the following interface:

```
/// @dev Verifies that a signature is valid.
/// @param hash Message hash that is signed.
/// @param signerAddress Address of signer.
/// @param signature Proof of signing.
/// @return Validity of order signature.
function isValidSignature(
    bytes32 hash,
    address signerAddress,
    bytes memory signature
)
    public
    view
    returns (bool isValid);
```

## Signature Types

All signatures submitted to the Exchange contract are represented as a byte array of arbitrary length, where the last byte (the "signature byte") specifies the signatures type. The signature type is popped from the signature byte array before validation. The following signature types are supported within the protocol:

| Signature byte | Signature type          |
| -------------- | ----------------------- |
| 0x00           | [Illegal](#illegal)     |
| 0x01           | [Invalid](#invalid)     |
| 0x02           | [EIP712](#eip712)       |
| 0x03           | [EthSign](#ethsign)     |
| 0x04           | [Wallet](#wallet)       |
| 0x05           | [Validator](#validator) |
| 0x06           | [PreSigned](#presigned) |

### Illegal

This is the default value of the signature byte. A transaction that includes an Illegal signature will be reverted. Therefore, users must explicitly specify a valid signature type.

### Invalid

An `Invalid` signature always returns false. An invalid signature can always be recreated and is therefore offered explicitly. This signature type is largely used for testing purposes.

### EIP712

An `EIP712` signature is considered valid if the address recovered from calling [`ecrecover`](#ecrecover-usage) with the given hash and decoded `v`, `r`, `s` values is the same as the specified signer. In this case, the signature is encoded in the following way:

| Offset | Length | Contents            |
| ------ | ------ | ------------------- |
| 0x00   | 1      | v (always 27 or 28) |
| 0x01   | 32     | r                   |
| 0x21   | 32     | s                   |

### EthSign

An `EthSign` signature is considered valid if the address recovered from calling [`ecrecover`](#ecrecover-usage) with the an EthSign-prefixed hash and decoded `v`, `r`, `s` values is the same as the specified signer.

The prefixed `msgHash` is calculated with:

```
string constant ETH_PERSONAL_MESSAGE = "\x19Ethereum Signed Message:\n32";
bytes32 msgHash = keccak256(abi.encodePacked(ETH_PERSONAL_MESSAGE, hash));
```

`v`, `r`, and `s` are encoded in the signature byte array using the same scheme as [EIP712 signatures](#EIP712).

### Wallet

The `Wallet` signature type allows a contract to trade on behalf of any other address(es) by defining its own signature validation function. When used with order signing, the `Wallet` contract _is_ the `maker` of the order and should hold any assets that will be traded. When using this signature type, the [`Exchange`](#exchange) contract makes a `STATICCALL` to the `Wallet` contract's `isValidSignature` method, which means that signature verifcation will fail and revert if the `Wallet` attempts to update state. This contract should have the following interface:

```
contract IWallet {

    /// @dev Verifies that a signature is valid.
    /// @param hash Message hash that is signed.
    /// @param signature Proof of signing.
    /// @return Validity of order signature.
    function isValidSignature(
        bytes32 hash,
        bytes signature
    )
        external
        view
        returns (bytes4 magicValue);
}
```

A `Wallet` contract's `isValidSignature` method must return the following magic value if successful:

```solidity
// 0xb0671381
bytes4 WALLET_MAGIC_VALUE = bytes4(keccak256("isValidWalletSignature(bytes32,address,bytes)"));
```

Note when using this method to sign orders: although it can be useful to allow the validity of signatures to be determined by some state stored on the blockchain, it should be noted that the signature will only be checked the first time an order is filled. Therefore, the signature cannot be later invalidated by updating the associates state.

### Validator

The `Validator` signature type allows an address to delegate signature verification to any other address. The `Validator` contract must first be approved by calling the `setSignatureValidatorApproval` method:

```
// Mapping of signer => validator => approved
mapping (address => mapping (address => bool)) public allowedValidators;

/// @dev Approves/unnapproves a Validator contract to verify signatures on signer's behalf.
/// @param validatorAddress Address of Validator contract.
/// @param approval Approval or disapproval of  Validator contract.
function setSignatureValidatorApproval(
    address validatorAddress,
    bool approval
)
    external;
```

The `setSignatureValidatorApproval` method emits a [`SignatureValidatorApproval`](#signaturevalidatorapprovalset) event when executed.

A Validator signature is then encoded as:

| Offset   | Length | Contents                   |
| -------- | ------ | -------------------------- |
| 0x00     | x      | signature                  |
| 0x00 + x | 20     | Validator contract address |

A Validator contract must have the following interface:

```
contract IValidator {

    /// @dev Verifies that a signature is valid.
    /// @param hash Message hash that is signed.
    /// @param signerAddress Address that should have signed the given hash.
    /// @param signature Proof of signing.
    /// @return Validity of order signature.
    function isValidSignature(
        bytes32 hash,
        address signerAddress,
        bytes signature
    )
        external
        view
        returns (bytes4 magicValue);
}
```

A `Validator` contract's `isValidSignature` method must return the following magic value if successful:

```solidity
// 0x42b38674
bytes4 VALIDATOR_MAGIC_VALUE = bytes4(keccak256("isValidValidatorSignature(address,bytes32,address,bytes)"));
```

The signature is validated by calling the `Validator` contract's `isValidSignature` method. When using this signature type, the [`Exchange`](#exchange) contract makes a `STATICCALL` to the `Validator` contract's `isValidSignature` method, which means that signature verifcation will fail and revert if the `Validator` attempts to update state.

```
// Pop last 20 bytes off of signature byte array.
address validatorAddress = popAddress(signature);

// Ensure signer has approved validator.
if (!allowedValidators[signerAddress][validatorAddress]) {
    return false;
}

magicValue = isValidValidatorSignature(
    validatorAddress,
    hash,
    signerAddress,
    signature
);
```

### PreSigned

Allows any address to sign a hash on-chain by calling the `preSign` method on the Exchange contract.

```
// Mapping of hash => signer => signed
mapping (bytes32 => mapping(address => bool)) public preSigned;

/// @dev Approves a hash on-chain using any valid signature type or `msg.sender`.
///      After presigning a hash, the preSign signature type will become valid for that hash and signer.
/// @param signerAddress Address that should have signed the given hash.
/// @param signature Proof that the hash has been signed by signer.
function preSign(
    bytes32 hash,
    address signerAddress,
    bytes signature
)
    external;
```

The hash can then be validated with only a `PreSigned` signature byte by checking the state of the `preSigned` mapping when a transaction is submitted.

```
isValid = preSigned[hash][signerAddress];
return isValid;
```

# Events

## Exchange events

### Fill

A `Fill` event is emitted when an order is filled.

```
event Fill(
    address indexed makerAddress,         // Address that created the order.
    address indexed feeRecipientAddress,  // Address that received fees.
    address takerAddress,                 // Address that filled the order.
    address senderAddress,                // Address that called the Exchange contract (msg.sender).
    uint256 makerAssetFilledAmount,       // Amount of makerAsset sold by maker and bought by taker.
    uint256 takerAssetFilledAmount,       // Amount of takerAsset sold by taker and bought by maker.
    uint256 makerFeePaid,                 // Amount of ZRX paid to feeRecipient by maker.
    uint256 takerFeePaid,                 // Amount of ZRX paid to feeRecipient by taker.
    bytes32 indexed orderHash,            // EIP712 hash of order (see LibOrder.getOrderHash).
    bytes makerAssetData,                 // Encoded data specific to makerAsset.
    bytes takerAssetData                  // Encoded data specific to takerAsset.
);
```

### Cancel

A `Cancel` event is emitted whenever an individual order is cancelled.

```
event Cancel(
    address indexed makerAddress,         // Address that created the order.
    address indexed feeRecipientAddress,  // Address that would have received fees if order was filled.
    address senderAddress,                // Address that called the Exchange contract (msg.sender).
    bytes32 indexed orderHash,            // EIP712 hash of order (see LibOrder.getOrderHash).
    bytes makerAssetData,                 // Encoded data specific to makerAsset.
    bytes takerAssetData                  // Encoded data specific to takerAsset.
);
```

### CancelUpTo

A `CancelUpTo` event is emitted whenever a [`cancelOrdersUpTo`](#cancelordersupto) call is successful.

```
event CancelUpTo(
    address indexed makerAddress,         // Orders cancelled must have been created by this address.
    address indexed senderAddress,        // Orders cancelled must have a `senderAddress` equal to this address.
    uint256 orderEpoch                    // Orders with specified makerAddress and senderAddress with a salt less than this value are considered cancelled.
);
```

### SignatureValidatorApproval

A `SignatureValidatorApproval` event is emitted whenever a [`Validator`](#validator) contract is approved or disapproved to verify signatures created by a signer via `setSignatureValidatorApproval`.

```
event SignatureValidatorApproval(
    address indexed signerAddress,     // Address that approves or disapproves a contract to verify signatures.
    address indexed validatorAddress,  // Address of signature validator contract.
    bool approved                      // Approval or disapproval of validator contract.
);
```

### AssetProxyRegistered

Whenever an [`AssetProxy`](#assetproxy) is registered the [`Exchange`](#exchange) contract, an `AssetProxyRegistered` is emitted.

```
event AssetProxyRegistered(
    uint8 id,               // Id of new registered AssetProxy.
    address assetProxy,     // Address of new registered AssetProxy.
);
```

## AssetProxy events

### AuthorizedAddressAdded

An `AuthorizedAddressAdded` event is emitted when a new address becomes authorized to call an [`AssetProxy`](#assetproxy) contract's transfer functions.

```
event AuthorizedAddressAdded(
    address indexed target,
    address indexed caller
);
```

### AuthorizedAddressRemoved

An `AuthorizedAddressRemoved` event is emitted when an address becomes unauthorized to call an [`AssetProxy`](#assetproxy) contract's transfer functions.

```
event AuthorizedAddressRemoved(
    address indexed target,
    address indexed caller
);
```

## AssetProxyOwner events

The following events must precede the execution of any function called by [`AssetProxyOwner`](#assetproxyowner) (with the exception of `removeAuthorizedAddressAtIndex`).

### Submission

A `Submission` event is emitted when a new transaction is submitted to the [`AssetProxyOwner`](#assetproxyowner).

```
event Submission(uint256 indexed transactionId);
```

### Confirmation

A `Confirmation` event is emitted when a transaction is confirmed by an individual owner of the [`AssetProxyOwner`](#assetproxyowner).

```
event Confirmation(
    address indexed sender,
    uint256 indexed transactionId
);
```

### ConfirmationTimeSet

A `ConfirmationTimeSet` event is emitted when a transaction has been fully confirmed. The 2 week timelock begins at this time, after which the transaction becomes executable.

```
event ConfirmationTimeSet(
    uint256 indexed transactionId,
    uint256 confirmationTime
);
```

# Types

## Order

```
struct Order {
    address makerAddress;           // Address that created the order.
    address takerAddress;           // Address that is allowed to fill the order. If set to 0, any address is allowed to fill the order.
    address feeRecipientAddress;    // Address that will receive fees when order is filled.
    address senderAddress;          // Address that is allowed to call Exchange contract methods that affect this order. If set to 0, any address is allowed to call these methods.
    uint256 makerAssetAmount;       // Amount of makerAsset being offered by maker. Must be greater than 0.
    uint256 takerAssetAmount;       // Amount of takerAsset being bid on by maker. Must be greater than 0.
    uint256 makerFee;               // Amount of ZRX paid to feeRecipient by maker when order is filled. If set to 0, no transfer of ZRX from maker to feeRecipient will be attempted.
    uint256 takerFee;               // Amount of ZRX paid to feeRecipient by taker when order is filled. If set to 0, no transfer of ZRX from taker to feeRecipient will be attempted.
    uint256 expirationTimeSeconds;  // Timestamp in seconds at which order expires.
    uint256 salt;                   // Arbitrary number to facilitate uniqueness of the order's hash.
    bytes makerAssetData;           // Encoded data that can be decoded by a specified proxy contract when transferring makerAsset. The last byte references the id of this proxy.
    bytes takerAssetData;           // Encoded data that can be decoded by a specified proxy contract when transferring takerAsset. The last byte references the id of this proxy.
}
```

## FillResults

Fill methods that return a value will return a FillResults instance if successful.

```
struct FillResults {
    uint256 makerAssetFilledAmount;  // Total amount of makerAsset(s) filled.
    uint256 takerAssetFilledAmount;  // Total amount of takerAsset(s) filled.
    uint256 makerFeePaid;            // Total amount of ZRX paid by maker(s) to feeRecipient(s).
    uint256 takerFeePaid;            // Total amount of ZRX paid by taker to feeRecipients(s).
}
```

## MatchedFillResults

The [`matchOrders`](#matchorders) method returns a MatchedFillResults instance if successful.

```
struct MatchedFillResults {
    FillResults left;                    // Amounts filled and fees paid of left order.
    FillResults right;                   // Amounts filled and fees paid of right order.
    uint256 leftMakerAssetSpreadAmount;  // Spread between price of left and right order, denominated in the left order's makerAsset, paid to taker.
}
```

## OrderInfo

The [`getOrderInfo`](#getorderinfo) method returns an `OrderInfo` instance.

```
struct OrderInfo {
    uint8 orderStatus;                    // Status that describes order's validity and fillability.
    bytes32 orderHash;                    // EIP712 hash of the order (see LibOrder.getOrderHash).
    uint256 orderTakerAssetFilledAmount;  // Amount of order that has already been filled.
}
```

# Standard relayer API

For a full specification of how orders are intended to be posted to and retrieved from relayers, see the [SRA v2 specification](https://github.com/0xProject/standard-relayer-api#sra-v2).

# Miscellaneous

## EIP712 usage

Hashes of orders and transactions are calculated according to the [EIP712 specification](https://github.com/ethereum/EIPs/pull/712/files).

The domain separator for the Exchange contract can be calculated with:

```
// EIP191 header for EIP712 prefix
string constant internal EIP191_HEADER = "\x19\x01";

// Hash of the EIP712 Domain Separator Schema
bytes32 constant internal EIP712_DOMAIN_SEPARATOR_SCHEMA_HASH = keccak256(abi.encodePacked(
    "EIP712Domain(",
    "string name,",
    "string version,",
    "address verifyingContract",
    ")"
));

bytes32 EIP712_DOMAIN_HASH = keccak256(abi.encodePacked(
    EIP712_DOMAIN_SEPARATOR_SCHEMA_HASH,
    keccak256(bytes("0x Protocol")),
    keccak256(bytes("2")),
    bytes32(address(this))
));
```

For more information about how this is used, see [hashing an order](#hashing-an-order) and [hashing a transaction](#hash-of-a-transaction).

## Optimizing calldata

Calldata is expensive. As per Appendix G of the [Ethereum Yellowpaper](#https://ethereum.github.io/yellowpaper/paper.pdf), every non-zero byte of calldata costs 68 gas, and every zero byte costs 4 gas. There are certain off-chain optimizations that can be made in order to maximize the amount of zeroes included in calldata.

### Filling remaining amounts

When an order is filled, it will attempt to fill the minimum of the amount submitted and the amount remaining. Therefore, if a user attempts to fill a very large amount such as `0xF000000000000000000000000000000000000000000000000000000000000000`, then the order will almost always be maximally filled while using minimal extra calldata.

### Filling orders that have already been partially filled

When filling an order, the signature is only validated the first time the order is filled. Because of this, signatures should _not_ be resubmitted after an order has already been partially filled. For a standard 65 byte ECDSA signature, this can save well over 4000 gas.

### Optimizing salt

When creating an order, a full 32 byte salt is generally unecessary to facilitate uniqueness of the order's hash. Using a salt value with as many leading zeroes as possible will increase gas efficiency. It is recommended to use a timestamp or incrementing nonce for the salt value, which will generally be small enough to optimize gas while also working well with [`cancelOrdersUpTo`](#cancelordersupto).

### Assuming order parameters

The [`matchOrders`](#matchorders), [`marketSellOrders`](#marketsellorders), [`marketSellOrdersNoThrow`](#marketsellordersnothrow), [`marketBuyOrders`](#marketbuyorders), and [`marketBuyOrdersNoThrow`](#marketbuyordersnothrow) functions all require that certain parameters of the later passed in orders match the same parameters of the first passed in order. Rather than checking equality, these functions all assume that the parameters are equal. This means users may pass in zero values for those parameters and the functions will still execute as if the values had been passed in as calldata.

### Vanity addresses

If frequently trading from a single address, it may make sense to generate a vanity address with as many zero bytes as possible.

## ecrecover usage

The `ecrecover` precompile available in Solidity expects `v` to always have a value of `27` or `28`. Some signers and clients assume that `v` will have a value of `0` or `1`, so it may be necessary to add `27` to `v` before submitting it to the `Exchange` contract.

## Reentrancy protection

The following functions within the `Exchange` contract contain a mutex that prevents them from called via [reentrancy](https://solidity.readthedocs.io/en/v0.4.24/security-considerations.html#re-entrancy):

- [`fillOrder`](#fillorder)
- [`fillOrKillOrder`](#fillorkillorder)
- [`batchFillOrders`](#batchfillorders)
- [`batchFillOrKillOrders`](#batchfillorkillorders)
- [`marketBuyOrders`](#marketbuyorders)
- [`marketSellOrders`](#marketsellorders)
- [`matchOrders`](#matchorders)
- [`cancelOrder`](#cancelorder)
- [`batchCancelOrders`](#batchcancelorders)
- [`cancelOrdersUpTo`](#cancelordersupto)
- [`setSignatureValidatorApproval`](#validator)

[`fillOrderNoThrow`](#fillordernothrow) and all of its variations do not explicitly have a mutex, but will fail gracefully if any reentrancy is attempted.

The mutex is implemented with the following `nonReentrant` modifier:

```
contract ReentrancyGuard {

    // Locked state of mutex
    bool private locked = false;

    /// @dev Functions with this modifer cannot be reentered. The mutex will be locked
    ///      before function execution and unlocked after.
    modifier nonReentrant() {
        // Ensure mutex is unlocked
        require(
            !locked,
            "REENTRANCY_ILLEGAL"
        );

        // Lock mutex before function call
        locked = true;

        // Perform function call
        _;

        // Unlock mutex after function call
        locked = false;
    }
}
```
