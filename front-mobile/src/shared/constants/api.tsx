// API Configuration
// Replace with your actual machine's IP address when running on physical device
const LOCAL_IP = "192.168.43.44"; // Your current VPN IP
// const LOCAL_IP = "192.168.1.100"; // Your WiFi IP (change this to your actual IP)
// const LOCAL_IP = "10.0.0.100"; // Alternative IP range

const DEV_API_URL = `http://${LOCAL_IP}:5000`; // VPN/WiFi IP for Android
// const DEV_API_URL = "http://localhost:5000"; // iOS simulator
// const DEV_API_URL = "http://10.0.2.2:5000"; // Android emulator

// Production URL (when deployed)
const PROD_API_URL = "https://your-production-domain.com";

// Use environment variable or default to development
const API_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

console.log("🔗 API_URL:", API_URL);

export default API_URL;
