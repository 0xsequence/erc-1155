pragma solidity ^0.4.24;

// Contract to test safe transfer behavior.
contract ERC1155ReceiverMock {
    bytes4 constant public ERC1155_RECEIVED_SIG = 0xe9e5be6a;

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
        @param _ids       Array containing the identifier of the items being transferred
        @param _values    Array containng the amount of token being transferred for each id
        @param _data      Additional data with no specified format
        @return           `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))`
    */
    function onERC1155Received(
        address _operator, 
        address _from, 
        uint256[] _ids, 
        uint256[] _values, 
        bytes _data ) 
        external returns(bytes4) 
    {   

        if (shouldReject == true) {
            return bytes4(_from); // Some random value
        } else {
            return ERC1155_RECEIVED_SIG;
        }
    }

}