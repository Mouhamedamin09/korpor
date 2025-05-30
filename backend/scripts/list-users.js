#!/usr/bin/env node

const { User, Wallet, sequelize } = require("../src/models");

// Function to format currency
function formatCurrency(amount, currency = "TND") {
  return `${parseFloat(amount || 0).toFixed(2)} ${currency}`;
}

// Function to list all users with their wallet details
async function listUsers(limit = 50, offset = 0, search = "") {
  try {
    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { fullName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["id", "ASC"]],
      include: [
        {
          model: Wallet,
          as: "wallet",
          required: false,
        },
      ],
    });

    console.log(`\n👥 USER LIST (Showing ${users.length} of ${count} users)`);
    console.log("=".repeat(100));
    console.log(
      "ID".padEnd(6) +
        "Name".padEnd(25) +
        "Email".padEnd(30) +
        "Cash Balance".padEnd(15) +
        "Rewards".padEnd(15) +
        "Total".padEnd(15)
    );
    console.log("-".repeat(100));

    users.forEach((user) => {
      const wallet = user.wallet;
      const cashBalance = wallet
        ? formatCurrency(wallet.cashBalance, wallet.currency)
        : "No wallet";
      const rewardsBalance = wallet
        ? formatCurrency(wallet.rewardsBalance, wallet.currency)
        : "-";
      const totalBalance = wallet
        ? formatCurrency(
            parseFloat(wallet.cashBalance || 0) +
              parseFloat(wallet.rewardsBalance || 0),
            wallet.currency
          )
        : "-";

      console.log(
        String(user.id).padEnd(6) +
          (user.fullName || "No name").substring(0, 24).padEnd(25) +
          (user.email || "No email").substring(0, 29).padEnd(30) +
          cashBalance.padEnd(15) +
          rewardsBalance.padEnd(15) +
          totalBalance.padEnd(15)
      );
    });

    console.log("-".repeat(100));
    console.log(`Total users in database: ${count}`);

    if (count > limit) {
      const nextOffset = offset + limit;
      console.log(
        `\n💡 To see more users, run: node list-users.js ${limit} ${nextOffset}`
      );
    }
  } catch (error) {
    console.error("❌ Error listing users:", error.message);
  }
}

// Function to search users
async function searchUsers(searchTerm, limit = 20) {
  try {
    const { Op } = require("sequelize");

    const users = await User.findAll({
      where: {
        [Op.or]: [
          { fullName: { [Op.like]: `%${searchTerm}%` } },
          { email: { [Op.like]: `%${searchTerm}%` } },
        ],
      },
      limit,
      include: [
        {
          model: Wallet,
          as: "wallet",
          required: false,
        },
      ],
    });

    console.log(
      `\n🔍 SEARCH RESULTS for "${searchTerm}" (${users.length} matches)`
    );
    console.log("=".repeat(100));
    console.log(
      "ID".padEnd(6) +
        "Name".padEnd(25) +
        "Email".padEnd(30) +
        "Cash Balance".padEnd(15) +
        "Rewards".padEnd(15) +
        "Total".padEnd(15)
    );
    console.log("-".repeat(100));

    users.forEach((user) => {
      const wallet = user.wallet;
      const cashBalance = wallet
        ? formatCurrency(wallet.cashBalance, wallet.currency)
        : "No wallet";
      const rewardsBalance = wallet
        ? formatCurrency(wallet.rewardsBalance, wallet.currency)
        : "-";
      const totalBalance = wallet
        ? formatCurrency(
            parseFloat(wallet.cashBalance || 0) +
              parseFloat(wallet.rewardsBalance || 0),
            wallet.currency
          )
        : "-";

      console.log(
        String(user.id).padEnd(6) +
          (user.fullName || "No name").substring(0, 24).padEnd(25) +
          (user.email || "No email").substring(0, 29).padEnd(30) +
          cashBalance.padEnd(15) +
          rewardsBalance.padEnd(15) +
          totalBalance.padEnd(15)
      );
    });
  } catch (error) {
    console.error("❌ Error searching users:", error.message);
  }
}

// Function to show user details by ID
async function showUserDetails(userId) {
  try {
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Wallet,
          as: "wallet",
          required: false,
        },
      ],
    });

    if (!user) {
      console.log(`❌ User with ID ${userId} not found`);
      return;
    }

    console.log(`\n👤 USER DETAILS (ID: ${userId})`);
    console.log("=".repeat(50));
    console.log(`Name: ${user.fullName || "Not provided"}`);
    console.log(`Email: ${user.email || "Not provided"}`);
    console.log(`Phone: ${user.phone || "Not provided"}`);
    console.log(`Created: ${user.createdAt || "Unknown"}`);
    console.log(`Currency: ${user.currency || "TND"}`);

    if (user.wallet) {
      console.log(`\n💳 WALLET:`);
      console.log(
        `Cash Balance: ${formatCurrency(
          user.wallet.cashBalance,
          user.wallet.currency
        )}`
      );
      console.log(
        `Rewards Balance: ${formatCurrency(
          user.wallet.rewardsBalance,
          user.wallet.currency
        )}`
      );
      console.log(
        `Total Balance: ${formatCurrency(
          parseFloat(user.wallet.cashBalance || 0) +
            parseFloat(user.wallet.rewardsBalance || 0),
          user.wallet.currency
        )}`
      );
      console.log(
        `Last Transaction: ${user.wallet.lastTransactionAt || "Never"}`
      );
    } else {
      console.log(`\n💳 WALLET: Not created yet`);
    }
  } catch (error) {
    console.error("❌ Error fetching user details:", error.message);
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);

  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error.message);
    process.exit(1);
  }

  if (args.length === 0) {
    // Default: list first 50 users
    await listUsers();
  } else if (args[0] === "search") {
    if (args[1]) {
      await searchUsers(args[1]);
    } else {
      console.log(
        "❌ Please provide a search term. Usage: node list-users.js search <term>"
      );
    }
  } else if (args[0] === "details") {
    if (args[1]) {
      const userId = parseInt(args[1]);
      if (isNaN(userId)) {
        console.log(
          "❌ Please provide a valid user ID. Usage: node list-users.js details <userId>"
        );
      } else {
        await showUserDetails(userId);
      }
    } else {
      console.log(
        "❌ Please provide a user ID. Usage: node list-users.js details <userId>"
      );
    }
  } else {
    // Custom limit and offset
    const limit = parseInt(args[0]) || 50;
    const offset = parseInt(args[1]) || 0;
    await listUsers(limit, offset);
  }

  await sequelize.close();
}

// Show usage help
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`
📖 USER LIST TOOL - Usage:

  node list-users.js                    List first 50 users
  node list-users.js 100                List first 100 users  
  node list-users.js 50 100             List 50 users starting from offset 100
  node list-users.js search "john"      Search for users containing "john"
  node list-users.js details 123        Show detailed info for user ID 123

Examples:
  node list-users.js                    # Show first 50 users
  node list-users.js search doe         # Search for "doe"
  node list-users.js details 5          # Show details for user ID 5
`);
  process.exit(0);
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

module.exports = { listUsers, searchUsers, showUserDetails };
