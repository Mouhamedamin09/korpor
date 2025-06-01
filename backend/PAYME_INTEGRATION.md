# PayMe.tn Integration Documentation

## Overview

This document describes the complete PayMe.tn integration for the Korpor investment platform. PayMe.tn is Tunisia's leading mobile payment solution that enables secure payments through mobile wallets, bank transfers, and local payment methods.

## Features

✅ **Real-time Payment Processing**

- Instant payment creation via PayMe.tn API v2
- Webhook-based payment status updates
- Secure payment verification with checksum validation

✅ **Multiple Payment Methods**

- Mobile wallet payments
- Bank transfers
- Local Tunisian payment methods
- QR code payments

✅ **Test Mode Support**

- Sandbox environment for development
- Test credentials provided
- Safe testing without real money

✅ **Frontend Integration**

- WebView-based payment flow
- Real-time status updates
- User-friendly payment interface

## API Documentation

### 1. Create Payment (Step 1)

**Endpoint:** `POST /api/payment/payme/create`

**Request Body:**

```json
{
  "amount": 220.25,
  "note": "Korpor investment payment",
  "first_name": "John",
  "last_name": "Doe",
  "email": "user@example.com",
  "phone": "+21611222333",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "projectId": "proj_123"
}
```

**Response:**

```json
{
  "status": "success",
  "payment_method": "payme",
  "message": "Payment created successfully",
  "token": "dfe54df34b54df3a854f3a53fc85a",
  "order_id": "korpor_1234567890_abc123",
  "payment_url": "https://sandbox.paymee.tn/gateway/dfe54df34b54df3a854f3a53fc85a",
  "amount": 220.25,
  "currency": "TND",
  "first_name": "John",
  "last_name": "Doe",
  "email": "user@example.com",
  "phone": "+21611222333",
  "note": "Korpor investment payment",
  "test_credentials": {
    "phone": "11111111",
    "password": "11111111"
  },
  "instructions": [
    "Use the test credentials in sandbox mode:",
    "Phone: 11111111",
    "Password: 11111111",
    "Watch for '/loader' URL to know when payment is complete",
    "Payment status will be sent to webhook URL"
  ]
}
```

### 2. Payment Webhook (Step 3)

**Endpoint:** `POST /api/payment/payme/webhook`

PayMe.tn sends payment status updates to this endpoint.

**Webhook Payload (Success):**

```json
{
  "token": "dfe54df34b54df3a854f3a53fc85a",
  "check_sum": "14efe54d8664f34543a854f3a5213fc85a",
  "payment_status": true,
  "order_id": "korpor_1234567890_abc123",
  "first_name": "John",
  "last_name": "Doe",
  "email": "user@example.com",
  "phone": "+21611222333",
  "note": "Korpor investment payment",
  "amount": 220.25,
  "transaction_id": 5578,
  "received_amount": 210.25,
  "cost": 10
}
```

**Webhook Payload (Failed):**

```json
{
  "token": "dfe54df34b54df3a854f3a854f3a53fc85a",
  "check_sum": "14efe54d8664f34543a854f3a5213fc85a",
  "payment_status": false,
  "order_id": "korpor_1234567890_abc123",
  "first_name": "John",
  "last_name": "Doe",
  "email": "user@example.com",
  "phone": "+21611222333",
  "note": "Korpor investment payment",
  "amount": 220.25
}
```

### 3. Check Payment Status

**Endpoint:** `GET /api/payment/payme/status/{token}`

**Response:**

```json
{
  "status": "success",
  "payment": {
    "token": "dfe54df34b54df3a854f3a53fc85a",
    "order_id": "korpor_1234567890_abc123",
    "amount": 220.25,
    "currency": "TND",
    "status": "completed",
    "created_at": "2024-01-15T10:30:00Z",
    "completed_at": "2024-01-15T10:35:00Z",
    "transaction_id": 5578,
    "received_amount": 210.25,
    "transaction_fee": 10
  }
}
```

## Environment Variables

Add these to your `.env` file:

```bash
# PayMe.tn Configuration
PAYMEE_API_KEY=your_payme_api_key_here
PAYMEE_RETURN_URL=https://your-frontend.com/payment/success
PAYMEE_CANCEL_URL=https://your-frontend.com/payment/cancel
PAYMEE_WEBHOOK_URL=https://your-backend.com/api/payment/payme/webhook

# URLs for webhook responses
FRONTEND_URL=https://your-frontend.com
BACKEND_URL=https://your-backend.com
```

## Database Schema

The integration uses the following database fields:

```sql
-- PayMe specific fields in payments table
payme_token VARCHAR(100) NULL,
payme_order_id VARCHAR(100) NULL,
payme_transaction_id INT NULL,
received_amount DECIMAL(10,2) NULL,
transaction_fee DECIMAL(10,2) NULL,
customer_email VARCHAR(255) NULL,
customer_phone VARCHAR(20) NULL,
customer_name VARCHAR(255) NULL,
completed_at TIMESTAMP NULL,
webhook_data JSON NULL
```

