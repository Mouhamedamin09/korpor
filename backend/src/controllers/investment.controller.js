const { rawQuery } = require("../config/db.config");
const paymee = require("../services/paymee.service");

exports.createInvestment = async (req, res) => {
  const { user_id, project_id, amount, user_address } = req.body;

  if (!user_id || !project_id || !amount || !user_address) {
    return res.status(400).send("Missing required fields");
  }

  try {
    // Step 1: Insert investment (pending)
    const [result] = await rawQuery(
      "INSERT INTO investments (user_id, project_id, amount, status, user_address) VALUES (?, ?, ?, ?, ?)",
      [user_id, project_id, amount, "pending", user_address],
    );
    const investmentId = result.insertId;

    // Step 2: Create Paymee payment session
    const payment = await paymee.createPayment({
      amount,
      note: `Investment in project ${project_id}`,
    });

    console.log("Paymee response:", payment);

    const paymeeRef = payment.token;
    const paymentUrl = payment.payment_url;

    if (!paymeeRef || !paymentUrl) {
      return res.status(400).send("Error: Missing Paymee data.");
    }

    // Step 3: Save Paymee data in DB
    await rawQuery(
      "UPDATE investments SET paymee_ref = ?, payment_url = ? WHERE id = ?",
      [paymeeRef, paymentUrl, investmentId],
    );

    // Step 4: Return investment record
    const [investmentData] = await rawQuery(
      "SELECT id, user_id, project_id, amount, status, paymee_ref, payment_url, user_address FROM investments WHERE id = ?",
      [investmentId],
    );

    res.json(investmentData[0]);
  } catch (error) {
    console.error("Error creating investment:", error);
    res.status(500).send("Error creating investment");
  }
};

// Get all investments (admin)
exports.getAllInvestments = async (req, res) => {
  try {
    const [result] = await rawQuery(
      "SELECT * FROM investments ORDER BY created_at DESC",
    );
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching investments");
  }
};

// Get investments by wallet address
exports.getInvestmentsByWallet = async (req, res) => {
  const { walletAddress } = req.params;

  try {
    const [result] = await rawQuery(
      "SELECT * FROM investments WHERE user_address = ? ORDER BY created_at DESC",
      [walletAddress.toLowerCase()],
    );

    if (result.length === 0)
      return res.status(404).send("No investments found");
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching investments");
  }
};

// Get investment limits for the current user
exports.getInvestmentLimits = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    console.log('Getting investment limits for user:', req.user.userId);

    // Get the current year's investments for the user
    const [investments] = await rawQuery(
      `SELECT COALESCE(SUM(amount), 0) as total_invested 
       FROM investments 
       WHERE user_id = ? 
       AND status = 'confirmed'
       AND YEAR(created_at) = YEAR(CURRENT_DATE())`,
      [req.user.userId]
    );

    const investedThisYear = parseFloat(investments[0].total_invested) || 0;
    const annualLimit = 367000; // TND
    const professionalThreshold = 1000000; // USD

    // Calculate renewal date (next January 1st)
    const currentYear = new Date().getFullYear();
    const renewalDate = new Date(currentYear + 1, 0, 1).toISOString();

    console.log('Investment limits:', {
      investedThisYear,
      annualLimit,
      renewalDate,
      professionalThreshold
    });

    res.json({
      investedThisYear,
      annualLimit,
      renewalDate,
      professionalThreshold
    });
  } catch (error) {
    console.error("Error fetching investment limits:", error);
    res.status(500).json({ 
      message: "Error fetching investment limits",
      error: error.message 
    });
  }
};
