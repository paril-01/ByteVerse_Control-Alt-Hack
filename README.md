# ShopTok Backend on Base

ShopTok is a decentralized social commerce platform built on the Base blockchain, combining engaging content experiences with web3 commerce capabilities.

## Architecture Overview

![ShopTok Backend Architecture](https://dummyimage.com/600x400/000/fff&text=Architecture+Diagram)

Our backend implements a multi-layer architecture:

1. **Smart Contract Layer**: Manages products, transactions, and receipts
2. **Wallet & Auth Layer**: Handles user authentication and wallet interactions
3. **AI/Data Layer**: Powers personalized feeds and analytics

## Key Components

### Smart Contracts

- **ShopTokMarketplace**: Handles product listings, escrow management, and purchase flow
- **ShopTokNFTReceipt**: Mints NFT receipts on purchase with ERC-6551 token-bound accounts
- **TokenGateway**: Manages USDC interactions and gas fee estimations

### Backend Services

- **Smart Wallet Integration**: Social logins via thirdweb SDK
- **AgentKit Data Pipeline**: Processing onchain interactions for personalized feeds
- **API Endpoints**: Managing wallet creation, product feeds, and marketplace interactions

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Hardhat for smart contract development
- A Base testnet wallet with testnet ETH and USDC

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/shoptok.git
   cd shoptok
   ```

2. Install dependencies:
   ```bash
   npm install
   cd contracts
   npm install
   ```

3. Configure environment:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration details
   ```

4. Compile and deploy contracts:
   ```bash
   cd contracts
   npx hardhat compile
   npx hardhat run scripts/deploy.js --network base_testnet
   ```

5. Update `.env.local` with your contract addresses after deployment.

6. Start the development server:
   ```bash
   npm run dev
   ```

### Contract Deployment Process

The deployment script (`contracts/scripts/deploy.js`) handles:

1. Deploying all contracts to Base testnet/mainnet
2. Setting up contract relationships
3. Verifying contracts on Basescan (if API key is provided)

## API Routes

The backend exposes these key endpoints:

### Wallet Management
- `POST /api/wallet`: Create a new smart wallet or retrieve existing one
- `GET /api/wallet?address={address}`: Get wallet information

### Feed Generation
- `GET /api/feed?address={address}`: Get personalized product feed
- `POST /api/feed`: Force refresh the trending products cache

## Smart Contract Details

### Marketplace Contract
- USDC escrow for purchases
- Product listing management
- Batch operations for gas efficiency

### NFT Receipt Contract
- ERC-721 with ERC-6551 support
- Links purchases to unique token-bound accounts
- IPFS metadata storage

### Token Gateway
- USDC balance checks
- Gas fee estimations
- Future cross-chain swap support

## Security Considerations

- All contracts include reentrancy protection
- Escrow system with time-locked release
- Admin capabilities limited by roles
- Session key management for improved UX

## Testing

Run contract tests:
```bash
cd contracts
npx hardhat test
```

Run API tests:
```bash
npm test
```

## Production Deployment

For mainnet deployment:

1. Update `.env.local` with mainnet configuration
2. Deploy contracts to Base mainnet:
   ```bash
   cd contracts
   npx hardhat run scripts/deploy.js --network base_mainnet
   ```
3. Build the application:
   ```bash
   npm run build
   ```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Base blockchain team for the L2 infrastructure
- thirdweb for Smart Wallet SDK
- ERC-6551 standard for token-bound accounts 