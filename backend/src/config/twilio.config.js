const twilio = require("twilio");

// These should be environment variables in production
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER; // Using environment variable

const client = twilio(accountSid, authToken);

module.exports = {
  sendSMS: async (to, message) => {
    try {
      const formattedNumber = to.startsWith("+") ? to : `+${to}`;

      console.log("Sending SMS to:", formattedNumber);
      console.log("Message:", message);
      console.log("From number:", fromNumber); // Added logging for debugging

      const result = await client.messages.create({
        body: message,
        from: fromNumber,
        to: formattedNumber,
      });

      console.log("SMS sent successfully:", result.sid);
      return result;
    } catch (error) {
      console.error("Error sending SMS:", error);
      throw error;
    }
  },
};
