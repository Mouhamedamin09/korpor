const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    phoneVerificationCode: {
        type: DataTypes.STRING(6),
        allowNull: true,
        field: "phone_verification_code",
      },
      verificationCodeExpires: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "verification_code_expires",
      },
      pendingPhone: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "pending_phone",
      },
      lastPhoneChange: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "last_phone_change",
      },
    accountType: {
      type: DataTypes.STRING(50),
      defaultValue: "Individual Account",
      field: "account_type",
    },
    korporSince: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "korpor_since",
    },
    intro: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    investmentUsedPct: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      field: "investment_used_pct",
    },
    investmentTotal: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      field: "investment_total",
    },
    globalUsers: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: "global_users",
    },
    globalCountries: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: "global_countries",
    },
    // Currency preference
    currency: {
      type: DataTypes.ENUM('TND', 'EUR'),
      defaultValue: 'TND',
      allowNull: false,
    },
    // Investment preferences
    investmentPreference: {
      type: DataTypes.ENUM('all', 'local'),
      defaultValue: 'all',
      allowNull: false,
      field: 'investment_preference',
    },
    investmentRegion: {
      type: DataTypes.ENUM('Tunisia', 'France'),
      defaultValue: 'Tunisia',
      allowNull: false,
      field: 'investment_region',
    },
    // Referral system
    referralCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
      field: "referral_code",
    },
    referredBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "referred_by",
      references: {
        model: 'users',
        key: 'id'
      }
    },
    referralStats: {
      type: DataTypes.JSON,
      defaultValue: {
        totalReferred: 0,
        totalInvested: 0,
        totalEarned: 0
      },
      field: "referral_stats",
    },
    // Authentication fields
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_verified",
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "role_id",
    },
    approvalStatus: {
      type: DataTypes.ENUM("unverified", "pending", "approved", "rejected"),
      defaultValue: "unverified",
      field: "approval_status",
    },
    profilePicture: {
      type: DataTypes.STRING(255),
      defaultValue: "",
      field: "profile_picture",
    },
    cloudinaryPublicId: {
      type: DataTypes.STRING(255),
      defaultValue: "",
      field: "cloudinary_public_id",
    },
    failedLoginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: "failed_login_attempts",
    },
    lockedUntil: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "locked_until",
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "last_login",
    },
    refreshToken: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: "refresh_token",
    },
    refreshTokenExpires: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "refresh_token_expires",
    },
    // Email verification fields
    emailVerificationCode: {
      type: DataTypes.STRING(6),
      allowNull: true,
      field: "email_verification_code",
    },
    pendingEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "pending_email",
    },
    lastEmailChange: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "last_email_change",
    },
    // Two-Factor Authentication fields
    twoFactorSecret: {
      type: DataTypes.STRING(128),
      allowNull: true,
      field: "twoFactorSecret",
      comment: 'Base32 encoded TOTP secret for 2FA'
    },
    twoFactorEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "twoFactorEnabled",
      comment: 'Whether 2FA is enabled for this user'
    },
    backupCodes: {
      type: DataTypes.JSON,
      allowNull: true,
      field: "backupCodes",
      comment: 'JSON array of backup codes for 2FA recovery'
    },
    twoFactorSetupAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "twoFactorSetupAt",
      comment: 'Timestamp when 2FA was first set up'
    },
  },
  {
    tableName: "users",
    timestamps: true,
    underscored: true,
  }
);

module.exports = User;
