# Stripe Payment Integration

This document explains how to set up and use the Stripe payment integration in the Korpor mobile app.

## Overview

The app integrates Stripe for secure payment processing, allowing users to:

- Add credit/debit cards securely
- Process payments for deposits and withdrawals
- Manage saved payment methods
- Use test cards for development

## Files Structure

```
front-mobile/src/app/main/components/wallet/
├── walletscreens/
│   └── PaymentMethodScreen.tsx          # Main payment methods screen
├── compoenets/ui/
│   └── StripeCardForm.tsx              # Stripe card input form
└── config/
    └── stripe.ts                       # Stripe configuration
```

## Setup Instructions

### 1. Get Stripe Keys

1. Create a Stripe account at [https://stripe.com](https://stripe.com)
2. Go to your Stripe Dashboard
3. Navigate to Developers > API keys
4. Copy your publishable key (starts with `pk_test_` for test mode)

### 2. Configure the App

1. Open `front-mobile/src/app/main/components/wallet/config/stripe.ts`
2. Replace `"pk_test_51YOUR_STRIPE_KEY_HERE"` with your actual publishable key
3. Update other configuration as needed:

```typescript
export const STRIPE_CONFIG = {
  publishableKey: "pk_test_YOUR_ACTUAL_KEY_HERE", // Replace this
  merchantDisplayName: "Korpor",
  supportedCountries: ["US", "CA", "GB", "FR", "DE", "TN"],
  supportedCurrencies: ["USD", "EUR", "TND"],
};
```

### 3. Backend Integration (Future)

For production, you'll need to:

1. Create a backend endpoint to create payment intents
2. Handle webhooks for payment confirmations
3. Store payment method tokens securely
4. Implement proper error handling

## Features

### Payment Method Screen

- **Add Cards**: Users can add credit/debit cards using Stripe's secure form
- **Manage Cards**: View and remove saved payment methods
- **iPayment**: Placeholder for future iPayment integration
- **Security Info**: Information about payment security

### Stripe Card Form

- **Secure Input**: Uses Stripe's CardField component for PCI compliance
- **Real-time Validation**: Validates card information as user types
- **Demo Mode**: Shows demo alerts when using test keys

### Demo/Test Mode

The app includes demo functionality for testing:

#### Test Card Numbers

Use these test cards with any future expiry date and any 3-digit CVC:

- **Visa**: 4242 4242 4242 4242
- **Visa Debit**: 4000 0566 5566 5556
- **Mastercard**: 5555 5555 5555 4444
- **American Express**: 3782 8224 6310 005

#### Error Testing Cards

- **Declined**: 4000 0000 0000 0002
- **Insufficient Funds**: 4000 0000 0000 9995

## Navigation

The payment method screen is accessible from:

1. Wallet screen → "Add payment method" button
2. Wallet settings → "Payment Methods" option

## Security Features

- **PCI Compliance**: Uses Stripe's secure card input fields
- **No Card Storage**: Card details never stored on device or servers
- **Tokenization**: Cards are tokenized by Stripe for security
- **Encryption**: All data transmitted securely via HTTPS

## Current Limitations

1. **Demo Mode**: Currently shows demo alerts instead of real processing
2. **No Backend**: Requires backend integration for production use
3. **iPayment**: Not yet implemented (placeholder only)
4. **Limited Testing**: Only basic card input testing available

## Next Steps for Production

1. **Backend Setup**:

   ```javascript
   // Example backend endpoint
   app.post("/create-payment-intent", async (req, res) => {
     const { amount, currency } = req.body;

     const paymentIntent = await stripe.paymentIntents.create({
       amount: amount * 100, // Convert to cents
       currency: currency,
       automatic_payment_methods: {
         enabled: true,
       },
     });

     res.send({
       clientSecret: paymentIntent.client_secret,
     });
   });
   ```

2. **Update Frontend**:

   - Replace demo alerts with real API calls
   - Implement proper error handling
   - Add loading states for network requests

3. **Testing**:
   - Test with real Stripe test keys
   - Implement proper error scenarios
   - Add unit tests for payment flows

## Troubleshooting

### Common Issues

1. **"Stripe Setup Required" Alert**:

   - Replace the demo key in `stripe.ts` with your actual key

2. **Card Input Not Working**:

   - Ensure Stripe SDK is properly installed
   - Check that publishable key is valid

3. **Navigation Errors**:
   - Verify all screen paths are correct
   - Check that required screens exist

### Debug Mode

To enable debug information:

1. Check console logs for Stripe errors
2. Use Stripe Dashboard to monitor test transactions
3. Enable network debugging to see API calls

## Support

For Stripe-specific issues:

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe React Native SDK](https://github.com/stripe/stripe-react-native)

For app-specific issues:

- Check the console for error messages
- Verify all dependencies are installed
- Ensure proper navigation setup
