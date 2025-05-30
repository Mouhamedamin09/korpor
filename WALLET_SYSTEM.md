# Wallet System Implementation

This document describes the complete wallet system implementation for the application, including both backend and frontend components.

## Overview

The wallet system provides users with:
- **Total Balance**: Combined cash and rewards balance
- **Cash Balance**: Available funds for investments and withdrawals
- **Rewards Balance**: Earned rewards from referrals, rent payouts, etc.
- **Transaction History**: Complete record of all wallet activities

## Backend Implementation

### Database Models

#### Wallet Model (`backend/src/models/Wallet.js`)
```javascript
{
  id: INTEGER (PK),
  userId: INTEGER (FK -> Users.id),
  cashBalance: DECIMAL(15,2) DEFAULT 0.00,
  rewardsBalance: DECIMAL(15,2) DEFAULT 0.00,
  totalBalance: VIRTUAL (cashBalance + rewardsBalance),
  currency: ENUM('USD', 'EUR', 'TND') DEFAULT 'TND',
  lastTransactionAt: DATE
}
```

#### Transaction Model (`backend/src/models/Transaction.js`)
```javascript
{
  id: INTEGER (PK),
  userId: INTEGER (FK -> Users.id),
  walletId: INTEGER (FK -> Wallets.id),
  type: ENUM('deposit', 'withdrawal', 'reward', 'investment', 'rent_payout', 'referral_bonus'),
  amount: DECIMAL(15,2),
  currency: ENUM('USD', 'EUR', 'TND'),
  status: ENUM('pending', 'completed', 'failed', 'cancelled'),
  description: STRING(255),
  reference: STRING(100),
  balanceType: ENUM('cash', 'rewards'),
  metadata: JSON,
  processedAt: DATE
}
```

### API Endpoints

#### GET `/api/wallet`
Retrieves user's wallet with all balance information.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 123,
    "cashBalance": 1500.00,
    "rewardsBalance": 250.00,
    "totalBalance": 1750.00,
    "currency": "TND",
    "lastTransactionAt": "2024-01-15T10:30:00Z"
  }
}
```

#### GET `/api/wallet/transactions`
Retrieves paginated transaction history.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `type`: Filter by transaction type
- `status`: Filter by transaction status

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": 1,
        "type": "deposit",
        "amount": 100.00,
        "currency": "TND",
        "status": "completed",
        "description": "Credit card deposit",
        "balanceType": "cash",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
}
```

#### POST `/api/wallet/deposit`
Adds funds to cash balance.

**Request Body:**
```json
{
  "amount": 100.00,
  "description": "Credit card deposit",
  "reference": "TXN_123456"
}
```

#### POST `/api/wallet/withdraw`
Withdraws funds from cash balance.

**Request Body:**
```json
{
  "amount": 50.00,
  "description": "Bank transfer withdrawal",
  "reference": "TXN_789012"
}
```

#### POST `/api/wallet/rewards`
Adds rewards to rewards balance.

**Request Body:**
```json
{
  "amount": 25.00,
  "description": "Referral bonus",
  "type": "referral_bonus",
  "reference": "REF_123456"
}
```

### Database Migration

Run the migration to create the wallet tables:

```bash
cd backend
npx sequelize-cli migration:create --name create-wallet-tables
```

The migration file is located at `backend/src/migrations/create-wallet-tables.js`.

## Frontend Implementation

### Services (`front-mobile/src/app/main/services/wallet.ts`)

#### Key Functions:
- `fetchWalletBalance()`: Get wallet data
- `fetchTransactionHistory()`: Get transaction history
- `depositFunds()`: Make a deposit
- `withdrawFunds()`: Make a withdrawal
- `addRewards()`: Add rewards
- `formatBalance()`: Format currency display

#### TypeScript Interfaces:
```typescript
interface WalletBalance {
  id: number;
  userId: number;
  cashBalance: number;
  rewardsBalance: number;
  totalBalance: number;
  currency: 'USD' | 'EUR' | 'TND';
  lastTransactionAt?: string;
}

interface Transaction {
  id: number;
  type: 'deposit' | 'withdrawal' | 'reward' | 'investment' | 'rent_payout' | 'referral_bonus';
  amount: number;
  currency: 'USD' | 'EUR' | 'TND';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description?: string;
  reference?: string;
  balanceType: 'cash' | 'rewards';
  metadata?: any;
  processedAt?: string;
  createdAt: string;
}
```

### UI Components

#### Updated Carousel Component
The carousel now displays real balance data:
- **Card 1**: Total Balance (cash + rewards)
- **Card 2**: Cash Balance (available for investment)
- **Card 3**: Rewards Balance (earned rewards)

#### Updated Wallet Screen
- Fetches real wallet data on focus
- Displays currency selector based on user's wallet currency
- Shows loading states with skeleton screens

## Setup Instructions

### Backend Setup

1. **Add Models to Index:**
   - Wallet and Transaction models are exported from `backend/src/models/index.js`
   - Associations are set up in `backend/src/models/associations.js`

2. **Run Migration:**
   ```bash
   cd backend
   npx sequelize-cli db:migrate
   ```

3. **Start Server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install Dependencies:** (if any new packages were added)
   ```bash
   cd front-mobile
   npm install
   ```

2. **Update API Imports:**
   The wallet service is now exported from the main API barrel file.

3. **Start Development:**
   ```bash
   npm start
   ```

## Testing

### Backend Testing

Use the test script to verify API endpoints:

```bash
cd backend
node test-wallet-api.js
```

Before running:
1. Ensure server is running on port 5000
2. Replace `TEST_USER_TOKEN` with valid JWT token
3. Have a user account created

### Frontend Testing

1. Login to the mobile app
2. Navigate to the Wallet tab
3. Verify balance displays show real data
4. Test currency switching
5. Check loading states

## Security Considerations

1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**: Users can only access their own wallet data
3. **Transaction Integrity**: Database transactions ensure balance consistency
4. **Input Validation**: Amount validation and sanitization
5. **Rate Limiting**: Consider implementing for deposit/withdrawal endpoints

## Currency Support

The system supports three currencies:
- **TND**: Tunisian Dinar (default)
- **USD**: US Dollar
- **EUR**: Euro

Currency is set per wallet and matches the user's preference.

## Error Handling

### Backend Errors:
- `400`: Invalid amount or insufficient balance
- `401`: Authentication required
- `404`: Wallet not found
- `500`: Server error

### Frontend Handling:
- Network error handling with retry logic
- Session expiration detection
- User-friendly error messages
- Loading states during API calls

## Future Enhancements

1. **Real Payment Integration**: Connect with payment processors
2. **Exchange Rates**: Real-time currency conversion
3. **Investment Tracking**: Track investment performance
4. **Notifications**: Real-time balance updates
5. **Export Features**: Transaction export to CSV/PDF
6. **Analytics**: Spending and earning analytics

## Database Indexes

The system includes optimized indexes for:
- `transactions.user_id`
- `transactions.wallet_id`
- `transactions.type`
- `transactions.status`
- `transactions.created_at`

This ensures fast query performance for transaction history and reporting. 