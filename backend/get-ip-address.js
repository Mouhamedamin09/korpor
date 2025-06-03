const os = require("os");

function getNetworkInterfaces() {
  const interfaces = os.networkInterfaces();
  const result = {};

  for (const [name, details] of Object.entries(interfaces)) {
    result[name] = details
      .filter((detail) => detail.family === "IPv4" && !detail.internal)
      .map((detail) => detail.address);
  }

  return result;
}

function displayNetworkInfo() {
  console.log("\n🌐 NETWORK INFORMATION");
  console.log("=".repeat(50));

  const interfaces = getNetworkInterfaces();

  for (const [name, addresses] of Object.entries(interfaces)) {
    if (addresses.length > 0) {
      console.log(`\n📡 ${name}:`);
      addresses.forEach((address) => {
        console.log(`   ${address}`);
      });
    }
  }

  console.log("\n📋 FOR MOBILE APP CONFIGURATION:");
  console.log("=".repeat(50));

  // Find the most likely candidate IP addresses
  const allAddresses = Object.values(interfaces).flat();

  if (allAddresses.length === 0) {
    console.log("❌ No external IP addresses found");
    console.log("💡 Make sure you are connected to a network");
    return;
  }

  console.log("\n🔧 Update your frontend API URL to one of these:");
  allAddresses.forEach((ip, index) => {
    console.log(`${index + 1}. http://${ip}:5000`);
  });

  console.log("\n📱 RECOMMENDED CONFIGURATION:");
  console.log("=".repeat(30));

  // Prioritize common network ranges
  const wifiIPs = allAddresses.filter(
    (ip) =>
      ip.startsWith("192.168.") ||
      ip.startsWith("10.0.") ||
      ip.startsWith("172.")
  );

  if (wifiIPs.length > 0) {
    console.log(`\n✅ For WiFi connection, use: http://${wifiIPs[0]}:5000`);
    console.log(`\n📝 Update front-mobile/src/shared/constants/api.tsx:`);
    console.log(`const LOCAL_IP = "${wifiIPs[0]}";`);
  }

  console.log("\n⚠️  IMPORTANT NOTES:");
  console.log("- Make sure your backend server is running on port 5000");
  console.log("- Your mobile device must be on the same network");
  console.log("- If using a VPN, it might interfere with local connections");
  console.log("- For Android emulator, use: http://10.0.2.2:5000");
  console.log("- For iOS simulator, use: http://localhost:5000");
}

displayNetworkInfo();
