const { ethers } = require("hardhat");
const { SEPOLIA_ADDRESSES, TOKEN_DECIMALS } = require("./helpers/constants");

async function main() {
  console.log("🧪 Testing Flash Loan Contract...");
  console.log("=================================");
  
  // Get contract address from environment or prompt
  const contractAddress = process.env.FLASHLOAN_CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("❌ Please set FLASHLOAN_CONTRACT_ADDRESS in your .env file");
  }
  
  const [signer] = await ethers.getSigners();
  console.log(`👤 Testing with account: ${signer.address}`);
  
  // Check signer balance
  const balance = await signer.getBalance();
  console.log(`💰 Account balance: ${ethers.utils.formatEther(balance)} ETH`);
  
  // Connect to deployed contract
  const SimpleFlashLoan = await ethers.getContractFactory("SimpleFlashLoan");
  const flashLoan = SimpleFlashLoan.attach(contractAddress);
  
  console.log(`📍 Contract address: ${contractAddress}`);
  
  // Verify contract connection
  try {
    const owner = await flashLoan.owner();
    console.log(`👤 Contract owner: ${owner}`);
    console.log(`✅ Owner match: ${owner === signer.address ? "YES" : "NO"}`);
  } catch (error) {
    throw new Error(`❌ Failed to connect to contract: ${error.message}`);
  }
  
  // Test with USDC (smaller amount, cheaper gas)
  const tokenAddress = SEPOLIA_ADDRESSES.USDC;
  const tokenDecimals = TOKEN_DECIMALS.USDC;
  const amount = ethers.utils.parseUnits("100", tokenDecimals); // 100 USDC
  
  console.log("\n📊 Flash Loan Test Parameters:");
  console.log(`💰 Token: USDC (${tokenAddress})`);
  console.log(`📈 Amount: ${ethers.utils.formatUnits(amount, tokenDecimals)} USDC`);
  console.log(`💸 Expected fee: ~${ethers.utils.formatUnits(amount.mul(5).div(10000), tokenDecimals)} USDC (0.05%)`);
  
  // Check if contract has enough balance to pay fee
  const contractBalance = await flashLoan.getBalance(tokenAddress);
  const expectedFee = amount.mul(5).div(10000); // 0.05%
  
  console.log(`\n💼 Contract USDC balance: ${ethers.utils.formatUnits(contractBalance, tokenDecimals)} USDC`);
  console.log(`💸 Required fee: ${ethers.utils.formatUnits(expectedFee, tokenDecimals)} USDC`);
  
  if (contractBalance.lt(expectedFee)) {
    console.log("⚠️  Warning: Contract doesn't have enough USDC to pay the fee!");
    console.log("💡 This flash loan will fail, but it's normal for first test");
    console.log("📝 In real scenarios, your arbitrage profit should cover the fee");
  }
  
  // Estimate gas for flash loan
  try {
    const gasEstimate = await flashLoan.estimateGas.requestFlashLoan(tokenAddress, amount);
    console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);
    
    const gasPrice = await ethers.provider.getGasPrice();
    const gasCost = gasEstimate.mul(gasPrice);
    console.log(`💰 Estimated gas cost: ${ethers.utils.formatEther(gasCost)} ETH`);
    
  } catch (error) {
    console.log(`⚠️  Gas estimation failed: ${error.message}`);
  }
  
  // Execute flash loan
  console.log("\n🚀 Executing Flash Loan...");
  console.log("⏳ This might take 10-30 seconds...");
  
  try {
    const tx = await flashLoan.requestFlashLoan(tokenAddress, amount, {
      gasLimit: 500000, // Set manual gas limit
    });
    
    console.log(`📝 Transaction sent: ${tx.hash}`);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await tx.wait();
    
    console.log("\n✅ FLASH LOAN EXECUTED SUCCESSFULLY!");
    console.log("=====================================");
    console.log(`🔗 Transaction hash: ${receipt.transactionHash}`);
    console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
    console.log(`💰 Gas cost: ${ethers.utils.formatEther(receipt.gasUsed.mul(receipt.effectiveGasPrice))} ETH`);
    
    // Parse events
    const events = receipt.events?.filter(e => e.event === 'FlashLoanExecuted');
    if (events && events.length > 0) {
      const event = events[0];
      console.log(`📊 Flash loan amount: ${ethers.utils.formatUnits(event.args.amount, tokenDecimals)} USDC`);
      console.log(`💸 Premium paid: ${ethers.utils.formatUnits(event.args.premium, tokenDecimals)} USDC`);
    }
    
    // Check final balances
    const finalBalance = await flashLoan.getBalance(tokenAddress);
    console.log(`💼 Final contract balance: ${ethers.utils.formatUnits(finalBalance, tokenDecimals)} USDC`);
    
  } catch (error) {
    console.error("\n❌ FLASH LOAN FAILED:");
    console.error("=====================");
    
    if (error.message.includes("revert")) {
      console.error("💡 Common reasons for failure:");
      console.error("   - Contract doesn't have enough tokens to pay the fee");
      console.error("   - Slippage too high in arbitrage");
      console.error("   - Not enough gas");
      console.error("   - Token approval issues");
    }
    
    console.error(`📝 Error: ${error.message}`);
    
    // This is expected for first test without tokens
    console.log("\n💡 This is normal for your first test!");
    console.log("📚 In real flash loans, you'd:");
    console.log("   1. Borrow tokens");
    console.log("   2. Execute profitable trades");
    console.log("   3. Pay back loan + fee from profits");
  }
  
  // Display Etherscan link
  console.log(`\n🔍 View on Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
  console.log(`👤 Your wallet: https://sepolia.etherscan.io/address/${signer.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
