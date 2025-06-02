# Payment System Integration - Frontend

This document describes the complete payment system integration between the frontend mobile app and the backend payment APIs.

## 🎯 Overview

The frontend now supports two payment methods integrated with the backend:

1. **Stripe** - Credit/Debit Cards (✅ **Test Mode Active**)
2. **PayMe** - Local Mobile Payments (🚧 **Coming Soon**)

**Key Features:**

- ✅ **Saved Payment Methods** - Cards and PayMe accounts are saved to backend
- ✅ **Cross-Screen Integration** - Saved methods appear in Deposit, Withdraw, AutoInvest, and Investment screens
- ✅ **Default Payment Method** - Users can set a default payment method
- ✅ **Real Backend Persistence** - All payment methods are stored in the database

## 📱 Frontend Integration

### New Services Created

#### 1. Payment Service (`/src/app/main/services/payment.service.ts`)

**Purpose**: Direct integration with backend payment APIs and saved payment method management

**Key Functions**:

- `getPaymentMethods()` - Get available payment methods from backend
- `getSavedPaymentMethods()` - Get user's saved payment methods
- `createStripePayment()` - Create Stripe payment intents
- `createStripeSetupIntent()` - Create setup intents for saving cards
- `saveStripePaymentMethod()` - Save Stripe cards to backend
- `savePaymeAccount()` - Save PayMe accounts to backend
- `deleteSavedPaymentMethod()` - Remove saved payment methods
- `setDefaultPaymentMethod()` - Set default payment method
- `createPaymentWithSavedStripeMethod()` - Use saved cards for payments
- `createPaymePayment()` - Get PayMe coming soon status
- `getStripeTestCards()` - Get test card numbers for development

**Features**:

- Full TypeScript interfaces for all payment methods
- Backend persistence for all saved payment methods
- Default payment method management
- Error handling and validation
- Test mode indicators
- Utility functions for formatting and display

### Security: Deposit-Withdrawal Method Alignment

**Important Security Feature**: For user security and compliance, withdrawal methods are restricted to only those payment methods that have been previously used for deposits.

**Implementation**:

- Both `DepositScreen.tsx` and `WithdrawScreen.tsx` use the same `getSavedPaymentMethods()` service
- Withdrawal screen displays only saved payment methods from deposits
- Clear messaging informs users about this security requirement
- Consistent UI styling between both screens

**User Experience**:

- Deposit screen shows info: "Payment methods you add here will be saved securely and can be used for future deposits and withdrawals."
- Withdrawal screen shows info: "For your security, you can only withdraw to payment methods that you've previously used for deposits."
- If no saved methods exist, users are guided to make a deposit first

#### 2. Investment Service (`/src/app/main/services/investment.service.ts`)

**Purpose**: Handle property investments using the payment system

**Key Functions**:

- `createInvestment()` - Universal investment creation for all payment methods
- `createInvestmentWithStripe()` - Stripe-specific investment flow
- `createInvestmentWithPayMe()` - PayMe investment handling
- `getInvestmentsByWallet()` - Get user's investment history
- `checkInvestmentPaymentStatus()` - Monitor payment status

**Features**:

- Unified interface for both payment methods
- Support for saved payment methods
- Investment validation and error handling
- ROI calculations and projections
- Payment status tracking

### Updated Components

#### 1. Payment Method Screen (`PaymentMethodScreen.tsx`)

**Integration**:

- Real-time loading of saved payment methods from backend
- Stripe setup intent creation and confirmation
- Card saving with backend persistence
- Default payment method management
- PayMe account saving (when available)
- Delete and manage saved payment methods

**Features**:

- **Real Card Saving**: Cards are saved to backend via Stripe setup intents
- **Default Management**: Set and change default payment methods
- **Cross-Screen Sync**: Saved methods appear across all payment screens
- **Test Mode Indicators**: Clear test mode status
- **PayMe Preparation**: Ready for PayMe integration when available

#### 2. Investment Payment Screen (`InvestmentPaymentScreen.tsx`)

**Purpose**: Complete investment flow with saved payment method support

**Features**:

- **Saved Method Selection**: Choose from user's saved payment methods
- **New Card Option**: Add new cards during investment
- **Multi-method Support**: Stripe cards and PayMe (coming soon)
- **Real-time Validation**: Form validation and payment method availability
- **Status Tracking**: Loading states and success/error handling

**Flow**:

1. User selects investment amount and project
2. Choose from saved payment methods OR add new card
3. Process payment through backend
4. Show confirmation and track investment

#### 3. Deposit Screen (`DepositScreen.tsx`)

**Integration**:

- Loads user's saved payment methods from backend
- Auto-selects default payment method
- Shows payment method details (card info, processing time, fees)
- Links to add new payment methods

**Features**:

- **Saved Methods Only**: Uses backend-saved payment methods
- **Smart Defaults**: Auto-selects user's default payment method
- **Method Management**: Easy access to add/manage payment methods
- **Real-time Info**: Processing times and fees from saved method data

#### 4. Withdraw Screen (`WithdrawScreen.tsx`)

**Integration**:

- Displays saved payment methods for withdrawals
- Shows withdrawal fees based on payment method type
- Validates withdrawal amounts against available balance
- Processes withdrawals using saved payment methods

**Features**:

- **Fee Calculation**: Different fees for card vs PayMe withdrawals
- **Method Selection**: Choose from saved cards/accounts
- **Balance Validation**: Ensures sufficient funds including fees
- **Processing Times**: Shows expected processing time per method

#### 5. Auto Invest Screen Integration

**Saved Payment Methods**: The AutoInvest flow now uses saved payment methods when users set up recurring investments.

## 🔧 Technical Implementation

### API Integration

**Base URL**: Uses existing `API_URL` configuration
**Authentication**: JWT tokens from AsyncStorage
**Error Handling**: Comprehensive try-catch with user-friendly messages

```typescript
// Example: Getting saved payment methods
const savedMethods = await getSavedPaymentMethods();
// Returns: SavedPaymentMethod[] with card/PayMe details
```

### Backend Integration Points

**Payment Method Management**:

- `GET /api/payment/saved-methods` - Get user's saved payment methods
- `POST /api/payment/stripe/save-method` - Save Stripe payment method
- `POST /api/payment/payme/save-account` - Save PayMe account
- `DELETE /api/payment/saved-methods/{id}` - Delete payment method
- `PUT /api/payment/saved-methods/{id}/default` - Set default method

**Payment Processing**:

- `POST /api/payment/stripe/setup-intent` - Create setup intent for saving cards
- `POST /api/payment/stripe/payment-with-saved` - Use saved card for payment
- `GET /api/payment/methods`
