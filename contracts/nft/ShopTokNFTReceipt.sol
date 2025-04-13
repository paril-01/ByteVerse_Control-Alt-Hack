// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ShopTokNFTReceipt
 * @dev NFT Receipt contract for ShopTok that implements ERC721 with token-bound accounts (ERC-6551)
 */
contract ShopTokNFTReceipt is ERC721URIStorage, ERC721Enumerable, AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // Roles
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    // Counter for token IDs
    Counters.Counter private _tokenIdCounter;
    
    // ERC-6551 Registry contract
    address public immutable tokenBoundRegistry;
    
    // ERC-6551 Implementation contract
    address public immutable tokenBoundImplementation;
    
    // ChainID
    uint256 public immutable chainId;
    
    // Tba addresses mapping
    mapping(uint256 => address) private _tokenBoundAccounts;
    
    // Purchase mapping
    mapping(uint256 => uint256) private _purchaseIdToTokenId;
    mapping(uint256 => uint256) private _tokenIdToPurchaseId;
    
    // Events
    event NFTMinted(uint256 indexed tokenId, address indexed owner, uint256 indexed purchaseId, string tokenURI);
    event TokenBoundAccountCreated(uint256 indexed tokenId, address indexed accountAddress);
    
    /**
     * @dev Constructor
     * @param _name Name of the NFT collection
     * @param _symbol Symbol of the NFT collection
     * @param _tokenBoundRegistry Address of ERC-6551 registry
     * @param _tokenBoundImplementation Address of ERC-6551 implementation
     * @param _chainId Chain ID for ERC-6551 accounts
     */
    constructor(
        string memory _name,
        string memory _symbol,
        address _tokenBoundRegistry,
        address _tokenBoundImplementation,
        uint256 _chainId
    ) ERC721(_name, _symbol) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        
        tokenBoundRegistry = _tokenBoundRegistry;
        tokenBoundImplementation = _tokenBoundImplementation;
        chainId = _chainId;
    }
    
    /**
     * @dev Mint new NFT receipt
     * @param _to Recipient address
     * @param _tokenURI IPFS URI of the receipt metadata
     * @param _purchaseId ID of the purchase in marketplace
     * @return tokenId ID of the minted token
     */
    function mintReceipt(
        address _to,
        string calldata _tokenURI,
        uint256 _purchaseId
    ) external nonReentrant onlyRole(MINTER_ROLE) returns (uint256) {
        require(_to != address(0), "Invalid recipient");
        require(bytes(_tokenURI).length > 0, "Empty token URI");
        require(_purchaseIdToTokenId[_purchaseId] == 0, "Receipt already minted for this purchase");
        
        // Increment token ID
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        // Mint token
        _safeMint(_to, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        
        // Store purchase mapping
        _purchaseIdToTokenId[_purchaseId] = tokenId;
        _tokenIdToPurchaseId[tokenId] = _purchaseId;
        
        // Create token-bound account
        address tba = _createTokenBoundAccount(tokenId);
        _tokenBoundAccounts[tokenId] = tba;
        
        emit NFTMinted(tokenId, _to, _purchaseId, _tokenURI);
        emit TokenBoundAccountCreated(tokenId, tba);
        
        return tokenId;
    }
    
    /**
     * @dev Batch mint NFT receipts - gas efficient
     * @param _recipients Array of recipient addresses
     * @param _tokenURIs Array of IPFS URIs
     * @param _purchaseIds Array of purchase IDs
     * @return tokenIds Array of minted token IDs
     */
    function batchMintReceipts(
        address[] calldata _recipients,
        string[] calldata _tokenURIs,
        uint256[] calldata _purchaseIds
    ) external nonReentrant onlyRole(MINTER_ROLE) returns (uint256[] memory) {
        require(
            _recipients.length == _tokenURIs.length && _tokenURIs.length == _purchaseIds.length,
            "Arrays must be same length"
        );
        require(_recipients.length > 0, "Must mint at least one token");
        require(_recipients.length <= 50, "Batch too large");
        
        uint256[] memory tokenIds = new uint256[](_recipients.length);
        
        for (uint256 i = 0; i < _recipients.length; i++) {
            require(_recipients[i] != address(0), "Invalid recipient");
            require(bytes(_tokenURIs[i]).length > 0, "Empty token URI");
            require(_purchaseIdToTokenId[_purchaseIds[i]] == 0, "Receipt already minted for this purchase");
            
            // Increment token ID
            _tokenIdCounter.increment();
            uint256 tokenId = _tokenIdCounter.current();
            tokenIds[i] = tokenId;
            
            // Mint token
            _safeMint(_recipients[i], tokenId);
            _setTokenURI(tokenId, _tokenURIs[i]);
            
            // Store purchase mapping
            _purchaseIdToTokenId[_purchaseIds[i]] = tokenId;
            _tokenIdToPurchaseId[tokenId] = _purchaseIds[i];
            
            // Create token-bound account
            address tba = _createTokenBoundAccount(tokenId);
            _tokenBoundAccounts[tokenId] = tba;
            
            emit NFTMinted(tokenId, _recipients[i], _purchaseIds[i], _tokenURIs[i]);
            emit TokenBoundAccountCreated(tokenId, tba);
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Create a token-bound account for the NFT using ERC-6551
     * @param _tokenId ID of the token
     * @return tba Address of the token-bound account
     */
    function _createTokenBoundAccount(uint256 _tokenId) internal returns (address) {
        // Call to ERC-6551 registry to create an account
        (bool success, bytes memory result) = tokenBoundRegistry.call(
            abi.encodeWithSignature(
                "createAccount(address,uint256,uint256,uint256,bytes32)",
                tokenBoundImplementation,
                chainId,
                address(this),
                _tokenId,
                bytes32(0) // salt
            )
        );
        
        require(success, "TBA creation failed");
        
        // Extract account address from result
        address tba = abi.decode(result, (address));
        return tba;
    }
    
    /**
     * @dev Get token-bound account address for a token
     * @param _tokenId ID of the token
     * @return TBA address
     */
    function getTokenBoundAccount(uint256 _tokenId) external view returns (address) {
        require(_exists(_tokenId), "Token does not exist");
        return _tokenBoundAccounts[_tokenId];
    }
    
    /**
     * @dev Get token ID by purchase ID
     * @param _purchaseId Purchase ID
     * @return Token ID
     */
    function getTokenIdByPurchase(uint256 _purchaseId) external view returns (uint256) {
        return _purchaseIdToTokenId[_purchaseId];
    }
    
    /**
     * @dev Get purchase ID by token ID
     * @param _tokenId Token ID
     * @return Purchase ID
     */
    function getPurchaseIdByToken(uint256 _tokenId) external view returns (uint256) {
        require(_exists(_tokenId), "Token does not exist");
        return _tokenIdToPurchaseId[_tokenId];
    }
    
    /**
     * @dev Get tokens owned by an address
     * @param _owner Owner address
     * @return Array of token IDs
     */
    function getTokensByOwner(address _owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(_owner);
        uint256[] memory tokens = new uint256[](balance);
        
        for (uint256 i = 0; i < balance; i++) {
            tokens[i] = tokenOfOwnerByIndex(_owner, i);
        }
        
        return tokens;
    }
    
    /**
     * @dev Add minter role to an address
     * @param _minter Address to add
     */
    function addMinter(address _minter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(MINTER_ROLE, _minter);
    }
    
    /**
     * @dev Remove minter role from an address
     * @param _minter Address to remove
     */
    function removeMinter(address _minter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(MINTER_ROLE, _minter);
    }
    
    /**
     * @dev Required override for ERC721URIStorage and ERC721Enumerable
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    /**
     * @dev Required override for ERC721URIStorage and ERC721Enumerable
     */
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    /**
     * @dev Required override for ERC721URIStorage and ERC721Enumerable
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    /**
     * @dev Required override for ERC721Enumerable and ERC165
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
} 