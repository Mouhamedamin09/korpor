require("dotenv").config();
const { sequelize } = require("./src/config/db.config");
const User = require("./src/models/User");

async function listUsers() {
  try {
    console.log("📋 Users in database:\n");

    const users = await User.findAll({
      attributes: [
        "id",
        "name",
        "email",
        "investmentTotal",
        "isVerified",
        "approvalStatus",
        "createdAt",
      ],
      order: [["id", "ASC"]],
    });

    if (users.length === 0) {
      console.log("❌ No users found in database");
      return;
    }

    users.forEach((user, index) => {
      const eligible = parseFloat(user.investmentTotal || 0) >= 2000;
      console.log(
        `${index + 1}. 👤 ${user.name || "No name"} (ID: ${user.id})`
      );
      console.log(`   📧 Email: ${user.email}`);
      console.log(
        `   💰 Investment: ${user.investmentTotal || 0} TND ${
          eligible ? "✅ (Eligible)" : "❌ (Not eligible)"
        }`
      );
      console.log(`   🔒 Verified: ${user.isVerified ? "Yes" : "No"}`);
      console.log(`   📊 Status: ${user.approvalStatus}`);
      console.log(
        `   📅 Created: ${user.createdAt?.toISOString().split("T")[0]}`
      );
      console.log("");
    });

    console.log(`📊 Total users: ${users.length}`);

    const eligibleUsers = users.filter(
      (user) => parseFloat(user.investmentTotal || 0) >= 2000
    );
    console.log(`✅ Eligible for auto-reinvest: ${eligibleUsers.length}`);

    if (eligibleUsers.length > 0) {
      console.log("\n🎯 Recommended test users:");
      eligibleUsers.forEach((user) => {
        console.log(`   - ${user.email} (${user.investmentTotal} TND)`);
      });
    }
  } catch (error) {
    console.error("❌ Error listing users:", error.message);
  } finally {
    await sequelize.close();
  }
}

listUsers();
