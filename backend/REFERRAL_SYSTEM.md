# Korpor Referral System

## Overview

The Korpor referral system allows users to invite friends and earn rewards when their referrals make qualifying investments. The system supports multiple currencies (TND and EUR) and provides dynamic currency switching.

## Features

### 🎯 Core Functionality
- **Unique Referral Codes**: Auto-generated 8-character hexadecimal codes
- **Currency Support**: TND (Tunisia) and EUR (France/Europe) 
- **Dynamic Currency Switching**: Users can switch between TND and EUR
- **Real-time Statistics**: Track registered users and qualifying investments
- **Reward Calculation**: Automatic reward calculation based on currency

### 💰 Reward Structure

| Currency | Referral Bonus | Min Investment | Referrer Reward | Referee Reward |
|----------|----------------|----------------|-----------------|----------------|
| TND      | 25 TND         | 2,000 TND      | 25 TND          | 25 TND         |
| EUR      | €10            | €800           | €10             | €10            |

### 🔄 Referral Flow
1. **User gets referral code** - Auto-generated when first accessed
2. **Share referral link** - Dynamic link with fresh code generation
3. **Friend signs up** - Using referral code in signup process
4. **Friend gets verified** - Goes through KYC process
5. **Friend invests** - Makes qualifying investment (above minimum)
6. **Rewards distributed** - Both users receive rewards

## API Endpoints

### Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <token>
```

### 1. Get Referral Information
**GET** `/api/referrals/info`

Returns complete referral information for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "1",
    "currency": "TND",
    "code": "A1B2C3D4",
    "referralAmount": 25,
    "minInvestment": 2000,
    "stats": {
      "totalReferred": 5,
      "totalInvested": 3
    }
  }
}
```

### 2. Switch Currency
**POST** `/api/referrals/switch-currency`

Switches user's currency preference and updates all amounts.

**Request:**
```json
{
  "currency": "EUR"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Currency switched to EUR",
  "data": {
    "currency": "EUR",
    "referralAmount": 10,
    "minInvestment": 800
  }
}
```

### 3. Generate New Referral Code
**POST** `/api/referrals/generate-code`

Generates a fresh referral code and share link.

**Response:**
```json
{
  "success": true,
  "data": {
    "referralCode": "E5F6G7H8",
    "shareLink": "https://app.getkorpor.com/rewards?c=1&n=E5F6G7H8"
  }
}
```

### 4. Get User Currency
**GET** `/api/referrals/currency`

Returns current user currency preference.

**Response:**
```json
{
  "success": true,
  "data": {
    "currency": "TND"
  }
}
```

### 5. Process Referral Signup
**POST** `/api/referrals/process-signup`

Internal endpoint for processing referral during user registration.

**Request:**
```json
{
  "referralCode": "A1B2C3D4",
  "newUserId": 123
}
```

**Response:**
```json
{
  "success": true,
  "message": "Referral processed successfully",
  "data": {
    "referralId": 1,
    "reward": 25,
    "currency": "TND"
  }
}
```

## Database Schema

### Users Table (New Fields)
```sql
ALTER TABLE users ADD COLUMN currency ENUM('TND', 'EUR') DEFAULT 'TND' NOT NULL;
ALTER TABLE users ADD COLUMN referral_code VARCHAR(20) UNIQUE;
ALTER TABLE users ADD COLUMN referred_by INT REFERENCES users(id);
ALTER TABLE users ADD COLUMN referral_stats JSON DEFAULT '{"totalReferred":0,"totalInvested":0,"totalEarned":0}';
```

### Referrals Table
```sql
CREATE TABLE referrals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  referrer_id INT NOT NULL REFERENCES users(id),
  referee_id INT NOT NULL REFERENCES users(id),
  status ENUM('pending', 'qualified', 'rewarded') DEFAULT 'pending',
  referee_investment_amount DECIMAL(15,2) DEFAULT 0,
  referrer_reward DECIMAL(15,2) DEFAULT 0,
  referee_reward DECIMAL(15,2) DEFAULT 0,
  currency ENUM('TND', 'EUR') NOT NULL,
  qualified_at TIMESTAMP NULL,
  rewarded_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Frontend Integration

### Service Layer (`Refer.ts`)
```typescript
import { fetchReferralInfo, switchCurrency, generateNewReferralCode } from '@main/services/Refer';

// Get referral info
const referralInfo = await fetchReferralInfo();

// Switch currency
const updatedInfo = await switchCurrency('EUR');

// Generate fresh code for sharing
const { shareLink } = await generateNewReferralCode();
```

### Settings Integration
The referral system is integrated with the settings system to ensure currency changes affect the entire app:

```typescript
// When user changes currency in settings, it updates referral system too
await updateCurrency(email, 'EUR'); // Also calls switchReferralCurrency
```

### ReferAFriendScreen Features
- **Real-time Data**: Fetches live referral statistics
- **Currency Switching**: Complete UI for switching between TND/EUR
- **Dynamic Share Links**: Generates fresh codes when sharing
- **Error Handling**: Graceful fallbacks and error messages
- **Loading States**: Proper loading indicators during API calls

## Testing

Run the comprehensive test suite:
```bash
cd backend
node test-referral-system.js
```

**Test Coverage:**
- ✅ Get referral information
- ✅ Currency switching (TND ↔ EUR)
- ✅ Referral code generation  
- ✅ Invalid currency handling
- ✅ Unauthorized request handling
- ✅ Referral signup process
- ✅ Duplicate referral prevention

## Security Features

### 🔒 Authentication
- Bearer token required for all operations
- Mock token support for development (`mock-token-user-1`)
- User context extraction from tokens

### 🛡️ Validation
- Currency validation (only TND/EUR allowed)
- Referral code uniqueness enforcement
- Duplicate referral prevention
- Input sanitization and validation

### 🔐 Data Protection
- Secure referral code generation using crypto.randomBytes
- Database constraints and foreign keys
- Proper error handling without data leakage

## Deployment Checklist

### Backend
- [ ] Run database migration: `20240630_add_referral_system.js`
- [ ] Verify User model has new referral fields
- [ ] Verify Referral model is created
- [ ] Test all API endpoints with `test-referral-system.js`
- [ ] Verify authentication middleware works

### Frontend  
- [ ] Update `Refer.ts` service with real API calls
- [ ] Update `settings.ts` to use referral currency API
- [ ] Test ReferAFriendScreen currency switching
- [ ] Test share functionality generates fresh codes
- [ ] Verify settings integration works across app

### Mobile App
- [ ] Test on Android with `192.168.43.44:5000` API URL
- [ ] Verify share functionality works on device
- [ ] Test currency changes reflect across app screens
- [ ] Validate error handling and loading states

## Future Enhancements

### Phase 2 Features
- **Investment Tracking**: Auto-qualify referrals when investments are made
- **Reward Distribution**: Automatic payout system 
- **Analytics Dashboard**: Detailed referral performance metrics
- **Referral Tiers**: Multi-level referral bonuses
- **Custom Messages**: Personalized referral invitations

### Integration Points
- **Signup Flow**: Detect referral codes during registration
- **Investment Flow**: Track investments for referral qualification
- **Payment System**: Integrate with Paymee for reward distribution
- **Notification System**: Notify users of referral milestones

## Support

For technical support or questions about the referral system:
- Check the test script: `backend/test-referral-system.js`
- Review API documentation: Swagger UI at `/api-docs`
- Examine logs for debugging information 