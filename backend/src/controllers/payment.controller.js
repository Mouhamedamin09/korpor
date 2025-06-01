const { rawQuery } = require("../config/db.config");
const paymeeService = require("../services/paymee.service");
const stripeService = require("../services/stripe.service");
const cryptoService = require("../services/crypto.service");
const blockchain = require("../blockchain/investment");

// ================================
// PAYMENT METHOD MANAGEMENT
// ================================

// Get all available payment methods
exports.getPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = {
      stripe: {
        name: "Credit/Debit Card",
        description: "Pay securely with Stripe (Test Mode)",
        enabled: true,
        test_mode: true,
        supported_currencies: ["USD", "EUR", "TND"],
        processing_time: "Instant",
        fees: "2.9% + $0.30",
      },
      payme: {
        name: "PayMe.tn",
        description: "Tunisian mobile payment solution (Test Mode)",
        enabled: true,
        test_mode: process.env.NODE_ENV !== "production",
        supported_currencies: ["TND"],
        processing_time: "1-3 minutes",
        fees: "1.5% + 0.5 TND",
        features: [
          "Mobile wallet payments",
          "Bank transfers",
          "Local payment methods",
          "QR code payments",
        ],
        test_credentials: {
          phone: "11111111",
          password: "11111111",
        },
      },
      crypto: {
        name: "Cryptocurrency",
        description: "Pay with Bitcoin, Ethereum, USDT, USDC",
        enabled: true,
        test_mode: true,
        supported_currencies: await cryptoService.getSupportedCryptos(),
        processing_time: "5-30 minutes (depending on network)",
        fees: "Network fees only",
      },
    };

    res.json({
      status: "success",
      payment_methods: paymentMethods,
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch payment methods",
    });
  }
};

// ================================
// STRIPE PAYMENTS (TEST MODE)
// ================================

