# 🏗️ Korpor Backend - Complete Developer Guide

> **A comprehensive guide to understanding, using, and modifying the Korpor financial investment backend system**

---

## 📚 Table of Contents

1. [🚀 Quick Start](#-quick-start)
2. [🏛️ System Architecture](#%EF%B8%8F-system-architecture)
3. [💾 Database Schema](#-database-schema)
4. [🔐 Authentication System](#-authentication-system)
5. [📡 API Endpoints](#-api-endpoints)
6. [🏦 Core Features](#-core-features)
7. [⚙️ Configuration](#%EF%B8%8F-configuration)
8. [🛠️ Development Guide](#%EF%B8%8F-development-guide)
9. [🔧 How to Modify Code](#-how-to-modify-code)
10. [📊 Monitoring & Health](#-monitoring--health)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16+)
- **MySQL/MariaDB** (v8.0+)
- **npm** or **yarn**

### Installation

```bash
# Clone the repository
cd backend

# Install dependencies
npm install

# Set up environment variables
cp src/env.example .env
# Edit .env with your configuration

# Start development server
npm run dev


```

### Environment Variables Setup

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=korpor_dev
DB_USER=root
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# Email Configuration (SendGrid/SMTP)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@korpor.com

# Payment Gateways
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# External Services
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## 🏛️ System Architecture

### 📁 Project Structure

```
backend/
├── src/
│   ├── 📂 config/           # Database & external service configs
│   ├── 📂 controllers/      # Business logic for each feature
│   ├── 📂 middleware/       # Authentication, validation, rate limiting
│   ├── 📂 models/          # Database models & relationships
│   ├── 📂 routes/          # API endpoint definitions
│   ├── 📂 services/        # External services & utilities
│   ├── 📂 utils/           # Helper functions
│   ├── 📂 migrations/      # Database schema changes
│   └── server.js           # Main application entry point
├── scripts/                # Database & utility scripts
├── package.json           # Dependencies & scripts
└── README files           # Documentation
```

### 🔄 Request Flow

```
Request → CORS → Rate Limiting → Authentication → Authorization → Controller → Model → Database
                                                                      ↓
Response ← JSON Format ← Error Handling ← Business Logic ← Database Query Result
```

### 🛡️ Security Layers

1. **Helmet.js** - Security headers
2. **CORS** - Cross-origin request protection
3. **Rate Limiting** - DDoS protection
4. **JWT Authentication** - Secure user sessions
5. **Input Validation** - SQL injection prevention
6. **Password Hashing** - bcrypt encryption

---

## 💾 Database Schema

### 📊 Core Tables

#### 👤 `users` Table

**Purpose**: Store user accounts and profile information

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  role_id INT,
  approval_status ENUM('unverified', 'pending', 'approved', 'rejected'),
  is_verified BOOLEAN DEFAULT FALSE,
  currency ENUM('TND', 'EUR') DEFAULT 'TND',
  investment_preference ENUM('all', 'local') DEFAULT 'all',
  investment_region ENUM('Tunisia', 'France') DEFAULT 'Tunisia',
  referral_code VARCHAR(20) UNIQUE,
  referred_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Key Fields**:

- `approval_status`: User verification workflow
- `currency`: User's preferred currency (TND/EUR)
- `referral_code`: Unique code for referral system
- `investment_preference`: Investment targeting preference

#### 💰 `wallets` Table

**Purpose**: Manage user financial balances

```sql
CREATE TABLE wallets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  currency ENUM('TND', 'EUR', 'USD') DEFAULT 'TND',
  cash_balance DECIMAL(15,2) DEFAULT 0.00,
  rewards_balance DECIMAL(15,2) DEFAULT 0.00,
  total_balance DECIMAL(15,2) DEFAULT 0.00,
  last_transaction_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 💸 `transactions` Table

**Purpose**: Track all financial transactions

```sql
CREATE TABLE transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  wallet_id INT,
  auto_invest_plan_id INT,
  type ENUM('deposit', 'withdrawal', 'investment', 'autoinvest_failed') NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency ENUM('TND', 'EUR', 'USD') NOT NULL,
  status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
  description TEXT,
  reference VARCHAR(100),
  balance_type ENUM('cash', 'rewards') DEFAULT 'cash',
  metadata JSON,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (wallet_id) REFERENCES wallets(id)
);
```

#### 🤖 `auto_invest_plans` Table

**Purpose**: Automated investment configurations

```sql
CREATE TABLE auto_invest_plans (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  monthly_amount DECIMAL(15,2) NOT NULL,
  currency ENUM('TND', 'EUR') DEFAULT 'TND',
  theme ENUM('growth', 'income', 'balanced', 'index') NOT NULL,
  status ENUM('active', 'paused', 'cancelled') DEFAULT 'active',
  deposit_day INT NOT NULL CHECK (deposit_day BETWEEN 1 AND 28),
  next_deposit_date DATE,
  last_deposit_date DATE,
  total_deposited DECIMAL(15,2) DEFAULT 0,
  total_invested DECIMAL(15,2) DEFAULT 0,
  risk_level ENUM('low', 'medium', 'high') DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 🏢 `projects` Table

**Purpose**: Real estate investment opportunities

```sql
CREATE TABLE projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  price DECIMAL(15,2),
  currency ENUM('TND', 'EUR', 'USD') DEFAULT 'TND',
  property_type ENUM('apartment', 'house', 'commercial', 'land'),
  status ENUM('active', 'funded', 'completed', 'cancelled') DEFAULT 'active',
  target_amount DECIMAL(15,2),
  raised_amount DECIMAL(15,2) DEFAULT 0,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### 🔗 Database Relationships

#### One-to-One Relationships:

- **User → Wallet**: Each user has one wallet
- **User → Verification**: Each user has one verification record

#### One-to-Many Relationships:

- **User → Transactions**: Users can have multiple transactions
- **User → AutoInvest Plans**: Users can have multiple investment plans
- **User → Projects**: Users can create multiple projects
- **Wallet → Transactions**: Wallets track multiple transactions

#### Many-to-Many Relationships:

- **Users → Projects** (through investments): Users can invest in multiple projects

---

## 🔐 Authentication System

### 🎯 Authentication Flow

```
1. User Registration → Email Verification → Account Approval
2. User Login → Password Check → JWT Token Generation
3. API Request → Token Validation → Route Access
4. Token Refresh → New Access Token
```

### 🔑 JWT Token Structure

```javascript
// Access Token (1 hour expiry)
{
  userId: 123,
  email: "user@example.com",
  role: "user",
  iat: 1640995200,
  exp: 1640998800
}

// Refresh Token (7 days expiry)
{
  userId: 123,
  type: "refresh",
  iat: 1640995200,
  exp: 1641600000
}
```

### 🛡️ Middleware Stack

1. **`authenticate.js`**: Validates JWT tokens
2. **`authorize.js`**: Checks user permissions
3. **`roleMiddleware.js`**: Role-based access control
4. **`loginLimiter.js`**: Brute force protection

### 👮 User Roles & Permissions

```javascript
const roles = {
  user: {
    permissions: ["read_own_profile", "create_investments", "manage_wallet"],
  },
  admin: {
    permissions: ["manage_users", "approve_projects", "system_config"],
  },
  super_admin: {
    permissions: ["all_permissions", "delete_users", "system_admin"],
  },
};
```

---

## 📡 API Endpoints

### 🔐 Authentication Endpoints

#### POST `/api/auth/register`

**Purpose**: Create new user account

```javascript
// Request Body
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "+21612345678"
}

// Response
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 123,
      "name": "John Doe",
      "email": "john@example.com",
      "isVerified": false
    }
  }
}
```

#### POST `/api/auth/login`

**Purpose**: Authenticate user and get tokens

```javascript
// Request Body
{
  "email": "john@example.com",
  "password": "securePassword123"
}

// Response
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 123,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

### 💰 Wallet Management

#### GET `/api/wallet/balance`

**Purpose**: Get user's wallet balance

```javascript
// Headers: Authorization: Bearer <token>
// Response
{
  "success": true,
  "data": {
    "wallet": {
      "cashBalance": 1500.50,
      "rewardsBalance": 25.00,
      "totalBalance": 1525.50,
      "currency": "TND"
    }
  }
}
```

#### POST `/api/wallet/deposit`

**Purpose**: Add funds to wallet

```javascript
// Request Body
{
  "amount": 500.00,
  "paymentMethodId": "pm_1234567890",
  "currency": "TND"
}

// Response
{
  "success": true,
  "data": {
    "transaction": {
      "id": 456,
      "amount": 500.00,
      "status": "completed",
      "type": "deposit"
    },
    "newBalance": 2000.50
  }
}
```

### 🤖 AutoInvest System

#### POST `/api/autoinvest`

**Purpose**: Create automated investment plan

```javascript
// Request Body
{
  "monthlyAmount": 2000,
  "theme": "balanced",
  "depositDay": 15,
  "riskLevel": "medium"
}

// Response
{
  "success": true,
  "data": {
    "autoInvestPlan": {
      "id": 789,
      "monthlyAmount": 2000,
      "theme": "balanced",
      "status": "active",
      "nextDepositDate": "2024-01-15"
    }
  }
}
```

#### GET `/api/autoinvest/stats`

**Purpose**: Get investment performance statistics

```javascript
// Response
{
  "success": true,
  "data": {
    "stats": {
      "hasActivePlan": true,
      "totalDeposited": 12000.00,
      "totalInvested": 11800.00,
      "totalReturns": 745.32,
      "currentPortfolioValue": 12545.32,
      "averageMonthlyReturn": 124.22,
      "projectedAnnualReturn": 1490.64,
      "returnOnInvestment": 6.31,
      "annualizedReturn": 7.8
    }
  }
}
```

### 💳 Payment System

#### GET `/api/payment/methods`

**Purpose**: Get available payment methods

```javascript
// Response
{
  "status": "success",
  "payment_methods": {
    "stripe": {
      "name": "Credit/Debit Card",
      "enabled": true,
      "supported_currencies": ["USD", "EUR", "TND"]
    },
    "payme": {
      "name": "PayMe",
      "enabled": false
    }
  }
}
```

#### GET `/api/payment/saved-methods`

**Purpose**: Get user's saved payment methods

```javascript
// Response
{
  "status": "success",
  "payment_methods": [
    {
      "id": 1,
      "type": "stripe",
      "card": {
        "brand": "visa",
        "last4": "4242",
        "exp_month": 12,
        "exp_year": 2027
      },
      "is_default": true
    }
  ]
}
```

---

## 🏦 Core Features

### 👤 User Management

#### User Registration & Verification

1. **Registration**: User creates account with email/phone
2. **Email Verification**: 6-digit code sent to email
3. **Phone Verification**: SMS verification (optional)
4. **Profile Completion**: Additional details for KYC
5. **Admin Approval**: Manual review for high-risk accounts

#### Account Security

- **Password Hashing**: bcrypt with salt rounds
- **Account Locking**: After 5 failed login attempts
- **Two-Factor Authentication**: TOTP-based 2FA
- **Session Management**: JWT with refresh tokens

### 💰 Financial System

#### Wallet Management

- **Multi-Currency Support**: TND, EUR, USD
- **Balance Types**: Cash balance, Rewards balance
- **Transaction History**: Complete audit trail
- **Real-time Updates**: Instant balance updates

#### Payment Processing

- **Stripe Integration**: Credit/debit cards
- **PayMe Integration**: Local Tunisian payments
- **Crypto Support**: Bitcoin, Ethereum, USDT, USDC
- **Saved Payment Methods**: Secure tokenized storage

### 🤖 AutoInvest System

#### Investment Automation

- **Scheduled Deposits**: Monthly automatic investments
- **Theme-Based Allocation**: Growth, Income, Balanced, Index
- **Risk Management**: Low, Medium, High risk levels
- **Performance Tracking**: Real-time ROI calculations

#### Statistical Analysis

- **Compound Interest Calculations**: Monthly compounding
- **Performance Metrics**: Multiple return calculations
- **Future Projections**: 1-year portfolio predictions
- **Efficiency Tracking**: Deposit utilization rates

### 🏢 Project Investment

#### Real Estate Projects

- **Project Listings**: Available investment opportunities
- **Investment Tracking**: User investment history
- **Rental Income**: Distribution to investors
- **Document Management**: Project documentation

---

## ⚙️ Configuration

### 🗄️ Database Configuration

**File**: `src/config/db.config.js`

```javascript
const config = {
  development: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || "korpor_dev",
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    dialect: "mysql",
    logging: console.log,
  },
  production: {
    // Production settings with connection pooling
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
};
```

### 📧 Email Configuration

**File**: `src/config/email.config.js`

```javascript
const emailConfig = {
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    from: process.env.FROM_EMAIL,
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },
};
```

### 🔐 Security Configuration

```javascript
// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // requests per window
  message: "Too many requests",
});

// CORS settings
const corsOptions = {
  origin: ["http://localhost:3000", "https://yourapp.com"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};
```

---

## 🛠️ Development Guide

### 🚀 Running the Application

#### Development Mode

```bash
# Start with hot reloading
npm run dev

# With environment variables
NODE_ENV=development npm run dev

# With debugging
DEBUG=* npm run dev
```

#### Production Mode

```bash
# Build and start
npm start

# With PM2 process manager
pm2 start src/server.js --name "korpor-backend"
```

### 🧪 Testing

#### Database Testing

```bash
# Test database connection
node scripts/test-db-connection.js

# Run migrations
node src/migrations/runMigrations.js

# Add test data
node add-test-data.js
```

#### API Testing

```bash
# Test specific endpoints
node test-auth-scenarios.js
node test-wallet-api.js
node test-investment-endpoints.js
```

### 📊 Database Migrations

#### Running Migrations

```bash
# Run all pending migrations
npx sequelize-cli db:migrate

# Rollback last migration
npx sequelize-cli db:migrate:undo

# Create new migration
npx sequelize-cli migration:generate --name add-new-column
```

#### Migration Example

```javascript
// migrations/20240101_add_new_feature.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("users", "new_field", {
      type: Sequelize.STRING(100),
      allowNull: true,
      defaultValue: null,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("users", "new_field");
  },
};
```

---

## 🔧 How to Modify Code

### 📝 Adding New API Endpoints

#### 1. Create Controller Function

**File**: `src/controllers/yourController.js`

```javascript
// Example: Create new user preference endpoint
exports.updateUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { theme, language, notifications } = req.body;

    // Validation
    if (!theme || !language) {
      return res.status(400).json({
        success: false,
        message: "Theme and language are required",
      });
    }

    // Update user preferences
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.update({
      preferences: { theme, language, notifications },
    });

    res.json({
      success: true,
      data: { preferences: user.preferences },
      message: "Preferences updated successfully",
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update preferences",
    });
  }
};
```

#### 2. Add Route Definition

**File**: `src/routes/userRoutes.js`

```javascript
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authenticate");
const userController = require("../controllers/userController");

// Add new route
router.put("/preferences", authenticate, userController.updateUserPreferences);

module.exports = router;
```

#### 3. Update Swagger Documentation

```javascript
/**
 * @swagger
 * /api/user/preferences:
 *   put:
 *     summary: Update user preferences
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               theme:
 *                 type: string
 *                 enum: [light, dark]
 *               language:
 *                 type: string
 *                 enum: [en, fr, ar]
 */
```

### 🗃️ Adding New Database Tables

#### 1. Create Model

**File**: `src/models/NewFeature.js`

```javascript
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

const NewFeature = sequelize.define(
  "NewFeature",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
      references: {
        model: "users",
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
    },
  },
  {
    tableName: "new_features",
    timestamps: true,
    underscored: true,
  }
);

module.exports = NewFeature;
```

#### 2. Add Associations

**File**: `src/models/associations.js`

```javascript
// Add to existing associations
User.hasMany(NewFeature, {
  foreignKey: "userId",
  as: "newFeatures",
});

NewFeature.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});
```

#### 3. Create Migration

```javascript
// migrations/20240101_create_new_features.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("new_features", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("active", "inactive"),
        defaultValue: "active",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });

    // Add indexes
    await queryInterface.addIndex("new_features", ["user_id"]);
    await queryInterface.addIndex("new_features", ["status"]);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("new_features");
  },
};
```

### 🔐 Adding Authentication to Endpoints

#### Apply Authentication Middleware

```javascript
// For routes requiring authentication
router.get("/protected", authenticate, controller.protectedFunction);

// For routes requiring specific roles
router.get(
  "/admin-only",
  authenticate,
  authorize(["admin"]),
  controller.adminFunction
);

// For routes with rate limiting
router.post(
  "/sensitive",
  loginLimiter,
  authenticate,
  controller.sensitiveFunction
);
```

#### Create Custom Middleware

```javascript
// middleware/customAuth.js
const customAuth = (requiredPermissions = []) => {
  return async (req, res, next) => {
    try {
      // Check if user has required permissions
      const userPermissions = req.user.permissions || [];
      const hasPermission = requiredPermissions.every((permission) =>
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions",
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Authorization check failed",
      });
    }
  };
};
```

### 💾 Database Query Examples

#### Complex Queries with Sequelize

```javascript
// Join multiple tables
const usersWithWallets = await User.findAll({
  include: [
    {
      model: Wallet,
      as: "wallet",
      attributes: ["cashBalance", "currency"],
    },
    {
      model: Transaction,
      as: "transactions",
      where: { status: "completed" },
      required: false,
    },
  ],
  where: {
    isVerified: true,
    approvalStatus: "approved",
  },
});

// Aggregate queries
const investmentStats = await Transaction.findAll({
  attributes: [
    "userId",
    [sequelize.fn("SUM", sequelize.col("amount")), "totalInvested"],
    [sequelize.fn("COUNT", sequelize.col("id")), "transactionCount"],
  ],
  where: {
    type: "investment",
    status: "completed",
  },
  group: ["userId"],
});

// Raw SQL for complex operations
const [results] = await sequelize.query(`
  SELECT 
    u.id,
    u.name,
    w.cash_balance,
    COUNT(t.id) as transaction_count
  FROM users u
  LEFT JOIN wallets w ON u.id = w.user_id
  LEFT JOIN transactions t ON u.id = t.user_id
  WHERE u.approval_status = 'approved'
  GROUP BY u.id, u.name, w.cash_balance
  ORDER BY w.cash_balance DESC
  LIMIT 10
`);
```

---

## 📊 Monitoring & Health

### 🔍 Health Check Endpoints

#### Basic Health Check

```javascript
// GET /health
{
  "status": "OK",
  "service": "korpor-backend",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "memory": {
    "used": 125829120,
    "total": 2147483648
  }
}
```

#### Database Health Check

```javascript
// GET /db-health
{
  "status": "healthy",
  "connection": "active",
  "tables": [
    { "name": "users", "rows": 1250 },
    { "name": "wallets", "rows": 1180 },
    { "name": "transactions", "rows": 5630 }
  ],
  "responseTime": "45ms"
}
```

### 📈 Performance Monitoring

#### Request Logging

```javascript
// Add to middleware stack
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`
    );
  });

  next();
};
```

#### Error Tracking

```javascript
// Global error handler
const errorHandler = (error, req, res, next) => {
  console.error("Error details:", {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Send error response
  res.status(error.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : error.message,
  });
};
```

### 🚨 Scheduled Tasks

#### AutoInvest Processing

```javascript
// services/autoInvestScheduler.js
const cron = require("node-cron");

// Run daily at 9 AM
cron.schedule("0 9 * * *", async () => {
  console.log("🔄 Processing AutoInvest deposits...");

  try {
    const result = await processAutoInvestDeposits();
    console.log(`✅ Processed ${result.processed} deposits`);
  } catch (error) {
    console.error("❌ AutoInvest processing failed:", error);
  }
});
```

---

## 🎯 Common Patterns & Best Practices

### 📝 API Response Format

**Always use consistent response structure:**

```javascript
// Success Response
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully"
}

// Error Response
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error info (development only)"
}
```

### 🔐 Security Checklist

- ✅ Always validate input data
- ✅ Use parameterized queries (Sequelize handles this)
- ✅ Implement rate limiting on sensitive endpoints
- ✅ Hash passwords with bcrypt
- ✅ Validate JWT tokens on protected routes
- ✅ Log security events
- ✅ Use HTTPS in production

### 🗄️ Database Best Practices

- ✅ Use foreign key constraints
- ✅ Add indexes on frequently queried columns
- ✅ Use transactions for multi-table operations
- ✅ Implement soft deletes when needed
- ✅ Regular backups and migration testing

### 🚀 Performance Tips

- ✅ Use database indexes wisely
- ✅ Implement query result caching
- ✅ Use connection pooling
- ✅ Monitor slow queries
- ✅ Optimize N+1 query problems with includes

---

## 🆘 Troubleshooting Guide

### 🔧 Common Issues

#### Database Connection Problems

```bash
# Test database connection
node scripts/test-db-connection.js

# Check database credentials
mysql -u root -p -h localhost korpor_dev

# Verify environment variables
echo $DB_HOST $DB_NAME $DB_USER
```

#### Authentication Issues

```bash
# Test JWT token
node -e "const jwt = require('jsonwebtoken'); console.log(jwt.verify('YOUR_TOKEN', 'YOUR_SECRET'));"

# Check user status
node check-users.js
```

#### Migration Problems

```bash
# Check migration status
npx sequelize-cli db:migrate:status

# Force migration
npx sequelize-cli db:migrate --force

# Rollback and retry
npx sequelize-cli db:migrate:undo
npx sequelize-cli db:migrate
```

### 📞 Getting Help

#### Log Files Location

- **Application Logs**: Console output (use PM2 logs in production)
- **Database Logs**: MySQL error log
- **Access Logs**: Express request logs

#### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev

# Database query logging
NODE_ENV=development npm run dev
```

---

## 📖 Additional Resources

### 📚 Documentation Links

- [Sequelize ORM Documentation](https://sequelize.org/docs/v6/)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [JWT Introduction](https://jwt.io/introduction)
- [MySQL Documentation](https://dev.mysql.com/doc/)

### 🛠️ Useful Tools

- **Database GUI**: MySQL Workbench, phpMyAdmin, DBeaver
- **API Testing**: Postman, Insomnia, Thunder Client
- **Monitoring**: PM2, New Relic, DataDog
- **Documentation**: Swagger UI (available at `/api-docs`)

---

**Last Updated**: January 2024
**Version**: 1.0.0
**Maintainer**: Korpor Development Team

---

## 🔍 Deep Dive: Authentication Flow & Data Movement

### 🚀 Complete User Journey: From Login Click to Authenticated Actions

This section explains **exactly** what happens underneath when a user clicks login and performs subsequent actions, including how data flows, tokens are generated, stored, and used.

---

## 📱➡️🖥️ Step 1: User Clicks Login (Frontend to Backend)

### 🎯 Frontend Input Collection

```javascript
// Front-end login form submission
const loginData = {
  email: "user@example.com",
  password: "userPassword123",
};

// Frontend sends HTTP POST request
fetch(`${API_URL}/api/auth/login`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  body: JSON.stringify(loginData),
});
```

### 🌐 HTTP Request Journey

```
Frontend Input → HTTP POST Request → CORS Check → Rate Limiting → Backend Controller
```

**Exact HTTP Request:**

```http
POST /api/auth/login HTTP/1.1
Host: your-api-domain.com
Content-Type: application/json
Accept: application/json
User-Agent: mobile-app/1.0

{
  "email": "user@example.com",
  "password": "userPassword123"
}
```

---

## 🔐 Step 2: Backend Authentication Process

### 📋 What Happens in `authController.login()`

```javascript
// File: src/controllers/authController.js
exports.login = async (req, res) => {
  try {
    // 1. Extract email and password from request body
    const { email, password } = req.body;

    // 2. Find user in database by email
    const user = await User.findOne({
      where: { email: email.toLowerCase() },
      include: [{ model: Wallet, as: "wallet" }],
    });

    // 3. Verify user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 4. Compare provided password with hashed password in database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // 5. Check password validity
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 6. Generate JWT Access Token (short-lived: 1 hour)
    const accessToken = jwt.sign(
      {
        userId: user.id, // ← USER ID EMBEDDED HERE
        email: user.email, // ← EMAIL EMBEDDED HERE
        role: user.role_id, // ← ROLE EMBEDDED HERE
        approvalStatus: user.approval_status,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 7. Generate Refresh Token (long-lived: 7 days)
    const refreshToken = jwt.sign(
      {
        userId: user.id, // ← USER ID EMBEDDED HERE
        type: "refresh",
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // 8. Update user's last login timestamp
    await user.update({ lastLoginAt: new Date() });

    // 9. Send response back to frontend
    res.json({
      success: true,
      data: {
        accessToken, // ← TOKEN SENT TO FRONTEND
        refreshToken, // ← REFRESH TOKEN SENT TO FRONTEND
        user: {
          id: user.id, // ← USER DATA SENT TO FRONTEND
          name: user.name,
          email: user.email,
          role: user.role_id,
          approvalStatus: user.approval_status,
          wallet: user.wallet,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};
```

### 🔑 Token Structure Breakdown

**Access Token Payload:**

```javascript
{
  "userId": 123,                    // ← Primary identifier for user
  "email": "user@example.com",     // ← User email for reference
  "role": 2,                       // ← Role ID for authorization
  "approvalStatus": "approved",    // ← Account status
  "iat": 1704025200,              // ← Token issued at timestamp
  "exp": 1704028800               // ← Token expiry timestamp
}
```

**Refresh Token Payload:**

```javascript
{
  "userId": 123,                   // ← User ID to identify user
  "type": "refresh",              // ← Token type identifier
  "iat": 1704025200,             // ← Token issued at timestamp
  "exp": 1704630000              // ← Token expiry (7 days)
}
```

---

## 📱⬅️🖥️ Step 3: Backend Response to Frontend

### 🔄 Complete HTTP Response

```http
HTTP/1.1 200 OK
Content-Type: application/json
Access-Control-Allow-Origin: *
Content-Length: 1024

{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicm9sZSI6MiwiYXBwcm92YWxTdGF0dXMiOiJhcHByb3ZlZCIsImlhdCI6MTcwNDAyNTIwMCwiZXhwIjoxNzA0MDI4ODAw.signature",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3MDQwMjUyMDAsImV4cCI6MTcwNDYzMDAwMH0.signature",
    "user": {
      "id": 123,
      "name": "John Doe",
      "email": "user@example.com",
      "role": 2,
      "approvalStatus": "approved",
      "wallet": {
        "cashBalance": 1500.50,
        "currency": "TND"
      }
    }
  }
}
```

### 📱 Frontend Token Storage

```javascript
// Frontend receives and stores tokens
const response = await fetch("/api/auth/login", {
  /* ... */
});
const result = await response.json();

if (result.success) {
  // Store tokens in secure storage
  await AsyncStorage.setItem("accessToken", result.data.accessToken);
  await AsyncStorage.setItem("refreshToken", result.data.refreshToken);

  // Store user data in app state/context
  setUser(result.data.user);

  // Navigate to authenticated screens
  navigation.navigate("Dashboard");
}
```

---

## 🔒 Step 4: Using Tokens for Subsequent Actions

### 🎯 How Every Authenticated Request Works

When user performs any action (check balance, make investment, etc.):

#### 📱 Frontend Prepares Request

```javascript
// Example: User clicks "Check Wallet Balance"
const checkBalance = async () => {
  // 1. Retrieve stored token
  const accessToken = await AsyncStorage.getItem("accessToken");

  // 2. Make authenticated request
  const response = await fetch(`${API_URL}/api/wallet/balance`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`, // ← TOKEN SENT HERE
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();
  // Handle response...
};
```

#### 🔐 Backend Token Validation Process

```javascript
// File: src/middleware/authenticate.js
const authenticate = (req, res, next) => {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Remove "Bearer " prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    // 2. Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Extract user information from token
    req.user = {
      id: decoded.userId, // ← USER ID EXTRACTED FROM TOKEN
      email: decoded.email, // ← EMAIL EXTRACTED FROM TOKEN
      role: decoded.role, // ← ROLE EXTRACTED FROM TOKEN
      approvalStatus: decoded.approvalStatus,
    };

    // 4. Continue to next middleware/controller
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
        code: "TOKEN_EXPIRED",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};
```

### 🎯 What Data Is Available in Controllers

```javascript
// File: src/controllers/walletController.js
exports.getBalance = async (req, res) => {
  try {
    // ← req.user contains data extracted from JWT token:
    const userId = req.user.id; // ← USER ID (PRIMARY KEY)
    const userEmail = req.user.email; // ← USER EMAIL
    const userRole = req.user.role; // ← USER ROLE

    // Find user's wallet using ID from token
    const wallet = await Wallet.findOne({
      where: { user_id: userId }, // ← USING USER ID FROM TOKEN
      include: [{ model: User, as: "user" }],
    });

    res.json({
      success: true,
      data: { wallet },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get balance",
    });
  }
};
```

---

## 🔄 Step 5: Complete Request-Response Cycle

### 📊 Authenticated Action Flow Diagram

```
[User Clicks Action]
       ↓
[Frontend Gets Token from Storage]
       ↓
[HTTP Request with Authorization Header]
       ↓
[Backend Receives Request]
       ↓
[authenticate() Middleware]
       ↓
[JWT Token Verification]
       ↓
[Extract User Data from Token]
       ↓
[Set req.user = { id, email, role }]
       ↓
[Controller Function Executes]
       ↓
[Database Query Using req.user.id]
       ↓
[Return Response to Frontend]
       ↓
[Frontend Updates UI]
```

### 🔍 Exact HTTP Request & Response Example

**Frontend Request:**

```http
GET /api/wallet/balance HTTP/1.1
Host: your-api-domain.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicm9sZSI6MiwiYXBwcm92YWxTdGF0dXMiOiJhcHByb3ZlZCIsImlhdCI6MTcwNDAyNTIwMCwiZXhwIjoxNzA0MDI4ODAw.signature
Content-Type: application/json
```

**Backend Processing:**

```javascript
// Middleware extracts from token:
req.user = {
  id: 123, // ← THIS IS THE PRIMARY KEY USED FOR DB QUERIES
  email: "user@example.com", // ← REFERENCE DATA
  role: 2, // ← AUTHORIZATION DATA
  approvalStatus: "approved", // ← STATUS DATA
};

// Controller uses user ID:
const wallet = await Wallet.findOne({ where: { user_id: 123 } });
```

**Backend Response:**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "data": {
    "wallet": {
      "id": 456,
      "user_id": 123,           // ← MATCHES TOKEN USER ID
      "cashBalance": 1500.50,
      "rewardsBalance": 25.00,
      "totalBalance": 1525.50,
      "currency": "TND"
    }
  }
}
```

---

## 🎯 Key Points About Data Flow

### ✅ What Gets Passed Around

1. **Primary Identifier**: `user.id` (integer) - This is the DATABASE PRIMARY KEY
2. **Token Payload**: Contains user ID, email, role, approval status
3. **Database Queries**: Always use `req.user.id` to filter user-specific data
4. **Security**: User can only access their own data (filtered by user_id)

### 🔐 Security Mechanisms

```javascript
// Every authenticated endpoint follows this pattern:
exports.someAction = async (req, res) => {
  const userId = req.user.id; // ← USER ID FROM JWT TOKEN

  // Query ALWAYS filters by user ID to ensure data isolation
  const userSpecificData = await SomeModel.findAll({
    where: { user_id: userId }, // ← SECURITY: USER CAN ONLY SEE THEIR DATA
  });

  res.json({ data: userSpecificData });
};
```

### 🔄 Token Refresh Process

When access token expires:

```javascript
// Frontend detects expired token (401 response)
if (response.status === 401 && error.code === "TOKEN_EXPIRED") {
  // Use refresh token to get new access token
  const refreshToken = await AsyncStorage.getItem("refreshToken");

  const refreshResponse = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: { Authorization: `Bearer ${refreshToken}` },
  });

  const newTokens = await refreshResponse.json();

  // Store new access token
  await AsyncStorage.setItem("accessToken", newTokens.accessToken);

  // Retry original request with new token
  return retryOriginalRequest();
}
```

### 📈 Performance Considerations

- **No Database Lookup on Every Request**: User data comes from JWT token decode
- **Stateless Authentication**: Server doesn't store session data
- **Efficient Queries**: All user data queries use indexed `user_id` column
- **Token Validation**: O(1) operation using cryptographic signature verification

---

## 🏁 Summary: The Complete Data Journey

1. **Login**: Email/password → Backend validates → Generates JWT with user ID embedded
2. **Token Storage**: Frontend stores JWT in secure storage
3. **Authenticated Requests**: Frontend sends JWT in Authorization header
4. **Token Validation**: Backend decodes JWT, extracts user ID (no DB lookup needed)
5. **Data Access**: Controllers use `req.user.id` to query user-specific data
6. **Response**: Backend returns only data belonging to authenticated user
7. **Security**: User isolation enforced by filtering all queries with user_id

**The user ID is the core identifier that flows through the entire system, embedded in JWTs for stateless authentication and used as the primary key for all database operations.**
