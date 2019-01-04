module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!

  networks: {
    ganache: {
      network_id: 127001,
      host: "127.0.0.1",
      port: 8545
    }
  },

  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    },
    evmVersion: "byzantium",
    version: "0.5.0"
  },

  mocha: {
    reporter: "eth-gas-reporter",
    reporterOptions: {
      currency: "USD",
      gasPrice: 21,
      outputFile: "/dev/null",
      showTimeSpent: true
    }
  }

}
