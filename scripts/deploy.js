const { ethers } = require("hardhat");
const { SEPOLIA_ADDRESSES } = require("./helpers/constants");

async function main() {
  console.log("🚀 Starting Flash Loan Contract Deployment...");
  console.log("=====================================");
  
  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deploying with account: ${deployer.address}`);
  
  // Check deployer balance
  const balance = await deployer.getBalance();
  console.log(`💰 Deployer balance: ${ethers.utils.formatEther(balance)} ETH`);
  
  // Minimum balance check
  const minBalance = ethers.utils.parseEther("0.1");
  if (balance.lt(minBalance)) {
    throw new Error(`❌ Insufficient balance! Need at least 0.1 ETH for deployment`);
  }
  
  // Contract deployment
  console.log("\n📄 Deploying SimpleFlashLoan contract...");
  
  const SimpleFlashLoan = await ethers.getContractFactory("SimpleFlashLoan");
  
  // Estimate gas
  const gasEstimate = await ethers.provider.estimateGas({
    data: SimpleFlashLoan.bytecode,
  });
  console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);
  
  // Deploy with proper gas settings
  const flashLoan = await SimpleFlashLoan.deploy(
    SEPOLIA_ADDRESSES.POOL_ADDRESSES_PROVIDER,
    {
      gasLimit: gasEstimate.mul(120).div(100), // 20% buffer
    }
  );
  
  console.log(`⏳ Deployment transaction: ${flashLoan.deployTransaction.hash}`);
  console.log("⏳ Waiting for deployment confirmation...");
  
  await flashLoan.deployed();
  
  console.log("\n✅ CONTRACT DEPLOYED SUCCESSFULLY!");
  console.log("=====================================");
  console.log(`📍 Contract Address: ${flashLoan.address}`);
  console.log(`🔗 Transaction Hash: ${flashLoan.deployTransaction.hash}`);
  console.log(`⛽ Gas Used: ${flashLoan.deployTransaction.gasLimit?.toString()}`);
  
  // Verify contract ownership
  const owner = await flashLoan.owner();
  console.log(`👤 Contract Owner: ${owner}`);
  console.log(`✅ Owner Match: ${owner === deployer.address ? "YES" : "NO"}`);
  
  // Get Pool address to verify
  const poolAddress = await flashLoan.POOL();
  console.log(`🏊 Connected Pool: ${poolAddress}`);
  console.log(`✅ Pool Match: ${poolAddress === SEPOLIA_ADDRESSES.POOL ? "YES" : "NO"}`);
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress: flashLoan.address,
    deployerAddress: deployer.address,
    transactionHash: flashLoan.deployTransaction.hash,
    network: network.name,
    chainId: network.chainId,
    timestamp: new Date().toISOString(),
    poolAddress: poolAddress,
    poolAddressesProvider: SEPOLIA_ADDRESSES.POOL_ADDRESSES_PROVIDER,
  };
  
  // Create deployment record
  const fs = require('fs');
  const deploymentFile = `deployments/${network.name}-${Date.now()}.json`;
  
  // Create deployments directory if it doesn't exist
  if (!fs.existsSync('deployments')) {
    fs.mkdirSync('deployments');
  }
  
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`📁 Deployment info saved to: ${deploymentFile}`);
  
  // Contract verification (if API key provided)
  if (process.env.ETHERSCAN_API_KEY && network.name === 'sepolia') {
    console.log("\n🔍 Starting contract verification...");
    console.log("⏳ Waiting for block confirmations...");
    
    // Wait for 6 confirmations
    await flashLoan.deployTransaction.wait(6);
    
    try {
      await hre.run("verify:verify", {
        address: flashLoan.address,
        constructorArguments: [SEPOLIA_ADDRESSES.POOL_ADDRESSES_PROVIDER],
      });
      console.log("✅ Contract verified successfully!");
    } catch (error) {
      console.log("❌ Verification failed:", error.message);
      console.log("💡 You can verify manually later with:");
      console.log(`npx hardhat verify --network sepolia ${flashLoan.address} "${SEPOLIA_ADDRESSES.POOL_ADDRESSES_PROVIDER}"`);
    }
  }
  
  // Display next steps
  console.log("\n🎯 NEXT STEPS:");
  console.log("=====================================");
  console.log("1. Update your .env file with:");
  console.log(`   FLASHLOAN_CONTRACT_ADDRESS=${flashLoan.address}`);
  console.log("\n2. Test the flash loan:");
  console.log(`   npx hardhat run scripts/test-flashloan.js --network sepolia`);
  console.log("\n3. Check contract on Etherscan:");
  console.log(`   https://sepolia.etherscan.io/address/${flashLoan.address}`);
  console.log("\n4. Add some testnet tokens to test with:");
  console.log(`   npx hardhat run scripts/get-tokens.js --network sepolia`);
  
  console.log("\n🎉 Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
