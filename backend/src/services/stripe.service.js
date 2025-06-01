// Stripe Test/Development Mode Configuration
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Test mode configuration
const STRIPE_CONFIG = {
  isTestMode: !process.env.NODE_ENV || process.env.NODE_ENV !== "production",
  testPublishableKey: "pk_test_TYooMQauvdEDq54NiTphI7jx", // Same as frontend
  supportedCurrencies: ["USD", "EUR", "TND"],
  testCards: {
    visa: "4242424242424242",
    visaDebit: "4000056655665556",
    mastercard: "5555555555554444",
    amex: "378282246310005",
    declined: "4000000000000002",
    insufficientFunds: "4000000000009995",
  },
};

// Log test mode status
console.log(
  `🔧 Stripe Service initialized in ${
    STRIPE_CONFIG.isTestMode ? "TEST" : "LIVE"
  } mode`
);
if (STRIPE_CONFIG.isTestMode) {
  console.log("💳 Test card numbers available for testing");
}

// Create payment intent for card payments
exports.createPaymentIntent = async ({
  amount,
  currency = "USD",
  customerId,
  metadata = {},
}) => {
  try {
    // Add test mode metadata
    const paymentMetadata = {
      ...metadata,
      integration_type: "korpor_investment",
      test_mode: STRIPE_CONFIG.isTestMode,
      environment: process.env.NODE_ENV || "development",
    };

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      customer: customerId,
      metadata: paymentMetadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      status: "success",
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      amount: amount,
      currency: currency,
      test_mode: STRIPE_CONFIG.isTestMode,
    };
  } catch (error) {
    console.error("Stripe payment intent creation error:", error);
    throw new Error(`Failed to create payment intent: ${error.message}`);
  }
};

// Create setup intent for saving cards
exports.createSetupIntent = async ({ customerId, metadata = {} }) => {
  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      metadata: {
        ...metadata,
        integration_type: "korpor_card_setup",
        test_mode: STRIPE_CONFIG.isTestMode,
      },
      payment_method_types: ["card"],
      usage: "off_session",
    });

    return {
      status: "success",
      client_secret: setupIntent.client_secret,
      setup_intent_id: setupIntent.id,
      test_mode: STRIPE_CONFIG.isTestMode,
    };
  } catch (error) {
    console.error("Stripe setup intent creation error:", error);
    throw new Error(`Failed to create setup intent: ${error.message}`);
  }
};

// Create or retrieve Stripe customer
exports.createOrGetCustomer = async ({ email, name, walletAddress }) => {
  try {
    // First, try to find existing customer by email
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    // Create new customer if not found
    const customer = await stripe.customers.create({
      email: email,
      name: name,
      metadata: {
        wallet_address: walletAddress,
        platform: "korpor",
        test_mode: STRIPE_CONFIG.isTestMode,
        created_via: "backend_api",
      },
    });

    return customer;
  } catch (error) {
    console.error("Stripe customer creation error:", error);
    throw new Error(`Failed to create/get customer: ${error.message}`);
  }
};

// Get payment methods for a customer
exports.getCustomerPaymentMethods = async (customerId) => {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    return paymentMethods.data.map((pm) => ({
      id: pm.id,
      type: pm.type,
      card: {
        brand: pm.card.brand,
        last4: pm.card.last4,
        exp_month: pm.card.exp_month,
        exp_year: pm.card.exp_year,
      },
      created: pm.created,
      test_mode: STRIPE_CONFIG.isTestMode,
    }));
  } catch (error) {
    console.error("Stripe payment methods retrieval error:", error);
    throw new Error(`Failed to get payment methods: ${error.message}`);
  }
};

// Detach payment method from customer
exports.detachPaymentMethod = async (paymentMethodId) => {
  try {
    const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
    return {
      status: "success",
      payment_method_id: paymentMethod.id,
      test_mode: STRIPE_CONFIG.isTestMode,
    };
  } catch (error) {
    console.error("Stripe payment method detach error:", error);
    throw new Error(`Failed to detach payment method: ${error.message}`);
  }
};

// Confirm payment intent
exports.confirmPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
    return {
      status: paymentIntent.status,
      payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount / 100, // Convert back from cents
      currency: paymentIntent.currency,
      test_mode: STRIPE_CONFIG.isTestMode,
    };
  } catch (error) {
    console.error("Stripe payment intent confirmation error:", error);
    throw new Error(`Failed to confirm payment intent: ${error.message}`);
  }
};

// Handle webhook events
exports.handleWebhook = async (payload, signature) => {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    return {
      event_id: event.id,
      event_type: event.type,
      data: event.data.object,
      test_mode: STRIPE_CONFIG.isTestMode,
    };
  } catch (error) {
    console.error("Stripe webhook error:", error);
    throw new Error(`Webhook signature verification failed: ${error.message}`);
  }
};

// Process refund
exports.createRefund = async (paymentIntentId, amount = null) => {
  try {
    const refundData = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      refundData.amount = Math.round(amount * 100); // Convert to cents
    }

    const refund = await stripe.refunds.create(refundData);

    return {
      status: "success",
      refund_id: refund.id,
      amount: refund.amount / 100, // Convert back from cents
      refund_status: refund.status,
      test_mode: STRIPE_CONFIG.isTestMode,
    };
  } catch (error) {
    console.error("Stripe refund error:", error);
    throw new Error(`Failed to create refund: ${error.message}`);
  }
};

// Get test card information (development helper)
exports.getTestCards = () => {
  if (!STRIPE_CONFIG.isTestMode) {
    throw new Error("Test cards are only available in test mode");
  }

  return {
    test_mode: true,
    message:
      "These test card numbers can be used with any future expiry date and any 3-digit CVC",
    cards: STRIPE_CONFIG.testCards,
    instructions: [
      "Use any future expiry date (e.g., 12/25)",
      "Use any 3-digit CVC (e.g., 123)",
      "For American Express, use any 4-digit CVC (e.g., 1234)",
    ],
  };
};

// Get Stripe configuration info
exports.getStripeConfig = () => {
  return {
    test_mode: STRIPE_CONFIG.isTestMode,
    supported_currencies: STRIPE_CONFIG.supportedCurrencies,
    publishable_key: STRIPE_CONFIG.testPublishableKey, // Only return test key
    environment: process.env.NODE_ENV || "development",
  };
};
