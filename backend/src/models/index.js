const { sequelize } = require("../config/db.config");
const User = require("./User");
const Role = require("./Role");
const BlacklistedToken = require("./BlacklistedToken");
const Project = require("./Project");
const PropertyImage = require("./PropertyImage");
const ProjectDocument = require("./ProjectDocument");
const Verification = require("./Verification");
const Referral = require("./Referral");
const Wallet = require("./Wallet");
const Transaction = require("./Transaction");
const AutoInvest = require("./AutoInvest");
const AutoReinvest = require("./AutoReinvest");
const RentalPayout = require("./RentalPayout");
const Investment = require("./Investment");
const setupAssociations = require("./associations");

// Note: setupAssociations is called in server.js after database connection
// to avoid duplicate association errors

// Function to sync all models with database
const syncModels = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log("Database models synchronized successfully.");
  } catch (error) {
    console.error("Error synchronizing database models:", error);
    throw error;
  }
};

// Export models and sequelize instance
module.exports = {
  sequelize,
  syncModels,
  User,
  Role,
  BlacklistedToken,
  Project,
  PropertyImage,
  ProjectDocument,
  Verification,
  Referral,
  Wallet,
  Transaction,
  AutoInvest,
  AutoReinvest,
  RentalPayout,
  Investment,
};
