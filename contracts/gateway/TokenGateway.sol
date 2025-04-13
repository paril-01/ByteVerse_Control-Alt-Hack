// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title TokenGateway
 * @dev Gateway contract for token operations in ShopTok
 * Handles USDC balance checks, estimations, and future cross-chain functionality
 */
contract TokenGateway is Ownable, ReentrancyGuard {
    // USDC token contract
    IERC20 public usdcToken;
    
    // Base gas price in wei
    uint256 public baseGasPrice;
    
    // Gas limit for marketplace operations
    uint256 public purchaseGasLimit = 300000;
    
    // Address of the marketplace contract
    address public marketplaceContract;
    
    // Whitelisted tokens (for future cross-chain functionality)
    mapping(address => bool) public whitelistedTokens;
    
    // Events
    event TokenWhitelisted(address indexed token, bool status);
    event MarketplaceContractUpdated(address indexed newContract);
    event GasEstimationUpdated(uint256 baseGasPrice, uint256 purchaseGasLimit);
    event TokenSwapped(address indexed fromToken, address indexed toToken, uint256 amount, uint256 received);
    
    /**
     * @dev Constructor sets USDC token address and initial gas parameters
     * @param _usdcToken USDC token contract address
     * @param _baseGasPrice Initial base gas price in wei
     */
    constructor(address _usdcToken, uint256 _baseGasPrice) {
        usdcToken = IERC20(_usdcToken);
        baseGasPrice = _baseGasPrice;
        whitelistedTokens[_usdcToken] = true;
        
        emit TokenWhitelisted(_usdcToken, true);
    }
    
    /**
     * @dev Checks if user has sufficient USDC balance
     * @param _user Address to check
     * @param _amount Amount of USDC needed
     * @return bool Whether the user has sufficient balance
     */
    function hasUSDCBalance(address _user, uint256 _amount) external view returns (bool) {
        return usdcToken.balanceOf(_user) >= _amount;
    }
    
    /**
     * @dev Checks if user has approved the marketplace for sufficient USDC
     * @param _user Address to check
     * @param _amount Amount of USDC needed
     * @return bool Whether the user has sufficient allowance
     */
    function hasUSDCAllowance(address _user, uint256 _amount) external view returns (bool) {
        return usdcToken.allowance(_user, marketplaceContract) >= _amount;
    }
    
    /**
     * @dev Estimates gas fee in USDC for a purchase
     * @param _productPrice Price of the product in USDC
     * @return gasFeesInUSDC Gas fee converted to USDC
     */
    function estimateGasFeeInUSDC(uint256 _productPrice) external view returns (uint256) {
        // Calculate gas fee in wei
        uint256 gasFeeInWei = baseGasPrice * purchaseGasLimit;
        
        // Convert to USDC with 6 decimals (assuming 18 decimals for ETH and 6 for USDC)
        // This is a simple estimation and might need adjustment based on actual prices
        uint256 ethPriceInUSD = getETHtoUSDPrice();
        uint256 gasFeesInUSDC = (gasFeeInWei * ethPriceInUSD) / 1e18;
        
        return gasFeesInUSDC;
    }
    
    /**
     * @dev Provides a simple ETH/USD price feed for gas estimations
     * @return ETH price in USD (6 decimals)
     * @notice In production, this should be replaced with a proper price oracle like Chainlink
     */
    function getETHtoUSDPrice() public view returns (uint256) {
        // Placeholder for actual price feed
        // In a real scenario, this would use a Chainlink or similar oracle
        return 3000 * 1e6; // $3000 USD with 6 decimal places
    }
    
    /**
     * @dev Update the marketplace contract address
     * @param _marketplaceContract New marketplace contract address
     */
    function setMarketplaceContract(address _marketplaceContract) external onlyOwner {
        require(_marketplaceContract != address(0), "Invalid contract address");
        marketplaceContract = _marketplaceContract;
        
        emit MarketplaceContractUpdated(_marketplaceContract);
    }
    
    /**
     * @dev Update gas estimation parameters
     * @param _baseGasPrice New base gas price in wei
     * @param _purchaseGasLimit New gas limit for purchases
     */
    function updateGasEstimation(uint256 _baseGasPrice, uint256 _purchaseGasLimit) external onlyOwner {
        baseGasPrice = _baseGasPrice;
        purchaseGasLimit = _purchaseGasLimit;
        
        emit GasEstimationUpdated(_baseGasPrice, _purchaseGasLimit);
    }
    
    /**
     * @dev Add or remove token from whitelist
     * @param _token Token contract address
     * @param _status Whitelist status
     */
    function setTokenWhitelist(address _token, bool _status) external onlyOwner {
        require(_token != address(0), "Invalid token address");
        whitelistedTokens[_token] = _status;
        
        emit TokenWhitelisted(_token, _status);
    }
    
    /**
     * @dev Placeholder for future cross-chain swap functionality
     * @param _fromToken Source token address
     * @param _toToken Destination token address
     * @param _amount Amount to swap
     * @return amountReceived Amount received after swap
     */
    function swapTokens(
        address _fromToken,
        address _toToken,
        uint256 _amount
    ) external nonReentrant returns (uint256) {
        require(whitelistedTokens[_fromToken], "Source token not whitelisted");
        require(whitelistedTokens[_toToken], "Destination token not whitelisted");
        require(_amount > 0, "Amount must be greater than zero");
        
        // Transfer tokens from user to contract
        IERC20(_fromToken).transferFrom(msg.sender, address(this), _amount);
        
        // In a real implementation, this would call a DEX or bridge
        // For now, we'll use a mock conversion rate
        uint256 amountReceived = calculateSwapAmount(_fromToken, _toToken, _amount);
        
        // Transfer tokens to user
        IERC20(_toToken).transfer(msg.sender, amountReceived);
        
        emit TokenSwapped(_fromToken, _toToken, _amount, amountReceived);
        
        return amountReceived;
    }
    
    /**
     * @dev Calculate swap amount between tokens
     * @param _fromToken Source token address
     * @param _toToken Destination token address
     * @param _amount Amount to swap
     * @return amountReceived Amount to receive
     * @notice This is a placeholder for actual swap logic
     */
    function calculateSwapAmount(
        address _fromToken,
        address _toToken,
        uint256 _amount
    ) internal pure returns (uint256) {
        // Mock implementation - in reality would use a price oracle or DEX
        // For simplicity, we use a 1:1 ratio minus fees
        uint256 fee = _amount / 100; // 1% fee
        return _amount - fee;
    }
    
    /**
     * @dev Recover tokens accidentally sent to the contract
     * @param _token Token address
     * @param _amount Amount to recover
     */
    function recoverTokens(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).transfer(owner(), _amount);
    }
    
    /**
     * @dev Recover ETH accidentally sent to the contract
     */
    function recoverETH() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    /**
     * @dev Allow contract to receive ETH
     */
    receive() external payable {}
} 