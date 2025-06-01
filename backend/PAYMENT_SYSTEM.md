# Payment System Documentation

This document describes the comprehensive payment system implemented for the Korpor platform, supporting multiple payment methods with different development stages.

## 🎯 Overview

The payment system supports three main payment methods:

1. **Stripe** - Credit/Debit Cards (✅ **Test Mode Active**)
2. **PayMe** - Local Mobile Payments (🚧 **Coming Soon**)
3. **Crypto** - Cryptocurrency Payments (✅ **Test Mode Active**)

## 📋 Payment Methods Status

### 1. Stripe Integration (Test Mode)

**Status**: ✅ **Fully Implemented - Test Mode**

- **What's Working**: Full card payment processing in test mode
- **Supported**: Visa, Mastercard, American Express
- **Features**:
  - Payment intents for one-time payments
  - Setup intents for saving cards
  - Customer management
  - Webhook handling
  - Test card numbers for development

**Test Cards Available**:

```
Visa: 4242 4242 4242 4242
Mastercard: 5555 5555 5555 4444
American Express: 3782 8224 6310 005
Declined: 4000 0000 0000 0002
```

### 2. PayMe Integration

**Status**: 🚧 **Coming Soon**

- **What's Planned**:

  - Mobile wallet payments
  - Bank transfers
  - Local payment methods (Tunisia)
  - QR code payments
  - Instant transfers

- **Current State**: API endpoints return "coming soon" messages with planned features

### 3. Cryptocurrency Payments

**Status**: ✅ **Implemented - Test Mode**

- **Supported Cryptos**: ETH, BTC, USDT, USDC
- **Features**:
  - Generate unique payment addresses
  - QR code generation for mobile payments
  - Transaction status checking
  - Address validation
  - Fee estimation
  - Crypto conversion rates (mock)

## 🛠 API Endpoints

### General Payment Methods

```bash
GET /api/payment/methods
# Get all available payment methods and their status
```

### Stripe Endpoints (Test Mode)

```bash
# Create payment intent
POST /api/payment/stripe/payment-intent
{
  "amount": 100.50,
  "currency": "USD",
  "email": "user@example.com",
  "walletAddress": "0x742d35Cc...",
  "projectId": "proj_123"
}

# Create setup intent (save card)
POST /api/payment/stripe/setup-intent
{
  "email": "user@example.com",
  "walletAddress": "0x742d35Cc..."
}

# Get customer payment methods
GET /api/payment/stripe/payment-methods/{customerId}

# Get test cards (development helper)
GET /api/payment/stripe/test-cards

# Webhook (auto-handled by Stripe)
POST /api/payment/stripe/webhook
```

### PayMe Endpoints (Coming Soon)

```bash
# Create PayMe payment (returns coming soon message)
POST /api/payment/payme/create
{
  "amount": 100.50,
  "walletAddress": "0x742d35Cc...",
  "note": "Investment payment"
}

# Legacy callback support
POST /api/payment/payme/callback
```

### Crypto Endpoints

```bash
# Create crypto payment
POST /api/payment/crypto/create
{
  "amount": 0.05,
  "crypto": "ETH",
  "walletAddress": "0x742d35Cc...",
  "projectId": "proj_123"
}

# Check transaction status
GET /api/payment/crypto/transaction/{txHash}/{crypto}

# Get supported cryptocurrencies
GET /api/payment/crypto/supported
```

### Legacy/General Endpoints

```bash
# Get payment by reference
GET /api/payment/status/{ref}

# Get all payments by wallet
GET /api/payment/wallet/{walletAddress}
```

## 🗄 Database Schema

### Payments Table

```sql
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_id VARCHAR(100) NOT NULL UNIQUE,
    payment_method ENUM('stripe', 'payme', 'crypto') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    status ENUM('pending', 'confirmed', 'failed', 'expired', 'cancelled', 'refunded') DEFAULT 'pending',
    user_address VARCHAR(42) NOT NULL,
    project_id INT NULL,

    -- Stripe specific
    stripe_customer_id VARCHAR(100) NULL,
    stripe_payment_intent_id VARCHAR(100) NULL,

    -- PayMe specific (legacy)
    paymee_ref VARCHAR(100) NULL,

    -- Crypto specific
    crypto_address VARCHAR(100) NULL,
    crypto_currency VARCHAR(10) NULL,

    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🔧 Environment Variables

Add these to your `.env` file:

```bash
# Stripe Configuration (Test Mode)
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# PayMe Configuration (When Ready)
PAYMEE_MERCHANT_ID=your_merchant_id
PAYMEE_API_KEY=your_api_key
PAYMEE_CALLBACK_URL=https://yourdomain.com/api/payment/payme/callback
PAYMEE_SUCCESS_URL=https://yourdomain.com/payment/success

