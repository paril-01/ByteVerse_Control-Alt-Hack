import { NextResponse } from 'next/server';
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { BaseGoerli } from "@thirdweb-dev/chains";
import { v4 as uuidv4 } from 'uuid';

// Replace these with your actual contract addresses
const MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || "0x...";
const NFT_RECEIPT_ADDRESS = process.env.NEXT_PUBLIC_RECEIPT_NFT_ADDRESS || "0x...";
const AGENT_KIT_API_KEY = process.env.NEXT_PUBLIC_AGENT_KIT_API_KEY || "MOCK_KEY";
const AGENT_KIT_MODEL_ID = process.env.AGENT_KIT_MODEL_ID || "claude-3-opus-20240229";

// Initialize ThirdwebSDK with API key
const sdk = new ThirdwebSDK(
  BaseGoerli, // Change to Base for production
  {
    clientId: process.env.THIRDWEB_CLIENT_ID,
  }
);

// Simple in-memory cache for trending products
// In production, use Redis or a database
let trendingProductsCache = {
  data: [],
  lastUpdated: 0,
  updateInterval: 15 * 60 * 1000, // 15 minutes
};

/**
 * Get personalized feed based on user activity and trending products
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get("address");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skipAI = searchParams.get("skipAI") === "true"; // For testing without AI
    
    // Get trending products first
    const trendingProducts = await getTrendingProducts();
    
    // If we have a wallet address, personalize the feed
    let personalizedFeed = trendingProducts;
    
    if (walletAddress && !skipAI) {
      personalizedFeed = await personalizeForUser(walletAddress, trendingProducts);
    }
    
    // Format response and limit results
    const formattedFeed = personalizedFeed
      .slice(0, limit)
      .map(product => ({
        id: product.id,
        metadata: product.metadata,
        price: product.price,
        seller: product.seller,
        score: product.score,
        trending: product.trending,
      }));
    
    return NextResponse.json({
      success: true,
      products: formattedFeed,
      isPersonalized: !!walletAddress && !skipAI,
      lastUpdated: new Date(trendingProductsCache.lastUpdated).toISOString(),
    });
    
  } catch (error) {
    console.error("Error generating feed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate feed" },
      { status: 500 }
    );
  }
}

/**
 * Force refresh the trending products cache
 */
export async function POST(req) {
  try {
    const data = await req.json();
    const { forceRefresh } = data;
    
    if (forceRefresh) {
      // Clear cache to force refresh
      trendingProductsCache.lastUpdated = 0;
    }
    
    const trendingProducts = await getTrendingProducts(true);
    
    return NextResponse.json({
      success: true,
      productsCount: trendingProducts.length,
      lastUpdated: new Date(trendingProductsCache.lastUpdated).toISOString(),
    });
    
  } catch (error) {
    console.error("Error refreshing trending products:", error);
    return NextResponse.json(
      { error: error.message || "Failed to refresh trending products" },
      { status: 500 }
    );
  }
}

/**
 * Get trending products from the marketplace
 * Uses a cache to avoid calling the blockchain too often
 */
async function getTrendingProducts(forceRefresh = false) {
  const now = Date.now();
  
  // Use cached data if it's recent enough
  if (
    !forceRefresh &&
    trendingProductsCache.data.length > 0 &&
    now - trendingProductsCache.lastUpdated < trendingProductsCache.updateInterval
  ) {
    return trendingProductsCache.data;
  }
  
  // Get data from blockchain
  const marketplace = await sdk.getContract(MARKETPLACE_ADDRESS);
  
  // We'll get all active products
  // In a real implementation, you'd use indexers like The Graph for efficiency
  const allProducts = [];
  const nextId = await marketplace.call("_nextProductId");
  
  // Batch requests to get product data
  // We'll get 10 products at a time to avoid hitting gas limits
  const batchSize = 10;
  for (let i = 1; i < parseInt(nextId.toString()); i += batchSize) {
    const batch = [];
    for (let j = i; j < i + batchSize && j < parseInt(nextId.toString()); j++) {
      batch.push(marketplace.call("products", [j]));
    }
    
    const results = await Promise.all(batch);
    for (const product of results) {
      if (product.isActive) {
        // Format and add to our collection
        allProducts.push({
          id: product.id.toString(),
          seller: product.seller,
          metadata: product.metadata, // IPFS hash
          price: product.price.toString(),
          createdAt: product.createdAt.toString(),
          updatedAt: product.updatedAt.toString(),
        });
      }
    }
  }
  
  // Analyze the products data and calculate trending scores
  const trending = await analyzeAndScoreTrending(allProducts);
  
  // Update the cache
  trendingProductsCache = {
    data: trending,
    lastUpdated: now,
    updateInterval: trendingProductsCache.updateInterval,
  };
  
  return trending;
}

