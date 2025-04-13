// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/**
 * @title ShopTokMarketplace
 * @dev Marketplace contract for ShopTok on Base
 * Handles product listings, escrow management, and purchase flow
 */
contract ShopTokMarketplace is Ownable, ReentrancyGuard {
    using EnumerableSet for EnumerableSet.UintSet;
    using EnumerableSet for EnumerableSet.AddressSet;

    // USDC token contract address
    IERC20 public usdcToken;

    // Fee percentage (in basis points, 100 = 1%)
    uint256 public platformFeePercentage = 250; // 2.5%
    
    // Escrow timeout period (in seconds)
    uint256 public escrowPeriod = 7 days;
    
    // Product struct for storing listing information
    struct Product {
        uint256 id;
        address seller;
        string metadata; // IPFS hash of product metadata
        uint256 price; // Price in USDC (6 decimals)
        bool isActive;
        uint256 createdAt;
        uint256 updatedAt;
    }
    
    // Purchase struct for tracking purchases and escrow
    struct Purchase {
        uint256 id;
        uint256 productId;
        address buyer;
        address seller;
        uint256 amount;
        uint256 timestamp;
        PurchaseStatus status;
        uint256 escrowReleaseTime;
    }
    
    enum PurchaseStatus {
        Pending,
        Shipped,
        Completed,
        Refunded,
        Disputed
    }
    
    // State variables for tracking
    uint256 private _nextProductId = 1;
    uint256 private _nextPurchaseId = 1;
    
    // Mappings
    mapping(uint256 => Product) public products;
    mapping(uint256 => Purchase) public purchases;
    mapping(address => EnumerableSet.UintSet) private _sellerProducts;
    mapping(address => EnumerableSet.UintSet) private _buyerPurchases;
    mapping(address => EnumerableSet.UintSet) private _sellerPurchases;
    
    // Events
    event ProductListed(uint256 indexed productId, address indexed seller, uint256 price, string metadata);
    event ProductUpdated(uint256 indexed productId, uint256 price, bool isActive, string metadata);
    event ProductPurchased(uint256 indexed purchaseId, uint256 indexed productId, address indexed buyer, address seller, uint256 amount);
    event PurchaseStatusUpdated(uint256 indexed purchaseId, PurchaseStatus status);
    event FundsReleased(uint256 indexed purchaseId, address seller, uint256 amount);
    event FundsRefunded(uint256 indexed purchaseId, address buyer, uint256 amount);
    event BatchProductsListed(uint256[] productIds, address seller);
    
    /**
     * @dev Constructor sets USDC token address
     * @param _usdcToken USDC token contract address
     */
    constructor(address _usdcToken) {
        usdcToken = IERC20(_usdcToken);
    }
    
    /**
     * @dev Lists a new product for sale
     * @param _price Price in USDC (6 decimals)
     * @param _metadata IPFS hash of product metadata
     * @return productId The ID of the newly created product
     */
    function listProduct(uint256 _price, string calldata _metadata) external returns (uint256) {
        require(_price > 0, "Price must be greater than zero");
        
        uint256 productId = _nextProductId++;
        
        products[productId] = Product({
            id: productId,
            seller: msg.sender,
            metadata: _metadata,
            price: _price,
            isActive: true,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        
        _sellerProducts[msg.sender].add(productId);
        
        emit ProductListed(productId, msg.sender, _price, _metadata);
        
        return productId;
    }
    
    /**
     * @dev Batch list multiple products - gas efficient for Base
     * @param _prices Array of prices in USDC
     * @param _metadataArray Array of IPFS hashes
     * @return productIds Array of created product IDs
     */
    function batchListProducts(uint256[] calldata _prices, string[] calldata _metadataArray) 
        external 
        returns (uint256[] memory)
    {
        require(_prices.length == _metadataArray.length, "Arrays must be same length");
        require(_prices.length > 0, "Must list at least one product");
        require(_prices.length <= 50, "Too many products in batch");
        
        uint256[] memory productIds = new uint256[](_prices.length);
        
        for (uint256 i = 0; i < _prices.length; i++) {
            require(_prices[i] > 0, "Price must be greater than zero");
            
            uint256 productId = _nextProductId++;
            
            products[productId] = Product({
                id: productId,
                seller: msg.sender,
                metadata: _metadataArray[i],
                price: _prices[i],
                isActive: true,
                createdAt: block.timestamp,
                updatedAt: block.timestamp
            });
            
            _sellerProducts[msg.sender].add(productId);
            productIds[i] = productId;
            
            emit ProductListed(productId, msg.sender, _prices[i], _metadataArray[i]);
        }
        
        emit BatchProductsListed(productIds, msg.sender);
        
        return productIds;
    }
    
    /**
     * @dev Updates an existing product
     * @param _productId ID of the product to update
     * @param _price New price in USDC
     * @param _isActive Whether the product is active
     * @param _metadata New IPFS hash of product metadata
     */
    function updateProduct(
        uint256 _productId,
        uint256 _price,
        bool _isActive,
        string calldata _metadata
    ) external {
        Product storage product = products[_productId];
        
        require(product.seller == msg.sender, "Not the seller");
        require(product.id != 0, "Product does not exist");
        require(_price > 0, "Price must be greater than zero");
        
        product.price = _price;
        product.isActive = _isActive;
        product.metadata = _metadata;
        product.updatedAt = block.timestamp;
        
        emit ProductUpdated(_productId, _price, _isActive, _metadata);
    }
    
    /**
     * @dev Purchases a product, holding funds in escrow
     * @param _productId ID of the product to purchase
     * @return purchaseId The ID of the newly created purchase
     */
    function purchaseProduct(uint256 _productId) external nonReentrant returns (uint256) {
        Product storage product = products[_productId];
        
        require(product.id != 0, "Product does not exist");
        require(product.isActive, "Product is not active");
        require(product.seller != msg.sender, "Cannot buy your own product");
        
        uint256 purchaseId = _nextPurchaseId++;
        uint256 escrowReleaseTime = block.timestamp + escrowPeriod;
        
        // Transfer USDC to contract (escrow)
        require(usdcToken.transferFrom(msg.sender, address(this), product.price), "USDC transfer failed");
        
        // Create purchase record
        purchases[purchaseId] = Purchase({
            id: purchaseId,
            productId: _productId,
            buyer: msg.sender,
            seller: product.seller,
            amount: product.price,
            timestamp: block.timestamp,
            status: PurchaseStatus.Pending,
            escrowReleaseTime: escrowReleaseTime
        });
        
        // Update tracking
        _buyerPurchases[msg.sender].add(purchaseId);
        _sellerPurchases[product.seller].add(purchaseId);
        
        emit ProductPurchased(purchaseId, _productId, msg.sender, product.seller, product.price);
        
        return purchaseId;
    }
    
    /**
     * @dev Updates the status of a purchase
     * @param _purchaseId ID of the purchase to update
     * @param _status New status
     */
    function updatePurchaseStatus(uint256 _purchaseId, PurchaseStatus _status) external {
        Purchase storage purchase = purchases[_purchaseId];
        
        require(purchase.id != 0, "Purchase does not exist");
        require(
            purchase.seller == msg.sender || purchase.buyer == msg.sender || owner() == msg.sender,
            "Not authorized"
        );
        
        // Add logic for state transitions
        if (_status == PurchaseStatus.Shipped) {
            require(purchase.seller == msg.sender, "Only seller can mark as shipped");
            require(purchase.status == PurchaseStatus.Pending, "Invalid status transition");
        } else if (_status == PurchaseStatus.Completed) {
            require(purchase.buyer == msg.sender || block.timestamp >= purchase.escrowReleaseTime, 
                "Only buyer can complete or escrow period passed");
            require(purchase.status == PurchaseStatus.Shipped || purchase.status == PurchaseStatus.Pending, 
                "Invalid status transition");
            
            // Release funds to seller
            _releaseFunds(_purchaseId);
        } else if (_status == PurchaseStatus.Refunded) {
            require(purchase.seller == msg.sender || owner() == msg.sender, 
                "Only seller or admin can refund");
            require(purchase.status == PurchaseStatus.Pending || purchase.status == PurchaseStatus.Shipped, 
                "Invalid status transition");
            
            // Refund buyer
            _refundBuyer(_purchaseId);
        } else if (_status == PurchaseStatus.Disputed) {
            require(purchase.buyer == msg.sender, "Only buyer can dispute");
            require(purchase.status == PurchaseStatus.Pending || purchase.status == PurchaseStatus.Shipped, 
                "Invalid status transition");
            
            // Handle dispute (admin will resolve manually)
        }
        
        purchase.status = _status;
        emit PurchaseStatusUpdated(_purchaseId, _status);
    }
    
    /**
     * @dev Releases funds from escrow to seller
     * @param _purchaseId ID of the purchase
     */
    function _releaseFunds(uint256 _purchaseId) internal {
        Purchase storage purchase = purchases[_purchaseId];
        
        uint256 platformFee = (purchase.amount * platformFeePercentage) / 10000;
        uint256 sellerAmount = purchase.amount - platformFee;
        
        // Transfer funds to seller
        require(usdcToken.transfer(purchase.seller, sellerAmount), "Transfer to seller failed");
        
        // Transfer fee to platform
        if (platformFee > 0) {
            require(usdcToken.transfer(owner(), platformFee), "Transfer fee failed");
        }
        
        emit FundsReleased(_purchaseId, purchase.seller, sellerAmount);
    }
    
    /**
     * @dev Refunds buyer for a purchase
     * @param _purchaseId ID of the purchase
     */
    function _refundBuyer(uint256 _purchaseId) internal {
        Purchase storage purchase = purchases[_purchaseId];
        
        // Transfer full amount back to buyer
        require(usdcToken.transfer(purchase.buyer, purchase.amount), "Refund failed");
        
        emit FundsRefunded(_purchaseId, purchase.buyer, purchase.amount);
    }
    
    /**
     * @dev Admin function to resolve disputes
     * @param _purchaseId ID of the disputed purchase
     * @param _refundBuyer Whether to refund the buyer
     */
    function resolveDispute(uint256 _purchaseId, bool _refundBuyer) external onlyOwner {
        Purchase storage purchase = purchases[_purchaseId];
        
        require(purchase.id != 0, "Purchase does not exist");
        require(purchase.status == PurchaseStatus.Disputed, "Purchase not disputed");
        
        if (_refundBuyer) {
            _refundBuyer(_purchaseId);
            purchase.status = PurchaseStatus.Refunded;
        } else {
            _releaseFunds(_purchaseId);
            purchase.status = PurchaseStatus.Completed;
        }
        
        emit PurchaseStatusUpdated(_purchaseId, purchase.status);
    }
    
    /**
     * @dev Gets products listed by a seller
     * @param _seller Address of the seller
     * @return Array of product IDs
     */
    function getSellerProducts(address _seller) external view returns (uint256[] memory) {
        uint256 length = _sellerProducts[_seller].length();
        uint256[] memory productIds = new uint256[](length);
        
        for (uint256 i = 0; i < length; i++) {
            productIds[i] = _sellerProducts[_seller].at(i);
        }
        
        return productIds;
    }
    
    /**
     * @dev Gets purchases made by a buyer
     * @param _buyer Address of the buyer
     * @return Array of purchase IDs
     */
    function getBuyerPurchases(address _buyer) external view returns (uint256[] memory) {
        uint256 length = _buyerPurchases[_buyer].length();
        uint256[] memory purchaseIds = new uint256[](length);
        
        for (uint256 i = 0; i < length; i++) {
            purchaseIds[i] = _buyerPurchases[_buyer].at(i);
        }
        
        return purchaseIds;
    }
    
    /**
     * @dev Gets purchases for products sold by a seller
     * @param _seller Address of the seller
     * @return Array of purchase IDs
     */
    function getSellerPurchases(address _seller) external view returns (uint256[] memory) {
        uint256 length = _sellerPurchases[_seller].length();
        uint256[] memory purchaseIds = new uint256[](length);
        
        for (uint256 i = 0; i < length; i++) {
            purchaseIds[i] = _sellerPurchases[_seller].at(i);
        }
        
        return purchaseIds;
    }
    
    /**
     * @dev Updates platform fee percentage
     * @param _feePercentage New fee percentage in basis points (100 = 1%)
     */
    function updatePlatformFeePercentage(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 1000, "Fee cannot exceed 10%");
        platformFeePercentage = _feePercentage;
    }
    
    /**
     * @dev Updates escrow period
     * @param _escrowPeriod New escrow period in seconds
     */
    function updateEscrowPeriod(uint256 _escrowPeriod) external onlyOwner {
        require(_escrowPeriod >= 1 days && _escrowPeriod <= 30 days, "Invalid escrow period");
        escrowPeriod = _escrowPeriod;
    }
} 