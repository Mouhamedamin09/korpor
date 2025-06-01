# Required Backend API Endpoints for Payment System

The frontend payment system requires these backend API endpoints to be implemented. Currently, these are returning 404 errors.

## 🔑 Environment Variables

### Frontend (.env)

```
# Stripe Configuration
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51RUnX3R7t1xjLkoPtig24VoJhzy80UEnlBfQfaU0D4Oq2bhv3JDLCFxhcXnxEK0DqCXnBLtxMlTNXrJDjrsL32ns00tAd3iQMn

# API Configuration
EXPO_PUBLIC_API_URL=http://192.168.1.201:5000

# App Configuration
EXPO_PUBLIC_APP_ENV=development
```

### Backend (.env)

```
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51RUnX3R7t1xjLkoP1wtXgDm3ErtAXTjsrhtwPa8WErQhl7meCuTYhmjW28p9rWglJrigNOJTdEs75H3sWUNWVOR100XsTGnDK1
STRIPE_PUBLISHABLE_KEY=pk_test_51RUnX3R7t1xjLkoPtig24VoJhzy80UEnlBfQfaU0D4Oq2bhv3JDLCFxhcXnxEK0DqCXnBLtxMlTNXrJDjrsL32ns00tAd3iQMn
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Database Configuration
DATABASE_URL=your_database_connection_string

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
```

## Authentication

All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

## 📋 Payment Method Management Endpoints

### 1. Get Saved Payment Methods

```
GET /api/payment/saved-methods
```

**Headers:**

- Authorization: Bearer {token}

**Response:**

```json
{
  "status": "success",
  "payment_methods": [
    {
      "id": "pm_123",
      "type": "stripe",
      "stripe_payment_method_id": "pm_stripe_123",
      "card": {
        "brand": "visa",
        "last4": "4242",
        "exp_month": 12,
        "exp_year": 2025
      },
      "is_default": true,
      "created_at": "2024-12-01T10:00:00Z",
      "updated_at": "2024-12-01T10:00:00Z"
    }
  ]
}
```

### 2. Save Stripe Payment Method

```
POST /api/payment/stripe/save-method
```

**Headers:**

- Authorization: Bearer {token}
- Content-Type: application/json

**Body:**

```json
{
  "setup_intent_id": "seti_123",
  "is_default": true
}
```

**Response:**

```json
{
  "status": "success",
  "payment_method": {
    "id": "pm_123",
    "type": "stripe",
    "stripe_payment_method_id": "pm_stripe_123",
    "card": {
      "brand": "visa",
      "last4": "4242",
      "exp_month": 12,
      "exp_year": 2025
    },
    "is_default": true,
    "created_at": "2024-12-01T10:00:00Z",
    "updated_at": "2024-12-01T10:00:00Z"
  }
}
```

### 3. Delete Saved Payment Method

```
DELETE /api/payment/saved-methods/{id}
```

**Headers:**

- Authorization: Bearer {token}

**Response:**

```json
{
  "status": "success",
  "message": "Payment method deleted successfully"
}
```

### 4. Set Default Payment Method

```
PUT /api/payment/saved-methods/{id}/default
```

**Headers:**

- Authorization: Bearer {token}

**Response:**

```json
{
  "status": "success",
  "message": "Default payment method updated"
}
```

## 💳 Stripe Integration Endpoints

### 5. Create Setup Intent (for saving cards)

```
POST /api/payment/stripe/setup-intent
```

**Headers:**

- Content-Type: application/json

**Body:**

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "walletAddress": "0x123..."
}
```

**Response:**

```json
{
  "status": "success",
  "payment_method": "stripe",
  "client_secret": "seti_123_secret_abc",
  "setup_intent_id": "seti_123",
  "customer_id": "cus_123",
  "test_mode": true
}
```

### 6. Create Payment with Saved Method

```
POST /api/payment/stripe/payment-with-saved
```

**Headers:**

- Authorization: Bearer {token}
- Content-Type: application/json

**Body:**

```json
{
  "saved_method_id": "pm_123",
  "amount": 100.0,
  "currency": "USD"
}
```

**Response:**

```json
{
  "status": "success",
  "payment_method": "stripe",
  "client_secret": "pi_123_secret_abc",
  "payment_intent_id": "pi_123",
  "amount": 100.0,
  "currency": "USD",
  "customer_id": "cus_123",
  "test_mode": true
}
```

## 🗄️ Database Schema

### saved_payment_methods table

```sql
CREATE TABLE saved_payment_methods (
  id VARCHAR(255) PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('stripe', 'payme') NOT NULL,
  stripe_payment_method_id VARCHAR(255),
  payme_phone VARCHAR(255),
  payme_account_name VARCHAR(255),
  card_brand VARCHAR(50),
  card_last4 VARCHAR(4),
  card_exp_month INT,
  card_exp_year INT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_default (user_id, is_default)
);
```

## 🔧 Implementation Notes

### Stripe Integration

- Use Stripe's Node.js SDK
- Store Stripe customer ID in users table
- Use setup intents for saving cards without charging
- Retrieve payment method details from Stripe API
- **Important**: Use environment variables for API keys (never hardcode them)
- Test mode keys provided above - switch to live keys for production

### Security

- Validate JWT tokens on all endpoints
- Ensure users can only access their own payment methods
- Never store raw card numbers - use Stripe payment method IDs
- Validate Stripe webhooks for payment status updates

### Error Handling

- Return appropriate HTTP status codes
- Provide clear error messages
- Handle Stripe API errors gracefully
- Log errors for debugging

## 🚀 Quick Implementation Tips

1. **Start with GET /api/payment/saved-methods** - Return empty array initially
2. **Implement Stripe setup intent creation** - This enables card saving
3. **Add database table** - Store payment method references
4. **Test with frontend** - Frontend already handles these endpoints

## Current Status

❌ All endpoints returning 404  
✅ Frontend gracefully handles missing endpoints  
🔄 Ready for backend implementation

The frontend will work with empty payment methods until these endpoints are implemented.
