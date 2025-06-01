# Troubleshooting Guide

## Native Module Error: "Cannot read property 'getConstants' of null"

This error typically occurs when native modules are not properly linked or configured. Here are the steps to resolve it:

### 1. Expo Development Build Required

Since `@stripe/stripe-react-native` requires native code, you need to create an Expo development build:

```bash
# Install Expo CLI (if not already installed)
npm install -g @expo/cli

# Create a development build
npx expo run:android  # For Android
npx expo run:ios      # For iOS
```

### 2. Alternative: Use Expo Go Compatible Version

If you want to continue using Expo Go (the standard Expo app), you can:

1. Remove Stripe temporarily:

```bash
npm uninstall @stripe/stripe-react-native
```

2. Use the simplified version we've created (already implemented)

3. Re-add Stripe later when you're ready to create a development build

### 3. Full Resolution Steps

To properly integrate Stripe with native modules:

#### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

#### Step 2: Configure EAS Build

```bash
eas build:configure
```

#### Step 3: Create Development Build

```bash
eas build --profile development --platform android
# or
eas build --profile development --platform ios
```

#### Step 4: Install Development Build

Install the generated APK/IPA on your device

#### Step 5: Re-enable Stripe

In `PaymentMethodScreen.tsx`, uncomment the Stripe provider:

```typescript
const PaymentMethodScreen: React.FC = () => {
  return (
    <StripeProvider publishableKey={STRIPE_CONFIG.publishableKey}>
      <PaymentMethodContent />
    </StripeProvider>
  );
};
```

### 4. Quick Fix for Testing

The current implementation includes a simplified version without Stripe that works with Expo Go:

- ✅ Payment method screen loads without errors
- ✅ Demo card functionality for testing UI
- ✅ All navigation works properly
- ✅ iPayment placeholder ready

### 5. Check Current Setup

Run these commands to verify your setup:

```bash
# Check Expo version
npx expo --version

# Check if development build is needed
npx expo doctor

# Clear cache and restart
npx expo start --clear
```

### 6. Error Scenarios

| Error                  | Cause                    | Solution                 |
| ---------------------- | ------------------------ | ------------------------ |
| `getConstants of null` | Native module not linked | Create development build |
| `Module not found`     | Package not installed    | Run `npm install`        |
| `Metro bundler error`  | Cache issue              | Run `expo start --clear` |
| `Build failed`         | Configuration issue      | Check `expo doctor`      |

### 7. Development Workflow

For development, you have two options:

#### Option A: Continue with Expo Go

- Keep current simplified version
- Full UI and navigation testing
- Add Stripe later with development build

#### Option B: Switch to Development Build

- Full Stripe functionality
- Requires device installation
- Longer build times

### 8. Production Notes

For production deployment:

1. Always use development/production builds (not Expo Go)
2. Configure proper Stripe keys
3. Set up backend endpoints
4. Test payment flows thoroughly

### 9. Current Status

✅ **Working Now:**

- Payment method screen
- Demo card functionality
- Navigation flow
- UI components
- Settings integration

🔄 **Needs Development Build:**

- Real Stripe card input
- Payment processing
- Native payment methods

### 10. Next Steps

1. **Immediate**: Test current simplified version
2. **Short-term**: Create development build for Stripe
3. **Long-term**: Backend integration for production

## Quick Commands

```bash
# Current working setup
cd front-mobile
npx expo start --clear

# Future Stripe setup
npx expo run:android --device
# or
eas build --profile development
```

The app should now work without the native module error!
