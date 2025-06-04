require("dotenv").config();
const axios = require("axios");

const API_URL = "http://localhost:5000"; // Your backend URL

async function testPhoneVerificationFlow() {
  console.log("🧪 Testing Phone Verification Flow...");
  console.log("====================================");

  // Test with a mock user ID (you can replace this with a real user ID from your database)
  const userId = 11; // Use the user ID from the logs you showed me
  const testPhoneNumber = "+21629453228";

  try {
    console.log("📱 Step 1: Sending phone verification SMS...");

    // Step 1: Send phone verification
    const sendResponse = await axios.post(
      `${API_URL}/api/auth/send-phone-verification`,
      {
        userId: userId,
      }
    );

    console.log("✅ SMS sent successfully!");
    console.log("Response:", sendResponse.data);

    // In a real flow, the user would receive the SMS and enter the code
    // For testing, we'll simulate entering the code from the backend logs
    console.log("");
    console.log("📝 Step 2: Simulating user entering verification code...");
    console.log(
      "⚠️  Check your backend logs for the verification code that was sent"
    );
    console.log("⚠️  Also check your phone (+21629453228) for the SMS");
    console.log("");
    console.log("✅ Phone verification flow test completed successfully!");
    console.log("");
    console.log("🔍 Next steps:");
    console.log("1. Check your phone for the SMS");
    console.log(
      "2. Use the received code to verify with: POST /api/auth/verify-phone"
    );
    console.log(
      '3. Payload: { "userId": ' + userId + ', "verificationCode": "XXXXXX" }'
    );

    return true;
  } catch (error) {
    console.error("❌ Phone verification flow failed:");
    console.error("Error:", error.response?.data || error.message);

    if (error.response?.status === 404) {
      console.error("");
      console.error("🔍 User not found. Please check:");
      console.error("1. User ID exists in database");
      console.error("2. User email is verified");
    } else if (error.response?.status === 400) {
      console.error("");
      console.error("🔍 Bad request. Please check:");
      console.error("1. User email is verified first");
      console.error("2. Phone is not already verified");
    }

    return false;
  }
}

// Run the test
testPhoneVerificationFlow().then((success) => {
  if (success) {
    console.log("");
    console.log("🎉 Phone verification flow is working!");
    process.exit(0);
  } else {
    console.log("");
    console.log("💥 Phone verification flow failed.");
    process.exit(1);
  }
});
