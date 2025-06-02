# Portfolio Calculation System Documentation

## Overview

This document explains how the portfolio system calculates and displays user investment data in the Korpor platform. The portfolio system integrates backend calculations with real-time frontend display to provide users with accurate investment metrics, performance tracking, and growth projections.

## 📊 Portfolio Metrics Calculated

### 1. **Portfolio Totals** (`/api/portfolio/totals`)

#### Core Metrics:

- **Total Invested**: User's cumulative investment amount
- **Total Returns**: Earnings from rent payouts and referral bonuses
- **Portfolio Value**: Total invested + Total returns
- **Monthly Income**: Estimated monthly earnings based on portfolio value
- **Average Yield**: Annualized return percentage based on historical performance

#### Data Sources:

```javascript
// From Users table
totalInvested = User.investmentTotal

// From Transactions table (rent_payout + referral_bonus)
totalReturns = SUM(transactions WHERE type IN ['rent_payout', 'referral_bonus'])

// Calculated
portfolioValue = totalInvested + totalReturns
monthlyIncome = (totalInvested × 0.065) ÷ 12
```

#### Currency Conversion:

```javascript
// Exchange rates (base: TND)
const exchangeRates = {
  USD: { TND: 3.16, EUR: 0.85 },
  EUR: { TND: 3.32, USD: 1.18 },
  TND: { USD: 0.32, EUR: 0.3 }
};

// Convert to user's preferred currency
localValue = portfolioValue × exchangeRates[fromCurrency][toCurrency]
```

### 2. **Automation Status** (`/api/portfolio/automation`)

#### AutoInvest Detection:

```sql
SELECT * FROM auto_invest_plans
WHERE user_id = ? AND status = 'active'
```

#### Response Structure:

```javascript
{
  autoInvestSetup: boolean,
  autoReinvestSetup: boolean,
  autoInvestDetails: {
    id: number,
    monthlyAmount: number,
    theme: string,
    status: string,
    depositDay: number,
    nextDepositDate: string,
    currency: string
  }
}
```

### 3. **Portfolio Performance** (`/api/portfolio/performance`)

#### Time Period Filtering:

- **1M**: Last 30 days
- **3M**: Last 90 days
- **6M**: Last 180 days
- **1Y**: Last 365 days
- **ALL**: Complete transaction history

#### Performance Calculation:

```javascript
// Filter transactions by period and type
transactions = Transaction.findAll({
  where: {
    userId: userId,
    type: ['investment', 'rent_payout', 'referral_bonus'],
    created_at: { [Op.gte]: startDate }
  }
});

// Calculate cumulative metrics
let totalInvested = 0;
let totalReturns = 0;

transactions.forEach(transaction => {
  if (transaction.type === 'investment') {
    totalInvested += transaction.amount;
  } else if (['rent_payout', 'referral_bonus'].includes(transaction.type)) {
    totalReturns += transaction.amount;
  }
});

returnPercentage = (totalReturns / totalInvested) × 100;
```

### 4. **Portfolio Projections** (`/api/portfolio/projection`)

#### Compound Interest Formula:

```javascript
// Future Value of Current Portfolio
futureValueCurrent = currentPortfolioValue × (1 + monthlyRate)^months

// Future Value of Monthly Deposits (Annuity)
futureValueDeposits = monthlyDeposit × ((1 + monthlyRate)^months - 1) / monthlyRate

// Total Projected Value
totalValue = futureValueCurrent + futureValueDeposits

// Where:
monthlyRate = yieldPct / 100 / 12
months = years × 12
```

#### Projection Calculation Example:

```javascript
// Input: $500/month for 10 years at 6.5% yield
// Current portfolio: $1,000

const monthlyDeposit = 500;
const years = 10;
const yieldPct = 6.5;
const currentPortfolioValue = 1000;

const monthlyRate = 6.5 / 100 / 12; // 0.00542
const months = 10 × 12; // 120 months

// Future value of current $1,000
const futureValueCurrent = 1000 × (1.00542)^120 = $1,910

// Future value of $500/month deposits
const futureValueDeposits = 500 × ((1.00542)^120 - 1) / 0.00542 = $83,156

// Total projected value
const totalValue = $1,910 + $83,156 = $85,066
```

