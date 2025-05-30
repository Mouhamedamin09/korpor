const User = require("./User");
const Role = require("./Role");
const Project = require("./Project");
const PropertyImage = require("./PropertyImage");
const ProjectDocument = require("./ProjectDocument");
const Verification = require("./Verification");
const Wallet = require("./Wallet");
const Transaction = require("./Transaction");
const AutoInvest = require("./AutoInvest");

// Set up associations
const setupAssociations = () => {
  // User belongs to Role
  User.belongsTo(Role, {
    foreignKey: "role_id",
    as: "role",
  });

  // Role has many Users
  Role.hasMany(User, {
    foreignKey: "role_id",
    as: "users",
  });

  // User has one Verification
  User.hasOne(Verification, {
    foreignKey: "user_id",
    as: "verification",
  });

  // Verification belongs to User
  Verification.belongsTo(User, {
    foreignKey: "user_id",
    as: "verificationUser",
  });

  // User has one Wallet
  User.hasOne(Wallet, {
    foreignKey: "user_id",
    as: "wallet",
  });

  // Wallet belongs to User
  Wallet.belongsTo(User, {
    foreignKey: "user_id",
    as: "walletUser",
  });

  // User has many Transactions
  User.hasMany(Transaction, {
    foreignKey: "user_id",
    as: "transactions",
  });

  // Transaction belongs to User
  Transaction.belongsTo(User, {
    foreignKey: "user_id",
    as: "transactionUser",
  });

  // Wallet has many Transactions
  Wallet.hasMany(Transaction, {
    foreignKey: "wallet_id",
    as: "walletTransactions",
  });

  // Transaction belongs to Wallet
  Transaction.belongsTo(Wallet, {
    foreignKey: "wallet_id",
    as: "wallet",
  });

  // User has many AutoInvest plans
  User.hasMany(AutoInvest, {
    foreignKey: "userId",
    as: "autoInvestPlans",
  });

  // AutoInvest belongs to User
  AutoInvest.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  // AutoInvest has many Transactions (for tracking deposits and investments)
  AutoInvest.hasMany(Transaction, {
    foreignKey: "autoInvestPlanId",
    as: "transactions",
  });

  // Transaction belongs to AutoInvest (optional, for AutoInvest-related transactions)
  Transaction.belongsTo(AutoInvest, {
    foreignKey: "autoInvestPlanId",
    as: "autoInvestPlan",
  });

  // Project belongs to User (creator)
  Project.belongsTo(User, {
    foreignKey: "created_by",
    as: "creator",
  });

  // User has many Projects
  User.hasMany(Project, {
    foreignKey: "created_by",
    as: "projects",
  });

  // Project has many PropertyImages
  Project.hasMany(PropertyImage, {
    foreignKey: "project_id",
    as: "images",
  });

  // PropertyImage belongs to Project
  PropertyImage.belongsTo(Project, {
    foreignKey: "project_id",
    as: "project",
  });

  // Project has many ProjectDocuments
  Project.hasMany(ProjectDocument, {
    foreignKey: "project_id",
    as: "documents",
  });

  // ProjectDocument belongs to Project
  ProjectDocument.belongsTo(Project, {
    foreignKey: "project_id",
    as: "project",
  });

  // ProjectDocument belongs to User (creator)
  ProjectDocument.belongsTo(User, {
    foreignKey: "created_by",
    as: "documentCreator",
  });

  console.log("Model associations have been set up");
};

module.exports = setupAssociations;
