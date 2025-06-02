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
**Authentication**: JWT tokens from SecureStore
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
- `GET /api/payment/methods` - Get available payment methods
- `GET /api/payment/stripe/test-cards` - Get test card info

### Stripe Integration

**Configuration**:

- Uses same test publishable key as backend: `pk_test_TYooMQauvdEDq54NiTphI7jx`
- CardField component for secure card input
- Setup intent flow for saving cards securely
- Payment confirmation using saved methods

**Card Saving Flow**:

1. User enters card details in CardField
2. Create setup intent via backend
3. Confirm setup intent with Stripe
4. Save payment method to backend
5. Update local state and show in all screens

**Test Cards Available**:

- Visa: `4242 4242 4242 4242`
- Mastercard: `5555 5555 5555 4444`
- American Express: `3782 8224 6310 005`

### PayMe Integration

**Current Status**: Coming Soon
**Preparation**: Backend endpoints ready for PayMe account saving

**Features Planned**:

- Mobile wallet payments
- Bank transfers
- Local payment methods
- QR code payments

## 🎨 UI/UX Features

### Saved Payment Method Display

- **Card Information**: Shows brand, last 4 digits, expiry
- **PayMe Accounts**: Shows phone number and account name
- **Default Indicators**: Clear default payment method badges
- **Management Actions**: Set default, delete methods

### Cross-Screen Consistency

- **Unified Design**: Same payment method cards across all screens
- **Smart Defaults**: Auto-selection of default payment methods
- **Real-time Updates**: Changes reflect immediately across screens
- **Empty States**: Helpful prompts when no payment methods exist

### Payment Flow Integration

- **Deposit**: Use saved methods for adding funds
- **Withdraw**: Use saved methods for withdrawing to
- **Invest**: Choose saved method or add new for investments
- **AutoInvest**: Saved methods for recurring investments

## 🔒 Security Features

### Data Protection

- **No Local Storage**: Payment details stored securely in backend
- **Stripe Security**: Cards tokenized and managed by Stripe
- **JWT Authentication**: Secure API access
- **PCI Compliance**: Stripe handles all sensitive card data

### User Privacy

- **Limited Display**: Only show last 4 digits and expiry
- **Secure Deletion**: Complete removal from backend
- **Access Control**: Users only see their own payment methods

## 📊 Backend Integration Summary

### Database Schema

Saved payment methods are stored with:

- User association
- Payment method type (Stripe/PayMe)
- Stripe payment method ID (for cards)
- PayMe account details (when available)
- Default payment method flag
- Creation and update timestamps

### API Endpoints Integration

All payment screens now integrate with:

- Payment method management APIs
- Saved payment method APIs
- Payment processing APIs
- User authentication APIs

## 🧪 Testing

### Stripe Testing

- Use test card numbers provided by backend
- Test setup intent creation and confirmation
- Verify card saving and retrieval
- Test payment processing with saved cards

### PayMe Testing

- Verify coming soon message display
- Test planned features information
- Ensure graceful handling of unavailable service

### Cross-Screen Testing

- Save payment method in PaymentMethodScreen
- Verify it appears in DepositScreen
- Test usage in WithdrawScreen
- Confirm availability in InvestmentPaymentScreen

## 🔄 Development Workflow

### 1. Start Backend

```bash
cd backend
npm run dev
```

### 2. Start Frontend

```bash
cd front-mobile
npm run dev
# or
npx expo start
```

### 3. Test Payment Method Saving

1. Navigate to PaymentMethodScreen
2. Add a new Stripe card (use test numbers)
3. Verify card is saved and marked as default
4. Check other screens to see saved card

### 4. Test Cross-Screen Integration

1. Go to DepositScreen - see saved payment methods
2. Go to WithdrawScreen - same methods available
3. Go to InvestmentPaymentScreen - choose from saved methods
4. Verify default selection and method management

## 📈 Key Improvements

### Before

- ❌ Hardcoded payment methods
- ❌ No persistence between sessions
- ❌ Crypto complexity
- ❌ Manual card entry every time
- ❌ Disconnected payment screens

### After

- ✅ Backend-saved payment methods
- ✅ Persistent across sessions and screens
- ✅ Simplified to Stripe + PayMe only
- ✅ One-time card setup, reuse everywhere
- ✅ Unified payment method management

## 🚦 Next Steps

### Phase 1 (Current) ✅

- [x] Remove crypto functionality
- [x] Backend payment method saving
- [x] Stripe setup intent integration
- [x] Cross-screen payment method integration
- [x] Default payment method management

### Phase 2 (Immediate)

- [ ] Payment method usage analytics
- [ ] Failed payment handling and retry
- [ ] Payment method expiry notifications
- [ ] Bulk payment method management

### Phase 3 (PayMe Integration)

- [ ] Complete PayMe API integration
- [ ] PayMe account saving implementation
- [ ] PayMe payment flow
- [ ] Local payment method support

### Phase 4 (Production)

- [ ] Switch to live payment modes
- [ ] Production webhook endpoints
- [ ] Real payment processing
- [ ] Performance monitoring

## 🆘 Troubleshooting

### Common Issues

**"No saved payment methods"**

- User hasn't added any payment methods yet
- Click "Add Payment Method" to go to PaymentMethodScreen
- Add a Stripe card using test numbers

**"Payment method not appearing"**

- Check backend connection
- Verify JWT token in SecureStore
- Check getSavedPaymentMethods() API call

**"Card saving failed"**

- Ensure using test mode Stripe key
- Verify setup intent creation
- Check backend stripe integration

### Debug Mode

- Enable console logging for all API calls
- Check SecureStore for authentication tokens
- Verify backend API responses

---

**Status**: ✅ **Fully Integrated with Saved Payment Methods**  
**Last Updated**: December 2024  
**Version**: 2.0.0

## 📝 Summary

The frontend is now fully integrated with backend-saved payment methods:

- **Stripe**: Complete setup intent integration with card saving
- **PayMe**: Coming soon status with account saving preparation
- **Cross-Screen Integration**: Saved methods available in all payment screens
- **Backend Persistence**: All payment methods stored in database
- **Smart Defaults**: Auto-selection and management of default methods
- **User Experience**: One-time setup, reuse everywhere

The payment system provides a seamless experience where users can:

1. **Save**: Add payment methods once in PaymentMethodScreen
2. **Reuse**: Access saved methods in Deposit, Withdraw, and Investment screens
3. **Manage**: Set defaults, delete methods, add new ones
4. **Persist**: All data saved to backend, available across sessions

This creates a modern, user-friendly payment experience that reduces friction and improves conversion rates.
