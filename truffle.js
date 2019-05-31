module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!

  networks: {
    ganache: {
      network_id: 127001,
      host: "127.0.0.1",
      port: 8545
    },
    coverage: {
      host: "localhost",
      network_id: "*",
      port: 8545,         // <-- If you change this, also set the port option in .solcover.js.
      gas: 0xfffffffffff, // <-- Use this high gas value
      gasPrice: 0x0000000000000001      // <-- Use this low gas price
    },
  },

  compilers: {
    solc: {
      version: "./node_modules/solc"
    }
  },
  solc: {
    optimizer: {
      enabled: true, // TO TURN ON for launch
      runs: 500,
      details: {
        yul: true
      }
    }
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
