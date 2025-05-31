const { ethers } = require("ethers");

// Crypto Payment Service for blockchain transactions
const CRYPTO_CONFIG = {
  supportedCryptos: {
    ETH: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
      network: "mainnet", // Change to testnet for development
      minAmount: 0.001,
    },
    BTC: {
      name: "Bitcoin",
      symbol: "BTC",
      decimals: 8,
      network: "mainnet",
      minAmount: 0.0001,
    },
    USDT: {
      name: "Tether USD",
      symbol: "USDT",
      decimals: 6,
      network: "ethereum",
      minAmount: 1,
    },
    USDC: {
      name: "USD Coin",
      symbol: "USDC",
      decimals: 6,
      network: "ethereum",
      minAmount: 1,
    },
  },
  networks: {
    ethereum: {
      mainnet: "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
      testnet: "https://goerli.infura.io/v3/YOUR_INFURA_KEY",
    },
  },
  isTestMode: process.env.NODE_ENV !== "production",
};

console.log(
  `🪙 Crypto Service initialized in ${
    CRYPTO_CONFIG.isTestMode ? "TEST" : "LIVE"
  } mode`
);

// Generate payment address for crypto payments
exports.generatePaymentAddress = async ({
  crypto,
  amount,
  userWalletAddress,
  orderId,
}) => {
  try {
    if (!CRYPTO_CONFIG.supportedCryptos[crypto]) {
      throw new Error(`Unsupported cryptocurrency: ${crypto}`);
    }

    const cryptoInfo = CRYPTO_CONFIG.supportedCryptos[crypto];

    // Validate minimum amount
    if (amount < cryptoInfo.minAmount) {
      throw new Error(
        `Minimum amount for ${crypto} is ${cryptoInfo.minAmount}`
      );
    }

    // Generate a unique payment address (in production, this would be a real address)
    const paymentAddress = await generateUniqueAddress(crypto);

    // Create payment request
    const paymentRequest = {
      payment_id: `crypto_${orderId}_${Date.now()}`,
      crypto_currency: crypto,
      amount: amount,
      payment_address: paymentAddress,
      user_wallet: userWalletAddress,
      expires_at: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      status: "pending",
      network: cryptoInfo.network,
      minimum_confirmations: crypto === "BTC" ? 3 : 1,
    };

    return {
      status: "success",
      payment_request: paymentRequest,
      qr_code_data: `${crypto.toLowerCase()}:${paymentAddress}?amount=${amount}`,
      instructions: [
        `Send exactly ${amount} ${crypto} to the address below`,
        `Payment will be confirmed after ${paymentRequest.minimum_confirmations} network confirmations`,
        `This address expires in 30 minutes`,
        `Do not send any other cryptocurrency to this address`,
      ],
    };
  } catch (error) {
    console.error("Crypto payment generation error:", error);
    throw new Error(`Failed to generate crypto payment: ${error.message}`);
  }
};

// Check transaction status on blockchain
exports.checkTransactionStatus = async (transactionHash, crypto) => {
  try {
    if (!CRYPTO_CONFIG.supportedCryptos[crypto]) {
      throw new Error(`Unsupported cryptocurrency: ${crypto}`);
    }

    // In production, this would check the actual blockchain
    // For now, return a mock response
    return {
      transaction_hash: transactionHash,
      status: "pending", // pending, confirmed, failed
      confirmations: 0,
      required_confirmations: crypto === "BTC" ? 3 : 1,
      amount: 0,
      from_address: "",
      to_address: "",
      timestamp: new Date().toISOString(),
      block_number: null,
      gas_used: crypto === "ETH" ? "21000" : null,
    };
  } catch (error) {
    console.error("Transaction status check error:", error);
    throw new Error(`Failed to check transaction status: ${error.message}`);
  }
};

// Validate crypto address format
exports.validateAddress = (address, crypto) => {
  try {
    switch (crypto) {
      case "ETH":
      case "USDT":
      case "USDC":
        return ethers.utils.isAddress(address);
      case "BTC":
        // Simple Bitcoin address validation (would use proper library in production)
        return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/.test(
          address
        );
      default:
        return false;
    }
  } catch (error) {
    return false;
  }
};

// Get supported cryptocurrencies
exports.getSupportedCryptos = () => {
  return {
    supported_cryptocurrencies: CRYPTO_CONFIG.supportedCryptos,
    test_mode: CRYPTO_CONFIG.isTestMode,
    note: CRYPTO_CONFIG.isTestMode
      ? "Test mode: Use testnet addresses only"
      : "Live mode: Use mainnet addresses only",
  };
};

// Estimate transaction fees
exports.estimateTransactionFee = async (crypto, amount) => {
  try {
    const cryptoInfo = CRYPTO_CONFIG.supportedCryptos[crypto];
    if (!cryptoInfo) {
      throw new Error(`Unsupported cryptocurrency: ${crypto}`);
    }

    // Mock fee estimation (in production, would call actual blockchain APIs)
    const fees = {
      ETH: { slow: 0.002, standard: 0.004, fast: 0.008 }, // ETH amounts
      BTC: { slow: 0.0001, standard: 0.0003, fast: 0.0006 }, // BTC amounts
      USDT: { slow: 2, standard: 5, fast: 10 }, // USD amounts
      USDC: { slow: 2, standard: 5, fast: 10 }, // USD amounts
    };

    return {
      crypto_currency: crypto,
      amount: amount,
      estimated_fees: fees[crypto] || fees.ETH,
      fee_currency: crypto === "USDT" || crypto === "USDC" ? "USD" : crypto,
      updated_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Fee estimation error:", error);
    throw new Error(`Failed to estimate fees: ${error.message}`);
  }
};

// Helper function to generate unique addresses (mock for development)
async function generateUniqueAddress(crypto) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);

  switch (crypto) {
    case "ETH":
    case "USDT":
    case "USDC":
      // Mock Ethereum address
      return `0x${timestamp.toString(16)}${random}`
        .substring(0, 42)
        .padEnd(42, "0");
    case "BTC":
      // Mock Bitcoin address
      return `bc1q${random}${timestamp}`.substring(0, 42);
    default:
      throw new Error(`Cannot generate address for ${crypto}`);
  }
}

// Convert between cryptocurrencies (mock exchange rates)
exports.convertCrypto = async (fromCrypto, toCrypto, amount) => {
  try {
    // Mock exchange rates (in production, would use real exchange API)
    const mockRates = {
      ETH_USD: 2000,
      BTC_USD: 35000,
      USDT_USD: 1,
      USDC_USD: 1,
      USD_ETH: 0.0005,
      USD_BTC: 0.0000286,
      USD_USDT: 1,
      USD_USDC: 1,
    };

    const rateKey = `${fromCrypto}_${toCrypto}`;
    const rate = mockRates[rateKey];

    if (!rate) {
      throw new Error(
        `Exchange rate not available for ${fromCrypto} to ${toCrypto}`
      );
    }

    const convertedAmount = amount * rate;

    return {
      from_crypto: fromCrypto,
      to_crypto: toCrypto,
      original_amount: amount,
      converted_amount: convertedAmount,
      exchange_rate: rate,
      updated_at: new Date().toISOString(),
      note: "Mock exchange rates - not for actual trading",
    };
  } catch (error) {
    console.error("Crypto conversion error:", error);
    throw new Error(`Failed to convert crypto: ${error.message}`);
  }
};
