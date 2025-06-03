const express = require("express");
const router = express.Router();
const {
  getPropertyForInvestment,
  validateInvestment,
  createInvestment,
  createInvestmentWithPayment,
  getUserInvestments,
  getInvestmentDetails,
} = require("../controllers/realEstateInvestmentController");
const { authenticate } = require("../middleware/authenticate");

// Protect all routes
router.use(authenticate);

// Get property details for investment
router.get("/property/:projectId", getPropertyForInvestment);

// Validate investment before creating
router.post("/validate", validateInvestment);

// Create investment (wallet payment)
router.post("/create", createInvestment);

// Create investment with external payment
router.post("/create-with-payment", createInvestmentWithPayment);

// Get user's investments
router.get("/user/investments", getUserInvestments);

// Get investment details
router.get("/investment/:investmentId", getInvestmentDetails);

module.exports = router;
