require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Tasks
require("./tasks/accounts");
require("./tasks/balance");
require("./tasks/flashloan");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.10",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Sepolia Testnet
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
      gas: 6000000,
      gasPrice: 20000000000, // 20 gwei
    },
    
    // Localhost untuk development
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    
    // Hardhat network
    hardhat: {
      chainId: 31337,
      forking: {
        url: process.env.MAINNET_RPC_URL || "",
        enabled: false,
      },
    },
  },
  
  // Etherscan verification
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY,
      mainnet: process.env.ETHERSCAN_API_KEY,
    },
  },
  
  // Gas reporter
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  
  // Mocha timeout
  mocha: {
    timeout: 40000,
  },
};
