# Sequence's ERC-1155 Specification

# Table of Content
- [Overview](#overview)
- [Contracts](#contracts)
    + [ERC1155.sol & ERC1155PackedBalance.sol](#erc1155sol---erc1155packedbalancesol)
    + [ERC1155Meta.sol & ERC1155MetaPackedBalance.sol](#erc1155metasol---erc1155metapackedbalancesol)
    + [ERC1155Metadata.sol](#erc1155metadatasol)
    + [ERC1155MintBurn.sol & ERC1155MintBurnPackedBalance.sol](#erc1155mintburnsol---erc1155mintburnpackedbalancesol)
- [Contract Interactions](#contract-interactions)
  * [Transferring Tokens](#transferring-tokens)
  * [Managing Approvals](#managing-approvals)
  * [Managing Metadata](#managing-metadata)
- [Packed Balance](#packed-balance)
  * [Relevant Methods](#relevant-methods)
    + [*getIDBinIndex(uint256 _id)*](#-getidbinindex-uint256--id--)
    + [*getValueInBin(uint256 _binAmount, uint256 _index)*](#-getvalueinbin-uint256--binamount--uint256--index--)
    + [*_viewUpdateBinValue(uint256 _binValues, uint256 _index, uint256 _amount, Operations _operation)*](#--viewupdatebinvalue-uint256--binvalues--uint256--index--uint256--amount--operations--operation--)
    + [*_updateIDBalance(address _address, uint256 _id, uint256 _amount, Operations _operation)*](#--updateidbalance-address--address--uint256--id--uint256--amount--operations--operation--)
    + [_safeBatchTransferFrom(...) and _batchMint(...)](#-safebatchtransferfrom---and--batchmint--)
- [Meta-transactions](#meta-transactions)
  * [Meta-Transaction for Asset Transfers](#meta-transaction-for-asset-transfers)
    + [metaSafeTransferFrom() Meta-Transaction Hash](#metasafetransferfrom---meta-transaction-hash)
    + [metaSafeBatchTransferFrom() Meta-Transaction Hash](#metasafebatchtransferfrom---meta-transaction-hash)
  * [Meta-Transaction for Approvals](#meta-transaction-for-approvals)
    + [metaSetApprovalForAll() Meta-Transaction Hash](#metasetapprovalforall---meta-transaction-hash)
- [Gas Reimbursement](#gas-reimbursement)
  * [Gas Receipt](#gas-receipt)
- [Signature Types](#signature-types)
    + [Illegal](#illegal)
    + [EIP712](#eip712)
    + [EthSign](#ethsign)
    + [WalletBytes](#walletbytes)
    + [WalletBytes32](#walletbytes32)
- [Events](#events)
- [Miscellaneous](#miscellaneous)
  * [EIP712 usage](#eip712-usage)
  * [ecrecover usage](#ecrecover-usage)

# Overview

This repository contains two implementations of the **ERC-1155** token standard. The main difference compared to **ERC-20** and **ERC-721** is that while **ERC-20** has a logic of `erc20.transfer(to, amount)` and **ERC-721** a logic of `erc721.transfer(to, id)`, **ERC-1155** has a logic of `erc1155.transfer(to, id, amount)` enabling the management of multiple fungible assets in a single contract. Some token ids in ERC-1155 could have a maximum supply of 1 (hence unique) while other could have no maximum supply and behave like a typical fungible token.

One of the **ERC-1155** implementation in this repository has a "packed balance" approach, meaning that some token IDs share the same uint256 storage slot. This permits cheaper balance update since token id balances can be updated in a single SSTORE operation, but it impose a lower maximum supply on tokens. The other implementation does not have this "packed balance" approach hence each token id use a full `uint256` storage slot for the balances.

In addition to the methods specified in the [ERC-1155 standard](<https://github.com/ethereum/eips/issues/1155>), the implementations in this repository support native meta-transactions methods, meaning that methods can be called on behalf of any users so long as they provide a corresponding valid signature. This enable users to delegate the transaction execution to a third party securely. Meta-transactions can be executed for a fee specified by the user, paid in arbitrary ERC-20 or ERC-1155 tokens, but these fees can be omitted if desired.

Most of the ERC-1155 methods are not explained in details in this document since the [ERC-1155 standard](<https://github.com/ethereum/eips/issues/1155>) document contains sufficient information. The present document will focus on implementation details that are not included in the ERC-1155 standard.

# Contracts

### ERC1155.sol & ERC1155PackedBalance.sol

The main purpose of this contract is to manage transfer, balances and approval methods. For an in-depth specification of this contract, see the [ERC-1155 official specification](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1155.md). The ERC1155PackedBalance.sol contract uses a packed balance approach. See the [Packed Balance](#packed-balance) for more information on packed balance approach.

### ERC1155Meta.sol & ERC1155MetaPackedBalance.sol

This contract is an extension of the previous contract, [ERC1155](#erc1155.sol-&-erc1155packedbalance.sol). This contract implements meta-transaction methods, enabling users to delegate their transfers and approvals to a third party via corresponding valid signed messages. The contract enables any address to transfer and set an approval on behalf of a user given that user signed a corresponding message. See the [Meta-Transactions](#meta-transactions) section for more information on the message and signature formatting for meta-transactions. The ERC1155MetaPackedBalance.sol contract uses a packed balance approach. See the [Packed Balance](#packed-balance) section for more information on packed balance approach.

### ERC1155Metadata.sol 

This contract handles metadata related methods, which are not mandatory with respect to the ERC-1155 standard. It enables logging URI changes for certain ID and assumes a static base URL and deterministic URI for the various IDs (e.g. `https://mymetadata.net/id/X` where X is an arbitrary ID) .

### ERC1155MintBurn.sol & ERC1155MintBurnPackedBalance.sol

This contract is an extension of the previous contract, [ERC1155](#erc1155). This contract implements minting and burning related methods, which are not mandated by the ERC-1155 standard. The minting and burning methods are `internal` and a parent contract must invoke them. This design choice was made to let developers  set their own authentication gates. The ERC1155MintBurnPackedBalance.sol contract uses a packed balance approach. 

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

```solidity
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

For how the data must be encoded in the `_data` byte arrays, see the [Meta-Transaction for Asset Transfers](meta--transaction-for-asset-transfers) section. 

For what constitutes a valid signature, see [Signature Types](#signature-types).

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

```solidity
0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
  [ ID 7 ][ ID 6 ][ ID 5 ][ ID 4 ][ ID 3 ][ ID 2 ][ ID 1 ][ ID 0 ]
```

For instance, if Bob had **four** token **#0**, **seven** token **#3** and **twenty-seven** token **#7**, the value at the storage slot they share should be 

```solidity
0x0000001b00000000000000000000000000000007000000000000000000000004
  [ ID 7 ][ ID 6 ][ ID 5 ][ ID 4 ][ ID 3 ][ ID 2 ][ ID 1 ][ ID 0 ]
```

Since each of these balance values are limited to IDS_BITS_SIZE bits per token ID, this means that values in each bin can't exceed an amount of $2^{z-1}$ , where $z$ is the `IDS_BITS_SIZE`. Overflow and underflow MUST lead to a revert. It is important to note that `mint` and `burn` operations respect these rules and not lead to overflows nor underflows.

## Relevant Methods

Most important methods that handle the balance packing logic can be found in the [ERC1155PackedBalance.sol](https://github.com/0xsequence/erc-1155/blob/master/contracts/tokens/ERC1155PackedBalance/ERC1155PackedBalance.sol) contract.

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

These method in the [ERC1155PackedBalance](https://github.com/0xsequence/erc-1155/blob/master/contracts/tokens/ERC1155PackedBalance/ERC1155PackedBalance.sol)  and [ERC1155MintBurnPackedBalance.sol](https://github.com/0xsequence/erc-1155/blob/master/contracts/tokens/ERC1155PackedBalance/ERC1155MintBurnPackedBalance.sol) contracts (respectively) take advantage of the packed balances by trying to only read and write once per storage slot when transferring or minting multiple assets. To achieve this, the methods assume the `_ids` provided as argument are sorted in such a way that ids in the same storage slots are consecutive. 

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

The three meta-transactions methods in these ERC-1155 implementations ([metaSafeTransferFrom()](#metasafetransferfrom()-meta-transaction-hash), [metaSafeBatchTransferFrom()](#metasafebatchtransferfrom()-meta-transaction-hash) & [metaSetApprovalForAll()](#metasetapprovalforall()-meta-transaction-hash)) follow a similar structure. These three methods share two meta-transaction relevant arguments, `_isGasFee` and `_data`.

`_isGasFee` : *Boolean* specifying whether gas is reimbursed by user to operator (address executing the transaction), in which case a [Gas Receipt](#gas-receipt) struct must be provided in the `_data` argument.

`_data`: *Bytes array* containing the `signature`, `GasReceipt` struct (optional) and an optional extra byte array (optional).

A meta-transaction's hash must be signed with a [supported signature type](#signature-types), unless if that type is [WalletBytes](#walletbytes) as explained in the corresponding section.

## Meta-Transaction for Asset Transfers

For the `metaSafeTransferFrom(_from, _to, _id, _amount, _isGasFee, _data)` and `metaSafeBatchTransferFrom(_from, _to, _ids, _amounts, _isGasFee, _data)` methods, the `_data` provided must be encoded as `abi.encode(Signature, ?GasReceiptAndTansferData)` where `Signature` is tightly encoded as:

| Offset | Length | Contents                          |
| ------ | ------ | --------------------------------- |
| 0x00   | 32     | r                                 |
| 0x20   | 32     | s                                 |
| 0x40   | 1      | v (always 27 or 28)               |
| 0x41   | 32     | [nonce](#nonce)                   |
| 0x61   | 1      | [SignatureType](#signature-types) |

and where `GasReceiptAndTansferData = abi.encode(?GasReceipt, tansferData)` if `_isGasFee` is `true`, else `GasReceiptAndTansferData` is simply `tansferData`.  `tansferData` is a byte array that will be passed to the recipient contract, if any.

#### metaSafeTransferFrom() Meta-Transaction Hash

The hash of a meta `safeTransferFrom()` transaction is hashed according to the [EIP712 specification](#https://github.com/ethereum/EIPs/pull/712/files). See the [EIP712 Usage](#eip712-usage) section for information on how to calculate the required domain separator for hashing a `metaSafeTransferFrom()` meta-transaction.

```
// TypeHash for the EIP712 metaSafeTransferFrom Schema
bytes32 constant internal META_TX_TYPEHASH = keccak256(
	"metaSafeTransferFrom(address _from,address _to,uint256 _id,uint256 _amount,uint256 nonce,bytes signedData)"
);

bytes32 metaSafeTransferFromHash = keccak256(abi.encodePacked(
    EIP191_HEADER,
    EIP712_DOMAIN_HASH,
    keccak256(abi.encodePacked(
        META_TX_TYPEHASH,                   // Bytes32
        uint256(_from),                     // Address as uint256
        uint256(_to),                       // Address as uint256
        _id,                                // Uint256
        _amount                             // Uint256
        nonce,                              // Uint256
        keccak256(GasReceiptAndTansferData) // Bytes32
    ))
));
```

#### metaSafeBatchTransferFrom() Meta-Transaction Hash

The hash of a meta `batchSafeTransferFrom()` transaction is hashed according to the [EIP712 specification](#https://github.com/ethereum/EIPs/pull/712/files). See the [EIP712 Usage](#eip712-usage) section for information on how to calculate the required domain separator for hashing a `metaSafeBatchTransferFrom()` meta-transaction.

```
// TypeHash for the EIP712 metaSafeBatchTransferFrom Schema
bytes32 constant internal META_BATCH_TX_TYPEHASH = keccak256(
	"metaSafeBatchTransferFrom(address _from,address _to,uint256[] _ids,uint256[] _amounts,uint256 nonce,bytes signedData)"
);

bytes32 metaSafeBatchTransferFromHash = keccak256(abi.encodePacked(
    EIP191_HEADER,
    EIP712_DOMAIN_HASH,
    keccak256(abi.encodePacked(
        META_BATCH_TX_TYPEHASH,               // Bytes32
        uint256(_from),                       // Address as uint256
        uint256(_to),                         // Address as uint256
        keccak256(abi.encodePacked(_ids)),    // Bytes32
        keccak256(abi.encodePacked(_amounts)) // Bytes32
        nonce,                                // Uint256
        keccak256(GasReceiptAndTansferData)   // Bytes32
    ))
));
```

## Meta-Transaction for Approvals

For the `metaSetApprovalForAll(_owner, _operator, _approved, _isGasFee, _data)` method the `_data` provided must be encoded as `abi.encode(Signature, ?GasReceipt)` where `Signature` is tightly encoded as:

| Offset | Length | Contents                          |
| ------ | ------ | --------------------------------- |
| 0x00   | 32     | r                                 |
| 0x20   | 32     | s                                 |
| 0x40   | 1      | v (always 27 or 28)               |
| 0x41   | 32     | [nonce](#nonce)                   |
| 0x61   | 1      | [SignatureType](#signature-types) |

and where `GasReceipt` is passed if `_isGasFee` is `true`.

#### metaSetApprovalForAll() Meta-Transaction Hash

The hash of a meta `setApprovalForAll()` transaction is hashed according to the [EIP712 specification](#https://github.com/ethereum/EIPs/pull/712/files). See the [EIP712 Usage](#eip712-usage) section for information on how to calculate the required domain separator for hashing a `metaSetApprovalForAll()` meta-transaction.

```
// TypeHash for the EIP712 metaSetApprovalForAll Schema
bytes32 constant internal META_APPROVAL_TYPEHASH = keccak256(
	"metaSetApprovalForAll(address _owner,address _operator,bool _approved,uint256 nonce,bytes signedData)"
);

bytes32 metaSetApprovalForAllHash = keccak256(abi.encodePacked(
    EIP191_HEADER,
    EIP712_DOMAIN_HASH,
    keccak256(abi.encodePacked(
        META_APPROVAL_TYPEHASH,             // Bytes32
        uint256(_owner),                    // Address as uint256
        uint256(_operator),                 // Address as uint256
        _approved ? uint256(1) : uint256(0) // Uint256
        nonce,                              // Uint256
        keccak256(GasReceipt)               // Bytes32
    ))
));
```

## Gas Reimbursement

Meta-transaction operators can charge a fee to the signer of the meta-transaction in exchange of paying for the gas in ETH. All three [meta-transaction methods](#meta-transactions) have an`_isGasFee` argument, which indicates whether a [Gas Receipt](#gas-receipt) is expected to be encoded in the `_data` argument. This receipts will determine what the fee will be and in which asset it must be paid. 

At the beginning of each meta-transaction method, a gas counter is started for the remaining of the transaction.

```solidity
uint256 startGas = gasleft();
```

Towards the end of a transaction, the fee to be paid is calculated as follow:

```solidity
// Amount of gas consumed so far
gasUsed = _startGas.sub(gasleft()).add(_g.baseGas);

// Reimburse up to gasLimit (instead of throwing)
fee = gasUsed > _g.gasLimit ? _g.gasLimit.mul(_g.gasPrice) : gasUsed.mul(_g.gasPrice);
```

The `baseGas` value is there to account for gas that was not accounted for by the gas counter, such as the CALLDATA, the expected cost of reimbursing the gas, a supplementary fee required by operator, etc. 

The `gasLimit` value is there to protect the users by imposing a limit on how much gas can be reimbursed to the operator. 

The `gasPrice` is used to dictate the price of each gas unit, similar to the [gasPrice](<https://www.investopedia.com/terms/g/gas-ethereum.asp>) in native Ethereum transactions. 

## Gas Receipt

The `GasReceipt` object passed with a meta-transaction will determine whether the gas will be reimbursed from the `_from` address to the `operator` (i.e. `feeRecipient`) if the meta-transaction is successful. It is entirely up to the operator to verify that the `GasReceipt` signed by the user satisfies their needs. The `GasReceipt` consists of the following fields:

| Elements     | Type    | Description                                                  |
| ------------ | ------- | ------------------------------------------------------------ |
| gasLimit     | uint256 | Max amount of gas that can be reimbursed                     |
| baseGas      | uint256 | Base gas cost, such as the 21k base transaction cost, CALLDATA cost, etc. |
| gasPrice     | address | Price denominated in token X per gas unit                    |
| feeRecipient | address | Address to send gas fee payment to                           |
| feeTokenData | bytes   | Encoded data for token to use to pay for gas                 |

The `feeTokenData` should be structured as followed when the token used for gas fee is an ERC-20:

| Offset | Length | Contents                                             |
| ------ | ------ | ---------------------------------------------------- |
| 0x00   | 32     | Address of the ERC-20 token, left padded with zeroes |
| 0x20   | 1      | FeeTokenType.ERC20                                   |

The `feeTokenData` should be structured as followed when the token used for gas fee is an ERC-1155:

| Offset | Length | Contents                                               |
| ------ | ------ | ------------------------------------------------------ |
| 0x00   | 32     | Address of the ERC-1155 token, left padded with zeroes |
| 0x20   | 32     | Token ID to pay gas fee with, left padded with zeroes  |
| 0x40   | 1      | FeeTokenType.ERC1155                                   |

 where `FeeTokenType` is an enum:

| FeeTokenType byte | FeeTokenType type |
| ----------------- | ----------------- |
| 0x00              | ERC20             |
| 0x01              | ERC1155           |

Any `FeeTokenType` other than these two MUST revert if used in a transaction. 

## Signature Types

All signatures submitted to the ERC-1155 contract are represented as a byte array of arbitrary length, where the last byte (the "signature byte") specifies the signatures type. The signature type is popped from the signature byte array before validation. The signature types tentatively follows [ERC-2126](https://github.com/ethereum/EIPs/blob/202d578acb76bb4b8d0f46630eff4965ca61c092/EIPS/eip-2126.md) as it's not finalized yet. The following signature types are supported:

| Signature byte | Signature type                  |
| -------------- | ------------------------------- |
| 0x00           | [Illegal](#illegal)             |
| 0x01           | [EIP712](#eip712)               |
| 0x02           | [EthSign](#ethsign)             |
| 0x03           | [WalletBytes](#walletbytes)     |
| 0x04           | [WalletBytes32](#walletbytes32) |

The data being signed is always encoded and hashed according to [EIP-712](<https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md>). The only notable exception is for when the signature type is [WalletBytes](#walletbytes), as described in the corresponding section.

#### Illegal

This is the default value of the signature byte. A transaction that includes an Illegal signature will be reverted. Therefore, users must explicitly specify a valid signature type.

#### EIP712

An `EIP712` signature is considered valid if the address recovered from calling [`ecrecover`](#ecrecover-usage) with the given hash and decoded `v`, `r`, `s` values is the same as the specified signer. In this case, the signature is encoded in the following way:

| Offset | Length | Contents            |
| ------ | ------ | ------------------- |
| 0x00   | 32     | r                   |
| 0x20   | 32     | s                   |
| 0x40   | 1      | v (always 27 or 28) |

#### EthSign

An `EthSign` signature is considered valid if the address recovered from calling [`ecrecover`](https://github.com/0xProject/0x-protocol-specification/blob/master/v2/v2-specification.md#ecrecover-usage) with the an EthSign-prefixed hash and decoded `v`, `r`, `s` values is the same as the specified signer.

The prefixed `msgHash` is calculated with:

```
string constant ETH_PERSONAL_MESSAGE = "\x19Ethereum Signed Message:\n32";
bytes32 msgHash = keccak256(abi.encodePacked(ETH_PERSONAL_MESSAGE, hash));
```

`v`, `r`, and `s` are encoded in the signature byte array using the same scheme as [EIP712 signatures](#eip712-usage).

#### WalletBytes

The `WalletBytes` signature type allows a contract to interact with the ERC-1155 token contract on behalf of any other address(es) by defining its own signature validation function. This method should follow [ERC-1271](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1271.md). When used with meta-transaction signing, the `Wallet` contract *is* the signer of the meta-transaction. When using this signature type, the token contract makes a `STATICCALL` to the `Wallet`contract's `isValidSignature` method, which means that signature verification will fail and revert if the `Wallet` attempts to update state. This contract should have the following interface:

```solidity
contract IWallet {
  /** 
   * @notice Verifies that a signature is valid.
   * @param data      Data that was hashed and signed
   * @param signature Proof of signing.
   * @return Validity of signature for provided data.
   */ 
  function isValidSignature(
    bytes calldata data,
    bytes calldata signature
  ) external view returns (bytes4 magicValue);
}
```

The `data` passed to the `Wallet` signer is the encoded data according to EIP-712, expect that the ***byte arrays are not hashed***. For that matter, the recipient contract is expected to know how the received data is structured, which is facilitated by the fact that the first 32 bytes of the byte array received is the `typeHash` (see [EIP-712](<https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md#rationale-for-typehash>)). This signature type distinguishes itself from the `WalletBytes32` as it permits the signer `Wallet` to verify the data itself that was signed. A `Wallet` contract's `isValidSignature(bytes,bytes)` method must return the following magic value if successful:

```solidity
bytes4 ERC1271_MAGICVALUE = bytes4(keccak256("isValidSignature(bytes,bytes)"));
```

#### WalletBytes32

The `WalletBytes32` signature type allows a contract to trade on behalf of any other address(es) by defining its own signature validation function. This method should follow [ERC-1654](https://github.com/ethereum/EIPs/issues/1654). When used with order signing, the `Wallet` contract *is* the signer of the meta-transaction. When using this signature type, the token contract makes a `STATICCALL` to the `Wallet`contract's `isValidSignature` method, which means that signature verification will fail and revert if the `Wallet` attempts to update state. This contract should have the following interface:

```solidity
contract IWallet {
  /** 
   * @notice Verifies that a signature is valid.
   * @param hash      Hash that was signed
   * @param signature Proof of signing.
   * @return Validity of signature for provided data.
   */ 
  function isValidSignature(
    bytes32 hash,
    bytes calldata signature
  ) external view returns (bytes4 magicValue);
}
```

A `Wallet` contract's `isValidSignature(bytes32,bytes)` method must return the following magic value if successful:

```solidity
bytes4 ERC1271_MAGICVALUE_BYTES32 = bytes4(keccak256("isValidSignature(bytes32,bytes)"));
```

## Nonce

Meta-transactions nonces are used to protect users against replay attacks, where the same signed message could be used multiple times. The ERC-1155 contract keeps track of the next available nonce for each signer    and will reject signed messages with nonces that are smaller than it. In addition, the next nonce accepted can be within a 100 value range with respect to the next available nonce.

```solidity
// Get current nonce and nonce used for signature
uint256 currentNonce = nonces[_signer];        // Lowest valid nonce for signer
uint256 nonce = uint256(sig.readBytes32(65));  // Nonce passed in the signature object

// Verify if nonce is valid
require(
  (nonce >= currentNonce) && (nonce < (currentNonce + 100)),
  "ERC1155Meta#_signatureValidation: INVALID_NONCE"
);
```

Upon a valid meta-transaction, the next available nonce (referred to as `currentNonce` in the contracts) is stored as `nonce +1`. Every time a nonce is modified, the following event will be emitted ; 

```solidity
event NonceChange(address indexed signer, uint256 newNonce);
```



# Events

### 



# Miscellaneous

## EIP712 usage

Hashes of ERC-1155 meta-transactions are calculated according to the [EIP712 specification](https://github.com/ethereum/EIPs/pull/712/files) as follow:

The `EIP191_HEADER` and `EIP712_DOMAIN_HASH` constants are calculated as follow ; 

```solidity
// EIP-191 Header
string constant internal EIP191_HEADER = "\x19\x01";

// Hash of the EIP712 Domain Separator Schema
bytes32 constant internal DOMAIN_SEPARATOR_TYPEHASH = keccak256(abi.encodePacked(
    "EIP712Domain(address verifyingContract)"
));

bytes32 constant internal EIP712_DOMAIN_HASH = keccak256(abi.encodePacked(
	DOMAIN_SEPARATOR_TYPEHASH, 
	uint256(address(this))
));
```

For more information about how this is used, see [hashing an order](#hashing-an-order) and [hashing a transaction](#hash-of-a-transaction).

## ecrecover usage

The `ecrecover` precompile available in Solidity expects `v` to always have a value of `27` or `28`. Some signers and clients assume that `v` will have a value of `0` or `1`, so it may be necessary to add `27` to `v` before submitting it to the `Exchange` contract.
