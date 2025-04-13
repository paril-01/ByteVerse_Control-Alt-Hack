const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ShopTokMarketplace", function () {
  let shopTokMarketplace;
  let mockUSDC;
  let owner;
  let seller;
  let buyer;
  let productId;
  let purchaseId;

  beforeEach(async function () {
    // Deploy mock USDC token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockUSDC = await MockERC20.deploy("USD Coin", "USDC", 6); // 6 decimals like real USDC
    await mockUSDC.deployed();

    // Deploy marketplace contract
    const ShopTokMarketplace = await ethers.getContractFactory("ShopTokMarketplace");
    shopTokMarketplace = await ShopTokMarketplace.deploy(mockUSDC.address);
    await shopTokMarketplace.deployed();

    // Get signers
    [owner, seller, buyer] = await ethers.getSigners();

    // Mint some USDC to the buyer
    const amount = ethers.utils.parseUnits("1000", 6); // 1000 USDC
    await mockUSDC.mint(buyer.address, amount);
    
    // Approve marketplace to spend buyer's USDC
    await mockUSDC.connect(buyer).approve(shopTokMarketplace.address, amount);
    
    // List a product
    const tx = await shopTokMarketplace.connect(seller).listProduct(
      ethers.utils.parseUnits("100", 6), // 100 USDC
      "ipfs://QmProductMetadata"
    );
    
    const receipt = await tx.wait();
    const event = receipt.events.find(e => e.event === "ProductListed");
    productId = event.args.productId.toNumber();
  });

  describe("Deployment", function () {
    it("Should set the right USDC token", async function () {
      expect(await shopTokMarketplace.usdcToken()).to.equal(mockUSDC.address);
    });

    it("Should set the right owner", async function () {
      expect(await shopTokMarketplace.owner()).to.equal(owner.address);
    });

    it("Should have the correct platform fee percentage", async function () {
      expect(await shopTokMarketplace.platformFeePercentage()).to.equal(250); // 2.5%
    });
  });

  describe("Product Listing", function () {
    it("Should list a product correctly", async function () {
      const product = await shopTokMarketplace.products(productId);
      
      expect(product.id).to.equal(productId);
      expect(product.seller).to.equal(seller.address);
      expect(product.metadata).to.equal("ipfs://QmProductMetadata");
      expect(product.price).to.equal(ethers.utils.parseUnits("100", 6));
      expect(product.isActive).to.be.true;
    });

    it("Should update a product correctly", async function () {
      await shopTokMarketplace.connect(seller).updateProduct(
        productId,
        ethers.utils.parseUnits("150", 6), // Updated price
        true,
        "ipfs://QmUpdatedMetadata"
      );
      
      const product = await shopTokMarketplace.products(productId);
      expect(product.price).to.equal(ethers.utils.parseUnits("150", 6));
      expect(product.metadata).to.equal("ipfs://QmUpdatedMetadata");
    });

    it("Should not allow non-seller to update product", async function () {
      await expect(
        shopTokMarketplace.connect(buyer).updateProduct(
          productId,
          ethers.utils.parseUnits("150", 6),
          true,
          "ipfs://QmUpdatedMetadata"
        )
      ).to.be.revertedWith("Not the seller");
    });

    it("Should batch list products", async function () {
      const prices = [
        ethers.utils.parseUnits("50", 6),
        ethers.utils.parseUnits("75", 6),
      ];
      
      const metadataArray = [
        "ipfs://QmBatchProduct1",
        "ipfs://QmBatchProduct2",
      ];
      
      const tx = await shopTokMarketplace.connect(seller).batchListProducts(
        prices,
        metadataArray
      );
      
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "BatchProductsListed");
      const productIds = event.args.productIds.map(id => id.toNumber());
      
      expect(productIds.length).to.equal(2);
      
      const product1 = await shopTokMarketplace.products(productIds[0]);
      const product2 = await shopTokMarketplace.products(productIds[1]);
      
      expect(product1.price).to.equal(prices[0]);
      expect(product2.price).to.equal(prices[1]);
      expect(product1.metadata).to.equal(metadataArray[0]);
      expect(product2.metadata).to.equal(metadataArray[1]);
    });
  });

  describe("Product Purchase and Escrow", function () {
    it("Should create a purchase and hold funds in escrow", async function () {
      const buyerUsdcBefore = await mockUSDC.balanceOf(buyer.address);
      const marketplaceUsdcBefore = await mockUSDC.balanceOf(shopTokMarketplace.address);
      
      const tx = await shopTokMarketplace.connect(buyer).purchaseProduct(productId);
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "ProductPurchased");
      purchaseId = event.args.purchaseId.toNumber();
      
      const purchase = await shopTokMarketplace.purchases(purchaseId);
      const buyerUsdcAfter = await mockUSDC.balanceOf(buyer.address);
      const marketplaceUsdcAfter = await mockUSDC.balanceOf(shopTokMarketplace.address);
      
      // Check purchase details
      expect(purchase.id).to.equal(purchaseId);
      expect(purchase.productId).to.equal(productId);
      expect(purchase.buyer).to.equal(buyer.address);
      expect(purchase.seller).to.equal(seller.address);
      expect(purchase.amount).to.equal(ethers.utils.parseUnits("100", 6));
      expect(purchase.status).to.equal(0); // PurchaseStatus.Pending
      
      // Check USDC transfer to escrow
      expect(buyerUsdcBefore.sub(buyerUsdcAfter)).to.equal(ethers.utils.parseUnits("100", 6));
      expect(marketplaceUsdcAfter.sub(marketplaceUsdcBefore)).to.equal(ethers.utils.parseUnits("100", 6));
    });

    it("Should not allow purchase if product is inactive", async function () {
      // Deactivate the product
      await shopTokMarketplace.connect(seller).updateProduct(
        productId,
        ethers.utils.parseUnits("100", 6),
        false, // inactive
        "ipfs://QmProductMetadata"
      );
      
      await expect(
        shopTokMarketplace.connect(buyer).purchaseProduct(productId)
      ).to.be.revertedWith("Product is not active");
    });

    it("Should not allow seller to buy their own product", async function () {
      await expect(
        shopTokMarketplace.connect(seller).purchaseProduct(productId)
      ).to.be.revertedWith("Cannot buy your own product");
    });
  });

  describe("Purchase Status and Fund Release", function () {
    beforeEach(async function () {
      // Make a purchase first
      const tx = await shopTokMarketplace.connect(buyer).purchaseProduct(productId);
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "ProductPurchased");
      purchaseId = event.args.purchaseId.toNumber();
    });

    it("Should allow the seller to mark as shipped", async function () {
      await shopTokMarketplace.connect(seller).updatePurchaseStatus(
        purchaseId,
        1 // PurchaseStatus.Shipped
      );
      
      const purchase = await shopTokMarketplace.purchases(purchaseId);
      expect(purchase.status).to.equal(1); // PurchaseStatus.Shipped
    });

    it("Should not allow non-seller to mark as shipped", async function () {
      await expect(
        shopTokMarketplace.connect(buyer).updatePurchaseStatus(
          purchaseId,
          1 // PurchaseStatus.Shipped
        )
      ).to.be.revertedWith("Only seller can mark as shipped");
    });

    it("Should release funds to seller when buyer completes the purchase", async function () {
      // Mark as shipped first
      await shopTokMarketplace.connect(seller).updatePurchaseStatus(
        purchaseId,
        1 // PurchaseStatus.Shipped
      );
      
      const sellerUsdcBefore = await mockUSDC.balanceOf(seller.address);
      const marketplaceUsdcBefore = await mockUSDC.balanceOf(shopTokMarketplace.address);
      const ownerUsdcBefore = await mockUSDC.balanceOf(owner.address);
      
      // Buyer marks as completed
      await shopTokMarketplace.connect(buyer).updatePurchaseStatus(
        purchaseId,
        2 // PurchaseStatus.Completed
      );
      
      const purchase = await shopTokMarketplace.purchases(purchaseId);
      const sellerUsdcAfter = await mockUSDC.balanceOf(seller.address);
      const marketplaceUsdcAfter = await mockUSDC.balanceOf(shopTokMarketplace.address);
      const ownerUsdcAfter = await mockUSDC.balanceOf(owner.address);
      
      // Check purchase status
      expect(purchase.status).to.equal(2); // PurchaseStatus.Completed
      
      // Calculate expected amounts
      const totalAmount = ethers.utils.parseUnits("100", 6);
      const platformFee = totalAmount.mul(250).div(10000); // 2.5% of 100 USDC
      const sellerAmount = totalAmount.sub(platformFee);
      
      // Check USDC transfer from escrow to seller and fee to owner
      expect(sellerUsdcAfter.sub(sellerUsdcBefore)).to.equal(sellerAmount);
      expect(ownerUsdcAfter.sub(ownerUsdcBefore)).to.equal(platformFee);
      expect(marketplaceUsdcBefore.sub(marketplaceUsdcAfter)).to.equal(totalAmount);
    });

    it("Should release funds automatically after escrow period", async function () {
      // Mark as shipped
      await shopTokMarketplace.connect(seller).updatePurchaseStatus(
        purchaseId,
        1 // PurchaseStatus.Shipped
      );
      
      // Get current escrow release time
      const purchase = await shopTokMarketplace.purchases(purchaseId);
      const escrowReleaseTime = purchase.escrowReleaseTime;
      
      // Fast forward time past the escrow period
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60 + 1]); // 7 days + 1 second
      await ethers.provider.send("evm_mine");
      
      const sellerUsdcBefore = await mockUSDC.balanceOf(seller.address);
      
      // Anyone can now complete the purchase after escrow period
      await shopTokMarketplace.connect(owner).updatePurchaseStatus(
        purchaseId,
        2 // PurchaseStatus.Completed
      );
      
      const sellerUsdcAfter = await mockUSDC.balanceOf(seller.address);
      
      // Check that seller received funds (minus platform fee)
      const totalAmount = ethers.utils.parseUnits("100", 6);
      const platformFee = totalAmount.mul(250).div(10000); // 2.5% of 100 USDC
      const sellerAmount = totalAmount.sub(platformFee);
      
      expect(sellerUsdcAfter.sub(sellerUsdcBefore)).to.equal(sellerAmount);
    });

    it("Should allow refund by seller", async function () {
      const buyerUsdcBefore = await mockUSDC.balanceOf(buyer.address);
      const marketplaceUsdcBefore = await mockUSDC.balanceOf(shopTokMarketplace.address);
      
      // Seller issues refund
      await shopTokMarketplace.connect(seller).updatePurchaseStatus(
        purchaseId,
        3 // PurchaseStatus.Refunded
      );
      
      const purchase = await shopTokMarketplace.purchases(purchaseId);
      const buyerUsdcAfter = await mockUSDC.balanceOf(buyer.address);
      const marketplaceUsdcAfter = await mockUSDC.balanceOf(shopTokMarketplace.address);
      
      // Check purchase status
      expect(purchase.status).to.equal(3); // PurchaseStatus.Refunded
      
      // Check USDC transfer from escrow back to buyer
      expect(buyerUsdcAfter.sub(buyerUsdcBefore)).to.equal(ethers.utils.parseUnits("100", 6));
      expect(marketplaceUsdcBefore.sub(marketplaceUsdcAfter)).to.equal(ethers.utils.parseUnits("100", 6));
    });

    it("Should handle disputes correctly", async function () {
      // Buyer files a dispute
      await shopTokMarketplace.connect(buyer).updatePurchaseStatus(
        purchaseId,
        4 // PurchaseStatus.Disputed
      );
      
      let purchase = await shopTokMarketplace.purchases(purchaseId);
      expect(purchase.status).to.equal(4); // PurchaseStatus.Disputed
      
      const buyerUsdcBefore = await mockUSDC.balanceOf(buyer.address);
      
      // Admin resolves in favor of buyer (refund)
      await shopTokMarketplace.connect(owner).resolveDispute(
        purchaseId,
        true // refund to buyer
      );
      
      purchase = await shopTokMarketplace.purchases(purchaseId);
      const buyerUsdcAfter = await mockUSDC.balanceOf(buyer.address);
      
      expect(purchase.status).to.equal(3); // PurchaseStatus.Refunded
      expect(buyerUsdcAfter.sub(buyerUsdcBefore)).to.equal(ethers.utils.parseUnits("100", 6));
    });
  });

  describe("Admin functions", function () {
    it("Should allow owner to update platform fee", async function () {
      await shopTokMarketplace.connect(owner).updatePlatformFeePercentage(300); // 3%
      expect(await shopTokMarketplace.platformFeePercentage()).to.equal(300);
    });

    it("Should not allow setting fee above 10%", async function () {
      await expect(
        shopTokMarketplace.connect(owner).updatePlatformFeePercentage(1100) // 11%
      ).to.be.revertedWith("Fee cannot exceed 10%");
    });

    it("Should allow owner to update escrow period", async function () {
      await shopTokMarketplace.connect(owner).updateEscrowPeriod(14 * 24 * 60 * 60); // 14 days
      expect(await shopTokMarketplace.escrowPeriod()).to.equal(14 * 24 * 60 * 60);
    });

    it("Should not allow non-owner to update platform parameters", async function () {
      await expect(
        shopTokMarketplace.connect(seller).updatePlatformFeePercentage(300)
      ).to.be.revertedWith("Ownable: caller is not the owner");
      
      await expect(
        shopTokMarketplace.connect(buyer).updateEscrowPeriod(14 * 24 * 60 * 60)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});

// Simple mock ERC20 token for testing
const MockERC20 = artifacts.ethers.getContractFactory("MockERC20", async () => {
  return ethers.getContractFactory(`
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    uint8 private _decimals;

    constructor(string memory name, string memory symbol, uint8 decimals_) ERC20(name, symbol) {
        _decimals = decimals_;
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
}
  `);
}); 