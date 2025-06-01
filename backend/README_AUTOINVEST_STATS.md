# AutoInvest Statistics Calculation Documentation

## Overview

This document explains how the AutoInvest statistics are calculated in the backend system. The `/api/autoinvest/stats` endpoint provides comprehensive analytics for users' automated investment plans, including performance metrics, returns calculations, and future projections.

## API Endpoint

```http
GET /api/autoinvest/stats
Authorization: Bearer <token>
```

## Response Structure

```json
{
  "success": true,
  "data": {
    "stats": {
      // Basic plan information
      "hasActivePlan": boolean,
      "status": "active|paused|cancelled",
      "theme": "growth|income|balanced|index",
      "monthlyAmount": number,
      "currency": "TND|EUR",

      // Financial metrics
      "totalDeposited": number,
      "totalInvested": number,
      "totalReturns": number,
      "currentPortfolioValue": number,

      // Performance metrics
      "monthsActive": number,
      "averageMonthlyReturn": number,
      "projectedAnnualReturn": number,
      "returnOnInvestment": number,
      "annualizedReturn": number,

      // Efficiency metrics
      "depositEfficiency": number,
      "cashUtilization": number,

      // Future projections
      "projectedValueIn1Year": number,

      // Schedule information
      "nextDepositDate": "ISO Date",
      "daysUntilNextDeposit": number,
      "lastDepositDate": "ISO Date",

      // Additional metadata
      "planCreatedDate": "ISO Date",
      "totalTransactions": number,
      "investmentCount": number
    }
  },
  "message": "AutoInvest statistics retrieved successfully"
}
```

## Data Sources

The calculations use data from the following database tables:

1. **auto_invest_plans** - Main AutoInvest plan configuration and totals
2. **transactions** - Individual investment transactions linked to AutoInvest plans
3. **users** - User profile and currency information
4. **wallets** - Current wallet balances

## Calculation Methods

### 1. Basic Financial Metrics

#### Total Deposited

```sql
SELECT total_deposited FROM auto_invest_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 1
```

- Source: `auto_invest_plans.total_deposited`
- Represents: Total amount deposited by user into AutoInvest plan
- Updates: Incremented each time user makes a deposit

#### Total Invested

```sql
SELECT total_invested FROM auto_invest_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 1
```

- Source: `auto_invest_plans.total_invested`
- Represents: Total amount actually invested in properties
- Updates: Incremented when deposits are allocated to specific property investments

#### Months Active

```javascript
const monthsActive = Math.max(
  1,
  Math.ceil(
    (currentDate.getTime() - planCreatedDate.getTime()) /
      (1000 * 60 * 60 * 24 * 30.44)
  )
);
```

- **Formula**: Days between plan creation and current date, divided by average days per month (30.44)
- **Minimum**: 1 month (prevents division by zero)
- **Purpose**: Used in performance calculations and return annualization

### 2. Return Calculations

#### Theme-Based Performance Rates

```javascript
const themePerformanceRates = {
  growth: 0.085, // 8.5% annual return
  income: 0.072, // 7.2% annual return
  balanced: 0.065, // 6.5% annual return
  index: 0.058, // 5.8% annual return
};
```

- **Source**: Historical market performance data for each investment theme
- **Updates**: Based on quarterly performance reviews
- **Fallback**: 6.5% for undefined themes

#### Individual Investment Returns

```javascript
// For each investment transaction:
const monthsHeld =
  (currentDate.getTime() - investmentDate.getTime()) /
  (1000 * 60 * 60 * 24 * 30.44);
const compoundedValue =
  investmentAmount * Math.pow(1 + monthlyReturnRate, monthsHeld);
const returnOnThisInvestment = compoundedValue - investmentAmount;
```

**Process**:

1. Query all completed investment transactions for the AutoInvest plan
2. For each transaction, calculate time held in months
3. Apply compound interest formula using theme-specific monthly return rate
4. Sum all individual returns to get total calculated returns

#### Fallback Return Calculation (No Individual Transactions)

```javascript
const averageMonthsInvested = monthsActive / 2;
const totalCompoundedValue =
  totalInvested * Math.pow(1 + monthlyReturnRate, averageMonthsInvested);
const totalCalculatedReturns = totalCompoundedValue - totalInvested;
```

- **Used when**: No individual investment transactions exist
- **Assumption**: Average investment is held for half the plan duration
- **Purpose**: Provides estimated returns for new plans

### 3. Performance Metrics

#### Average Monthly Return

```javascript
const averageMonthlyReturn =
  monthsActive > 0 ? totalCalculatedReturns / monthsActive : 0;
```

- **Formula**: Total returns divided by months active
- **Unit**: Currency amount per month
- **Purpose**: Shows consistent monthly performance

#### Projected Annual Return

```javascript
const projectedAnnualReturn = averageMonthlyReturn * 12;
```

- **Formula**: Average monthly return multiplied by 12
- **Purpose**: Estimates yearly return based on current performance

#### Return on Investment (ROI)

```javascript
const returnOnInvestment =
  totalInvested > 0 ? (totalCalculatedReturns / totalInvested) * 100 : 0;
```

- **Formula**: (Total Returns / Total Invested) × 100
- **Unit**: Percentage
- **Purpose**: Shows efficiency of investments

#### Annualized Return