## 🗄️ Database Schema

### Tables Used:

#### 1. **Users Table**

```sql
- id: Primary key
- currency: User's preferred currency (USD, EUR, TND)
- investmentTotal: Total amount invested (DECIMAL)
- investmentUsedPct: Percentage of limit used
```

#### 2. **Wallets Table**

```sql
- user_id: Foreign key to Users
- cash_balance: Available cash (DECIMAL)
- rewards_balance: Reward points balance (DECIMAL)
- currency: Wallet currency (ENUM)
- created_at, updated_at: Timestamps
```

#### 3. **Transactions Table**

```sql
- user_id: Foreign key to Users
- type: Transaction type (ENUM)
  - 'investment': Money invested in properties
  - 'rent_payout': Monthly rental income
  - 'referral_bonus': Earnings from referrals
  - 'deposit': Cash deposits
  - 'withdrawal': Cash withdrawals
- amount: Transaction amount (DECIMAL)
- currency: Transaction currency (ENUM)
- status: pending/completed/failed/cancelled
- created_at: Transaction timestamp
```

#### 4. **AutoInvest Plans Table**

```sql
- user_id: Foreign key to Users
- monthly_amount: Auto-investment amount (DECIMAL)
- theme: Investment strategy (balanced/aggressive/conservative)
- status: active/paused/cancelled
- deposit_day: Day of month for auto-deposit
- next_deposit_date: Next scheduled deposit
```

## 🔗 API Endpoints

### Authentication

All portfolio endpoints require Bearer token authentication:

```javascript
headers: {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
}
```

### Endpoint Details

#### `GET /api/portfolio/totals`

**Purpose**: Get user's portfolio summary  
**Response**:

```json
{
  "success": true,
  "data": {
    "usd": 1250.0,
    "local": 4000.0,
    "currency": "TND",
    "totalInvested": 3500.0,
    "totalReturns": 500.0,
    "monthlyIncome": 18.96,
    "averageYield": 6.5
  }
}
```

#### `GET /api/portfolio/automation`

**Purpose**: Check AutoInvest/AutoReinvest status  
**Response**:

```json
{
  "success": true,
  "data": {
    "autoInvestSetup": true,
    "autoReinvestSetup": false,
    "autoInvestDetails": {
      "id": 17,
      "monthlyAmount": 4000,
      "theme": "balanced",
      "status": "active",
      "depositDay": 27,
      "nextDepositDate": "2025-06-26T23:00:00.000Z",
      "currency": "TND"
    }
  }
}
```

#### `GET /api/portfolio/performance?period=1Y`

**Purpose**: Get detailed performance metrics  
**Query Parameters**: `period` (1M, 3M, 6M, 1Y, ALL)  
**Response**:

```json
{
  "success": true,
  "data": {
    "period": "1Y",
    "totalInvested": 3500.0,
    "totalReturns": 500.0,
    "portfolioValue": 4000.0,
    "returnPercentage": 14.29,
    "history": [
      {
        "date": "2024-01-15T10:30:00.000Z",
        "type": "investment",
        "amount": 1000,
        "cumulativeInvested": 1000,
        "cumulativeReturns": 0,
        "portfolioValue": 1000
      }
    ]
  }
}
```

#### `POST /api/portfolio/projection`

**Purpose**: Calculate growth projections  
**Request Body**:

```json
{
  "monthlyDeposit": 500,
  "years": 10,
  "yieldPct": 6.5
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "currentPortfolioValue": 1000,
    "monthlyDeposit": 500,
    "years": 10,
    "yieldPct": 6.5,
    "currency": "TND",
    "projections": [
      {
        "year": 0,
        "totalValue": 1000,
        "monthlyIncome": 5,
        "totalDeposited": 0,
        "totalReturns": 0,
        "returnPercentage": 0
      },
      {
        "year": 10,
        "totalValue": 85066,
        "monthlyIncome": 461,
        "totalDeposited": 60000,
        "totalReturns": 24066,
        "returnPercentage": 39.45
      }
    ]
  }
}
```

