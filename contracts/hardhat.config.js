require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("hardhat-deploy");

const PRIVATE_KEY = process.env.PRIVATE_KEY || "576ef037d064db1de5b109edb03a2ab15444bc2a8c2b6117eff4fed92fe6089f";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "YWGTC6R38EEGISRBQ7I63ZDA815HQEY6DS";
const BASE_GOERLI_RPC_URL = process.env.BASE_GOERLI_RPC_URL || "https://goerli.base.org/";
const BASE_MAINNET_RPC_URL = process.env.BASE_MAINNET_RPC_URL || "https://mainnet.base.org/";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      chainId: 31337,
    },
    base_goerli: {
      url: BASE_GOERLI_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 84531,
      verify: {
        etherscan: {
          apiUrl: "https://api-goerli.basescan.org",
        },
      },
    },
    base_mainnet: {
      url: BASE_MAINNET_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 8453,
      verify: {
        etherscan: {
          apiUrl: "https://api.basescan.org",
        },
      },
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  etherscan: {
    apiKey: {
      base_goerli: ETHERSCAN_API_KEY,
      base_mainnet: ETHERSCAN_API_KEY,
    },
    customChains: [
      {
        network: "base_goerli",
        chainId: 84531,
        urls: {
          apiURL: "https://api-goerli.basescan.org/api",
          browserURL: "https://goerli.basescan.org",
        },
      },
      {
        network: "base_mainnet",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org",
        },
      },
    ],
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    coinmarketcap: COINMARKETCAP_API_KEY,
  },
}; 