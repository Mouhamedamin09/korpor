#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 PayMe + ngrok Setup Helper\n");

// Check if ngrok is installed
try {
  execSync("npx ngrok --version", { stdio: "ignore" });
  console.log("✅ ngrok is available");
} catch (error) {
  console.log("❌ ngrok not found. Installing...");
  execSync("npm install -g ngrok", { stdio: "inherit" });
}

console.log("\n🔧 IMPORTANT: PayMe.tn API Requirements:");
console.log("⚠️  return_url and cancel_url MUST start with https://");
console.log(
  "⚠️  HTTP URLs will be rejected with 'Erroneous provided data' error"
);

console.log("\n📋 Setup Instructions:");
console.log("1. Run: npx ngrok http 5000 (for backend)");
console.log("2. Run: npx ngrok http 3000 (for frontend, in another terminal)");
console.log("3. Copy BOTH HTTPS URLs from ngrok");
console.log("4. Update your .env file with HTTPS URLs:");

console.log("\n🔧 Required .env configuration:");
console.log(`
# PayMe Configuration (HTTPS REQUIRED!)
PAYMEE_API_KEY=your_actual_paymee_api_key_here
BACKEND_URL=https://your-backend-ngrok-url.ngrok-free.app
FRONTEND_URL=https://your-frontend-ngrok-url.ngrok-free.app
NODE_ENV=development

# Other configs...
`);

console.log("\n✅ Example with your current ngrok URL:");
console.log(`
PAYMEE_API_KEY=your_actual_paymee_api_key_here
BACKEND_URL=https://0e42-185-165-241-213.ngrok-free.app
FRONTEND_URL=https://0e42-185-165-241-213.ngrok-free.app
NODE_ENV=development
`);

console.log("\n🧪 Test your PayMe integration:");
console.log(
  "POST https://your-backend-ngrok-url.ngrok-free.app/api/payment/payme/test-payment"
);

console.log("\n💡 Frontend ngrok setup (if needed):");
console.log("1. In a new terminal: cd front-mobile");
console.log("2. Run: npx ngrok http 3000");
console.log("3. Use the frontend ngrok HTTPS URL in your .env");

console.log("\n🚨 Common Errors Fixed:");
console.log("❌ 'Erroneous provided data' = Using HTTP instead of HTTPS");
console.log("✅ Use HTTPS URLs for return_url and cancel_url");

// Check current .env
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  console.log("\n📄 Current .env file found. Check these values:");
  const envContent = fs.readFileSync(envPath, "utf8");
  const lines = envContent
    .split("\n")
    .filter(
      (line) =>
        line.includes("PAYMEE") ||
        line.includes("BACKEND_URL") ||
        line.includes("FRONTEND_URL")
    );

  lines.forEach((line) => {
    if (line.includes("BACKEND_URL") || line.includes("FRONTEND_URL")) {
      const isHttps = line.includes("https://");
      const status = isHttps ? "✅" : "❌ MUST BE HTTPS";
      console.log(`   ${line} ${status}`);
    } else {
      console.log(`   ${line}`);
    }
  });
} else {
  console.log(
    "\n📄 No .env file found. You need to create one with HTTPS URLs."
  );
}

console.log("\n🎯 Quick Fix for your current setup:");
console.log("Add these lines to your backend/.env file:");
console.log("BACKEND_URL=https://0e42-185-165-241-213.ngrok-free.app");
console.log("FRONTEND_URL=https://0e42-185-165-241-213.ngrok-free.app");