// Create Stripe payment intent
exports.createStripePayment = async (req, res) => {
  try {
    const {
      amount,
      currency = "USD",
      email,
      name,
      walletAddress,
      projectId,
    } = req.body;

    if (!amount || !email || !walletAddress) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields: amount, email, walletAddress",
      });
    }

    // Create or get Stripe customer
    const customer = await stripeService.createOrGetCustomer({
      email,
      name: name || email,
      walletAddress,
    });

    // Create payment intent
    const paymentIntent = await stripeService.createPaymentIntent({
      amount,
      currency,
      customerId: customer.id,
      metadata: {
        project_id: projectId,
        wallet_address: walletAddress,
        payment_type: "investment",
      },
    });

    // Store payment record in database
    await rawQuery(
      `INSERT INTO payments (
        payment_id, payment_method, amount, currency, status, 
        user_address, project_id, stripe_customer_id, stripe_payment_intent_id, 
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        paymentIntent.payment_intent_id,
        "stripe",
        amount,
        currency,
        "pending",
        walletAddress.toLowerCase(),
        projectId,
        customer.id,
        paymentIntent.payment_intent_id,
      ]
    );

    res.json({
      status: "success",
      payment_method: "stripe",
      ...paymentIntent,
      customer_id: customer.id,
    });
  } catch (error) {
    console.error("Stripe payment creation error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Create Stripe setup intent (for saving cards)
exports.createStripeSetupIntent = async (req, res) => {
  try {
    const { email, name, walletAddress } = req.body;

    if (!email || !walletAddress) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields: email, walletAddress",
      });
    }

    // Create or get Stripe customer
    const customer = await stripeService.createOrGetCustomer({
      email,
      name: name || email,
      walletAddress,
    });

    // Create setup intent
    const setupIntent = await stripeService.createSetupIntent({
      customerId: customer.id,
      metadata: {
        wallet_address: walletAddress,
        setup_type: "card_save",
      },
    });

    res.json({
      status: "success",
      payment_method: "stripe",
      ...setupIntent,
      customer_id: customer.id,
    });
  } catch (error) {
    console.error("Stripe setup intent error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get Stripe customer payment methods
exports.getStripePaymentMethods = async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      return res.status(400).json({
        status: "error",
        message: "Customer ID required",
      });
    }

    const paymentMethods = await stripeService.getCustomerPaymentMethods(
      customerId
    );

    res.json({
      status: "success",
      payment_methods: paymentMethods,
    });
  } catch (error) {
    console.error("Get payment methods error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Stripe webhook handler
exports.handleStripeWebhook = async (req, res) => {
  try {
    const signature = req.headers["stripe-signature"];
    const payload = req.body;

    const webhookEvent = await stripeService.handleWebhook(payload, signature);

    // Handle different event types
    switch (webhookEvent.event_type) {
      case "payment_intent.succeeded":
        await handleSuccessfulPayment(webhookEvent.data, "stripe");
        break;
      case "payment_intent.payment_failed":
        await handleFailedPayment(webhookEvent.data, "stripe");
        break;
    }

    res.json({ status: "success", event_id: webhookEvent.event_id });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get Stripe test cards (development helper)
exports.getStripeTestCards = async (req, res) => {
  try {
    const testCards = stripeService.getTestCards();
    res.json(testCards);
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// ================================
// PAYME PAYMENTS (COMING SOON)
// ================================

// Test PayMe payment creation with minimal data
exports.testPaymePayment = async (req, res) => {
  try {
    console.log("Testing PayMe payment with minimal data...");

    // Test with minimal required data using HTTPS URLs as required by PayMe
    const testPaymentData = {
      amount: 10.0,
      note: "Test payment",
      first_name: "John",
      last_name: "Doe",
      email: "test@example.com",
      phone: "11111111", // Use PayMe test phone
      order_id: `test_${Date.now()}`,
      return_url: "https://korpor.example.com/payment/success", // HTTPS required
      cancel_url: "https://korpor.example.com/payment/cancel", // HTTPS required
      webhook_url: process.env.BACKEND_URL || "https://webhook.example.com", // Use ngrok HTTPS URL
    };

    console.log("Sending test data to PayMe:", testPaymentData);

    const paymeResponse = await paymeeService.createPayment(testPaymentData);

    res.json({
      status: "success",
      message: "PayMe test payment created successfully",
      data: paymeResponse,
      test_data_sent: testPaymentData,
    });
  } catch (error) {
    console.error("PayMe test payment error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
      error_details: {
        name: error.name,
        stack: error.stack,
      },
    });
  }
};

// Create PayMe payment (now using real API)
exports.createPaymePayment = async (req, res) => {
  try {
    const {
      amount,
      note,
      walletAddress,
      first_name,
      last_name,
      email,
      phone,
      projectId,
    } = req.body;

    if (
      !amount ||
      !walletAddress ||
      !email ||
      !phone ||
      !first_name ||
      !last_name
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "Missing required fields: amount, walletAddress, email, phone, first_name, last_name",
      });
    }

    // Generate unique order ID
    const orderId = `korpor_${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}`;

    // Ensure phone number is in correct format for Tunisia
    let formattedPhone = phone;
    if (!phone.startsWith("+216") && !phone.startsWith("216")) {
      // If it's a local number like 11222333, add +216
      if (phone.length === 8) {
        formattedPhone = `+216${phone}`;
      }
      // If it starts with 0, replace with +216
      else if (phone.startsWith("0")) {
        formattedPhone = `+216${phone.substring(1)}`;
      }
      // If it doesn't have country code, add it
      else if (!phone.startsWith("+")) {
        formattedPhone = `+216${phone}`;
      }
    }

    // PayMe requires HTTPS URLs - use ngrok URL for both frontend and backend
    const backendUrl =
      process.env.BACKEND_URL || "https://korpor-backend.ngrok.io";
    const frontendUrl =
      process.env.FRONTEND_URL || "https://korpor-frontend.ngrok.io";

    // Ensure URLs are HTTPS (PayMe requirement)
    const secureBackendUrl = backendUrl.startsWith("https://")
      ? backendUrl
      : `https://${backendUrl.replace(/^https?:\/\//, "")}`;
    const secureFrontendUrl = frontendUrl.startsWith("https://")
      ? frontendUrl
      : `https://${frontendUrl.replace(/^https?:\/\//, "")}`;

    console.log("PayMe payment data being sent:", {
      amount: parseFloat(amount),
      note: note || `Korpor investment payment`,
      first_name,
      last_name,
      email,
      phone: formattedPhone,
      order_id: orderId,
      return_url: `${secureFrontendUrl}/payment/success`,
      cancel_url: `${secureFrontendUrl}/payment/cancel`,
      webhook_url: `${secureBackendUrl}/api/payment/payme/webhook`,
    });

    // Create PayMe payment with HTTPS URLs as required by their API
    const paymeResponse = await paymeeService.createPayment({
      amount: parseFloat(amount),
      note: note || `Korpor investment payment`,
      first_name,
      last_name,
      email,
      phone: formattedPhone,
      order_id: orderId,
      return_url: `${secureFrontendUrl}/payment/success`,
      cancel_url: `${secureFrontendUrl}/payment/cancel`,
      webhook_url: `${secureBackendUrl}/api/payment/payme/webhook`,
    });

    // Store payment record in database
    await rawQuery(
      `INSERT INTO payments (
        payment_id, payment_method, amount, currency, status, 
        user_address, project_id, payme_token, payme_order_id, 
        customer_email, customer_phone, customer_name, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        paymeResponse.token, // Use PayMe token as payment_id
        "payme",
        amount,
        "TND",
        "pending",
        walletAddress.toLowerCase(),
        projectId,
        paymeResponse.token,
        paymeResponse.order_id,
        email,
        phone,
        `${first_name} ${last_name}`,
      ]
    );

    res.json({
      status: "success",
      payment_method: "payme",
      ...paymeResponse,
    });
  } catch (error) {
    console.error("PayMe payment error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Handle PayMe webhook (Step 3 - Check payment)
exports.handlePaymeWebhook = async (req, res) => {
  try {
    console.log("PayMe webhook received:", req.body);

    // Process the webhook data
    const processedData = await paymeeService.processWebhook(req.body);

    // Update payment record in database
    await rawQuery(
      `UPDATE payments 
       SET status = ?, payme_transaction_id = ?, received_amount = ?, 
           transaction_fee = ?, completed_at = NOW(), webhook_data = ?
       WHERE payme_token = ?`,
      [
        processedData.payment_status,
        processedData.transaction_id,
        processedData.received_amount,
        processedData.transaction_fee,
        JSON.stringify(req.body),
        processedData.token,
      ]
    );

    // If payment is successful, handle the investment
    if (processedData.is_successful) {
      await handleSuccessfulPayment(processedData, "payme");
    } else {
      await handleFailedPayment(processedData, "payme");
    }

    // Always return 200 to PayMe to acknowledge receipt
    res.status(200).json({
      status: "success",
      message: "Webhook processed successfully",
      token: processedData.token,
      payment_status: processedData.payment_status,
    });
  } catch (error) {
    console.error("PayMe webhook processing error:", error);

    // Still return 200 to prevent PayMe from retrying
    res.status(200).json({
      status: "error",
      message: "Webhook processing failed",
      error: error.message,
    });
  }
};

// Check PayMe payment status
exports.checkPaymePaymentStatus = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        status: "error",
        message: "Token is required",
      });
    }

    // Get payment status from database (since PayMe doesn't have status endpoint)
    const [payment] = await rawQuery(
      "SELECT * FROM payments WHERE payme_token = ?",
      [token]
    );

    if (!payment.length) {
      return res.status(404).json({
        status: "error",
        message: "Payment not found",
      });
    }

    const paymentData = payment[0];

    res.json({
      status: "success",
      payment: {
        token: paymentData.payme_token,
        order_id: paymentData.payme_order_id,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: paymentData.status,
        created_at: paymentData.created_at,
        completed_at: paymentData.completed_at,
        transaction_id: paymentData.payme_transaction_id,
        received_amount: paymentData.received_amount,
        transaction_fee: paymentData.transaction_fee,
      },
    });
  } catch (error) {
    console.error("PayMe status check error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// ================================
// CRYPTO PAYMENTS
// ================================

// Create crypto payment
exports.createCryptoPayment = async (req, res) => {
  try {
    const { amount, crypto, walletAddress, projectId } = req.body;

    if (!amount || !crypto || !walletAddress) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields: amount, crypto, walletAddress",
      });
    }

    const orderId = `order_${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}`;

    const cryptoPayment = await cryptoService.generatePaymentAddress({
      crypto,
      amount,
      userWalletAddress: walletAddress,
      orderId,
    });

    // Store crypto payment record
    await rawQuery(
      `INSERT INTO payments (
        payment_id, payment_method, amount, currency, status, 
        user_address, project_id, crypto_address, crypto_currency,
        expires_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        cryptoPayment.payment_request.payment_id,
        "crypto",
        amount,
        crypto,
        "pending",
        walletAddress.toLowerCase(),
        projectId,
        cryptoPayment.payment_request.payment_address,
        crypto,
        cryptoPayment.payment_request.expires_at,
      ]
    );

    res.json({
      status: "success",
      payment_method: "crypto",
      ...cryptoPayment,
    });
  } catch (error) {
    console.error("Crypto payment creation error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Check crypto transaction status
exports.checkCryptoTransaction = async (req, res) => {
  try {
    const { transactionHash, crypto } = req.params;

    const transactionStatus = await cryptoService.checkTransactionStatus(
      transactionHash,
      crypto
    );

    res.json({
      status: "success",
      transaction_status: transactionStatus,
    });
  } catch (error) {
    console.error("Crypto transaction check error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get supported cryptocurrencies
exports.getSupportedCryptos = async (req, res) => {
  try {
    const supportedCryptos = cryptoService.getSupportedCryptos();
    res.json(supportedCryptos);
  } catch (error) {
    console.error("Get supported cryptos error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// ================================
// LEGACY/GENERAL PAYMENT FUNCTIONS
// ================================

// Get payment status by reference
exports.getPaymentStatusByRef = async (req, res) => {
  const { ref } = req.params;

  try {
    const [result] = await rawQuery(
      "SELECT * FROM payments WHERE payment_id = ? OR paymee_ref = ?",
      [ref, ref]
    );

    if (!result.length) {
      return res.status(404).json({
        status: "error",
        message: "Payment not found",
      });
    }

    res.json({
      status: "success",
      payment: result[0],
    });
  } catch (error) {
    console.error("Error fetching payment status:", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching payment status",
    });
  }
};

// Get all payments by wallet address
exports.getPaymentsByWallet = async (req, res) => {
  const { walletAddress } = req.params;

  try {
    const [result] = await rawQuery(
      "SELECT * FROM payments WHERE user_address = ? ORDER BY created_at DESC",
      [walletAddress.toLowerCase()]
    );

    if (!result.length) {
      return res.status(404).json({
        status: "error",
        message: "No payments found",
      });
    }

    res.json({
      status: "success",
      payments: result,
    });
  } catch (error) {
    console.error("Error fetching payments by wallet:", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching payments",
    });
  }
};

// ================================
// SAVED PAYMENT METHODS
// ================================

// Get user's saved payment methods
exports.getSavedPaymentMethods = async (req, res) => {
  try {
    // Extract user ID from JWT token (you'll need to implement JWT middleware)
    const userId = req.user?.userId || req.headers["x-user-id"]; // Fallback for testing

    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    console.log(`Fetching saved payment methods for user: ${userId}`);

    const [savedMethods] = await rawQuery(
      `SELECT spm.*, 
              JSON_OBJECT(
                'brand', spm.card_brand,
                'last4', spm.card_last4,
                'exp_month', spm.card_exp_month,
                'exp_year', spm.card_exp_year
              ) as card
       FROM saved_payment_methods spm 
       WHERE spm.user_id = ? AND spm.deleted_at IS NULL
       ORDER BY spm.is_default DESC, spm.created_at DESC`,
      [userId]
    );

    console.log(`Found ${savedMethods.length} saved payment methods`);

    const formattedMethods = savedMethods.map((method) => ({
      id: method.id,
      type: method.type,
      stripe_payment_method_id: method.stripe_payment_method_id,
      card: JSON.parse(method.card),
      is_default: method.is_default === 1,
      created_at: method.created_at,
      updated_at: method.updated_at,
    }));

    console.log(`Formatted methods:`, formattedMethods);

    res.json({
      status: "success",
      payment_methods: formattedMethods,
    });
  } catch (error) {
    console.error("Error fetching saved payment methods:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch saved payment methods",
      error: error.message, // Add error message for debugging
    });
  }
};

// Save Stripe payment method from setup intent
exports.saveStripePaymentMethod = async (req, res) => {
  try {
    const { setup_intent_id, is_default = false } = req.body;
    const userId = req.user?.userId || req.headers["x-user-id"]; // Fallback for testing

    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    if (!setup_intent_id) {
      return res.status(400).json({
        status: "error",
        message: "Setup intent ID is required",
      });
    }

    // Retrieve the setup intent from Stripe to get the payment method
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    const setupIntent = await stripe.setupIntents.retrieve(setup_intent_id);

    if (!setupIntent.payment_method) {
      return res.status(400).json({
        status: "error",
        message: "No payment method attached to this setup intent",
      });
    }

    // Get payment method details from Stripe
    const paymentMethod = await stripe.paymentMethods.retrieve(
      setupIntent.payment_method
    );

    // If this should be the default, unset other defaults first
    if (is_default) {
      await rawQuery(
        `UPDATE saved_payment_methods SET is_default = 0 WHERE user_id = ?`,
        [userId]
      );
    }

    // Save to database
    const result = await rawQuery(
      `INSERT INTO saved_payment_methods 
       (user_id, type, stripe_payment_method_id, stripe_customer_id, 
        card_brand, card_last4, card_exp_month, card_exp_year, 
        is_default, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        userId,
        "stripe",
        paymentMethod.id,
        setupIntent.customer,
        paymentMethod.card.brand,
        paymentMethod.card.last4,
        paymentMethod.card.exp_month,
        paymentMethod.card.exp_year,
        is_default ? 1 : 0,
      ]
    );

    // Return the saved payment method
    const savedMethod = {
      id: result.insertId,
      type: "stripe",
      stripe_payment_method_id: paymentMethod.id,
      card: {
        brand: paymentMethod.card.brand,
        last4: paymentMethod.card.last4,
        exp_month: paymentMethod.card.exp_month,
        exp_year: paymentMethod.card.exp_year,
      },
      is_default: is_default,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    res.json({
      status: "success",
      payment_method: savedMethod,
    });
  } catch (error) {
    console.error("Error saving payment method:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Delete saved payment method
exports.deleteSavedPaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId || req.headers["x-user-id"]; // Fallback for testing

    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    // Check if the payment method exists and belongs to the user
    const [existingMethod] = await rawQuery(
      `SELECT * FROM saved_payment_methods WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
      [id, userId]
    );

    if (existingMethod.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Payment method not found",
      });
    }

    // Soft delete the payment method
    await rawQuery(
      `UPDATE saved_payment_methods SET deleted_at = NOW() WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    // If this was the default method, set another one as default if available
    if (existingMethod[0].is_default) {
      await rawQuery(
        `UPDATE saved_payment_methods 
         SET is_default = 1 
         WHERE user_id = ? AND deleted_at IS NULL 
         ORDER BY created_at ASC 
         LIMIT 1`,
        [userId]
      );
    }

    res.json({
      status: "success",
      message: "Payment method deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting payment method:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete payment method",
      error: error.message,
    });
  }
};

// Set default payment method
exports.setDefaultPaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId || req.headers["x-user-id"]; // Fallback for testing

    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    // Check if the payment method exists and belongs to the user
    const [existingMethod] = await rawQuery(
      `SELECT * FROM saved_payment_methods WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
      [id, userId]
    );

    if (existingMethod.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Payment method not found",
      });
    }

    // Unset all other defaults for this user
    await rawQuery(
      `UPDATE saved_payment_methods SET is_default = 0 WHERE user_id = ?`,
      [userId]
    );

    // Set this one as default
    await rawQuery(
      `UPDATE saved_payment_methods SET is_default = 1 WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    res.json({
      status: "success",
      message: "Default payment method updated",
    });
  } catch (error) {
    console.error("Error setting default payment method:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update default payment method",
      error: error.message,
    });
  }
};

// Create payment with saved Stripe method
exports.createPaymentWithSavedMethod = async (req, res) => {
  try {
    const { saved_method_id, amount, currency = "USD" } = req.body;
    const userId = req.user?.userId || req.headers["x-user-id"]; // Fallback for testing

    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    if (!saved_method_id || !amount) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields: saved_method_id, amount",
      });
    }

    // Get the saved payment method
    const [savedMethod] = await rawQuery(
      `SELECT * FROM saved_payment_methods WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
      [saved_method_id, userId]
    );

    if (savedMethod.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Saved payment method not found",
      });
    }

    const method = savedMethod[0];

    // Create payment intent with the saved payment method
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      customer: method.stripe_customer_id,
      payment_method: method.stripe_payment_method_id,
      confirmation_method: "manual",
      confirm: true,
      return_url: "https://your-app.com/return", // You may need to adjust this
      metadata: {
        saved_method_id: saved_method_id,
        user_id: userId,
        payment_type: "saved_method",
      },
    });

    // Store payment record
    await rawQuery(
      `INSERT INTO payments (
        payment_id, payment_method, amount, currency, status, 
        user_id, stripe_customer_id, stripe_payment_intent_id, 
        saved_payment_method_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        paymentIntent.id,
        "stripe",
        amount,
        currency,
        paymentIntent.status,
        userId,
        method.stripe_customer_id,
        paymentIntent.id,
        saved_method_id,
      ]
    );

    res.json({
      status: "success",
      payment_method: "stripe",
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      amount: amount,
      currency: currency,
      payment_status: paymentIntent.status,
      test_mode: true,
    });
  } catch (error) {
    console.error("Error creating payment with saved method:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// ================================
// HELPER FUNCTIONS
// ================================

// Handle successful payment (shared logic)
async function handleSuccessfulPayment(paymentData, paymentMethod) {
  try {
    // Update payment status
    await rawQuery(
      "UPDATE payments SET status = 'confirmed', updated_at = NOW() WHERE payment_id = ?",
      [paymentData.id]
    );

    // Get payment details
    const [payment] = await rawQuery(
      "SELECT * FROM payments WHERE payment_id = ?",
      [paymentData.id]
    );

    if (payment.length > 0 && payment[0].project_id) {
      // Record investment on blockchain
      const txHash = await blockchain.recordInvestment(
        payment[0].project_id,
        payment[0].user_address,
        payment[0].amount
      );

      // Update investment record
      await rawQuery(
        "UPDATE investments SET status = 'confirmed', tx_hash = ? WHERE payment_id = ?",
        [txHash, paymentData.id]
      );

      // Update project funding
      await updateProjectFunding(payment[0].project_id, payment[0].amount);
    }

    console.log(`✅ Payment confirmed: ${paymentData.id} via ${paymentMethod}`);
  } catch (error) {
    console.error("Error handling successful payment:", error);
  }
}

// Handle failed payment
async function handleFailedPayment(paymentData, paymentMethod) {
  try {
    await rawQuery(
      "UPDATE payments SET status = 'failed', updated_at = NOW() WHERE payment_id = ?",
      [paymentData.id]
    );

    console.log(`❌ Payment failed: ${paymentData.id} via ${paymentMethod}`);
  } catch (error) {
    console.error("Error handling failed payment:", error);
  }
}

// Update project funding amount
async function updateProjectFunding(projectId, amount) {
  try {
    const [project] = await rawQuery(
      "SELECT current_amount, goal_amount FROM projects WHERE id = ?",
      [projectId]
    );

    if (project.length > 0) {
      const newCurrentAmount =
        parseFloat(project[0].current_amount) + parseFloat(amount);

      await rawQuery("UPDATE projects SET current_amount = ? WHERE id = ?", [
        newCurrentAmount.toFixed(2),
        projectId,
      ]);

      // Check if project is fully funded
      if (newCurrentAmount >= project[0].goal_amount) {
        await rawQuery("UPDATE projects SET status = 'Funded' WHERE id = ?", [
          projectId,
        ]);
      }
    }
  } catch (error) {
    console.error("Error updating project funding:", error);
  }
}

// Handle PayMe callback (Legacy Support - Deprecated)
exports.handlePaymeCallback = async (req, res) => {
  const { status, reference, amount } = req.body;

  console.log("Legacy PayMe callback received:", req.body);

  if (status !== "paid") {
    return res.status(400).json({
      status: "error",
      message: "Payment not confirmed",
    });
  }

  try {
    const [investment] = await rawQuery(
      "SELECT * FROM investments WHERE paymee_ref = ?",
      [reference]
    );

    if (!investment.length) {
      return res.status(404).json({
        status: "error",
        message: "Investment not found",
      });
    }

    // Process the payment (existing logic)
    const txHash = await blockchain.recordInvestment(
      investment[0].project_id,
      investment[0].user_address,
      investment[0].amount / 100
    );

    await rawQuery(
      "UPDATE investments SET status = 'confirmed', tx_hash = ? WHERE paymee_ref = ?",
      [txHash, reference]
    );

    res.json({
      status: "success",
      message: "Payment confirmed and investment recorded",
      txHash,
    });
  } catch (error) {
    console.error("PayMe callback error:", error);
    res.status(500).json({
      status: "error",
      message: "Error processing payment callback",
    });
  }
};

// Test PayMe configuration and connectivity
exports.testPaymeConfig = async (req, res) => {
  try {
    const config = require("../paymee/paymee.config");

    // Check environment variables
    const envCheck = {
      PAYMEE_API_KEY: process.env.PAYMEE_API_KEY ? "✅ Set" : "❌ Not set",
      NODE_ENV: process.env.NODE_ENV || "development",
      BACKEND_URL: process.env.BACKEND_URL || "❌ Not set (using fallback)",
      FRONTEND_URL: process.env.FRONTEND_URL || "❌ Not set (using fallback)",
    };

    // Check PayMe service info
    const serviceInfo = require("../services/paymee.service").getServiceInfo();

    res.json({
      status: "success",
      message: "PayMe configuration test",
      environment: envCheck,
      config: {
        baseURL: config.baseURL,
        authHeader: config.headers.Authorization.includes(
          "your_paymee_api_key_here"
        )
          ? "❌ Using placeholder API key"
          : "✅ API key configured",
        testCredentials: config.testCredentials,
      },
      serviceInfo,
      recommendations: [
        !process.env.PAYMEE_API_KEY &&
          "Set PAYMEE_API_KEY environment variable",
        !process.env.BACKEND_URL &&
          "Set BACKEND_URL environment variable (e.g., http://localhost:5000)",
        !process.env.FRONTEND_URL &&
          "Set FRONTEND_URL environment variable (e.g., http://localhost:3000)",
      ].filter(Boolean),
    });
  } catch (error) {
    console.error("PayMe config test error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Create PayMe deposit for wallet funding
exports.createPaymeDeposit = async (req, res) => {
  try {
    const { amount, walletAddress, note, first_name, last_name, email, phone } =
      req.body;

    // Validate required fields
    const requiredFields = [
      "amount",
      "walletAddress",
      "email",
      "phone",
      "first_name",
      "last_name",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: "error",
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Validate amount
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Amount must be a positive number",
      });
    }

    // Get user ID from authentication middleware (if available)
    const userId = req.user?.userId || null;

    // Generate unique order ID for deposit
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const orderId = `deposit_${timestamp}_${randomSuffix}`;

    // Format phone number for Tunisia
    let formattedPhone = phone.toString().replace(/\s+/g, "");
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = formattedPhone.startsWith("216")
        ? `+${formattedPhone}`
        : `+216${formattedPhone}`;
    }

    // Determine appropriate URLs based on environment
    const isProduction = process.env.NODE_ENV === "production";
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

    const secureFrontendUrl = isProduction
      ? frontendUrl
      : frontendUrl.replace("http://", "https://");
    const secureBackendUrl = isProduction
      ? backendUrl
      : backendUrl.replace("http://", "https://");

    console.log("PayMe deposit data being sent:", {
      amount: parseFloat(amount),
      note: note || `Wallet deposit`,
      first_name,
      last_name,
      email,
      phone: formattedPhone,
      order_id: orderId,
      return_url: `${secureFrontendUrl}/payment-success`,
      cancel_url: `${secureFrontendUrl}/payment-cancel`,
      webhook_url: `${secureBackendUrl}/api/payment/payme/webhook/deposit`,
    });

    // Create PayMe payment with HTTPS URLs as required by their API
    const paymeResponse = await paymeeService.createPayment({
      amount: parseFloat(amount),
      note: note || `Wallet deposit`,
      first_name,
      last_name,
      email,
      phone: formattedPhone,
      order_id: orderId,
      return_url: `${secureFrontendUrl}/payment-success`,
      cancel_url: `${secureFrontendUrl}/payment-cancel`,
      webhook_url: `${secureBackendUrl}/api/payment/payme/webhook/deposit`,
    });

    // Store deposit record in database
    await rawQuery(
      `INSERT INTO wallet_transactions (
        transaction_id, transaction_type, payment_method, amount, currency, status, 
        user_address, payme_token, payme_order_id, 
        customer_email, customer_phone, customer_name, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        paymeResponse.token, // Use PayMe token as transaction_id
        "deposit",
        "payme",
        amount,
        "TND",
        "pending",
        walletAddress.toLowerCase(), // Store for tracking purposes
        paymeResponse.token,
        paymeResponse.order_id,
        email,
        phone,
        `${first_name} ${last_name}`,
      ]
    );

    // If we have a user ID, ensure they have a wallet
    if (userId) {
      try {
        const [walletCheck] = await rawQuery(
          "SELECT id FROM wallets WHERE user_id = ?",
          [userId]
        );

        if (!walletCheck.length) {
          // Create wallet for user if it doesn't exist
          await rawQuery(
            `INSERT INTO wallets (user_id, cash_balance, rewards_balance, currency, created_at) 
             VALUES (?, 0, 0, 'TND', NOW())`,
            [userId]
          );
          console.log(`Created wallet for user ID: ${userId}`);
        }
      } catch (walletError) {
        console.warn("Could not ensure wallet exists:", walletError);
        // Don't fail the deposit creation for this
      }
    }

    res.json({
      status: "success",
      payment_method: "payme",
      ...paymeResponse,
    });
  } catch (error) {
    console.error("PayMe deposit error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Create PayMe withdrawal from wallet
exports.createPaymeWithdrawal = async (req, res) => {
  try {
    const {
      amount,
      walletAddress,
      note,
      first_name,
      last_name,
      email,
      phone,
      bank_account,
    } = req.body;

    // Validate required fields
    const requiredFields = [
      "amount",
      "walletAddress",
      "email",
      "phone",
      "first_name",
      "last_name",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: "error",
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Validate amount
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Amount must be a positive number",
      });
    }

    // Check wallet balance - find user by email first
    const [userResult] = await rawQuery(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (!userResult.length) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const userId = userResult[0].id;

    const [walletResult] = await rawQuery(
      "SELECT * FROM wallets WHERE user_id = ?",
      [userId]
    );

    if (!walletResult.length) {
      return res.status(404).json({
        status: "error",
        message: "Wallet not found",
      });
    }

    const wallet = walletResult[0];
    const withdrawalFee = parseFloat(amount) * 0.015 + 0.5; // 1.5% + 0.5 TND
    const totalRequired = parseFloat(amount) + withdrawalFee;

    if (parseFloat(wallet.cash_balance) < totalRequired) {
      return res.status(400).json({
        status: "error",
        message: `Insufficient funds. Required: ${totalRequired.toFixed(
          2
        )} TND, Available: ${parseFloat(wallet.cash_balance).toFixed(2)} TND`,
      });
    }

    // Generate unique withdrawal ID
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const withdrawalId = `withdraw_${timestamp}_${randomSuffix}`;

    // For withdrawals, we would typically integrate with PayMe's payout API
    // Since PayMe primarily handles incoming payments, we'll create a withdrawal record
    // and process it through their refund/payout system

    // Store withdrawal record in database
    await rawQuery(
      `INSERT INTO wallet_transactions (
        transaction_id, transaction_type, payment_method, amount, currency, status, 
        user_address, withdrawal_id, fees, net_amount,
        customer_email, customer_phone, customer_name, bank_account_info, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        withdrawalId,
        "withdrawal",
        "payme",
        amount,
        "TND",
        "pending",
        walletAddress.toLowerCase(),
        withdrawalId,
        withdrawalFee,
        parseFloat(amount),
        email,
        phone,
        `${first_name} ${last_name}`,
        bank_account ? JSON.stringify(bank_account) : null,
      ]
    );

    // Deduct amount from wallet (will be reversed if withdrawal fails)
    await rawQuery(
      "UPDATE wallets SET cash_balance = cash_balance - ? WHERE user_id = ?",
      [totalRequired, userId]
    );

    res.json({
      status: "success",
      message: "Withdrawal request created successfully",
      withdrawal_id: withdrawalId,
      amount: parseFloat(amount),
      currency: "TND",
      processing_time: "1-3 minutes",
      fees: withdrawalFee,
      net_amount: parseFloat(amount),
      bank_account: bank_account || {
        account_number: "Mobile Wallet",
        bank_name: "PayMe",
        account_holder: `${first_name} ${last_name}`,
      },
    });
  } catch (error) {
    console.error("PayMe withdrawal error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Create PayMe refund
exports.createPaymeRefund = async (req, res) => {
  try {
    const { original_payment_token, amount, reason, walletAddress } = req.body;

    // Validate required fields
    if (!original_payment_token || !walletAddress) {
      return res.status(400).json({
        status: "error",
        message:
          "Missing required fields: original_payment_token, walletAddress",
      });
    }

    // Find original payment/transaction
    const [paymentResult] = await rawQuery(
      "SELECT * FROM payments WHERE payme_token = ? OR payment_id = ?",
      [original_payment_token, original_payment_token]
    );

    if (!paymentResult.length) {
      return res.status(404).json({
        status: "error",
        message: "Original payment not found",
      });
    }

    const originalPayment = paymentResult[0];

    // Validate refund amount
    const refundAmount = amount
      ? parseFloat(amount)
      : parseFloat(originalPayment.amount);

    if (
      refundAmount <= 0 ||
      refundAmount > parseFloat(originalPayment.amount)
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid refund amount",
      });
    }

    // Check if payment is refundable
    if (
      originalPayment.status !== "completed" &&
      originalPayment.status !== "confirmed"
    ) {
      return res.status(400).json({
        status: "error",
        message: "Payment is not eligible for refund",
      });
    }

    // Generate unique refund ID
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const refundId = `refund_${timestamp}_${randomSuffix}`;

    // Create refund record
    await rawQuery(
      `INSERT INTO payment_refunds (
        refund_id, original_payment_id, original_payment_token, amount, currency, 
        status, reason, user_address, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        refundId,
        originalPayment.id,
        original_payment_token,
        refundAmount,
        originalPayment.currency || "TND",
        "pending",
        reason || "Customer request",
        walletAddress.toLowerCase(),
      ]
    );

    // For actual PayMe refunds, you would call their refund API here
    // Since we're working with the current implementation, we'll mark it as processing

    res.json({
      status: "success",
      message: "Refund request created successfully",
      refund_id: refundId,
      original_payment_token,
      refund_amount: refundAmount,
      currency: originalPayment.currency || "TND",
      processing_time: "1-3 minutes",
      refund_status: "pending",
    });
  } catch (error) {
    console.error("PayMe refund error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Handle PayMe webhook for deposits
exports.handlePaymeDepositWebhook = async (req, res) => {
  try {
    console.log("PayMe deposit webhook received:", req.body);

    // For test mode, accept the webhook data directly
    // In production, you would validate the webhook signature/authenticity
    const webhookData = req.body;

    // Determine payment status
    let paymentStatus = "pending";
    let isSuccessful = false;

    if (webhookData.status === "completed" || webhookData.is_successful) {
      paymentStatus = "completed";
      isSuccessful = true;
    } else if (webhookData.status === "failed") {
      paymentStatus = "failed";
    }

    // Update wallet transaction record in database
    await rawQuery(
      `UPDATE wallet_transactions 
       SET status = ?, payme_transaction_id = ?, received_amount = ?, 
           transaction_fee = ?, completed_at = NOW(), webhook_data = ?
       WHERE payme_token = ?`,
      [
        paymentStatus,
        webhookData.transaction_id || `test_${Date.now()}`,
        webhookData.received_amount || webhookData.amount,
        webhookData.transaction_fee || 0,
        JSON.stringify(webhookData),
        webhookData.token,
      ]
    );

    // If deposit is successful, add funds to wallet
    if (isSuccessful) {
      await handleSuccessfulDeposit({
        token: webhookData.token,
        amount: webhookData.received_amount || webhookData.amount,
        customer_email: webhookData.customer_email,
      });

      console.log(
        `✅ Test deposit processed successfully: ${webhookData.amount} TND for ${webhookData.customer_email}`
      );
    } else {
      await handleFailedDeposit({ token: webhookData.token });
      console.log(`❌ Test deposit failed for token: ${webhookData.token}`);
    }

    // Always return 200 to acknowledge receipt
    res.status(200).json({
      status: "success",
      message: "Webhook processed successfully",
      token: webhookData.token,
      payment_status: paymentStatus,
      amount_processed: webhookData.received_amount || webhookData.amount,
      test_mode: process.env.NODE_ENV !== "production",
    });
  } catch (error) {
    console.error("PayMe deposit webhook processing error:", error);

    // Still return 200 to prevent retries, but log the error
    res.status(200).json({
      status: "error",
      message: "Webhook processing failed",
      error: error.message,
    });
  }
};

// Helper function to handle successful deposit
const handleSuccessfulDeposit = async (depositData) => {
  try {
    // Get transaction details
    const [transactionResult] = await rawQuery(
      "SELECT * FROM wallet_transactions WHERE payme_token = ?",
      [depositData.token]
    );

    if (!transactionResult.length) {
      throw new Error("Deposit transaction not found");
    }

    const transaction = transactionResult[0];

    // Find user by email to get their user_id
    const [userResult] = await rawQuery(
      "SELECT id FROM users WHERE email = ?",
      [transaction.customer_email]
    );

    if (!userResult.length) {
      console.warn(`User not found for email: ${transaction.customer_email}`);
      return;
    }

    const userId = userResult[0].id;

    // Check if wallet exists for this user
    const [walletCheck] = await rawQuery(
      "SELECT id FROM wallets WHERE user_id = ?",
      [userId]
    );

    if (!walletCheck.length) {
      // Create wallet for user if it doesn't exist
      await rawQuery(
        `INSERT INTO wallets (user_id, cash_balance, rewards_balance, currency, created_at) 
         VALUES (?, ?, 0, 'TND', NOW())`,
        [userId, parseFloat(transaction.amount)]
      );
      console.log(
        `Created wallet and added ${transaction.amount} TND for user ID: ${userId}`
      );
    } else {
      // Update existing wallet
      await rawQuery(
        `UPDATE wallets 
         SET cash_balance = cash_balance + ?, 
             last_transaction_at = NOW() 
         WHERE user_id = ?`,
        [parseFloat(transaction.amount), userId]
      );
      console.log(
        `Added ${transaction.amount} TND to wallet for user ID: ${userId}`
      );
    }

    console.log(
      `Successful deposit: ${transaction.amount} TND processed for user ${transaction.customer_email}`
    );
  } catch (error) {
    console.error("Error handling successful deposit:", error);
    throw error;
  }
};

// Helper function to handle failed deposit
const handleFailedDeposit = async (depositData) => {
  try {
    console.log(`Failed deposit for token: ${depositData.token}`);
    // Additional handling for failed deposits if needed
  } catch (error) {
    console.error("Error handling failed deposit:", error);
    throw error;
  }
};
