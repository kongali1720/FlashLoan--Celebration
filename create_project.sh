#!/bin/bash

echo "🚀 Setting up Flash Loan Tutorial Project..."

# Create main project directory
mkdir -p flash-loan-tutorial
cd flash-loan-tutorial

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p contracts/interfaces contracts/mocks
mkdir -p scripts/helpers
mkdir -p test/integration
mkdir -p tasks
mkdir -p config
mkdir -p docs

echo "📝 Creating configuration files..."

# Create package.json
cat > package.json << 'EOF'
{
  "name": "flash-loan-tutorial",
  "version": "1.0.0",
  "description": "Flash Loan Tutorial for Sepolia Testnet",
  "main": "index.js",
  "scripts": {
    "compile": "npx hardhat compile",
    "deploy": "npx hardhat run scripts/deploy.js --network sepolia",
    "deploy:local": "npx hardhat run scripts/deploy.js --network localhost",
    "test": "npx hardhat test",
    "test:integration": "npx hardhat test test/integration/",
    "node": "npx hardhat node",
    "clean": "npx hardhat clean",
    "verify": "npx hardhat verify --network sepolia",
    "accounts": "npx hardhat accounts",
    "balance": "npx hardhat balance",
    "flashloan": "npx hardhat flashloan"
  },
  "keywords": ["flashloan", "defi", "aave", "ethereum", "sepolia"],
  "author": "Your Name",
  "license": "MIT",
  "devDependencies": {
    "@nomicfoundation/hardhat-toolbox": "^3.0.0",
    "@nomiclabs/hardhat-ethers": "^2.2.3",
    "hardhat": "^2.17.1",
    "dotenv": "^16.3.1",
    "chai": "^4.3.8"
  },
  "dependencies": {
    "@aave/core-v3": "^1.19.3",
    "@openzeppelin/contracts": "^4.9.3",
    "ethers": "^5.7.2"
  }
}
EOF

# Create .env.example
cat > .env.example << 'EOF'
# Network Configuration
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID

# Wallet Private Key (NEVER SHARE THIS!)
PRIVATE_KEY=your_private_key_here

# API Keys
ETHERSCAN_API_KEY=your_etherscan_api_key
INFURA_PROJECT_ID=your_infura_project_id
ALCHEMY_API_KEY=your_alchemy_api_key

# Contract Addresses (will be filled after deployment)
FLASHLOAN_CONTRACT_ADDRESS=
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
# Environment variables
.env

# Dependencies
node_modules/
npm-debug.log*

# Hardhat
cache/
artifacts/
typechain/
typechain-types/

# Coverage
coverage/
coverage.json

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log

# Build artifacts
dist/
build/
EOF

# Create basic README.md
cat > README.md << 'EOF'
# Flash Loan Tutorial

Tutorial lengkap untuk belajar Flash Loan menggunakan Aave V3 di Sepolia Testnet.

## Quick Start

1. Clone repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` dan isi dengan credentials Anda
4. Compile contracts: `npm run compile`
5. Deploy ke Sepolia: `npm run deploy`
6. Test flash loan: `npm run flashloan`

## Wallet Address
`0x5448c44c2088f43d651dbeAACee99aFf5fEC95c6`

## Saldo Sepolia
1.7971 SepoliaETH

## Resources
- [Aave V3 Documentation](https://docs.aave.com/developers/)
- [Hardhat Documentation](https://hardhat.org/docs)
EOF

echo "✅ Project structure created successfully!"
echo ""
echo "Next steps:"
echo "1. cd flash-loan-tutorial"
echo "2. npm install"
echo "3. Copy .env.example to .env and fill in your credentials"
echo "4. Start coding your flash loan contract!"
echo ""
echo "Project location: $(pwd)"
