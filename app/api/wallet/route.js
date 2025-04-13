import { NextResponse } from 'next/server';
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { BaseGoerli } from "@thirdweb-dev/chains";
import { SmartWallet } from "@thirdweb-dev/wallets";

// Environment variables (replace with your actual values in .env.local)
const THIRDWEB_SECRET_KEY = process.env.THIRDWEB_SECRET_KEY;
const ACCOUNT_FACTORY_ADDRESS = process.env.ACCOUNT_FACTORY_ADDRESS || "0x..."; // Your factory address
const PAYMASTER_ADDRESS = process.env.PAYMASTER_ADDRESS; // Optional: Your paymaster for gasless transactions
const TRUSTED_FORWARDER = process.env.NEXT_PUBLIC_TRUSTED_FORWARDER || "0xBf175FCC7086b4f9bd59d5EAE8eA67b8f940DE0d";
const SMART_WALLET_URL = process.env.NEXT_PUBLIC_BASE_SMART_WALLET_URL || "https://api.smartwallet.dev/v1";

// Initialize the SDK
const sdk = ThirdwebSDK.fromPrivateKey(
  THIRDWEB_SECRET_KEY, 
  BaseGoerli, // Change to Base for production
  {
    clientId: process.env.THIRDWEB_CLIENT_ID,
  }
);

/**
 * Create a new smart wallet or retrieve existing one
 */
export async function POST(req) {
  try {
    const data = await req.json();
    const { personalWalletAddress, authType } = data;
    
    if (!personalWalletAddress) {
      return NextResponse.json(
        { error: "Personal wallet address is required" },
        { status: 400 }
      );
    }
    
    // Create a smart wallet instance
    const smartWallet = new SmartWallet({
      chain: BaseGoerli, // Replace with Base for production
      factoryAddress: ACCOUNT_FACTORY_ADDRESS,
      gasless: !!PAYMASTER_ADDRESS, // Enable gasless if paymaster is configured
      ...(PAYMASTER_ADDRESS && {
        paymaster: {
          paymasterAPI: `https://api.defender.openzeppelin.com/autotasks/${PAYMASTER_ADDRESS}/runs/webhook/`,
        },
      }),
      trustedForwarder: TRUSTED_FORWARDER,
      apiUrl: SMART_WALLET_URL,
    });
    
    // Initialize the wallet with the connected personal wallet
    await smartWallet.connect({
      personalWallet: personalWalletAddress,
    });
    
    // Check if account is deployed
    const isDeployed = await smartWallet.isDeployed();
    
    // Get the smart wallet address
    const address = await smartWallet.getAddress();
    
    // Create a session key for the user
    const sessionKey = await createSessionKey(smartWallet, address);
    
    return NextResponse.json({
      success: true,
      smartWalletAddress: address,
      isDeployed,
      sessionKey,
      authType,
    });
    
  } catch (error) {
    console.error("Error creating smart wallet:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create smart wallet" },
      { status: 500 }
    );
  }
}

/**
 * Generate a session key for a specific smart wallet
 */
async function createSessionKey(smartWallet, address) {
  try {
    // Generate a new private key for this session
    // In a real app, you would use a secure method to generate and store this key
    const sessionKeyPrivateKey = sdk.wallet.generatePrivateKey();
    
    // Get the public key from the private key
    const sessionKeyAddress = sdk.wallet.getAddressFromPrivateKey(sessionKeyPrivateKey);
    
    // Define permissions for this session key
    const permissions = [
      {
        // Allow following marketplace contract calls:
        // - Purchase products
        // - List products
        // - Update purchase status
        contractAddress: process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || "0x...", // Replace with your marketplace address
        functionSelectors: [
          // Marketplace function selectors
          "0x12345678", // purchaseProduct function selector
          "0x87654321", // listProduct function selector
          "0x11223344", // updatePurchaseStatus function selector
        ],
      },
    ];
    
    // Define validity for 7 days
    const validityInSeconds = 7 * 24 * 60 * 60; // 7 days
    
    // Create the session key with specified permissions
    const receipt = await smartWallet.createSessionKey(
      sessionKeyAddress,
      {
        approvedTargets: permissions.map(p => p.contractAddress),
        nativeTokenLimitPerTransaction: 0, // Limit for native token per transaction
        permittedFunctions: permissions,
        startDate: new Date(),
        expirationDate: new Date(Date.now() + validityInSeconds * 1000),
      }
    );
    
    return {
      sessionKeyAddress,
      sessionKeyPrivateKey,
      expiresAt: new Date(Date.now() + validityInSeconds * 1000),
      receipt,
    };
  } catch (error) {
    console.error("Error creating session key:", error);
    throw error;
  }
}

/**
 * Get wallet information
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");
    
    if (!address) {
      return NextResponse.json(
        { error: "Smart wallet address is required" },
        { status: 400 }
      );
    }
    
    // Connect to the smart wallet
    const smartWallet = new SmartWallet({
      chain: BaseGoerli, // Change to Base for production
      factoryAddress: ACCOUNT_FACTORY_ADDRESS,
      gasless: !!PAYMASTER_ADDRESS,
      ...(PAYMASTER_ADDRESS && {
        paymaster: {
          paymasterAPI: `https://api.defender.openzeppelin.com/autotasks/${PAYMASTER_ADDRESS}/runs/webhook/`,
        },
      }),
      trustedForwarder: TRUSTED_FORWARDER,
      apiUrl: SMART_WALLET_URL,
    });
    
    // Check if the wallet is deployed
    const isDeployed = await smartWallet.isDeployed(address);
    
    // Get basic wallet info
    return NextResponse.json({
      address,
      isDeployed,
      chain: BaseGoerli.chainId, // Change to Base for production
    });
    
  } catch (error) {
    console.error("Error retrieving wallet information:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get wallet information" },
      { status: 500 }
    );
  }
} 