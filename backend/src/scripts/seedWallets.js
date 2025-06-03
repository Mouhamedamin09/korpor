const { testConnection } = require("../config/db.config");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const bcrypt = require("bcryptjs");

// Sample users with wallets for testing
const testUsers = [
  {
    name: "Ahmed",
    surname: "Ben Ali",
    email: "ahmed.benali@test.com",
    password: "test123456",
    walletBalance: 50000,
    currency: "TND",
  },
  {
    name: "Fatima",
    surname: "Khelifi",
    email: "fatima.khelifi@test.com",
    password: "test123456",
    walletBalance: 75000,
    currency: "TND",
  },
  {
    name: "Mohamed",
    surname: "Trabelsi",
    email: "mohamed.trabelsi@test.com",
    password: "test123456",
    walletBalance: 100000,
    currency: "TND",
  },
  {
    name: "Leila",
    surname: "Mansouri",
    email: "leila.mansouri@test.com",
    password: "test123456",
    walletBalance: 25000,
    currency: "TND",
  },
];

async function seedWallets() {
  try {
    console.log("🏦 Starting wallet seeding...");

    // Test database connection
    await testConnection();
    console.log("✅ Database connected successfully");

    // Get user role
    const Role = require("../models/Role");
    let userRole = await Role.findOne({ where: { name: "user" } });

    if (!userRole) {
      console.log("Creating user role...");
      userRole = await Role.create({
        name: "user",
        privileges: ["read:properties", "create:investments"],
        description: "Regular user with investment capabilities",
      });
      console.log("✅ User role created");
    }

    console.log("👥 Creating test users with wallets...");

    for (const userData of testUsers) {
      // Check if user already exists
      let user = await User.findOne({ where: { email: userData.email } });

      if (!user) {
        // Create user
        user = await User.create({
          name: userData.name,
          surname: userData.surname,
          email: userData.email,
          password: await bcrypt.hash(userData.password, 10),
          birthdate: new Date("1990-01-01"),
          isVerified: true,
          approvalStatus: "approved",
          roleId: userRole.id,
          investmentTotal: 0,
          accountNo: Math.floor(Math.random() * 900000000) + 100000000,
        });
        console.log(`✅ Created user: ${user.name} ${user.surname}`);
      } else {
        console.log(`👤 User exists: ${user.name} ${user.surname}`);
      }

      // Check if wallet exists
      let wallet = await Wallet.findOne({ where: { userId: user.id } });

      if (!wallet) {
        // Create wallet
        wallet = await Wallet.create({
          userId: user.id,
          cashBalance: userData.walletBalance,
          totalBalance: userData.walletBalance,
          currency: userData.currency,
          lastTransactionAt: new Date(),
          status: "active",
        });
        console.log(
          `  💰 Created wallet with ${userData.walletBalance} ${userData.currency}`
        );
      } else {
        // Update wallet balance
        await wallet.update({
          cashBalance: userData.walletBalance,
          totalBalance: userData.walletBalance,
          lastTransactionAt: new Date(),
        });
        console.log(
          `  💰 Updated wallet balance to ${userData.walletBalance} ${userData.currency}`
        );
      }
    }

    console.log("\n🎉 Wallet seeding completed successfully!");

    // Display summary
    const wallets = await Wallet.findAll({
      attributes: ["id", "cashBalance", "currency", "userId"],
    });

    console.log("\n📋 Wallets Summary:");
    for (const wallet of wallets) {
      const user = await User.findByPk(wallet.userId, {
        attributes: ["name", "surname", "email"],
      });
      if (user) {
        console.log(
          `  • ${user.name} ${user.surname} (${user.email}): ${wallet.cashBalance} ${wallet.currency}`
        );
      }
    }

    console.log("\n🔑 Test Credentials:");
    testUsers.forEach((user) => {
      console.log(`  • Email: ${user.email} | Password: ${user.password}`);
    });
  } catch (error) {
    console.error("❌ Error seeding wallets:", error);
    throw error;
  }
}

// Run the seeding
if (require.main === module) {
  seedWallets()
    .then(() => {
      console.log("🏁 Wallet seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Wallet seeding failed:", error);
      process.exit(1);
    });
}

module.exports = { seedWallets };
