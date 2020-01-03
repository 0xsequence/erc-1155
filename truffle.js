module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!

  networks: {
    ganache: {
      hardfork: "instanbul",
      network_id: 127001,
      host: "127.0.0.1",
      port: 8545
    }
  },

  compilers: {
    solc: {
      version: "./node_modules/solc"
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 100000,
      details: {
        yul: true,
        constantOptimizer: false
      }
    }
  },

  mocha: {
    reporter: "eth-gas-reporter",
    reporterOptions: {
      currency: "USD",
      gasPrice: 10,
      showTimeSpent: true
    }
  }

}
