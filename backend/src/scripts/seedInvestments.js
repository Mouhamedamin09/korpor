const { sequelize } = require("../config/db.config");
const { rawQuery } = require("../config/db.config");

const seedInvestments = async () => {
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

    // Get project IDs
    const [projects] = await rawQuery(
      "SELECT id FROM projects LIMIT 3"
    );

    if (!projects.length) {
      console.error("No projects found!");
      return;
    }

    // Sample investment data
    const investments = [
      {
        user_id: userId,
        project_id: projects[0].id,
        amount: 50000,
        status: 'confirmed',
        user_address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        created_at: new Date('2024-03-01')
      },
      {
        user_id: userId,
        project_id: projects[1].id,
        amount: 75000,
        status: 'confirmed',
        user_address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        created_at: new Date('2024-03-15')
      },
      {
        user_id: userId,
        project_id: projects[2].id,
        amount: 100000,
        status: 'confirmed',
        user_address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        created_at: new Date('2024-04-01')
      }
    ];

    // Insert investments
    for (const investment of investments) {
      await rawQuery(
        `INSERT INTO investments 
        (user_id, project_id, amount, status, user_address, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          investment.user_id,
          investment.project_id,
          investment.amount,
          investment.status,
          investment.user_address,
          investment.created_at,
          investment.created_at
        ]
      );
    }

    console.log("Successfully added sample investments!");

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

    console.log("Updated user's investment totals!");

  } catch (error) {
    console.error("Error seeding investments:", error);
  } finally {
    // Close database connection
    await sequelize.close();
  }
};

// Run the seeding
seedInvestments(); 