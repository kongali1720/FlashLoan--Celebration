// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import "@aave/core-v3/contracts/interfaces/IPool.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SimpleFlashLoan
 * @dev Flash loan contract untuk belajar di Sepolia testnet
 * @author Flash Loan Tutorial
 */
contract SimpleFlashLoan is FlashLoanSimpleReceiverBase, Ownable {
    
    // Events
    event FlashLoanExecuted(
        address indexed asset,
        uint256 amount,
        uint256 premium,
        address indexed initiator
    );
    
    event ProfitWithdrawn(address indexed token, uint256 amount);
    
    // Constructor
    constructor(address _addressProvider) 
        FlashLoanSimpleReceiverBase(IPoolAddressesProvider(_addressProvider)) 
    {}
    
    /**
     * @dev Fungsi ini dipanggil setelah contract menerima flash loan
     * @param asset Address dari token yang dipinjam
     * @param amount Jumlah token yang dipinjam
     * @param premium Fee yang harus dibayar
     * @param initiator Address yang memulai flash loan
     * @param params Data tambahan (jika ada)
     */
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        
        // Pastikan hanya Pool yang bisa memanggil fungsi ini
        require(msg.sender == address(POOL), "Caller must be Pool");
        
        // Di sini kita bisa menambahkan logika bisnis:
        // - Arbitrase antar DEX
        // - Liquidation
        // - Refinancing
        // - dll
        
        // Contoh: Log saja untuk testing
        emit FlashLoanExecuted(asset, amount, premium, initiator);
        
        // PENTING: Harus approve Pool untuk mengambil dana + fee
        uint256 totalAmount = amount + premium;
        IERC20(asset).approve(address(POOL), totalAmount);
        
        return true;
    }
    
    /**
     * @dev Request flash loan
     * @param _token Address token yang mau dipinjam
     * @param _amount Jumlah token yang mau dipinjam
     */
    function requestFlashLoan(address _token, uint256 _amount) public {
        address receiverAddress = address(this);
        bytes memory params = "";
        uint16 referralCode = 0;
        
        POOL.flashLoanSimple(
            receiverAddress,
            _token,
            _amount,
            params,
            referralCode
        );
    }
    
    /**
     * @dev Ambil profit dari contract (hanya owner)
     * @param _token Address token yang mau diambil
     */
    function withdrawProfit(address _token) external onlyOwner {
        IERC20 token = IERC20(_token);
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No profit to withdraw");
        
        token.transfer(owner(), balance);
        emit ProfitWithdrawn(_token, balance);
    }
    
    /**
     * @dev Ambil ETH dari contract (hanya owner)
     */
    function withdrawETH() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Cek balance token di contract
     * @param _token Address token
     */
    function getBalance(address _token) external view returns (uint256) {
        return IERC20(_token).balanceOf(address(this));
    }
    
    /**
     * @dev Cek ETH balance di contract
     */
    function getETHBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Emergency function untuk transfer token (hanya owner)
     * @param _token Address token
     * @param _to Address penerima
     * @param _amount Jumlah token
     */
    function emergencyTransfer(
        address _token,
        address _to,
        uint256 _amount
    ) external onlyOwner {
        IERC20(_token).transfer(_to, _amount);
    }
    
    // Receive function untuk menerima ETH
    receive() external payable {}
}
