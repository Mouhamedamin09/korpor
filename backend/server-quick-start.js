const express = require('express');
const cors = require('cors');
const { authenticate } = require('./src/middleware/authenticate');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import wallet routes directly
const walletController = require('./src/controllers/walletController');

// Define wallet routes manually
app.get('/api/wallet', authenticate, walletController.getWallet);
app.get('/api/wallet/transactions', authenticate, walletController.getTransactions);
app.post('/api/wallet/deposit', authenticate, walletController.deposit);
app.post('/api/wallet/withdraw', authenticate, walletController.withdraw);
app.post('/api/wallet/rewards', authenticate, walletController.addRewards);

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Test endpoint without auth
app.get('/api/test', (req, res) => {
  res.json({ message: 'Wallet API is working!', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Wallet API Server running on port ${PORT}`);
  console.log(`📡 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`💰 Wallet endpoint: http://localhost:${PORT}/api/wallet`);
});

module.exports = app; 