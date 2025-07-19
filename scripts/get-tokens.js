const { ethers } = require("hardhat");
const { SEPOLIA_ADDRESSES } = require("./helpers/constants");

async function main() {
  console.log("🪙 Getting Testnet Tokens...");
  console.log("===========================");
  
  const [signer] = await ethers.getSigners();
  console.log(`👤 Account: ${signer.address}`);
  
  // Check ETH balance
  const ethBalance = await signer.getBalance();
  console.log(`💰 ETH Balance: ${ethers.utils.formatEther(ethBalance)} ETH`);
  
  console.log("\n📍 Sepolia Testnet Token Addresses:");
  console.log("===================================");
  console.log(`🔵 USDC: ${SEPOLIA_ADDRESSES.USDC}`);
  console.log(`🔵 USDT: ${SEPOLIA_ADDRESSES.USDT}`);
  console.log(`🔵 DAI:  ${SEPOLIA_ADDRESSES.DAI}`);
  console.log(`🔵 WETH: ${SEPOLIA_ADDRESSES.WETH}`);
  console.log(`🔵 WBTC: ${SEPOLIA_ADDRESSES.WBTC}`);
  
  // Check current token balances
  const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function name() view returns (string)"
  ];
  
  const tokens = [
    { address: SEPOLIA_ADDRESSES.USDC, symbol: "USDC" },
    { address: SEPOLIA_ADDRESSES.USDT, symbol: "USDT" },
    { address: SEPOLIA_ADDRESSES.DAI, symbol: "DAI" },
    { address: SEPOLIA_ADDRESSES.WETH, symbol: "WETH" },
  ];
  
  console.log("\n💼 Current Token Balances:");
  console.log("=========================");
  
  for (const token of tokens) {
    try {
      const contract = new ethers.Contract(token.address, ERC20_ABI, signer);
      const balance = await contract.balanceOf(signer.address);
      const decimals = await contract.decimals();
      const symbol = await contract.symbol();
      
      console.log(`${symbol.padEnd(5)}: ${ethers.utils.formatUnits(balance, decimals).padStart(10)} ${symbol}`);
    } catch (error) {
      console.log(`${token.symbol.padEnd(5)}: Error reading balance`);
    }
  }
  
  console.log("\n🚰 How to get testnet tokens:");
  console.log("============================");
  console.log("1. 💧 Sepolia ETH Faucet:");
  console.log("   - https://sepoliafaucet.com/");
  console.log("   - https://sepolia-faucet.pk910.de/");
  console.log("   - https://www.infura.io/faucet/sepolia");
  console.log("");
  console.log("2. 🪙 Aave Testnet Tokens:");
  console.log("   - Visit: https://staging.aave.com/");
  console.log("   - Connect wallet to Sepolia");
  console.log("   - Click 'Faucet' in top menu");
  console.log("   - Mint test tokens (USDC, USDT, DAI, etc.)");
  console.log("");
  console.log("3. 🔄 Alternative - Uniswap Sepolia:");
  console.log("   - Visit: https://app.uniswap.org/");
  console.log("   - Switch to Sepolia network");
  console.log("   - Swap ETH for tokens");
  console.log("");
  console.log("4. 🏦 Direct Faucets:");
  console.log("   - USDC: Use Aave faucet");
  console.log("   - DAI: Use Aave faucet");
  console.log("   - WETH: Wrap ETH on Uniswap");
  
  console.log("\n💡 Recommended amounts for testing:");
  console.log("===================================");
  console.log("- 1000 USDC (for flash loan testing)");
  console.log("- 1000 DAI (for arbitrage testing)");
  console.log("- 1 WETH (for gas and swaps)");
  console.log("- Keep 2-3 ETH for gas fees");
  
  console.log("\n⚠️  Important Notes:");
  console.log("===================");
  console.log("- Flash loans need tokens to pay fees");
  console.log("- Your first flash loan will likely fail (this is normal)");
  console.log("- In real scenarios, profits pay for the fees");
  console.log("- Always test with small amounts first");
  
  console.log("\n🎯 After getting tokens, run:");
  console.log("============================");
  console.log("npx hardhat run scripts/test-flashloan.js --network sepolia");
  
  // If contract address is available, show transfer command
  if (process.env.FLASHLOAN_CONTRACT_ADDRESS) {
    console.log("\n💰 To fund your flash loan contract:");
    console.log("===================================");
    console.log("Send some USDC to your contract address:");
    console.log(`${process.env.FLASHLOAN_CONTRACT_ADDRESS}`);
    console.log("This will help pay for flash loan fees during testing.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
