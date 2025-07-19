@echo off
echo 🚀 Setting up Flash Loan Tutorial Project...

REM Create main project directory
mkdir flash-loan-tutorial
cd flash-loan-tutorial

REM Create directory structure
echo 📁 Creating directory structure...
mkdir contracts\interfaces
mkdir contracts\mocks
mkdir scripts\helpers
mkdir test\integration
mkdir tasks
mkdir config
mkdir docs

echo 📝 Creating configuration files...

REM Create package.json
(
echo {
echo   "name": "flash-loan-tutorial",
echo   "version": "1.0.0",
echo   "description": "Flash Loan Tutorial for Sepolia Testnet",
echo   "scripts": {
echo     "compile": "npx hardhat compile",
echo     "deploy": "npx hardhat run scripts/deploy.js --network sepolia",
echo     "test": "npx hardhat test",
echo     "clean": "npx hardhat clean"
echo   },
echo   "devDependencies": {
echo     "@nomicfoundation/hardhat-toolbox": "^3.0.0",
echo     "hardhat": "^2.17.1",
echo     "dotenv": "^16.3.1"
echo   },
echo   "dependencies": {
echo     "@aave/core-v3": "^1.19.3",
echo     "@openzeppelin/contracts": "^4.9.3"
echo   }
echo }
) > package.json

REM Create .env.example
(
echo # Network Configuration
echo SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
echo.
echo # Wallet Private Key ^(NEVER SHARE THIS!^)
echo PRIVATE_KEY=your_private_key_here
echo.
echo # API Keys
echo ETHERSCAN_API_KEY=your_etherscan_api_key
) > .env.example

REM Create .gitignore
(
echo .env
echo node_modules/
echo cache/
echo artifacts/
echo coverage/
) > .gitignore

echo ✅ Project structure created successfully!
echo.
echo Next steps:
echo 1. npm install
echo 2. Copy .env.example to .env and fill credentials
echo 3. Start coding!

pause
