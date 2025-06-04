require("dotenv").config();
const { sendSMS } = require("./src/config/twilio-http.config");

async function testTwilioCredentials() {
  console.log("🧪 Testing Twilio Credentials...");
  console.log("=====================================");

  // Check environment variables
  console.log("📋 Environment Variables:");
  console.log(
    "TWILIO_ACCOUNT_SID:",
    process.env.TWILIO_ACCOUNT_SID || "MISSING"
  );
  console.log(
    "TWILIO_AUTH_TOKEN:",
    process.env.TWILIO_AUTH_TOKEN ? "Present" : "MISSING"
  );
  console.log(
    "TWILIO_PHONE_NUMBER:",
    process.env.TWILIO_PHONE_NUMBER || "MISSING"
  );
  console.log("");

  // Validate environment variables
  if (
    !process.env.TWILIO_ACCOUNT_SID ||
    !process.env.TWILIO_AUTH_TOKEN ||
    !process.env.TWILIO_PHONE_NUMBER
  ) {
    console.error("❌ Missing required Twilio environment variables");
    return;
  }

  // Test phone number
  const testNumber = "+21629453228";
  const testMessage =
    "Test from Korpor: Your verification code is 123456. This message confirms Twilio is working!";

  console.log("📱 Testing SMS to:", testNumber);
  console.log("📝 Message:", testMessage);
  console.log("");

  try {
    console.log("🚀 Sending SMS...");
    const result = await sendSMS(testNumber, testMessage);

    console.log("✅ SUCCESS! SMS sent successfully");
    console.log("📨 Message SID:", result.sid);
    console.log("📊 Status:", result.status);
    console.log("💰 Price:", result.price || "N/A");
    console.log("🏷️  Price Unit:", result.priceUnit || "N/A");

    return true;
  } catch (error) {
    console.error("❌ FAILED! Error sending SMS:");
    console.error("Error message:", error.message);

    // Check for specific error types
    if (error.message.includes("HTTP 401")) {
      console.error("");
      console.error(
        "🔑 Authentication Error: Your Twilio credentials are invalid"
      );
      console.error("Please check:");
      console.error("1. Account SID is correct");
      console.error("2. Auth Token is correct");
      console.error("3. Account is active and not suspended");
    } else if (error.message.includes("HTTP 400")) {
      console.error("");
      console.error(
        "📱 Bad Request: There might be an issue with the phone number or message"
      );
    } else if (error.message.includes("HTTP 403")) {
      console.error("");
      console.error(
        "🚫 Forbidden: Account may not have permission to send SMS"
      );
    }

    return false;
  }
}

// Run the test
testTwilioCredentials().then((success) => {
  if (success) {
    console.log("");
    console.log("🎉 Twilio is configured correctly and working!");
    process.exit(0);
  } else {
    console.log("");
    console.log("💥 Twilio test failed. Please fix the issues above.");
    process.exit(1);
  }
});