/**
 * Analyze product data and score for trending
 * This is where AgentKit would be integrated in a full implementation
 */
async function analyzeAndScoreTrending(products) {
  // Get purchase data from marketplace to determine popularity
  const marketplace = await sdk.getContract(MARKETPLACE_ADDRESS);
  const purchases = [];
  
  // In a real implementation, you'd use The Graph or a database
  // For this demo, we'll use a simplified approach with mock data
  
  // Create a map of product ID to product data
  const productMap = products.reduce((map, product) => {
    map[product.id] = { ...product, purchases: 0, score: 0 };
    return map;
  }, {});
  
  // Here we would normally fetch real purchase data
  // For this demo, we'll simulate some purchases
  for (const product of products) {
    // Simulate purchase counts - in reality, this would be real data
    const randomPurchases = Math.floor(Math.random() * 10);
    productMap[product.id].purchases = randomPurchases;
    
    // Calculate a simple trending score based on:
    // 1. Recency (newer products score higher)
    // 2. Purchase count
    const ageInDays = (Date.now() / 1000 - parseInt(product.createdAt)) / (24 * 60 * 60);
    const recencyScore = Math.max(0, 1 - ageInDays / 30); // Higher for newer items
    
    const purchaseScore = randomPurchases / 10; // Normalize purchases to 0-1 range
    
    // Combined score (recency has higher weight)
    productMap[product.id].score = recencyScore * 0.7 + purchaseScore * 0.3;
    
    // Add trending flag to top 30% of products
    productMap[product.id].trending = false;
  }
  
  // Get trending scores from AgentKit if available
  try {
    const scores = await getAgentKitScores(products);
    if (scores && scores.length > 0) {
      scores.forEach(item => {
        if (productMap[item.id]) {
          // Blend AgentKit score with our basic score
          productMap[item.id].score = (productMap[item.id].score + item.score) / 2;
        }
      });
    }
  } catch (error) {
    console.error("Error getting AgentKit scores:", error);
    // Continue with basic scoring if AgentKit fails
  }
  
  // Convert back to array and sort by score
  const scoredProducts = Object.values(productMap)
    .sort((a, b) => b.score - a.score);
  
  // Mark top 30% as trending
  const trendingCount = Math.ceil(scoredProducts.length * 0.3);
  for (let i = 0; i < trendingCount; i++) {
    scoredProducts[i].trending = true;
  }
  
  return scoredProducts;
}

/**
 * Get trending scores from AgentKit
 */
