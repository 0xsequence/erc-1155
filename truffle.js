module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!

  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    },
    evmVersion: "byzantium"
  },

  networks: {
    ganache: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*'
    }
  }

};
