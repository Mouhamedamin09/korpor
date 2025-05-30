# 🏦 Money Management Tools

This directory contains administrative tools for managing user wallets and adding money to user accounts. These tools provide an easy way to control money management in your backend system.

## 📋 Available Tools

### 1. 🔍 List Users (`list-users.js`)

View all users with their wallet balances and search for specific users.

**Usage:**

```bash
# List first 50 users
node scripts/list-users.js

# List first 100 users
node scripts/list-users.js 100

# List 50 users starting from offset 100
node scripts/list-users.js 50 100

# Search for users containing "john"
node scripts/list-users.js search "john"

# Show detailed info for user ID 123
node scripts/list-users.js details 123

# Show help
node scripts/list-users.js --help
```

**Example Output:**

```
👥 USER LIST (Showing 50 of 150 users)
====================================================================================================
ID    Name                     Email                         Cash Balance   Rewards        Total
----------------------------------------------------------------------------------------------------
1     John Doe                 john@example.com              100.00 TND     25.00 TND      125.00 TND
2     Jane Smith               jane@example.com              50.00 TND      10.00 TND      60.00 TND
3     Bob Johnson              bob@example.com               No wallet      -              -
```

### 2. 💰 Interactive Money Addition (`admin-add-money.js`)

Interactive tool for adding money to individual user wallets.

**Usage:**

```bash
node scripts/admin-add-money.js
```

**Features:**

- Interactive prompts for user ID, amount, and description
- Validates user exists before proceeding
- Shows current wallet details
- Supports both cash and rewards balance types
- Confirmation step before processing
- Detailed transaction logging

**Example Session:**

```
🏦 ADMIN MONEY MANAGEMENT TOOL
================================
👤 Enter User ID: 1
✅ User found: John Doe (ID: 1)

💳 WALLET DETAILS:
👤 User: John Doe (ID: 1)
💵 Cash Balance: 100.00 TND
🎁 Rewards Balance: 25.00 TND
💰 Total Balance: 125.00 TND

💵 Enter amount to add: 50
📊 Balance type (cash/rewards) [default: cash]: cash
📝 Description (optional): Promotion bonus

🔍 CONFIRMATION:
👤 User: John Doe (ID: 1)
💵 Amount: 50 TND
📊 Balance Type: cash
📝 Description: Promotion bonus

✅ Confirm this operation? (yes/no): yes

✅ SUCCESS: Added 50 TND to user 1's cash balance
📊 Previous cash balance: 100.00 TND
📊 New cash balance: 150.00 TND
📊 Total balance: 175.00 TND
🧾 Transaction ID: 45
```

### 3. 📊 Batch Money Addition (`batch-add-money.js`)

Process multiple money additions at once using CSV files or command line.

**Usage:**

#### CSV File Processing:

```bash
# Preview mode (shows what would happen)
node scripts/batch-add-money.js users.csv

# Execute the transactions
node scripts/batch-add-money.js users.csv --execute

# Create a sample CSV file
node scripts/batch-add-money.js --sample
```

#### Direct Command Line:

```bash
# Add 100 cash to user 1
node scripts/batch-add-money.js --direct 1 100 cash "Welcome bonus"

# Add 50 rewards to user 2
node scripts/batch-add-money.js --direct 2 50 rewards "Referral reward"
```

#### CSV Format:

```csv
userId,amount,balanceType,description
1,100.00,cash,Welcome bonus
2,50.00,rewards,Referral reward
3,25.00,cash,Promotion credit
4,75.00,cash,Contest prize
```

**CSV Fields:**

- `userId` (required): The user ID to add money to
- `amount` (required): Amount to add (positive number)
- `balanceType` (optional): Either "cash" or "rewards" (default: "cash")
- `description` (optional): Description for the transaction

## 🚀 Quick Start Guide

### Step 1: Find Users

First, find the user IDs you want to add money to:

