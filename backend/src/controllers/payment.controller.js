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
        name: "PayMe",
        description: "PayMe integration coming soon!",
        enabled: false,
        features_planned: [
          "Mobile wallet payments",
          "Bank transfers",
          "Local payment methods",
          "QR code payments",
        ],
        processing_time: "1-3 minutes",
        fees: "1.5% + 0.5 TND",
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

// Create PayMe payment (coming soon)
exports.createPaymePayment = async (req, res) => {
  try {
    const { amount, note, walletAddress } = req.body;

    if (!amount || !walletAddress) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields: amount, walletAddress",
      });
    }

    const paymeResponse = await paymeeService.createPayment({
      amount,
      note: note || `Investment payment`,
      userReference: walletAddress,
    });

    res.json({
      status: "coming_soon",
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

// Handle PayMe callback (legacy support)
exports.handlePaymeCallback = async (req, res) => {
  const { status, reference, amount } = req.body;

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