```javascript
const annualizedReturn =
  monthsActive > 0
    ? Math.pow(1 + totalCalculatedReturns / totalInvested, 12 / monthsActive) -
      1
    : 0;
```

- **Formula**: ((1 + Total Return Rate) ^ (12 / Months Active)) - 1
- **Unit**: Percentage (annual equivalent)
- **Purpose**: Standardized comparison metric regardless of time period

### 4. Efficiency Metrics

#### Deposit Efficiency

```javascript
const depositEfficiency =
  totalDeposited > 0 ? (totalInvested / totalDeposited) * 100 : 0;
```

- **Formula**: (Total Invested / Total Deposited) × 100
- **Purpose**: Shows percentage of deposited funds actually invested
- **Range**: 0-100%, with 100% being optimal

#### Cash Utilization

```javascript
const cashUtilization = totalInvested > 0 ? 100 : 0;
```

- **Current Logic**: Binary (100% if any investments, 0% if none)
- **Future Enhancement**: Could be refined to show percentage of available cash invested

### 5. Future Projections

#### Future Value Calculation

```javascript
function calculateFutureValue(
  presentValue,
  monthlyPayment,
  monthlyRate,
  periods
) {
  const pvFuture = presentValue * Math.pow(1 + monthlyRate, periods);
  const pmtFuture =
    monthlyPayment * ((Math.pow(1 + monthlyRate, periods) - 1) / monthlyRate);
  return pvFuture + pmtFuture;
}
```

**Components**:

- **Present Value Growth**: Current portfolio value compounded for specified periods
- **Annuity Growth**: Future value of regular monthly contributions with compound interest
- **Formula**: `FV = PV × (1 + r)^n + PMT × [((1 + r)^n - 1) / r]`

Where:

- `PV` = Present portfolio value
- `PMT` = Monthly payment amount
- `r` = Monthly interest rate
- `n` = Number of periods (months)

### 6. Schedule Information

#### Days Until Next Deposit

```javascript
const daysUntilNextDeposit = nextDepositDate
  ? Math.ceil(
      (new Date(nextDepositDate).getTime() - currentDate.getTime()) /
        (1000 * 60 * 60 * 24)
    )
  : null;
```

- **Calculation**: Difference between next deposit date and current date
- **Rounding**: Ceiling function to show full days remaining
- **Null handling**: Returns null if no next deposit date is set

## Database Schema Dependencies

### auto_invest_plans Table

```sql
CREATE TABLE auto_invest_plans (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  monthly_amount DECIMAL(15,2) NOT NULL,
  currency ENUM('TND', 'EUR') DEFAULT 'TND',
  theme ENUM('growth', 'income', 'balanced', 'index') NOT NULL,
  status ENUM('active', 'paused', 'cancelled') DEFAULT 'active',
  deposit_day INTEGER NOT NULL,
  next_deposit_date DATE,
  last_deposit_date DATE,
  total_deposited DECIMAL(15,2) DEFAULT 0,
  total_invested DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### transactions Table

```sql
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  auto_invest_plan_id INTEGER NULL,
  type ENUM('deposit', 'withdrawal', 'investment', 'autoinvest_failed') NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency ENUM('TND', 'EUR', 'USD') NOT NULL,
  status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- ... other fields
);
```

## Error Handling

The API handles several error scenarios:

1. **No AutoInvest Plan**: Returns stats with `hasActivePlan: false` and zero values
2. **Database Errors**: Returns 500 status with error message in development mode
3. **Invalid User**: Returns 401 status for authentication failures
4. **Division by Zero**: All calculations include safety checks for zero denominators

## Performance Considerations

1. **Query Optimization**: Uses indexes on `user_id`, `auto_invest_plan_id`, and `status` fields
2. **Data Aggregation**: Calculations are performed in application layer rather than database
3. **Caching**: Consider implementing Redis cache for frequently accessed statistics
4. **Pagination**: Transaction queries could be limited for users with extensive history

## Testing Examples

### Test Case 1: New Plan (No Investments)

```json
{
  "hasActivePlan": true,
  "totalDeposited": 1000.0,
  "totalInvested": 0.0,
  "totalReturns": 0.0,
  "monthsActive": 1,
  "averageMonthlyReturn": 0.0,
  "projectedAnnualReturn": 0.0
}
```

### Test Case 2: Active Plan (6 Months, Growth Theme)

```json
{
  "hasActivePlan": true,
  "totalDeposited": 6000.0,
  "totalInvested": 5800.0,
  "totalReturns": 248.5,
  "monthsActive": 6,
  "averageMonthlyReturn": 41.42,
  "projectedAnnualReturn": 497.0,
  "returnOnInvestment": 4.28,
  "annualizedReturn": 8.5
}
```

## Maintenance Notes

1. **Theme Performance Rates**: Review and update quarterly based on actual market performance
2. **Return Calculations**: Monitor accuracy against actual property performance
3. **Currency Support**: Ensure calculations work correctly across different currencies
4. **Rounding**: All financial values are rounded to 2 decimal places for display

## Future Enhancements

1. **Real-time Property Values**: Integration with property valuation APIs
2. **Risk-adjusted Returns**: Implement Sharpe ratio and other risk metrics
3. **Benchmark Comparison**: Compare performance against market indices
4. **Tax Calculations**: Include tax implications in return calculations
5. **Multi-currency Support**: Advanced currency conversion and reporting
