# Stripe Integration Setup Guide

## 🔑 API Keys Configuration

### Frontend Environment Variables

Create a `.env` file in the `front-mobile` directory:

```bash
# front-mobile/.env
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51RUnX3R7t1xjLkoPtig24VoJhzy80UEnlBfQfaU0D4Oq2bhv3JDLCFxhcXnxEK0DqCXnBLtxMlTNXrJDjrsL32ns00tAd3iQMn
EXPO_PUBLIC_API_URL=http://192.168.1.201:5000
EXPO_PUBLIC_APP_ENV=development
```

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# backend/.env
STRIPE_SECRET_KEY=sk_test_51RUnX3R7t1xjLkoP1wtXgDm3ErtAXTjsrhtwPa8WErQhl7meCuTYhmjW28p9rWglJrigNOJTdEs75H3sWUNWVOR100XsTGnDK1
STRIPE_PUBLISHABLE_KEY=pk_test_51RUnX3R7t1xjLkoPtig24VoJhzy80UEnlBfQfaU0D4Oq2bhv3JDLCFxhcXnxEK0DqCXnBLtxMlTNXrJDjrsL32ns00tAd3iQMn
```

## 📱 Frontend Integration

The frontend is already configured to use environment variables:

- **PaymentMethodScreen**: Uses `process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **InvestmentPaymentScreen**: Uses `process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Fallback**: Hardcoded key as fallback if env var not found

## 🛠️ Backend Integration

For the backend, use the Stripe SDK with environment variables:

```javascript
// backend/config/stripe.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = stripe;
```

## 🧪 Test Cards

With the new test keys, you can use these test card numbers:

- **Visa**: `4242 4242 4242 4242`
- **Visa (debit)**: `4000 0566 5566 5556`
- **Mastercard**: `5555 5555 5555 4444`
- **American Express**: `3782 8224 6310 005`
- **Declined**: `4000 0000 0000 0002`

**Details for all test cards:**

- Use any future expiry date (e.g., 12/25)
- Use any 3-digit CVC (e.g., 123)
- Use any ZIP code (e.g., 12345)

## 🔄 Setup Steps

### 1. Frontend Setup

```bash
cd front-mobile
# Create .env file with the variables above
echo "EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51RUnX3R7t1xjLkoPtig24VoJhzy80UEnlBfQfaU0D4Oq2bhv3JDLCFxhcXnxEK0DqCXnBLtxMlTNXrJDjrsL32ns00tAd3iQMn" > .env
npm start
```

### 2. Backend Setup

```bash
cd backend
# Create .env file with the variables above
echo "STRIPE_SECRET_KEY=sk_test_51RUnX3R7t1xjLkoP1wtXgDm3ErtAXTjsrhtwPa8WErQhl7meCuTYhmjW28p9rWglJrigNOJTdEs75H3sWUNWVOR100XsTGnDK1" > .env
npm install stripe
npm run dev
```

## 🔐 Security Notes

- ✅ **Publishable Key**: Safe to use in frontend (starts with `pk_`)
- ⚠️ **Secret Key**: NEVER expose in frontend (starts with `sk_`)
- 🔒 **Environment Variables**: Always use `.env` files
- 📝 **Git Ignore**: Add `.env` to `.gitignore`

## 🚀 Current Status

✅ **Frontend**: Updated to use new publishable key  
✅ **Environment Variables**: Configured with fallbacks  
🔄 **Backend**: Needs implementation with new secret key  
🧪 **Test Mode**: Ready for development testing

## 📋 Next Steps

1. **Add .env files** with the keys above
2. **Install Stripe SDK** in backend: `npm install stripe`
3. **Implement backend endpoints** from `BACKEND_ENDPOINTS_NEEDED.md`
4. **Test payment flows** with test cards

The frontend will automatically use the new keys once you add them to the `.env` file!
