const https = require("https");
const querystring = require("querystring");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const sendSMSWithHTTP = (to, message) => {
  return new Promise((resolve, reject) => {
    const formattedNumber = to.startsWith("+") ? to : `+${to}`;

    const postData = querystring.stringify({
      To: formattedNumber,
      From: fromNumber,
      Body: message,
    });

    const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    const options = {
      hostname: "api.twilio.com",
      port: 443,
      path: `/2010-04-01/Accounts/${accountSid}/Messages.json`,
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(postData),
      },
      // Force IPv4 to avoid DNS issues
      family: 4,
    };

    console.log("Making HTTP request to Twilio API...");
    console.log("Account SID:", accountSid);
    console.log("Auth Token:", authToken ? "Present" : "Missing");
    console.log("From Number:", fromNumber);
    console.log("To Number:", formattedNumber);

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        console.log("Response status:", res.statusCode);
        console.log("Response data:", data);

        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const result = JSON.parse(data);
            console.log("SMS sent successfully via HTTP:", result.sid);
            resolve(result);
          } catch (parseError) {
            reject(new Error("Failed to parse response: " + data));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on("error", (error) => {
      console.error("HTTP request error:", error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
};

module.exports = {
  sendSMS: async (to, message) => {
    try {
      console.log("Sending SMS via HTTP to:", to);
      console.log("Message:", message);
      console.log("From number:", fromNumber);

      const result = await sendSMSWithHTTP(to, message);
      return result;
    } catch (error) {
      console.error("Error sending SMS via HTTP:", error);

      if (error.code === "ENOTFOUND") {
        console.error(
          "Network error: Cannot reach Twilio API. Please check your internet connection."
        );
        throw new Error(
          "Network connectivity issue. Unable to reach Twilio service."
        );
      }

      throw error;
    }
  },
};
