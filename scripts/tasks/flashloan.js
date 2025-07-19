const { task } = require("hardhat/config");
const { SEPOLIA_ADDRESSES, TOKEN_DECIMALS } = require("../scripts/helpers/constants");

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  
  console.log("Available accounts:");
  for (const account of accounts) {
    const balance = await account.getBalance();
    console.log(`${account.address}: ${hre.ethers.utils.formatEther(balance)} ETH`);
  }
});

task("balance", "Prints account balance")
  .addParam("account", "The account's address")
  .setAction(async (taskArgs, hre) => {
    const balance = await hre.ethers.provider.getBalance(taskArgs.account);
    console.log(hre.ethers.utils.formatEther(balance), "ETH");
  });

task("flashloan", "Execute a flash loan")
  .addParam("token", "Token address (or 'usdc', 'dai', 'weth')")
  .addParam("amount", "Amount to borrow")
  .addOptionalParam("contract", "Flash loan contract address")
  .setAction(async (taskArgs, hre) => {
    const [signer] = await hre.ethers.getSigners();
    
    // Get contract address
    const contractAddress = taskArgs.contract || process.env.FLASHLOAN_CONTRACT_ADDRESS;
    if (!contractAddress) {
      throw new Error("Contract address not provided. Use --contract or set FLASHLOAN_CONTRACT_ADDRESS");
    }
    
    // Resolve token address
    let tokenAddress;
    let decimals;
    
    switch (taskArgs.token.toLowerCase()) {
      case 'usdc':
        tokenAddress = SEPOLIA_ADDRESSES.USDC;
        decimals = TOKEN_DECIMALS.USDC;
        break;
      case 'dai':
        tokenAddress = SEPOLIA_ADDRESSES.DAI;
        decimals = TOKEN_DECIMALS.DAI;
        break;
      case 'weth':
        tokenAddress = SEPOLIA_ADDRESSES.WETH;
        decimals = TOKEN_DECIMALS.WETH;
        break;
      default:
        tokenAddress = taskArgs.token;
        decimals = 18; // Default to 18 decimals
    }
    
    // Parse amount
    const amount = hre.ethers.utils.parseUnits(taskArgs.amount, decimals);
    
    // Connect to contract
    const SimpleFlashLoan = await hre.ethers.getContractFactory("SimpleFlashLoan");
    const flashLoan = SimpleFlashLoan.attach(contractAddress);
    
    console.log(`🚀 Executing flash loan...`);
    console.log(`📍 Contract: ${contractAddress}`);
    console.log(`💰 Token: ${tokenAddress}`);
    console.log(`📊 Amount: ${taskArgs.amount}`);
    
    try {
      const tx = await flashLoan.requestFlashLoan(tokenAddress, amount);
      console.log(`📝 Transaction: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`✅ Success! Gas used: ${receipt.gasUsed}`);
      
    } catch (error) {
      console.error(`❌ Failed: ${error.message}`);
    }
  });

task("deploy-flashloan", "Deploy flash loan contract")
  .setAction(async (taskArgs, hre) => {
    const [deployer] = await hre.ethers.getSigners();
    
    console.log("Deploying flash loan contract...");
    console.log("Deployer:", deployer.address);
    
    const SimpleFlashLoan = await hre.ethers.getContractFactory("SimpleFlashLoan");
    const flashLoan = await SimpleFlashLoan.deploy(SEPOLIA_ADDRESSES.POOL_ADDRESSES_PROVIDER);
    
    await flashLoan.deployed();
    
    console.log("Flash loan contract deployed to:", flashLoan.address);
    console.log("Update your .env file with:");
    console.log(`FLASHLOAN_CONTRACT_ADDRESS=${flashLoan.address}`);
  });

task("contract-info", "Get contract information")
  .addOptionalParam("contract", "Contract address")
  .setAction(async (taskArgs, hre) => {
    const contractAddress = taskArgs.contract || process.env.FLASHLOAN_CONTRACT_ADDRESS;
    if (!contractAddress) {
      throw new Error("Contract address not provided");
    }
    
    const SimpleFlashLoan = await hre.ethers.getContractFactory("SimpleFlashLoan");
    const flashLoan = SimpleFlashLoan.attach(contractAddress);
    
    console.log(`📍 Contract: ${contractAddress}`);
    console.log(`👤 Owner: ${await flashLoan.owner()}`);
    console.log(`🏊 Pool: ${await flashLoan.POOL()}`);
    console.log(`💰 ETH Balance: ${hre.ethers.utils.formatEther(await flashLoan.getETHBalance())} ETH`);
    
    // Check token balances
    const tokens = ['USDC', 'DAI', 'WETH'];
    for (const token of tokens) {
      const address = SEPOLIA_ADDRESSES[token];
      const balance = await flashLoan.getBalance(address);
      const decimals = TOKEN_DECIMALS[token];
      console.log(`💼 ${token}: ${hre.ethers.utils.formatUnits(balance, decimals)} ${token}`);
    }
  });
