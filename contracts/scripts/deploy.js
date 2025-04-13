// Deploy script for ShopTok contracts on Base
const { ethers, network, run } = require("hardhat");
require("dotenv").config();

// USDC address from environment variables or fallback to hardcoded values 
const USDC_GOERLI = process.env.NEXT_PUBLIC_USDC_ADDRESS || "0xf175520c52418dfe19c8098071a252da48cd1c19";
// USDC address on Base mainnet
const USDC_MAINNET = process.env.NEXT_PUBLIC_USDC_ADDRESS || "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

// ERC-6551 Registry and Implementation addresses
// You would replace these with actual Base addresses when they're available
const ERC6551_REGISTRY_TESTNET = process.env.ERC6551_REGISTRY_TESTNET || "0x02101dfB77FDE026414827Fdc604ddAF224F0921";
const ERC6551_IMPLEMENTATION_TESTNET = process.env.ERC6551_IMPLEMENTATION_TESTNET || "0x2D25602551487C3f3354dD80D76D54383A243358";

// Sample gas price for estimation
const BASE_GAS_PRICE = ethers.utils.parseUnits("0.1", "gwei"); // 0.1 gwei

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  console.log("Network:", network.name);

  // Determine which USDC address to use based on the network
  const usdcAddress = network.name === "base_mainnet" ? USDC_MAINNET : USDC_GOERLI;
  const chainId = network.name === "base_mainnet" ? 8453 : 84531;
  
  console.log(`Using USDC address: ${usdcAddress}`);
  console.log(`Chain ID: ${chainId}`);
  
  // 1. Deploy TokenGateway
  console.log("Deploying TokenGateway...");
  const TokenGateway = await ethers.getContractFactory("TokenGateway");
  const tokenGateway = await TokenGateway.deploy(usdcAddress, BASE_GAS_PRICE);
  await tokenGateway.deployed();
  console.log("TokenGateway deployed to:", tokenGateway.address);
  
  // 2. Deploy NFT Receipt Contract
  console.log("Deploying ShopTokNFTReceipt...");
  const ShopTokNFTReceipt = await ethers.getContractFactory("ShopTokNFTReceipt");
  const nftReceipt = await ShopTokNFTReceipt.deploy(
    "ShopTok Receipts", 
    "SHOPTOK", 
    ERC6551_REGISTRY_TESTNET,
    ERC6551_IMPLEMENTATION_TESTNET,
    chainId
  );
  await nftReceipt.deployed();
  console.log("ShopTokNFTReceipt deployed to:", nftReceipt.address);
  
  // 3. Deploy Marketplace Contract
  console.log("Deploying ShopTokMarketplace...");
  const ShopTokMarketplace = await ethers.getContractFactory("ShopTokMarketplace");
  const marketplace = await ShopTokMarketplace.deploy(usdcAddress);
  await marketplace.deployed();
  console.log("ShopTokMarketplace deployed to:", marketplace.address);
  
  // 4. Set up contract relationships
  console.log("Setting up contract relationships...");
  
  // Add marketplace as minter for NFTs
  const addMinterTx = await nftReceipt.addMinter(marketplace.address);
  await addMinterTx.wait();
  console.log("Added marketplace as NFT minter");
  
  // Set marketplace address in token gateway
  const setMarketplaceTx = await tokenGateway.setMarketplaceContract(marketplace.address);
  await setMarketplaceTx.wait();
  console.log("Set marketplace address in token gateway");
  
  // Update gas estimation in token gateway
  const updateGasTx = await tokenGateway.updateGasEstimation(
    BASE_GAS_PRICE,
    300000 // gas limit
  );
  await updateGasTx.wait();
  console.log("Updated gas estimation in token gateway");
  
  // Log deployment information
  console.log("\n----- DEPLOYMENT SUMMARY -----");
  console.log(`Network: ${network.name} (Chain ID: ${chainId})`);
  console.log(`USDC Address: ${usdcAddress}`);
  console.log(`TokenGateway: ${tokenGateway.address}`);
  console.log(`ShopTokNFTReceipt: ${nftReceipt.address}`);
  console.log(`ShopTokMarketplace: ${marketplace.address}`);
  console.log(`ERC-6551 Registry: ${ERC6551_REGISTRY_TESTNET}`);
  console.log(`ERC-6551 Implementation: ${ERC6551_IMPLEMENTATION_TESTNET}`);
  console.log("-------------------------------");
  
  console.log("\nAdd these addresses to your .env.local file:");
  console.log(`NEXT_PUBLIC_MARKETPLACE_ADDRESS=${marketplace.address}`);
  console.log(`NEXT_PUBLIC_RECEIPT_NFT_ADDRESS=${nftReceipt.address}`);
  console.log(`NEXT_PUBLIC_TOKEN_GATEWAY_ADDRESS=${tokenGateway.address}`);
  
  // Verify contracts (commented out for testnet deployments to avoid rate limiting)
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\nWaiting for block confirmations before verification...");
    // Wait for 5 block confirmations for the contracts to be available for verification
    await tokenGateway.deployTransaction.wait(5);
    await nftReceipt.deployTransaction.wait(5);
    await marketplace.deployTransaction.wait(5);
    
    console.log("Verifying contracts on Etherscan...");
    try {
      // Verify TokenGateway
      await run("verify:verify", {
        address: tokenGateway.address,
        constructorArguments: [usdcAddress, BASE_GAS_PRICE],
        contract: "contracts/gateway/TokenGateway.sol:TokenGateway"
      });
      
      // Verify ShopTokNFTReceipt
      await run("verify:verify", {
        address: nftReceipt.address,
        constructorArguments: [
          "ShopTok Receipts", 
          "SHOPTOK", 
          ERC6551_REGISTRY_TESTNET,
          ERC6551_IMPLEMENTATION_TESTNET,
          chainId
        ],
        contract: "contracts/nft/ShopTokNFTReceipt.sol:ShopTokNFTReceipt"
      });
      
      // Verify ShopTokMarketplace
      await run("verify:verify", {
        address: marketplace.address,
        constructorArguments: [usdcAddress],
        contract: "contracts/marketplace/ShopTokMarketplace.sol:ShopTokMarketplace"
      });
      
      console.log("Contract verification completed");
    } catch (error) {
      console.error("Contract verification failed:", error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 