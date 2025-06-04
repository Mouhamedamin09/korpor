require("dotenv").config();
const { sendSMS } = require("./config/twilio-alternative.config");

async function testSMSAlternative() {
  try {
    console.log("Starting SMS test with HTTP approach...");
    console.log("Twilio Account SID:", process.env.TWILIO_ACCOUNT_SID);
    console.log(
      "Twilio Auth Token:",
      process.env.TWILIO_AUTH_TOKEN ? "Present" : "Missing"
    );
    console.log("Twilio Phone Number:", process.env.TWILIO_PHONE_NUMBER);

    const testNumber = "+21629453228"; // Your real mobile number, not the Twilio number
    const testMessage =
      "Test message from Korpor HTTP: Your verification code is 123456";

    console.log("Sending test message to:", testNumber);
    const result = await sendSMS(testNumber, testMessage);

    console.log("SMS sent successfully via HTTP!");
    console.log("Message SID:", result.sid);
    console.log("Message Status:", result.status);
  } catch (error) {
    console.error("Failed to send SMS via HTTP:", error);
    console.error("Error details:", error.message);
    if (error.code) {
      console.error("Error code:", error.code);
    }
  }
}

testSMSAlternative();
