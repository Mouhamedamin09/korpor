const axios = require("axios");
const config = require("../paymee/paymee.config");

// PayMe service - Currently in "Coming Soon" mode
exports.createPayment = async ({ amount, note, userReference }) => {
  // For now, return a coming soon response
  return {
    status: "coming_soon",
    message:
      "PayMe integration is coming soon! We're working hard to bring you this payment option.",
    payment_url: null,
    amount: amount,
    token: null,
    features_planned: [
      "Mobile wallet payments",
      "Bank transfers",
      "Local payment methods",
      "QR code payments",
      "Instant transfers",
    ],
  };

  // TODO: Uncomment when PayMe is ready for production
  /*
  const body = {
    vendor: process.env.PAYMEE_MERCHANT_ID, // Merchant ID from Paymee
    amount,
    note,
    currency: "TND", // Tunisian Dinar (change if using another currency)
    back_url: process.env.PAYMEE_SUCCESS_URL, // URL to redirect after payment
    notify_url: process.env.PAYMEE_CALLBACK_URL, // Callback URL for Paymee to notify the status
    reference: userReference, // Custom reference for tracking
  };

  try {
    // Send POST request to Paymee API to create the payment
    const res = await axios.post(`${config.baseURL}/payments/create`, body, {
      headers: config.headers, // Authorization and Content-Type headers
    });

    console.log("Paymee response:", res.data); // Log the entire response

    // Check if the response contains the expected structure
    if (res.data && res.data.data) {
      const paymeeRef = res.data.data.token; // Paymee token is used as reference
      const paymentUrl = `https://sandbox.paymee.tn/gateway/${paymeeRef}`;

      // Ensure the response contains the necessary fields
      if (!paymeeRef || !paymentUrl) {
        throw new Error("Missing Paymee token or payment_url.");
      }

      // Return payment URL and amount
      return {
        status: "success",
        payment_url: paymentUrl,
        amount: res.data.data.amount,
        token: paymeeRef, // Return the token (paymee_ref)
      };
    } else {
      throw new Error("Invalid Paymee response structure.");
    }
  } catch (error) {
    console.error("Paymee error:", error.response?.data || error.message);
    throw new Error("Failed to create payment with Paymee");
  }
  */
};

// Check payment status
exports.checkPaymentStatus = async (reference) => {
  // For now, return coming soon
  return {
    status: "coming_soon",
    message: "PayMe status checking will be available soon",
    reference: reference,
  };

  // TODO: Uncomment when PayMe is ready
  /*
  try {
    const res = await axios.get(`${config.baseURL}/payments/status/${reference}`, {
      headers: config.headers
    });
    
    return res.data;
  } catch (error) {
    console.error("Paymee status check error:", error.response?.data || error.message);
    throw new Error("Failed to check payment status");
  }
  */
};

// Verify webhook signature (when implemented)
exports.verifyWebhookSignature = (payload, signature) => {
  // TODO: Implement webhook signature verification
  return true;
};
