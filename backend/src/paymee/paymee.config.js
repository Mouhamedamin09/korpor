module.exports = {
  baseURL: "https://sandbox.paymee.tn/api/v1",
  headers: {
    "Content-Type": "application/json",
    // Mock token for CI debugging
    Authorization: `Token MOCK_PAYMEE_API_KEY_FOR_CI_DEBUG`,
  },
};
