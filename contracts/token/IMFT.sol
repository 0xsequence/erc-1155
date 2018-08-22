
pragma solidity ^0.4.24;

contract IMFT {
  // Events
  event Transfer(address from, address to, uint256 tokenType, uint256 amount);
  event BatchTransfer(address from, address to, uint256[] tokenTypes, uint256[] amounts);
  event ApprovalForAll(address tokensOwner, address operator, bool approved);

  // // Regular transfers functions
  function transferFrom(address _from, address _to, uint256 _type, uint256 _amount) external;
  function batchTransferFrom(address _from, address _to, uint256[] _types, uint256[] _amounts) public;
  
  // // Safe Transfer functions
  function safeTransferFrom(address _from, address _to, uint256 _type, uint256 _amount, bytes _data) external;
  function safeBatchTransferFrom(address _from, address _to, uint256[] _types, uint256[] _amounts, bytes _data) public;
  
  // // Return balance function
  function balanceOf(address _address, uint256 _type) external view returns (uint256);

  // // Operator functions
  function setApprovalForAll(address _operator, bool _approved) external;
  function isApprovedForAll(address _owner, address _operator) external view returns (bool isOperator);
}