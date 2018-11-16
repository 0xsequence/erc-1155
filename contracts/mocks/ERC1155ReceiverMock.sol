pragma solidity ^0.4.24;

// Contract to test safe transfer behavior.
contract ERC1155ReceiverMock {
    bytes4 constant public ERC1155_RECEIVED_SIG = 0xf23a6e61;
    bytes4 constant public ERC1155_BATCH_RECEIVED_SIG = 0xe9e5be6a;

    // Keep values from last received contract.
    bool public shouldReject;

    bytes public lastData;
    address public lastOperator;
    uint256 public lastId;
    uint256 public lastValue;

    function setShouldReject(bool _value) public {
        shouldReject = _value;
    }

    /**
        @notice Handle the receipt of an ERC1155 type
        @dev The smart contract calls this function on the recipient
        after a `safeTransfer`. This function MAY throw to revert and reject the
        transfer. Return of other than the magic value MUST result in the
        transaction being reverted
        Note: the contract address is always the message sender
        @param _operator  The address which called `safeTransferFrom` function
        @param _from      The address which previously owned the token
        @param _id        The identifier of the item being transferred
        @param _value     The amount of the item being transferred
        @param _data      Additional data with no specified format
        @return           `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))`
    */
    function onERC1155Received(
        address _operator, 
        address _from, 
        uint256 _id, 
        uint256 _value, 
        bytes _data ) 
        external returns(bytes4) 
    {
        lastOperator = _operator;
        lastId = _id;
        lastValue = _value;
        lastData = _data;
        if (shouldReject == true) {
            return bytes4(_from); // Some random value
        } else {
            return ERC1155_RECEIVED_SIG;
        }
    }



    /**
     * @dev Handle the receipt of multiple fungible tokens from an MFT contract. The ERCXXXX smart contract calls 
     * this function on the recipient after a `batchTransfer`. This function MAY throw to revert and reject the 
     * transfer. Return of other than the magic value MUST result in the transaction being reverted.
     * Returns `bytes4(keccak256("onERCXXXXBatchReceived(address,address,uint256[],uint256[],bytes)"))` unless throwing.
     * @notice The contract address is always the message sender. A wallet/broker/auction application
     * MUST implement the wallet interface if it will accept safe transfers.
     * @param _operator The address which called `safeTransferFrom` function.
     * @param _from     The address from which the token was transfered from.
     * @param _ids      Array of types of token being transferred (where each type is represented as an ID)
     * @param _values   Array of amount of object per type to be transferred.
     * @param _data     Additional data with no specified format.
     * @return `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))`
     */
    function onERC1155BatchReceived(
        address _operator,
        address _from,
        uint256[] _ids,
        uint256[] _values,
        bytes _data)
        external returns(bytes4) 
    {
        lastOperator = _operator;
        lastData = _data;
        if (shouldReject == true) {
            return bytes4(_from); // Some random value
        } else {
            return ERC1155_BATCH_RECEIVED_SIG;
        }

    }

}