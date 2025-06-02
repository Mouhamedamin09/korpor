const express = require("express");
const router = express.Router();

// Import route modules
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const projectRoutes = require("./project.routes");
const adminRoutes = require("./adminRoutes");
const propertyRoutes = require("./propertyRoutes");
const verificationRoutes = require("./verificationRoutes");
const walletRoutes = require("./walletRoutes");
const portfolioRoutes = require("./portfolioRoutes");
const autoReinvestRoutes = require("./autoReinvestRoutes");

// API routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/projects", projectRoutes);
router.use("/admin", adminRoutes);
router.use("/properties", propertyRoutes);
router.use("/verification", verificationRoutes);
router.use("/wallet", walletRoutes);
router.use("/portfolio", portfolioRoutes);
router.use("/autoreinvest", autoReinvestRoutes);

module.exports = router;
