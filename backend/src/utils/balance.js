require("dotenv").config();
const hre = require("hardhat");

/**
 * Fetches and returns the ETH balance of a wallet address.
 * @param {string} walletAddress - The Ethereum wallet address to check
 * @returns {Promise<string>} The balance in ETH
 */
async function getWalletBalance(walletAddress) {
  const provider = hre.ethers.provider;
  const balance = await provider.getBalance(walletAddress);
  return hre.ethers.utils.formatEther(balance);
}

// For CLI usage
if (require.main === module) {
  const walletAddress = process.env.ADMIN_WALLET_ADDRESS;
  getWalletBalance(walletAddress)
    .then((balance) => console.log(`Wallet Balance: ${balance} ETH`))
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}

module.exports = { getWalletBalance };
