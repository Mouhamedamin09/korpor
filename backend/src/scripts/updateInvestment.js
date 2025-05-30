const { sequelize } = require("../config/db.config");
const { rawQuery } = require("../config/db.config");

const updateInvestment = async () => {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log("Database connection established.");

    // Get user ID for mouhamedaminkraiem09@gmail.com
    const [users] = await rawQuery(
      "SELECT id FROM users WHERE email = ?",
      ["mouhamedaminkraiem09@gmail.com"]
    );

    if (!users.length) {
      console.error("User not found!");
      return;
    }

    const userId = users[0].id;
    console.log("Found user ID:", userId);

    // Update the investment amount
    await rawQuery(
      `UPDATE investments 
       SET amount = 87000 
       WHERE user_id = ? AND status = 'confirmed'`,
      [userId]
    );

    // Update user's investment total
    const [totalInvested] = await rawQuery(
      `SELECT COALESCE(SUM(amount), 0) as total 
       FROM investments 
       WHERE user_id = ? AND status = 'confirmed'`,
      [userId]
    );

    await rawQuery(
      `UPDATE users 
       SET investment_total = ?,
           investment_used_pct = ?
       WHERE id = ?`,
      [
        totalInvested[0].total,
        (totalInvested[0].total / 367000) * 100, // Calculate percentage of annual limit
        userId
      ]
    );

    console.log("Successfully updated investment amount to 87000 TND!");
    console.log("Updated user's investment totals!");

  } catch (error) {
    console.error("Error updating investment:", error);
  } finally {
    // Close database connection
    await sequelize.close();
  }
};

// Run the update
updateInvestment(); 