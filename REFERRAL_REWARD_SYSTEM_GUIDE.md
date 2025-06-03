# Complete Referral Reward System Guide

## Overview

The referral reward system allows users to earn monetary rewards by inviting friends to join the platform. Both the referrer (inviter) and referee (new user) receive rewards when specific conditions are met.

## 🎯 Reward Structure

- **TND Currency**: 125 TND for both referrer and referee
- **EUR Currency**: 50 EUR for both referrer and referee
- **Minimum Investment**: 2000 TND or 800 EUR (required for referrer reward)

## 📱 Frontend Flow

### 1. Getting Referral Code (Refer Screen)

**File**: `front-mobile/src/app/main/services/Refer.ts`

```typescript
// User visits referral screen and gets their unique code
const referralInfo = await fetchReferralInfo();
// Returns: { code: "efe51", referralAmount: 50, minInvestment: 800 }
```

### 2. Sharing Referral Code

**Files**:

- `front-mobile/src/app/main/screens/(tabs)/profile/ReferAFriendScreen.tsx`
- `front-mobile/src/app/main/components/wallet/compoenets/ui/Carousel.tsx`

Users can share their referral code through:

- QR codes
- Social media sharing
- Direct link sharing
- "Earn rewards" button in wallet carousel

### 3. New User Signup with Referral Code

**File**: `front-mobile/src/app/auth/signup/signupcard.tsx`

```typescript
// New user enters referral code during signup
const signupData = {
  name,
  surname,
  email,
  password,
  birthdate,
  referralCode: "efe51", // Friend's referral code
};
```

### 4. Wallet Display

**File**: `front-mobile/src/app/main/components/wallet/compoenets/ui/Carousel.tsx`
The wallet carousel shows three cards:

- **Total Balance**: Combined cash + rewards
- **Cash Balance**: Available for investments/withdrawals
- **Rewards Balance**: Earned from referrals (shows with star icon)

## 🔧 Backend Processing

### 5. Signup Processing

**File**: `backend/src/controllers/authController.js`

```javascript
// When user signs up with referral code
const referrer = await User.findOne({ where: { referralCode } });
await Referral.create({
  referrerId: referrer.id,
  refereeId: newUser.id,
  currency: referrer.currency,
  referrerReward: 125, // TND or 50 EUR
  refereeReward: 125, // TND or 50 EUR
  status: "pending",
});
```

### 6. User Approval (Triggers Referee Reward)

**File**: `backend/src/controllers/userManagementController.js`

```javascript
// When admin approves new user
await checkAndProcessPendingReferralRewards(userId);
// → Calls referralRewardService.processRefereeSignupReward()
```

**File**: `backend/src/services/referralRewardService.js`

```javascript
// Processes referee reward immediately upon approval
async function processRefereeSignupReward(userId) {
  const referral = await Referral.findOne({
    where: { refereeId: userId, status: "pending" },
  });

  // Add reward to referee's wallet
  await addRewardToWallet(
    userId,
    referral.refereeReward,
    "Welcome bonus - Referred by user #X",
    referral.id
  );

  // Update referral status to "qualified"
  await referral.update({ status: "qualified" });
}
```

### 7. Investment Processing (Triggers Referrer Reward)

**File**: `backend/src/controllers/realEstateInvestmentController.js`

```javascript
// When referred user makes qualifying investment
await processReferrerInvestmentReward(userId, investmentAmount);
```

**File**: `backend/src/services/referralRewardService.js`

```javascript
// Checks if investment qualifies for referrer reward
async function processReferrerInvestmentReward(
  refereeUserId,
  investmentAmount
) {
  const referral = await Referral.findOne({
    where: { refereeId: refereeUserId, status: "qualified" },
  });

  const minimumInvestment = referral.currency === "EUR" ? 800 : 2000;

  if (investmentAmount >= minimumInvestment) {
    // Add reward to referrer's wallet
    await addRewardToWallet(
      referral.referrerId,
      referral.referrerReward,
      `Referral bonus - User invested ${investmentAmount}`,
      referral.id
    );

    // Update referral status to "rewarded"
    await referral.update({ status: "rewarded" });
  }
}
```

### 8. Wallet & Transaction System

**Files**:

- `backend/src/models/Wallet.js`
- `backend/src/models/Transaction.js`
- `backend/src/controllers/walletController.js`

```javascript
// Wallet structure
{
  cashBalance: 1500.00,    // Available for investments
  rewardsBalance: 125.00,  // Earned from referrals
  totalBalance: 1625.00    // Combined amount
}

// Transaction record
{
  type: "referral_bonus",
  amount: 125.00,
  description: "Welcome bonus - Referred by user #1",
  balanceType: "rewards",
  reference: "REF_123"
}
```

## 🔄 Complete User Journey

### Scenario: User A refers User B

1. **User A gets referral code**: "efe51"
2. **User A shares** code with User B
3. **User B signs up** with referralCode: "efe51"
4. **System creates** pending referral record
5. **Admin approves** User B → **User B gets 125 TND reward** (referee reward)
6. **Referral status** changes to "qualified"
7. **User B invests** 2500 TND (above 2000 minimum)
8. **System detects** qualifying investment → **User A gets 125 TND reward** (referrer reward)
9. **Referral status** changes to "rewarded"
10. **Both users** see rewards in wallet "Rewards Balance"

## 📊 Database Schema

### Referrals Table

```sql
CREATE TABLE referrals (
  id INT PRIMARY KEY,
  referrer_id INT,           -- User who shared the code
  referee_id INT,            -- User who used the code
  status ENUM('pending', 'qualified', 'rewarded'),
  referrer_reward DECIMAL(15,2),  -- Amount for referrer
  referee_reward DECIMAL(15,2),   -- Amount for referee
  currency ENUM('TND', 'EUR'),
  qualified_at TIMESTAMP,    -- When referee got their reward
  rewarded_at TIMESTAMP      -- When referrer got their reward
);
```

### Transactions Table

```sql
CREATE TABLE transactions (
  id INT PRIMARY KEY,
  user_id INT,
  type ENUM('referral_bonus', 'deposit', 'investment', ...),
  amount DECIMAL(15,2),
  balance_type ENUM('cash', 'rewards'),
  description VARCHAR(255),
  reference VARCHAR(100),    -- REF_123 for referral bonuses
  metadata JSON              -- Additional referral info
);
```

## 🔍 Key Features

### Automatic Processing

- **No manual intervention** required for reward distribution
- **Real-time updates** to wallet balances
- **Comprehensive logging** for all referral activities

### Fraud Prevention

- **Unique referral codes** per user
- **One-time referee rewards** (can't refer same user twice)
- **Investment threshold** prevents abuse
- **Database constraints** ensure data integrity

### User Experience

- **Immediate feedback** when using referral codes
- **Clear reward display** in wallet carousel
- **Transaction history** shows referral bonuses
- **Progress tracking** through referral status

## 🚀 Integration Points

The referral system integrates seamlessly with:

- **User Registration** → Creates referral records
- **Admin Approval** → Triggers referee rewards
- **Investment System** → Triggers referrer rewards
- **Wallet System** → Updates reward balances
- **Transaction System** → Records all movements
- **Frontend UI** → Displays rewards and progress

This comprehensive system ensures both referrer and referee are properly rewarded while maintaining security and user experience standards.
