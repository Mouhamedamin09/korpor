require("dotenv").config();
const { sequelize } = require("./src/config/db.config");
const User = require("./src/models/User");
const AutoReinvest = require("./src/models/AutoReinvest");
const RentalPayout = require("./src/models/RentalPayout");
const Project = require("./src/models/Project");

async function createTestData() {
  try {
    console.log("🔄 Creating test data for auto-reinvest system...");

    // Create a test user with sufficient investment
    const [testUser, created] = await User.findOrCreate({
      where: { email: "mouhamedaminkraiem09@gmail.com" },
      defaults: {
        name: "Mouhamed Amine Kraiem",
        email: "mouhamedaminkraiem09@gmail.com",
        password: "pasword123",
        investmentTotal: 5000.0,
        phone: "+21629453228",
        roleId: 2, // Regular user
        isVerified: true,
        approvalStatus: "approved",
      },
    });

    console.log(
      `✅ Test user: ${created ? "created" : "found"} (ID: ${testUser.id})`
    );

    // Create a test project
    const [testProject, projectCreated] = await Project.findOrCreate({
      where: { name: "Test Property Investment" },
      defaults: {
        name: "Test Property Investment",
        description: "A test property for auto-reinvest testing",
        goal_amount: 100000.0,
        current_amount: 85000.0,
        status: "Active",
        property_status: "rented",
        location: "Tunis, Tunisia",
        property_type: "residential",
        expected_roi: 8.5,
        rental_yield: 6.2,
        minimum_investment: 500.0,
        created_by: testUser.id,
        featured: true,
      },
    });

    console.log(
      `✅ Test project: ${projectCreated ? "created" : "found"} (ID: ${
        testProject.id
      })`
    );

    // Create an auto-reinvest plan for the test user
    const [autoReinvestPlan, planCreated] = await AutoReinvest.findOrCreate({
      where: { userId: testUser.id },
      defaults: {
        userId: testUser.id,
        status: "active",
        minimumReinvestAmount: 100.0,
        reinvestPercentage: 80.0,
        theme: "balanced",
        riskLevel: "medium",
        reinvestmentFrequency: "monthly",
        autoApprovalEnabled: true,
        maxReinvestPercentagePerProject: 25.0,
        totalRentalIncome: 450.0,
        totalReinvested: 320.0,
        pendingReinvestAmount: 130.0,
      },
    });

    console.log(
      `✅ Auto-reinvest plan: ${planCreated ? "created" : "found"} (ID: ${
        autoReinvestPlan.id
      })`
    );

    // Create some sample rental payouts
    const samplePayouts = [
      {
        userId: testUser.id,
        projectId: testProject.id,
        autoReinvestPlanId: autoReinvestPlan.id,
        amount: 150.0,
        reinvestedAmount: 120.0,
        payoutDate: new Date("2024-05-01"),
        status: "reinvested",
      },
      {
        userId: testUser.id,
        projectId: testProject.id,
        autoReinvestPlanId: autoReinvestPlan.id,
        amount: 150.0,
        reinvestedAmount: 120.0,
        payoutDate: new Date("2024-04-01"),
        status: "reinvested",
      },
      {
        userId: testUser.id,
        projectId: testProject.id,
        autoReinvestPlanId: autoReinvestPlan.id,
        amount: 150.0,
        reinvestedAmount: 80.0,
        payoutDate: new Date("2024-03-01"),
        status: "partially_reinvested",
      },
    ];

    for (const payout of samplePayouts) {
      const [rentalPayout, payoutCreated] = await RentalPayout.findOrCreate({
        where: {
          userId: payout.userId,
          payoutDate: payout.payoutDate,
        },
        defaults: payout,
      });

      console.log(
        `✅ Rental payout: ${payoutCreated ? "created" : "found"} (${
          payout.amount
        } TND on ${payout.payoutDate.toISOString().split("T")[0]})`
      );
    }

    // Update the auth token to match our test user
    console.log(
      `\n🔑 Use this auth token for testing: mock-token-user-${testUser.id}`
    );
    console.log(
      `📊 Test user investment total: ${
        testUser.investmentTotal
      } TND (eligible: ${testUser.investmentTotal >= 2000})`
    );
    console.log(`📈 Auto-reinvest plan status: ${autoReinvestPlan.status}`);
    console.log(
      `💰 Total rental income: ${autoReinvestPlan.totalRentalIncome} TND`
    );
    console.log(`🔄 Total reinvested: ${autoReinvestPlan.totalReinvested} TND`);
    console.log(
      `⏳ Pending reinvestment: ${autoReinvestPlan.pendingReinvestAmount} TND`
    );

    console.log("\n✅ Test data creation completed!");
  } catch (error) {
    console.error("❌ Error creating test data:", error);
  } finally {
    await sequelize.close();
  }
}

createTestData();