# Crypto Configuration (Optional)
INFURA_PROJECT_ID=your_infura_project_id
```

## 🚀 Getting Started

### 1. Run Database Migration

```bash
# Run the migration to update payments table
mysql -u username -p database_name < src/migrations/update_payments_table.sql
```

### 2. Test Stripe Integration

```bash
# Get available payment methods
curl http://localhost:3000/api/payment/methods

# Get test cards
curl http://localhost:3000/api/payment/stripe/test-cards

# Create a payment intent
curl -X POST http://localhost:3000/api/payment/stripe/payment-intent \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10.00,
    "currency": "USD",
    "email": "test@example.com",
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
  }'
```

### 3. Test Crypto Payments

```bash
# Get supported cryptocurrencies
curl http://localhost:3000/api/payment/crypto/supported

# Create crypto payment
curl -X POST http://localhost:3000/api/payment/crypto/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 0.01,
    "crypto": "ETH",
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
  }'
```

### 4. Check PayMe Status

```bash
# This will return "coming soon" message
curl -X POST http://localhost:3000/api/payment/payme/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
  }'
```

## 📱 Frontend Integration

### Stripe Integration

The frontend already has Stripe integration set up:

- Uses the same test publishable key: `pk_test_TYooMQauvdEDq54NiTphI7jx`
- Card form components are ready
- Test card numbers are available

### PayMe Integration

- Currently shows "Coming Soon" message
- UI components are ready but disabled
- Will be enabled when backend integration is complete

### Crypto Integration

- QR code generation for mobile payments
- Address display and copy functionality
- Transaction status monitoring
- Fee estimation display

## 🔄 Payment Flow

### 1. Stripe Payment Flow

1. User selects card payment
2. Frontend creates payment intent via API
3. User enters card details using Stripe Elements
4. Frontend confirms payment with Stripe
5. Webhook confirms payment to backend
6. Investment recorded on blockchain
7. Project funding updated

### 2. Crypto Payment Flow

1. User selects cryptocurrency
2. Backend generates unique payment address
3. User sends crypto to provided address
4. Backend monitors blockchain for transaction
5. Upon confirmation, investment recorded
6. Project funding updated

### 3. PayMe Flow (When Ready)

1. User selects PayMe payment
2. Backend creates PayMe payment request
3. User redirected to PayMe interface
4. PayMe webhook confirms payment
5. Investment recorded and project updated

## 🔒 Security Features

- **Stripe**: PCI compliant, never store card details
- **Crypto**: Address validation, amount verification
- **PayMe**: Webhook signature verification
- **General**: SQL injection protection, input validation

## 🧪 Testing

### Test Mode Indicators

All payment services include test mode indicators:

- Stripe responses include `test_mode: true`
- Crypto services indicate test mode
- PayMe shows "coming soon" status

### Test Data

- Use provided test card numbers for Stripe
- Use testnet addresses for crypto (when enabled)
- Mock responses for all services in development

## 📈 Monitoring & Logging

All payment services include comprehensive logging:

- Payment creation and status updates
- Error tracking with detailed messages
- Webhook event processing
- Blockchain transaction monitoring

## 🚦 Next Steps

### Immediate (Development)

1. ✅ Test Stripe integration with test cards
2. ✅ Test crypto payment address generation
3. ✅ Verify webhook handling
4. Test database operations

### Phase 2 (PayMe Integration)

1. Complete PayMe API integration
2. Implement webhook signature verification
3. Add PayMe-specific error handling
4. Enable PayMe in frontend

### Phase 3 (Production)

1. Switch Stripe to live mode
2. Configure production crypto networks
3. Set up production webhooks
4. Implement comprehensive monitoring
5. Add transaction reconciliation

## 🆘 Troubleshooting

### Common Issues

**Stripe Test Mode Issues**:

- Ensure using test keys (start with `sk_test_` and `pk_test_`)
- Use only test card numbers
- Check webhook endpoint configuration

**Database Issues**:

- Run migration script to update payments table
- Check column names match controller expectations
- Verify indexes are created for performance

**Crypto Payment Issues**:

- Address validation may fail for invalid formats
- Amount must meet minimum requirements
- Check supported crypto list

### Support

For issues:

1. Check server logs for detailed error messages
2. Verify environment variables are set correctly
3. Ensure database migration has been run
4. Test with provided test data first

---

**Status**: ✅ Ready for Development Testing  
**Last Updated**: December 2024  
**Version**: 1.0.0