async function getAgentKitScores(products) {
  // Mock implementation - replace with actual AgentKit API call
  if (AGENT_KIT_API_KEY === "MOCK_KEY") {
    // Return mock scores in dev environment
    return products.map(product => ({
      id: product.id,
      score: Math.random() * 0.5 + 0.5, // Random score between 0.5 and 1.0
    }));
  }
  
  // In production, call the actual AgentKit API
  try {
    const response = await fetch("https://api.agentkit.ai/v1/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AGENT_KIT_API_KEY}`,
      },
      body: JSON.stringify({
        model: AGENT_KIT_MODEL_ID,
        products: products.map(p => ({
          id: p.id,
          metadata: p.metadata,
          price: p.price,
          created_at: p.createdAt,
        })),
        task: "trending_analysis",
      }),
    });
    
    if (!response.ok) {
      throw new Error(`AgentKit API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.scores || [];
  } catch (error) {
    console.error("AgentKit API error:", error);
    throw error;
  }
}

/**
 * Personalize feed for a specific user based on their onchain activity
 * This is where we would integrate with AgentKit for AI personalization
 */
async function personalizeForUser(walletAddress, trendingProducts) {
  // Get user's purchase history
  const marketplace = await sdk.getContract(MARKETPLACE_ADDRESS);
  const nftContract = await sdk.getContract(NFT_RECEIPT_ADDRESS);
  
  // Get user's NFT tokens (receipts of purchases)
  let userTokens = [];
  try {
    userTokens = await nftContract.call("getTokensByOwner", [walletAddress]);
  } catch (error) {
    console.error("Error getting user tokens:", error);
    // Continue with trending feed if we can't get user data
    return trendingProducts;
  }
  
  // If user has no purchase history, return trending feed
  if (!userTokens || userTokens.length === 0) {
    return trendingProducts;
  }
  
  // Get purchase IDs from tokens
  const purchaseIds = [];
  for (const tokenId of userTokens) {
    try {
      const purchaseId = await nftContract.call("getPurchaseIdByToken", [tokenId]);
      purchaseIds.push(purchaseId.toString());
    } catch (error) {
      console.error(`Error getting purchase ID for token ${tokenId}:`, error);
    }
  }
  
  // Get purchase data
  const userPurchases = [];
  for (const purchaseId of purchaseIds) {
    try {
      const purchase = await marketplace.call("purchases", [purchaseId]);
      userPurchases.push({
        id: purchase.id.toString(),
        productId: purchase.productId.toString(),
        seller: purchase.seller,
        amount: purchase.amount.toString(),
        timestamp: purchase.timestamp.toString(),
      });
    } catch (error) {
      console.error(`Error getting purchase ${purchaseId}:`, error);
    }
  }
  
  // Get product details for purchased items
  const purchasedProductIds = userPurchases.map(p => p.productId);
  const purchasedProducts = [];
  
  for (const productId of purchasedProductIds) {
    try {
      const product = await marketplace.call("products", [productId]);
      if (product.id.toString() !== "0") {
        purchasedProducts.push({
          id: product.id.toString(),
          seller: product.seller,
          metadata: product.metadata,
        });
      }
    } catch (error) {
      console.error(`Error getting product ${productId}:`, error);
    }
  }
  
  // Use AgentKit to personalize feed if available
  try {
    const personalizedOrder = await getAgentKitPersonalization(walletAddress, trendingProducts, purchasedProducts);
    if (personalizedOrder && personalizedOrder.length > 0) {
      return personalizedOrder;
    }
  } catch (error) {
    console.error("Error getting AgentKit personalization:", error);
    // Fall back to basic personalization if AgentKit fails
  }
  
  // Basic personalization as fallback
  // Sort trending products to prioritize sellers the user has purchased from before
  const personalizedFeed = [...trendingProducts].sort((a, b) => {
    const aFromFavoriteSeller = purchasedProducts.some(p => p.seller === a.seller);
    const bFromFavoriteSeller = purchasedProducts.some(p => p.seller === b.seller);
    
    if (aFromFavoriteSeller && !bFromFavoriteSeller) return -1;
    if (!aFromFavoriteSeller && bFromFavoriteSeller) return 1;
    
    // If both or neither are from favorite sellers, keep original trending order
    return b.score - a.score;
  });
  
  return personalizedFeed;
}

/**
 * Get personalized feed from AgentKit
 */
async function getAgentKitPersonalization(walletAddress, trendingProducts, purchasedProducts) {
  // Mock implementation - replace with actual AgentKit API call
  if (AGENT_KIT_API_KEY === "MOCK_KEY") {
    // Just return the trending products in a slightly modified order for testing
    const shuffled = [...trendingProducts];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  // In production, call the actual AgentKit API
  try {
    const response = await fetch("https://api.agentkit.ai/v1/personalize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AGENT_KIT_API_KEY}`,
      },
      body: JSON.stringify({
        model: AGENT_KIT_MODEL_ID,
        user: {
          wallet_address: walletAddress,
          purchased_products: purchasedProducts,
        },
        trending_products: trendingProducts,
        task: "feed_personalization",
      }),
    });
    
    if (!response.ok) {
      throw new Error(`AgentKit API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.personalized_feed || [];
  } catch (error) {
    console.error("AgentKit API error:", error);
    throw error;
  }
} 