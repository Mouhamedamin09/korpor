// Stripe Configuration
// Replace these with your actual Stripe keys from your Stripe Dashboard

export const STRIPE_CONFIG = {
  // Test publishable key - replace with your actual key
  publishableKey: "pk_test_51YOUR_STRIPE_KEY_HERE",

  // For production, use your live keys
  // publishableKey: "pk_live_YOUR_LIVE_KEY_HERE",

  // Merchant display name
  merchantDisplayName: "Korpor",

  // Supported countries (ISO 3166-1 alpha-2)
  supportedCountries: ["US", "CA", "GB", "FR", "DE", "TN"],

  // Supported currencies
  supportedCurrencies: ["USD", "EUR", "TND"],
};

// Demo card numbers for testing (only work with test keys)
export const DEMO_CARDS = {
  visa: "4242424242424242",
  visaDebit: "4000056655665556",
  mastercard: "5555555555554444",
  amex: "378282246310005",
  declined: "4000000000000002",
  insufficientFunds: "4000000000009995",
};

// Instructions for setting up Stripe
export const SETUP_INSTRUCTIONS = `
To set up Stripe integration:

1. Create a Stripe account at https://stripe.com
2. Get your publishable key from the Stripe Dashboard
3. Replace STRIPE_PUBLISHABLE_KEY in PaymentMethodScreen.tsx
4. For production, use live keys and enable live mode

Test Cards (only work with test keys):
- Visa: 4242 4242 4242 4242
- Visa Debit: 4000 0566 5566 5556
- Mastercard: 5555 5555 5555 4444
- American Express: 3782 8224 6310 005

Use any future expiry date and any 3-digit CVC.
`;

export default STRIPE_CONFIG;
