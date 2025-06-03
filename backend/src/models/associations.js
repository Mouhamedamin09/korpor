const User = require("./User");
const Role = require("./Role");
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

  // ========== REFERRAL ASSOCIATIONS ==========
  // User has many Referrals as referrer
  User.hasMany(Referral, {
    foreignKey: "referrer_id",
    as: "referralsAsReferrer",
  });

  // User has many Referrals as referee
  User.hasMany(Referral, {
    foreignKey: "referee_id",
    as: "referralsAsReferee",
  });

  // Referral belongs to User (referrer)
  Referral.belongsTo(User, {
    foreignKey: "referrer_id",
    as: "referrer",
  });

  // Referral belongs to User (referee)
  Referral.belongsTo(User, {
    foreignKey: "referee_id",
    as: "referee",
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

  // Investment Associations
  // User has many Investments
  User.hasMany(Investment, {
    foreignKey: "user_id",
    as: "investments",
  });

  // Investment belongs to User
  Investment.belongsTo(User, {
    foreignKey: "user_id",
    as: "investor",
  });

  // Project has many Investments
  Project.hasMany(Investment, {
    foreignKey: "project_id",
    as: "investments",
  });

  // Investment belongs to Project
  Investment.belongsTo(Project, {
    foreignKey: "project_id",
    as: "project",
  });

  // Investment belongs to Transaction (wallet deduction)
  Investment.belongsTo(Transaction, {
    foreignKey: "transaction_id",
    as: "transaction",
  });

  // Transaction can have one Investment
  Transaction.hasOne(Investment, {
    foreignKey: "transaction_id",
    as: "investment",
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

  // User has one AutoReinvest plan
  User.hasOne(AutoReinvest, {
    foreignKey: "userId",
    as: "autoReinvestPlan",
  });

  // AutoReinvest belongs to User
  AutoReinvest.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  // AutoReinvest has many Transactions (for tracking reinvestments)
  AutoReinvest.hasMany(Transaction, {
    foreignKey: "autoReinvestPlanId",
    as: "reinvestmentTransactions",
  });

  // Transaction belongs to AutoReinvest (optional, for AutoReinvest-related transactions)
  Transaction.belongsTo(AutoReinvest, {
    foreignKey: "autoReinvestPlanId",
    as: "autoReinvestPlan",
  });

  // User has many RentalPayouts
  User.hasMany(RentalPayout, {
    foreignKey: "userId",
    as: "rentalPayouts",
  });

  // RentalPayout belongs to User
  RentalPayout.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  // Project has many RentalPayouts
  Project.hasMany(RentalPayout, {
    foreignKey: "projectId",
    as: "rentalPayouts",
  });

  // RentalPayout belongs to Project
  RentalPayout.belongsTo(Project, {
    foreignKey: "projectId",
    as: "project",
  });

  // AutoReinvest has many RentalPayouts
  AutoReinvest.hasMany(RentalPayout, {
    foreignKey: "autoReinvestPlanId",
    as: "rentalPayouts",
  });

  // RentalPayout belongs to AutoReinvest
  RentalPayout.belongsTo(AutoReinvest, {
    foreignKey: "autoReinvestPlanId",
    as: "autoReinvestPlan",
  });

  // Transaction has one RentalPayout (for reinvestment transactions)
  Transaction.hasOne(RentalPayout, {
    foreignKey: "reinvestTransactionId",
    as: "rentalPayout",
  });

  // RentalPayout belongs to Transaction (reinvestment transaction)
  RentalPayout.belongsTo(Transaction, {
    foreignKey: "reinvestTransactionId",
    as: "reinvestTransaction",
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

  console.log("✅ All model associations set up successfully");
};

module.exports = setupAssociations;
