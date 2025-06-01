const axios = require("axios");
const crypto = require("crypto");
const config = require("../paymee/paymee.config");

/**
 * Create a PayMe payment according to official PayMe.tn documentation
 * Documentation: https://www.paymee.tn/paymee-integration-without-redirection/
 * Step 1 - Initiate payment
 */
exports.createPayment = async ({
  amount,
  note,
  first_name,
  last_name,
  email,
  phone,
  order_id,
  return_url,
  cancel_url,
  webhook_url,
}) => {
  try {
    // Validate required fields according to PayMe API documentation
    const validationErrors = [];

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      validationErrors.push("amount must be a positive number (required)");
    }
    if (!note || note.trim().length === 0) {
      validationErrors.push("note is required");
    }
    if (!first_name || first_name.trim().length === 0) {
      validationErrors.push("first_name is required");
    }
    if (!last_name || last_name.trim().length === 0) {
      validationErrors.push("last_name is required");
    }
    if (!email || !email.includes("@")) {
      validationErrors.push("valid email is required");
    }
    if (!phone || phone.trim().length === 0) {
      validationErrors.push("phone is required");
    }
    if (!webhook_url || !webhook_url.startsWith("https://")) {
      validationErrors.push(
        "webhook_url is required and must start with https://"
      );
    }
    if (return_url && !return_url.startsWith("https://")) {
      validationErrors.push(
        "return_url must start with https:// (if provided)"
      );
    }
    if (cancel_url && !cancel_url.startsWith("https://")) {
      validationErrors.push(
        "cancel_url must start with https:// (if provided)"
      );
    }

    if (validationErrors.length > 0) {
      throw new Error(
        `PayMe API validation errors: ${validationErrors.join(", ")}`
      );
    }

    // Format data according to PayMe API requirements
    const paymentData = {
      amount: parseFloat(amount), // PayMe expects number, not string
      note: note.trim(),
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.replace(/\s+/g, ""), // Remove any spaces
      return_url: return_url ? return_url.trim() : undefined,
      cancel_url: cancel_url ? cancel_url.trim() : undefined,
      webhook_url: webhook_url.trim(),
      order_id: order_id || undefined,
    };

    // Remove undefined values (PayMe API documentation shows these as optional)
    Object.keys(paymentData).forEach((key) => {
      if (paymentData[key] === undefined) {
        delete paymentData[key];
      }
    });

    console.log("Creating PayMe payment with official API format:", {
      ...paymentData,
      // Mask sensitive info for logging
      phone: phone ? `${phone.substring(0, 4)}***` : "",
      email: email ? `${email.split("@")[0]}***@${email.split("@")[1]}` : "",
    });

    console.log("PayMe API URL:", `${config.baseURL}/payments/create`);
    console.log("PayMe API Headers:", {
      "Content-Type": config.headers["Content-Type"],
      Authorization: config.headers.Authorization ? "✅ Set" : "❌ Missing",
    });

    // Send POST request to PayMe API
    const response = await axios.post(
      `${config.baseURL}/payments/create`,
      paymentData,
      {
        headers: config.headers,
        timeout: 30000, // 30 second timeout
        validateStatus: function (status) {
          // Accept any status code to get the full response
          return status >= 200 && status < 600;
        },
      }
    );

    console.log("PayMe API response status:", response.status);
    console.log("PayMe API response headers:", response.headers);
    console.log(
      "PayMe API response data:",
      JSON.stringify(response.data, null, 2)
    );

    // Check response according to PayMe documentation
    if (
      response.status === 200 &&
      response.data &&
      response.data.status === true
    ) {
      // PayMe API success response structure:
      // {
      //   "status": true,
      //   "message": "Success",
      //   "code": 50,
      //   "data": {
      //     "token": "dfe54df34b54df3a854f3a53fc85a",
      //     "order_id": "244557",
      //     "first_name": "John",
      //     "last_name": "Doe",
      //     "email": "test@paymee.tn",
      //     "phone": "+21611222333",
      //     "note": "Order #123",
      //     "amount": 220.25,
      //     "payment_url": "https://sandbox.paymee.tn/gateway/dfe54df34b54df3a854f3a53fc85a"
      //   }
      // }

      const data = response.data.data;

      return {
        status: "success",
        message: response.data.message || "Payment created successfully",
        code: response.data.code,
        token: data.token,
        order_id: data.order_id,
        payment_url: data.payment_url,
        amount: data.amount,
        currency: "TND", // Tunisian Dinar (PayMe only supports TND)
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        note: data.note,
        test_credentials: config.testCredentials,
        instructions: [
          "💳 PayMe Payment Instructions:",
          "1. Redirect user to payment_url for payment",
          "2. In sandbox mode, use test credentials:",
          `   📱 Phone: ${config.testCredentials.phone}`,
          `   🔐 Password: ${config.testCredentials.password}`,
          "3. Payment completion will trigger webhook_url",
          "4. In mobile apps, watch for '/loader' URL to detect completion",
          "5. Verify webhook using check_sum for security",
        ],
      };
    } else {
      // PayMe API error response
      console.error("PayMe API Error - Status:", response.status);
      console.error("PayMe API Error - Data:", response.data);

      let errorMessage = "PayMe API error";

      if (response.data) {
        if (response.data.message) {
          errorMessage = response.data.message;
        } else if (
          response.data.errors &&
          Array.isArray(response.data.errors)
        ) {
          // Handle validation errors like {"errors": [{"return_url": "Return URL must start with https://"}]}
          const errorDetails = response.data.errors
            .map((err) => {
              return Object.entries(err)
                .map(([field, msg]) => `${field}: ${msg}`)
                .join(", ");
            })
            .join("; ");
          errorMessage = `Validation errors: ${errorDetails}`;
        } else if (typeof response.data === "string") {
          errorMessage = response.data;
        } else {
          errorMessage = JSON.stringify(response.data);
        }
      }

      throw new Error(`${errorMessage} (HTTP ${response.status})`);
    }
  } catch (error) {
    // Enhanced error logging
    console.error("PayMe payment creation error details:", {
      message: error.message,
      name: error.name,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      requestUrl: error.config?.url,
      requestMethod: error.config?.method,
      requestData: error.config?.data,
    });

    if (error.response?.status === 401) {
      throw new Error(
        "PayMe API authentication failed. Please check your PAYMEE_API_KEY."
      );
    } else if (error.response?.status === 400) {
      throw new Error(error.message); // Pass through the formatted error message
    } else if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      throw new Error(
        "PayMe API is currently unavailable. Please try again later."
      );
    }

    throw new Error(error.message || "Failed to create PayMe payment");
  }
};

