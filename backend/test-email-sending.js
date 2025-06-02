const dotenv = require("dotenv");
dotenv.config();

console.log("🔍 Checking email environment variables...");
console.log("EMAIL_USER:", process.env.EMAIL_USER ? "SET" : "MISSING");
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "SET" : "MISSING");
console.log("SMTP_USER:", process.env.SMTP_USER ? "SET" : "MISSING");
console.log("SMTP_PASS:", process.env.SMTP_PASS ? "SET" : "MISSING");

// Test email sending with both configurations
async function testEmailSending() {
  console.log("\n📧 Testing email sending...");

  // Test 1: Using authController method
  try {
    console.log("\n--- Test 1: AuthController Email Method ---");
    const nodemailer = require("nodemailer");

    const createTransporter = () =>
      nodemailer.createTransporter({
        service: "gmail",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

    const transporter = createTransporter();

    // Verify connection
    const isConnected = await transporter.verify();
    console.log("✅ SMTP connection verified:", isConnected);

    // Test send email
    const testResult = await transporter.sendMail({
      from: `"Korpor Test" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Send to self for testing
      subject: "Test Email - Korpor Auth System",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10B981;">Email Test Successful! ✅</h2>
          <p>This is a test email from the Korpor authentication system.</p>
          <p><strong>Test Time:</strong> ${new Date().toISOString()}</p>
          <p>If you receive this email, the email configuration is working correctly.</p>
        </div>
      `,
    });

    console.log("✅ Test email sent successfully!");
    console.log("Message ID:", testResult.messageId);
  } catch (error) {
    console.error("❌ AuthController email test failed:", error.message);
  }

  // Test 2: Using email.config method
  try {
    console.log("\n--- Test 2: Email Config Method ---");
    const emailConfig = require("./src/config/email.config");

    const testResult = await emailConfig.sendVerificationEmail(
      process.env.SMTP_USER, // Send to self for testing
      "123456",
      "Test User",
      "email"
    );

    console.log("✅ Email config test successful!");
  } catch (error) {
    console.error("❌ Email config test failed:", error.message);
  }

  console.log("\n🔧 Email sending test completed!");
}

// Test the generateOTP function
try {
  console.log("\n--- Testing OTP Generation ---");
  const { generateOTP } = require("./src/middleware/otpMiddleware");

  const testOTP = generateOTP({ digits: 4, expiryMinutes: 10 });
  console.log("✅ OTP Generated:", testOTP);
  console.log("OTP Code:", testOTP.otp);
  console.log("Expires:", new Date(testOTP.expiry));
} catch (error) {
  console.error("❌ OTP generation failed:", error.message);
}

// Run the test
testEmailSending().catch(console.error);