Run the migration:

```bash
mysql -u username -p database_name < src/migrations/update_payments_table.sql
```

## Frontend Integration

### 1. Payment Creation

```typescript
import { createPaymePayment } from "@main/services/payment.service";

const handlePayMePayment = async () => {
  try {
    const response = await createPaymePayment({
      amount: 100,
      walletAddress: userAccount.walletAddress,
      note: "Korpor investment payment",
      first_name: "John",
      last_name: "Doe",
      email: "user@example.com",
      phone: "+21611222333",
      projectId: "proj_123",
    });

    // Open WebView with payment_url
    setPaymePaymentData(response);
    setPaymeWebViewVisible(true);
  } catch (error) {
    console.error("PayMe error:", error);
  }
};
```

### 2. WebView Integration

```typescript
<WebView
  source={{ uri: paymePaymentData.payment_url }}
  onNavigationStateChange={(navState) => {
    // Check for completion URL
    if (navState.url.includes("/loader")) {
      setPaymeWebViewVisible(false);
      checkPaymentStatus(paymePaymentData.token);
    }
  }}
/>
```

### 3. Status Checking

```typescript
import { checkPaymePaymentStatus } from "@main/services/payment.service";

const checkPaymentStatus = async (token: string) => {
  try {
    const statusResponse = await checkPaymePaymentStatus(token);

    if (statusResponse.payment.status === "completed") {
      // Payment successful
      showSuccessMessage();
    } else if (statusResponse.payment.status === "failed") {
      // Payment failed
      showErrorMessage();
    }
  } catch (error) {
    console.error("Status check error:", error);
  }
};
```

## Testing Guide

### 1. Sandbox Credentials

Use these test credentials in the PayMe.tn sandbox:

- **Phone:** `11111111`
- **Password:** `11111111`

### 2. Test Flow

1. **Create Payment:**

   ```bash
   curl -X POST http://localhost:3000/api/payment/payme/create \
     -H "Content-Type: application/json" \
     -d '{
       "amount": 100,
       "first_name": "Test",
       "last_name": "User",
       "email": "test@example.com",
       "phone": "+21611222333",
       "walletAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
       "note": "Test payment"
     }'
   ```

2. **Open WebView:** Use the returned `payment_url`

3. **Complete Payment:** Use sandbox credentials

4. **Check Status:**
   ```bash
   curl http://localhost:3000/api/payment/payme/status/{token}
   ```

### 3. Webhook Testing

Test webhook locally using ngrok:

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Use the ngrok URL for webhook_url
# Example: https://abc123.ngrok.io/api/payment/payme/webhook
```

## Security Features

### 1. Webhook Verification

All webhooks are verified using PayMe's checksum:

```javascript
// Checksum formula: md5(token + payment_status + API_KEY)
const expectedCheckSum = crypto
  .createHash("md5")
  .update(token + paymentStatusValue + apiToken)
  .digest("hex");
```

### 2. Data Validation

- All input parameters are validated
- Phone numbers are formatted correctly
- Email addresses are verified
- Amounts are properly formatted

### 3. Error Handling

- Comprehensive error messages
- Proper HTTP status codes
- Detailed logging for debugging
- Graceful fallbacks

## Production Deployment

### 1. Environment Setup

```bash
# Production environment variables
NODE_ENV=production
PAYMEE_API_KEY=your_production_api_key
PAYMEE_RETURN_URL=https://your-domain.com/payment/success
PAYMEE_CANCEL_URL=https://your-domain.com/payment/cancel
PAYMEE_WEBHOOK_URL=https://your-domain.com/api/payment/payme/webhook
```

### 2. SSL Requirements

- HTTPS is required for production
- Valid SSL certificate needed
- Webhook URL must be accessible

### 3. Monitoring

- Monitor webhook delivery
- Track payment success rates
- Log all payment attempts
- Set up alerts for failures

## Troubleshooting

### Common Issues

1. **Webhook Not Received:**

   - Check webhook URL accessibility
   - Verify SSL certificate
   - Check firewall settings

2. **Payment Fails:**

   - Verify API key
   - Check request parameters
   - Review PayMe.tn status

3. **Checksum Mismatch:**
   - Verify API key in environment
   - Check checksum calculation
   - Review webhook payload

### Debug Mode

Enable debug logging:

```javascript
// Add to your environment
DEBUG=payme:*
```

### Support

- PayMe.tn Documentation: https://docs.paymee.tn
- PayMe.tn Support: support@paymee.tn
- Korpor Integration Support: Check project documentation

## Changelog

### v1.0.0 (Current)

- ✅ Complete PayMe.tn API v2 integration
- ✅ Webhook handling with signature verification
- ✅ Frontend WebView integration
- ✅ Real-time payment status updates
- ✅ Test mode support
- ✅ Comprehensive error handling
- ✅ Database schema updates
- ✅ Documentation and testing guide
