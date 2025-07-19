// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleFlashLoan is FlashLoanSimpleReceiverBase, Ownable {
    
    event FlashLoanExecuted(
        address indexed asset,
        uint256 amount,
        uint256 premium,
        address indexed initiator
    );
    
    constructor(address _addressProvider) 
        FlashLoanSimpleReceiverBase(IPoolAddressesProvider(_addressProvider)) 
    {
        // Constructor body empty - initialization handled by parent
    }
    
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata /* params */
    ) external override returns (bool) {
        require(msg.sender == address(POOL), "Caller must be Pool");
        
        // Emit event untuk tracking
        emit FlashLoanExecuted(asset, amount, premium, initiator);
        
        // Di sini Anda bisa tambahkan logika arbitrage
        // Contoh: swap tokens, interact dengan DEX, dll
        
        // Hitung total amount yang harus dibayar (loan + fee)
        uint256 totalAmount = amount + premium;
        
        // Approve pool untuk menarik pembayaran
        IERC20(asset).approve(address(POOL), totalAmount);
        
        return true;
    }
    
    function requestFlashLoan(address _token, uint256 _amount) public {
        POOL.flashLoanSimple(address(this), _token, _amount, "", 0);
    }
    
    function getBalance(address _token) public view returns (uint256) {
        return IERC20(_token).balanceOf(address(this));
    }
    
    function getETHBalance() public view returns (uint256) {
        return address(this).balance;
    }
    
    function withdrawToken(address _token) external onlyOwner {
        IERC20 token = IERC20(_token);
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        token.transfer(owner(), balance);
    }
    
    function withdrawETH() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        payable(owner()).transfer(balance);
    }
    
    // Receive function untuk menerima ETH
    receive() external payable {}
    
    // Fallback function
    fallback() external payable {}
}