```bash
cd backend
node scripts/list-users.js search "john"
```

### Step 2: Add Money (Choose One Method)

#### Method A: Interactive (Single User)

```bash
node scripts/admin-add-money.js
# Follow the prompts
```

#### Method B: Command Line (Single User)

```bash
node scripts/batch-add-money.js --direct 1 100 cash "Bonus payment"
```

#### Method C: CSV Batch (Multiple Users)

1. Create a CSV file with your data:

```csv
userId,amount,balanceType,description
1,100.00,cash,Welcome bonus
2,50.00,rewards,Referral reward
```

2. Preview the operations:

```bash
node scripts/batch-add-money.js my-payments.csv
```

3. Execute if everything looks correct:

```bash
node scripts/batch-add-money.js my-payments.csv --execute
```

## 📝 Transaction Logging

All money additions are automatically logged with:

- ✅ Transaction records in the database
- 🧾 Unique transaction IDs and references
- 📊 Balance type tracking (cash vs rewards)
- 📅 Timestamps and metadata
- 👤 Admin identification

## 🔒 Safety Features

### Validation

- ✅ User existence validation
- ✅ Amount validation (positive numbers only)
- ✅ Balance type validation
- ✅ Database connection checks

### Confirmation

- 🔍 Preview mode for batch operations
- ✅ Confirmation prompts for interactive mode
- 📋 Detailed operation summaries

### Error Handling

- ❌ Graceful error handling and rollbacks
- 📝 Detailed error messages
- 🔄 Transaction atomicity (all-or-nothing)

## 📁 File Locations

All scripts are located in the `backend/scripts/` directory:

```
backend/scripts/
├── admin-add-money.js        # Interactive money addition
├── batch-add-money.js        # Batch processing
├── list-users.js            # User listing and search
└── README-MONEY-MANAGEMENT.md # This file
```

## 🔧 Requirements

- Node.js environment
- Database connection configured
- Sequelize models loaded
- Proper permissions to modify wallet data

## 🆘 Troubleshooting

### Database Connection Issues

```bash
# Test database connection
node scripts/test-db-connection.js
```

### User Not Found

Use the list-users tool to verify the user ID exists:

```bash
node scripts/list-users.js details 123
```

### Invalid CSV Format

Use the sample generator to see correct format:

```bash
node scripts/batch-add-money.js --sample
```

## 📊 Examples

### Example 1: Add Welcome Bonus to New Users

```bash
# Find new users
node scripts/list-users.js search "new"

# Add welcome bonus
node scripts/batch-add-money.js --direct 15 100 cash "Welcome bonus"
```

### Example 2: Monthly Rewards Distribution

1. Create CSV file `monthly-rewards.csv`:

```csv
userId,amount,balanceType,description
1,25.00,rewards,Monthly loyalty reward
2,30.00,rewards,Monthly loyalty reward
3,20.00,rewards,Monthly loyalty reward
```

2. Preview and execute:

```bash
node scripts/batch-add-money.js monthly-rewards.csv
node scripts/batch-add-money.js monthly-rewards.csv --execute
```

### Example 3: Contest Prize Distribution

```bash
# Winner gets 500 cash
node scripts/batch-add-money.js --direct 42 500 cash "Contest 1st place"

# Runners up get 100 rewards each
node scripts/batch-add-money.js --direct 43 100 rewards "Contest 2nd place"
node scripts/batch-add-money.js --direct 44 100 rewards "Contest 3rd place"
```

## 🔐 Security Notes

- 🚨 These tools have direct database access - use responsibly
- 👥 Only authorized administrators should have access
- 📝 All transactions are logged and auditable
- 🔒 Consider implementing additional authentication for production use

## 📞 Support

If you encounter any issues with these tools:

1. Check the database connection
2. Verify user IDs exist using `list-users.js`
3. Review the transaction logs in the database
4. Check console output for detailed error messages

---

_Happy money managing! 💰_