## 📱 Frontend Integration

### Authentication

Frontend uses AsyncStorage to store authentication token:

```javascript
const token = await AsyncStorage.getItem("accessToken");
```

### Data Flow

1. **Portfolio Screen Load**: Calls `fetchPortfolioTotals()` and `fetchAutomationStatus()`
2. **Monthly Deposits Calculator**: Calls `calculatePortfolioProjection()` with user inputs
3. **Performance Tracking**: Calls `fetchPortfolioPerformance()` with time period
4. **Real-time Updates**: Uses `useFocusEffect` to refresh data when screen gains focus

### Error Handling

All API calls include fallback data to ensure UI remains functional:

```javascript
try {
  const data = await fetchPortfolioTotals();
  return data;
} catch (error) {
  console.error("Error fetching portfolio totals:", error);
  // Return fallback data
  return {
    usd: 0,
    local: 0,
    currency: "TND",
    totalInvested: 0,
    totalReturns: 0,
    monthlyIncome: 0,
    averageYield: 6.5,
  };
}
```

## 🧮 Calculation Examples

### Example 1: New User (No Investments)

```
totalInvested = 0
totalReturns = 0
portfolioValue = 0
monthlyIncome = 0
averageYield = 6.5 (default)
```

### Example 2: Active Investor

```
User has:
- Invested $5,000 total
- Received $300 in rent payouts
- Received $50 in referral bonuses

Calculations:
totalInvested = $5,000
totalReturns = $300 + $50 = $350
portfolioValue = $5,000 + $350 = $5,350
monthlyIncome = ($5,000 × 0.065) ÷ 12 = $27.08
averageYield = ($350 ÷ $5,000) × 100 = 7.0%
```

### Example 3: Currency Conversion

```
Portfolio value: 4,000 TND
User currency: USD
Exchange rate: 1 TND = 0.32 USD

Conversion:
usdValue = 4,000 × 0.32 = $1,280
localValue = $1,280 (same as USD for USD users)
```

## 🔄 Update Cycle

### Data Sources Update Frequency:

- **User Investment Total**: Updated when user makes investments
- **Transaction History**: Real-time (immediate after transactions)
- **AutoInvest Status**: Updated when users modify AutoInvest settings
- **Currency Rates**: Static (updated manually in code)

### Frontend Refresh Triggers:

- Screen focus (when user navigates to portfolio)
- Pull-to-refresh gesture
- After completing investment actions
- Currency preference changes

## 🛠️ Troubleshooting

### Common Issues:

#### 1. Authentication Errors

- **Symptom**: 401 Unauthorized responses
- **Cause**: Token mismatch between services
- **Solution**: Ensure all services use `accessToken` key in AsyncStorage

#### 2. Database Column Errors

- **Symptom**: "Unknown column" SQL errors
- **Cause**: Model field names don't match database schema
- **Solution**: Use correct field names (`created_at` not `createdAt`)

#### 3. Missing Transaction Types

- **Symptom**: Empty returns calculation
- **Cause**: Using non-existent transaction types
- **Solution**: Use actual enum values (`rent_payout`, `referral_bonus`)

#### 4. Incorrect Calculations

- **Symptom**: Wrong portfolio values
- **Cause**: Currency conversion or calculation errors
- **Solution**: Verify exchange rates and calculation formulas

## 📈 Future Enhancements

### Planned Features:

1. **Real-time Currency Rates**: API integration for live exchange rates
2. **Advanced Analytics**: Detailed performance breakdowns
3. **Goal Tracking**: Investment goal progress monitoring
4. **Tax Reporting**: Annual investment summaries
5. **Performance Benchmarking**: Compare against market indices

### Scalability Considerations:

- **Caching**: Implement Redis for frequent calculations
- **Database Optimization**: Add indexes for performance queries
- **Rate Limiting**: Prevent excessive API calls
- **Background Jobs**: Async calculation for large datasets

---

_Last updated: January 2025_  
_Version: 1.0_