/**
 * Check payment status
 * This can be used to manually verify payment status
 */
exports.checkPaymentStatus = async (token) => {
  try {
    // PayMe doesn't have a direct status check endpoint in their docs
    // Status is typically received via webhook
    // For now, return a pending status and recommend using webhooks
    return {
      status: "pending",
      message:
        "Payment status should be received via webhook. Please implement webhook handling for real-time status updates.",
      token: token,
      recommendation: "Use webhook_url for real-time payment status updates",
    };
  } catch (error) {
    console.error("PayMe status check error:", error);
    throw new Error(
      "Failed to check payment status. Use webhook for real-time updates."
    );
  }
};

/**
 * Verify webhook signature and data integrity
 * Step 3 - Check payment integrity using check_sum
 */
exports.verifyWebhookSignature = (webhookData) => {
  try {
    const { token, payment_status, check_sum } = webhookData;

    if (!token || payment_status === undefined || !check_sum) {
      return {
        valid: false,
        message:
          "Missing required webhook data (token, payment_status, or check_sum)",
      };
    }

    // PayMe check_sum formula: md5(token + payment_status(1 or 0) + API Token)
    const paymentStatusValue =
      payment_status === true || payment_status === 1 ? "1" : "0";
    const apiToken = process.env.PAYMEE_API_KEY;

    if (!apiToken) {
      return {
        valid: false,
        message: "PayMe API key not configured for webhook verification",
      };
    }

    const expectedCheckSum = crypto
      .createHash("md5")
      .update(token + paymentStatusValue + apiToken)
      .digest("hex");

    const isValid = expectedCheckSum === check_sum;

    return {
      valid: isValid,
      message: isValid
        ? "Webhook signature is valid"
        : "Webhook signature verification failed",
      expected_checksum: expectedCheckSum,
      received_checksum: check_sum,
    };
  } catch (error) {
    console.error("Webhook verification error:", error);
    return {
      valid: false,
      message: "Error during webhook verification",
      error: error.message,
    };
  }
};

/**
 * Process webhook data from PayMe
 * This should be called when PayMe sends payment status to webhook_url
 */
exports.processWebhook = async (webhookData) => {
  try {
    // First verify the webhook signature
    const verification = exports.verifyWebhookSignature(webhookData);

    if (!verification.valid) {
      throw new Error(`Webhook verification failed: ${verification.message}`);
    }

    // Extract payment information
    const {
      token,
      payment_status,
      order_id,
      first_name,
      last_name,
      email,
      phone,
      note,
      amount,
      transaction_id,
      received_amount,
      cost,
    } = webhookData;

    const isSuccessful = payment_status === true || payment_status === 1;

    const processedData = {
      token,
      order_id,
      payment_status: isSuccessful ? "completed" : "failed",
      is_successful: isSuccessful,
      amount: parseFloat(amount),
      received_amount: received_amount ? parseFloat(received_amount) : null,
      transaction_fee: cost ? parseFloat(cost) : null,
      transaction_id,
      customer: {
        first_name,
        last_name,
        email,
        phone,
      },
      note,
      processed_at: new Date().toISOString(),
      webhook_verified: true,
    };

    console.log("PayMe webhook processed:", {
      ...processedData,
      customer: {
        ...processedData.customer,
        phone: phone ? `${phone.substring(0, 4)}***` : "",
        email: email ? `${email.split("@")[0]}***@${email.split("@")[1]}` : "",
      },
    });

    return processedData;
  } catch (error) {
    console.error("PayMe webhook processing error:", error);
    throw error;
  }
};

/**
 * Get service information for testing
 */
exports.getServiceInfo = () => {
  const config = require("../paymee/paymee.config");

  return {
    service: "PayMe.tn",
    version: "API v2",
    baseURL: config.baseURL,
    environment: process.env.NODE_ENV || "development",
    testCredentials: config.testCredentials,
    features: [
      "Mobile wallet payments",
      "Bank transfers",
      "Local payment methods",
      "QR code payments",
      "Webhook notifications",
    ],
    supportedCurrency: "TND (Tunisian Dinar)",
    processingTime: "1-3 minutes",
    fees: "1.5% + 0.5 TND",
  };
};
