const { ethers } = require("ethers");
const contractABI =
  require("../artifacts/contracts/InvestmentManager.sol/InvestmentManager.json").abi;
require("dotenv").config();

// Commented out live blockchain connections
// const provider = new ethers.providers.JsonRpcProvider(
//   process.env.INFURA_SEPOLIA,
// );
// const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
// const contract = new ethers.Contract(
//   process.env.INVESTMENT_CONTRACT_ADDRESS,
//   contractABI,
//   wallet,
// );

// Mock implementation for debugging
exports.recordInvestment = async (projectId, userAddress, amountTND) => {
  try {
    // Mock the blockchain interaction
    console.log(
      `[MOCK] Recording investment: Project ${projectId}, User ${userAddress}, Amount ${amountTND} TND`,
    );

    // Return a mock transaction hash
    const mockTxHash = `mock_tx_${Date.now().toString(16)}`;
    console.log(
      `[MOCK] Investment recorded successfully with mock confirmation`,
    );

    return mockTxHash;
  } catch (error) {
    console.error("Error in mock blockchain investment:", error);
    throw new Error(
      `Mocked blockchain transaction failed: ${error.message || "Unknown error"}`,
    );
  }
};
