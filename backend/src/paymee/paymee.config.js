module.exports = {
  // Use v2 API as per PayMe documentation
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://app.paymee.tn/api/v2"
      : "https://sandbox.paymee.tn/api/v2",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Token ${
      process.env.PAYMEE_API_KEY || "your_paymee_api_key_here"
    }`,
  },
  // Test credentials for sandbox
  testCredentials: {
    phone: "11111111",
    password: "11111111",
  },
};
