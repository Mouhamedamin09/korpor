const { sequelize } = require("../config/db.config");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const fakeUsers = [
  {
    name: "Amin Kraiem",
    email: "mouhamedaminkraiem09@gmail.com",
    phone: "+21629453228",
    accountType: "Individual Account",
    korporSince: new Date("2024-03-11"),
    intro: "Korpor Intro",
    investmentUsedPct: 0,
    investmentTotal: 367000,
    globalUsers: 1000000,
    globalCountries: 209,
    password: "password123",
    isVerified: true,
    approvalStatus: "approved"
  },
  {
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+1234567890",
    accountType: "Business Account",
    korporSince: new Date("2024-02-15"),
    intro: "Tech entrepreneur and investor",
    investmentUsedPct: 45,
    investmentTotal: 500000,
    globalUsers: 1500000,
    globalCountries: 150,
    password: "password123",
    isVerified: true,
    approvalStatus: "approved"
  },
  {
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "+44123456789",
    accountType: "Individual Account",
    korporSince: new Date("2024-01-20"),
    intro: "Real estate investor",
    investmentUsedPct: 75,
    investmentTotal: 250000,
    globalUsers: 800000,
    globalCountries: 120,
    password: "password123",
    isVerified: true,
    approvalStatus: "approved"
  },
  {
    name: "Mohammed Ali",
    email: "m.ali@example.com",
    phone: "+971501234567",
    accountType: "Corporate Account",
    korporSince: new Date("2024-03-01"),
    intro: "International business consultant",
    investmentUsedPct: 30,
    investmentTotal: 1000000,
    globalUsers: 2000000,
    globalCountries: 180,
    password: "password123",
    isVerified: true,
    approvalStatus: "approved"
  },
  {
    name: "Emma Wilson",
    email: "emma.w@example.com",
    phone: "+61234567890",
    accountType: "Individual Account",
    korporSince: new Date("2024-02-28"),
    intro: "Property developer",
    investmentUsedPct: 60,
    investmentTotal: 750000,
    globalUsers: 1200000,
    globalCountries: 160,
    password: "password123",
    isVerified: true,
    approvalStatus: "approved"
  }
];

const seedUsers = async () => {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log("Database connection established.");

    // Hash passwords
    const usersWithHashedPasswords = await Promise.all(
      fakeUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }))
    );

    // Create users
    await User.bulkCreate(usersWithHashedPasswords);
    console.log("Successfully created 5 fake users!");

    // Log the created users
    const createdUsers = await User.findAll({
      attributes: ['name', 'email', 'accountType', 'investmentTotal']
    });
    console.log("\nCreated Users:");
    createdUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email})`);
    });

  } catch (error) {
    console.error("Error seeding users:", error);
  } finally {
    // Close database connection
    await sequelize.close();
  }
};

// Run the seed function
seedUsers(); 