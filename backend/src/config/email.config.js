const nodemailer = require("nodemailer");

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: false, // Use TLS (STARTTLS) on port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Optional: avoid self-signed cert error in dev
  },
});

// Professional email template matching the app's theme
const createVerificationEmailTemplate = (
  verificationCode,
  userName = "User",
  verificationType = "email"
) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Korpor – Verification Code</title>
  <style>
    /* reset + box‐model */
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      background-color: #F9FAFB; /* app background */
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      color: #0A0E23;               /* app primary text */
      line-height:1.6;
    }
    .email-wrapper {
      max-width:600px;
      margin:40px auto;
      padding:0;
    }
    .card {
      background:#ffffff;
      border-radius:20px;
      overflow:hidden;
      box-shadow:0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
      margin-bottom:24px;
    }

    .header {
      background: linear-gradient(135deg, #008F6B 0%, #00B37D 100%);
      padding:32px;
      text-align:center;
      color:white;
    }
    .logo {
      font-size:28px;
      font-weight:800;
      letter-spacing:2px;
      margin-bottom:4px;
    }
    .tagline {
      font-size:14px;
      opacity:0.9;
      font-weight:500;
    }

    .content {
      padding:32px;
    }
    .greeting {
      font-size:18px;
      font-weight:600;
      margin-bottom:16px;
    }
    .message {
      font-size:15px;
      color:#4B5563; /* app secondary text */
      margin-bottom:24px;
    }

    .verification-card {
      background:#F0FDF4; /* very light green */
      border:2px solid #10B981;
      border-radius:16px;
      padding:24px;
      text-align:center;
      margin:24px 0;
      position:relative;
    }
    .verification-card::before {
      content:'🔐';
      position:absolute;
      top:-12px;
      left:50%;
      transform:translateX(-50%);
      background:#ffffff;
      padding:0 6px;
      font-size:18px;
    }
    .verification-label {
      font-size:12px;
      color:#065F46;
      text-transform:uppercase;
      letter-spacing:1px;
      font-weight:700;
      margin-bottom:12px;
    }
    .verification-code {
      font-family:'SF Mono', 'Monaco', monospace;
      font-size:38px;
      font-weight:800;
      letter-spacing:6px;
      color:#10B981;
      text-shadow:0 2px 4px rgba(16,185,129,0.2);
    }

    .expiry {
      background:#FEF3C7;
      border:1px solid #F59E0B;
      border-radius:12px;
      padding:14px;
      font-size:13px;
      font-weight:600;
      color:#92400E;
      display:flex;
      align-items:center;
      justify-content:center;
      margin-bottom:24px;
    }
    .expiry::before { content:'⏰'; margin-right:8px; }

    .security {
      background:#EFF6FF;
      border:1px solid #3B82F6;
      border-radius:12px;
      padding:20px;
      color:#1E40AF;
      margin-bottom:24px;
    }
    .security-title {
      display:flex;
      align-items:center;
      font-weight:700;
      margin-bottom:10px;
    }
    .security-title .icon { font-size:18px; margin-right:8px; }
    .security-list { list-style:none; padding-left:0; }
    .security-list li { margin-bottom:6px; font-size:14px; }

    .footer {
      text-align:center;
      font-size:14px;
      color:#4B5563;
      padding:32px;
      line-height:1.5;
    }
    .footer .brand { color:#10B981; font-weight:800; }

    @media (max-width:600px) {
      .header, .content, .footer { padding:24px; }
      .verification-code { font-size:32px; letter-spacing:4px; }
      .verification-card { padding:20px; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">

    <!-- HEADER CARD -->
    <div class="card header">
      <div class="logo">KORPOR</div>
      <div class="tagline">Your Trusted Investment Platform</div>
    </div>

    <!-- CONTENT CARD -->
    <div class="card content">
      <div class="greeting">Hello ${userName},</div>
      <div class="message">
        We received a request to change your <strong>${verificationType}</strong> on your Korpor account. 
        Please enter the code below to confirm.
      </div>

      <div class="verification-card">
        <div class="verification-label">Verification Code</div>
        <div class="verification-code">${verificationCode}</div>
      </div>

      <div class="expiry">
        This code will expire in 10 minutes
      </div>

      <div class="security">
        <div class="security-title">
          <span class="icon">🛡️</span>Security Tips
        </div>
        <ul class="security-list">
          <li>• If you didn’t request this, just ignore.</li>
          <li>• Never share your code.</li>
          <li>• The code expires quickly.</li>
          <li>• Contact support if you have questions.</li>
        </ul>
      </div>

      <div class="message">
        Our support team is here for you 24/7 if you need anything.
      </div>
    </div>

    <!-- FOOTER -->
    <div class="footer">
      Thank you for choosing <span class="brand">Korpor</span>.<br/>
      This is a notification-only email. For help, open your Korpor app or visit our help center.
    </div>
  </div>
</body>
</html>

  `;
};

module.exports = {
  sendEmail: async (to, subject, text) => {
    try {
      console.log("📧 Sending email to:", to);
      console.log("📝 Subject:", subject);

      const mailOptions = {
        from: process.env.SMTP_FROM || `"Korpor" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("✅ Email sent successfully:", info.messageId);
      return info;
    } catch (error) {
      console.error("❌ Error sending email:", error);
      throw error;
    }
  },

  sendVerificationEmail: async (
    to,
    verificationCode,
    userName = "User",
    verificationType = "email"
  ) => {
    try {
      console.log("📧 Sending verification email to:", to);
      console.log("🔐 Verification type:", verificationType);

      const subject = `Korpor - Your ${
        verificationType.charAt(0).toUpperCase() + verificationType.slice(1)
      } Verification Code`;
      const htmlContent = createVerificationEmailTemplate(
        verificationCode,
        userName,
        verificationType
      );

      // Plain text fallback
      const textContent = `
Hello ${userName},

Your Korpor verification code for ${verificationType} change is: ${verificationCode}

This code will expire in 10 minutes.

If you didn't request this change, please ignore this email.

Thank you,
The Korpor Team
      `;

      const mailOptions = {
        from: process.env.SMTP_FROM || `"Korpor" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text: textContent,
        html: htmlContent,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("✅ Verification email sent successfully:", info.messageId);
      return info;
    } catch (error) {
      console.error("❌ Error sending verification email:", error);
      throw error;
    }
  },
};
