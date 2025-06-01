// API Configuration
const DEV_API_URL = "http://192.168.1.47:5000"; // VPN IP for Android
// const DEV_API_URL = "http://192.168.43.44:5000"; // Original IP (may not work with VPN)
// const DEV_API_URL = "http://localhost:5000"; // iOS simulator

// Use environment variable or default to production
const API_URL = DEV_API_URL;

export default API_URL;
