const { sequelize } = require("../config/db.config");
const { rawQuery } = require("../config/db.config");

const createInvestment = async () => {
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

    // Check if we have any projects
    const [projects] = await rawQuery(
      "SELECT id FROM projects LIMIT 1"
    );

    let projectId;
    if (!projects.length) {
      // Create a project if none exists
      const [result] = await rawQuery(
        `INSERT INTO projects 
        (name, description, goal_amount, current_amount, status, created_by) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        ["Test Project", "A test project for investment", 1000000, 0, "active", userId]
      );
      projectId = result.insertId;
      console.log("Created new project with ID:", projectId);
    } else {
      projectId = projects[0].id;
      console.log("Using existing project with ID:", projectId);
    }

    // Create the investment
    const [result] = await rawQuery(
      `INSERT INTO investments 
      (user_id, project_id, amount, status, user_address, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        userId,
        projectId,
        87000,
        'confirmed',
        '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
      ]
    );

    console.log("Created investment with ID:", result.insertId);

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

    console.log("Successfully created investment and updated user totals!");

  } catch (error) {
    console.error("Error creating investment:", error);
  } finally {
    // Close database connection
    await sequelize.close();
  }
};

// Run the script
createInvestment(); 