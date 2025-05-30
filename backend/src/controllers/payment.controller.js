const { rawQuery } = require("../config/db.config");
const paymee = require("../services/paymee.service");
const blockchain = require("../blockchain/investment");

// Handle Paymee callback and record investment on blockchain if payment is successful
exports.handleCallback = async (req, res) => {
  const { status, reference, amount } = req.body;

  if (status !== "paid") {
    return res.status(400).send("Payment not confirmed");
  }

  try {
    const [investment] = await rawQuery(
      "SELECT * FROM investments WHERE paymee_ref = ?",
      [reference]
    );

    if (!investment.length) {
      return res.status(404).send("Investment not found");
    }

    const investmentAmount = parseFloat(investment[0].amount);
    const paymeeAmount = parseFloat(amount);

    console.log(
      `Comparing amounts: DB(${investmentAmount}) vs Paymee(${paymeeAmount})`
    );

    if (investmentAmount !== paymeeAmount) {
      return res
        .status(400)
        .send(
          `Payment amount mismatch: DB(${investmentAmount}) != Paymee(${paymeeAmount})`
        );
    }

    // ✅ Record on blockchain first
    const txHash = await blockchain.recordInvestment(
      investment[0].project_id,
      investment[0].user_address,
      investment[0].amount / 100
    );

    // ✅ Now update investment with confirmed status and tx_hash
    await rawQuery(
      "UPDATE investments SET status = 'confirmed', tx_hash = ? WHERE paymee_ref = ?",
      [txHash, reference]
    );

    // ✅ Now update the project current amount
    const [project] = await rawQuery(
      "SELECT current_amount, goal_amount FROM projects WHERE id = ?",
      [investment[0].project_id]
    );

    if (project.length > 0) {
      let newCurrentAmount =
        parseFloat(project[0].current_amount) + investmentAmount;

      if (isNaN(newCurrentAmount)) {
        console.log("Invalid number for newCurrentAmount:", newCurrentAmount);
        return res
          .status(400)
          .send("Error: Invalid current amount calculation.");
      }

      newCurrentAmount = newCurrentAmount.toFixed(2);

      console.log(
        `New current amount for project ${investment[0].project_id}:`,
        newCurrentAmount
      );

      await rawQuery("UPDATE projects SET current_amount = ? WHERE id = ?", [
        newCurrentAmount,
        investment[0].project_id,
      ]);

      if (parseFloat(newCurrentAmount) >= project[0].goal_amount) {
        await rawQuery("UPDATE projects SET status = 'Funded' WHERE id = ?", [
          investment[0].project_id,
        ]);
      }
    }

    res
      .status(200)
      .send({ message: "Payment confirmed and investment recorded", txHash });
  } catch (error) {
    console.error("Error handling Paymee callback:", error);
    res.status(500).send("Error processing payment callback");
  }
};

// Get payment status by reference
exports.getPaymentStatusByRef = async (req, res) => {
  const { ref } = req.params;

  try {
    const [result] = await rawQuery(
      "SELECT * FROM payments WHERE paymee_ref = ?",
      [ref]
    );

    if (!result.length) return res.status(404).send("Payment not found");

    res.json(result[0]);
  } catch (error) {
    console.error("Error fetching payment status:", error);
    res.status(500).send("Error fetching payment status");
  }
};

// Get all payments by wallet address
exports.getPaymentsByWallet = async (req, res) => {
  const { walletAddress } = req.params;

  try {
    const [result] = await rawQuery(
      "SELECT * FROM payments WHERE user_address = ? ORDER BY created_at DESC",
      [walletAddress.toLowerCase()]
    );

    if (!result.length) return res.status(404).send("No payments found");

    res.json(result);
  } catch (error) {
    console.error("Error fetching payments by wallet:", error);
    res.status(500).send("Error fetching payments");
  }
};
