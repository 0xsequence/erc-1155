module.exports = {
  port: '8545',
  norpc: true,
  testCommand: 'truffle test --network coverage',
  skipFiles: [
    'ERC1155MockNoBalancePacking.sol',
    'ERC1155Mock.sol',
    'ERC1155MockX.sol',
    'ERC1155OperatorMock.sol',
    'ERC1155ReceiverMock.sol',
    'ERC20Mock.sol',
    'ERC721Mock.sol'
  ]
}
