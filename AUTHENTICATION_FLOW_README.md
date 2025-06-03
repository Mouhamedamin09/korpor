# 🔐 Korpor Authentication Flow Documentation

## Overview

This document provides a comprehensive guide to the authentication system in the Korpor real estate investment mobile application. The authentication system includes multiple verification steps, 2FA support, and secure token management.

## 📱 Frontend Structure

```
front-mobile/src/app/auth/
├── screens/
│   ├── Signup/
│   │   ├── index.tsx              # Main signup form
│   │   ├── password.tsx           # Password creation step
│   │   ├── verify.tsx             # Email verification
│   │   ├── verifyPhone.tsx        # Phone verification
│   │   ├── success.tsx            # Registration success
│   │   └── signupDone.tsx         # Final completion
│   ├── Login/
│   │   ├── index.tsx              # Main login form
│   │   ├── TwoFactorLogin.tsx     # 2FA verification
│   │   └── forgotPassword/
│   │       ├── forgotPassword.tsx # Password reset request
│   │       ├── OTPReset.tsx      # Reset code verification
│   │       └── resetPassword.tsx  # New password creation
│   └── onboarding/
│       └── onboarding.tsx         # Post-signup onboarding
├── components/
│   ├── complex/
│   │   ├── SignupCard.tsx         # Signup form component
│   │   ├── LoginCard.tsx          # Login form component
│   │   ├── PasswordCard.tsx       # Password creation component
│   │   ├── OTPCard.tsx           # Email OTP verification
│   │   ├── PhoneOTPCard.tsx      # Phone OTP verification
│   │   ├── ForgotPasswordCard.tsx # Password reset form
│   │   └── OTPResetCard.tsx      # Reset code input
│   └── ui/                       # Reusable UI components
└── services/
    ├── authService.ts            # Core authentication service
    ├── authStore.ts              # State management
    ├── signup.tsx                # Signup API calls
    ├── signin.ts                 # Signin API calls
    └── logout.ts                 # Logout functionality
```

## 🚀 Complete Signup Flow

### 1. Welcome Screen (`/`)

**File:** `front-mobile/src/app/index.tsx`

- Entry point with navigation options
- **Navigation Options:**
  - "Signup" button → `/auth/screens/Signup`
  - "Login" button → `/auth/screens/Login`

### 2. Signup Information Collection (`/auth/screens/Signup`)

**File:** `front-mobile/src/app/auth/screens/Signup/index.tsx`
**Component:** `SignupCard.tsx`

**Form Fields:**

- First Name (required)
- Last Name (required)
- Email (required, validated)
- Birthday (required, date picker)
- Phone Number (optional, stored locally)

**Validation:**

- All required fields must be filled
- Email format validation
- Birthday selection via modal picker

**Navigation:**

- ✅ Success → `/auth/screens/Signup/verify?email={email}`
- ❌ Validation Error → Stay on current screen

**Backend Interaction:** None (validation only)

### 3. Email Verification (`/auth/screens/Signup/verify`)

**File:** `front-mobile/src/app/auth/screens/Signup/verify.tsx`
**Component:** `OTPCard.tsx`
**Backend Endpoint:** `POST /api/auth/verify-email`

**Process:**

- Displays 4-digit OTP input fields
- Email parameter passed from previous screen
- User enters verification code received via email

**API Call:**

```javascript
await verifySignUp(email, code);
```

**Navigation:**

- ✅ Success → `/auth/screens/Signup/verifyPhone?userId={userId}`
- ❌ Invalid Code → Error message, stay on screen
- 🔄 Resend Code → Calls resend endpoint

### 4. Phone Verification (`/auth/screens/Signup/verifyPhone`)

**File:** `front-mobile/src/app/auth/screens/Signup/verifyPhone.tsx`
**Component:** `PhoneOTPCard.tsx`
**Backend Endpoints:**

- `POST /api/auth/send-phone-verification`
- `POST /api/auth/verify-phone`

**Process:**

- Automatically sends SMS verification code on component mount
- Displays 6-digit OTP input fields
- User enters verification code received via SMS

**API Calls:**

```javascript
// Automatic on mount
await axios.post("/api/auth/send-phone-verification", { userId });

// On code submission
await axios.post("/api/auth/verify-phone", { userId, verificationCode });
```

**Navigation:**

- ✅ Success → `/auth/screens/onboarding/onboarding`
- ❌ Invalid Code → Error message, stay on screen
- 🔄 Resend Code → Calls send-phone-verification again

**Important:** This step completes registration and automatically logs the user in, storing authentication tokens.

### 5. Onboarding (`/auth/screens/onboarding/onboarding`)

**File:** `front-mobile/src/app/auth/screens/onboarding/onboarding.tsx`

- Welcome and introduction screens
- App feature explanations
- User is now fully authenticated

## 🔑 Complete Signin Flow

### 1. Login Screen (`/auth/screens/Login`)

**File:** `front-mobile/src/app/auth/screens/Login/index.tsx`
**Component:** `LoginCard.tsx`
**Backend Endpoint:** `POST /api/auth/sign-in`

**Form Fields:**

- Email (required, validated)
- Password (required)
- Remember Me checkbox
- Forgot Password link

**API Call:**

```javascript
const response = await signin({ email, password });
```

**Possible Responses:**

#### Standard Login Success

- **Response:** `{ accessToken, refreshToken, user, role, dashboardRoute }`
- **Action:** Store tokens, navigate to main app
- **Navigation:** → `/main/screens/(tabs)/properties`

#### 2FA Required

- **Response:** `{ requires2FA: true, userId, email, message }`
- **Action:** Redirect to 2FA verification
- **Navigation:** → `/auth/screens/Login/TwoFactorLogin?userId={userId}&email={email}`

#### Account Status Issues

- **Email not verified:** → Error message
- **Account pending approval:** → Error message
- **Account rejected:** → Error message
- **Account locked:** → Lockout message with timer

### 2. Two-Factor Authentication (`/auth/screens/Login/TwoFactorLogin`)

**File:** `front-mobile/src/app/auth/screens/Login/TwoFactorLogin.tsx`
**Backend Endpoint:** `POST /api/auth/complete-2fa-login`

**Process:**

- 6-digit TOTP code input
- Validates against user's 2FA secret

**API Call:**

```javascript
await axios.post("/api/auth/complete-2fa-login", { userId, token });
```

**Navigation:**

- ✅ Success → `/main/screens/(tabs)/properties` (with full authentication)
- ❌ Invalid Code → Error message, retry
- 🔙 Back to Login → `/auth/screens/Login`

## 🔄 Password Reset Flow

### 1. Forgot Password Request (`/auth/screens/Login/forgotPassword/forgotPassword`)

**File:** `front-mobile/src/app/auth/screens/Login/forgotPassword/forgotPassword.tsx`
**Component:** `ForgotPasswordCard.tsx`
**Backend Endpoint:** `POST /api/auth/forgot-password`

**Process:**

- User enters email address
- System sends reset code to email

**API Call:**

```javascript
await axios.post("/api/auth/forgot-password", { email });
```

**Navigation:**

- ✅ Code Sent → `/auth/screens/Login/forgotPassword/OTPReset`

### 2. Reset Code Verification (`/auth/screens/Login/forgotPassword/OTPReset`)

**File:** `front-mobile/src/app/auth/screens/Login/forgotPassword/OTPReset.tsx`
**Component:** `OTPResetCard.tsx`

**Process:**

- 4-digit reset code input
- Validates code from email

**Navigation:**

- ✅ Valid Code → `/auth/screens/Login/forgotPassword/resetPassword`
- ❌ Invalid Code → Error message, retry

### 3. New Password Creation (`/auth/screens/Login/forgotPassword/resetPassword`)

**File:** `front-mobile/src/app/auth/screens/Login/forgotPassword/resetPassword.tsx`
**Backend Endpoint:** `POST /api/auth/reset-password`

**Process:**

- User creates new password
- Password confirmation validation
- Updates password in database

**Navigation:**

- ✅ Success → `/auth/screens/Login` (login with new password)

## 🔒 Backend Authentication Endpoints

### Core Endpoints

| Endpoint                            | Method | Purpose                | Required Fields                           |
| ----------------------------------- | ------ | ---------------------- | ----------------------------------------- |
| `/api/auth/sign-up`                 | POST   | User registration      | name, surname, email, password, birthdate |
| `/api/auth/verify-email`            | POST   | Email verification     | email, code                               |
| `/api/auth/send-phone-verification` | POST   | Send SMS code          | userId                                    |
| `/api/auth/verify-phone`            | POST   | Phone verification     | userId, verificationCode                  |
| `/api/auth/sign-in`                 | POST   | User login             | email, password                           |
| `/api/auth/complete-2fa-login`      | POST   | 2FA verification       | userId, token                             |
| `/api/auth/refresh-token`           | POST   | Token refresh          | refreshToken                              |
| `/api/auth/logout`                  | POST   | User logout            | Authorization header                      |
| `/api/auth/forgot-password`         | POST   | Password reset request | email                                     |
| `/api/auth/reset-password`          | POST   | Password reset         | email, code, newPassword                  |

## 🔄 Detailed Backend Implementation & Data Flow

### 📝 User Registration Flow (`POST /api/auth/sign-up`)

**Frontend Request:**

```javascript
// From SignupCard.tsx
const signupData = {
  name: "John",
  surname: "Doe",
  email: "john.doe@example.com",
  password: "SecurePass123!",
  birthdate: "1990-01-15",
  phone: "+1234567890", // Optional
  accountType: "user",
};

const response = await axios.post(`${API_URL}/api/auth/sign-up`, signupData);
```

**Backend Controller (`authController.js - signUp`):**

```javascript
exports.signUp = async (req, res) => {
  const { name, surname, email, password, birthdate, phone, requestedRole } =
    req.body;

  // 1. Validate required fields
  if (!name || !surname || !email || !password || !birthdate) {
    return res.status(400).json({
      message: "Name, surname, email, password, and birthdate are required",
    });
  }

  // 2. Check if user already exists
  const existingUser = await User.findOne({ where: { email } });

  // 3. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4. Generate account number & verification code
  const accountNo = parseInt(Date.now().toString().slice(-8));
  const { otp: verificationCode, expiry: expiryTime } = generateOTP({
    digits: 4,
    expiryMinutes: 10,
  });

  // 5. Create user in database
  const newUser = await User.create({
    accountNo,
    name,
    surname,
    email,
    password: hashedPassword,
    birthdate,
    phone: phone || null,
    signupVerificationCode: verificationCode,
    signupVerificationExpires: expiryTime,
    roleId,
    approvalStatus: "unverified",
    isVerified: false,
    phoneVerified: false,
  });

  // 6. Send verification email
  await sendVerificationEmail(
    email,
    verificationCode,
    `${name} ${surname}`,
    "email"
  );
};
```

**Database Changes:**

- **Table:** `users`
- **Action:** INSERT new user record
- **Status:** `approvalStatus: "unverified"`, `isVerified: false`

**Backend Response:**

```javascript
{
  message: "Registration successful. Please verify your email address to continue.",
  status: "pending_email_verification",
  user: {
    id: 123,
    email: "john.doe@example.com",
    phone: "+1234567890",
    approval_status: "unverified"
  }
}
```

---

### ✉️ Email Verification Flow (`POST /api/auth/verify-email`)

**Frontend Request:**

```javascript
// From OTPCard.tsx
await verifySignUp(email, code);

// Which calls:
const response = await axios.post(`${API_URL}/api/auth/verify-email`, {
  email: "john.doe@example.com",
  code: "1234",
});
```

**Backend Controller (`authController.js - verifyEmail`):**

```javascript
exports.verifyEmail = async (req, res) => {
  const { email, code } = req.body;

  // 1. Find user by email
  const user = await User.findOne({ where: { email } });

  // 2. Validate verification code
  if (user.signupVerificationCode !== code) {
    return res.status(400).json({ message: "Invalid verification code" });
  }

  // 3. Check expiration
  if (new Date() > new Date(user.signupVerificationExpires)) {
    return res.status(400).json({ message: "Verification code has expired" });
  }

  // 4. Update user status
  await User.update(
    {
      isVerified: true,
      signupVerificationCode: null,
      signupVerificationExpires: null,
      approvalStatus: "pending", // Now pending admin approval
    },
    { where: { id: user.id } }
  );
};
```

**Database Changes:**

- **Table:** `users`
- **Action:** UPDATE user record
- **Changes:** `isVerified: true`, `approvalStatus: "pending"`, clear verification code

**Backend Response:**

```javascript
{
  message: "Email verified successfully. Your account is now pending admin approval. You'll be notified once approved.";
}
```

---

### 📱 Phone Verification Flow

#### Step 1: Send SMS (`POST /api/auth/send-phone-verification`)

**Frontend Request:**

```javascript
// From PhoneOTPCard.tsx (automatic on mount)
const response = await axios.post("/api/auth/send-phone-verification", {
  userId: 123,
});
```

**Backend Controller (`authController.js - sendPhoneVerification`):**

```javascript
exports.sendPhoneVerification = async (req, res) => {
  const { userId } = req.body;

  // 1. Find user
  const user = await User.findByPk(userId);

  // 2. Generate phone verification code
  const { otp: phoneVerificationCode, expiry: expiryTime } = generateOTP({
    digits: 6,
    expiryMinutes: 10,
  });

  // 3. Update user with phone code
  await User.update(
    {
      phoneVerificationCode,
      verificationCodeExpires: new Date(expiryTime),
    },
    { where: { id: userId } }
  );

  // 4. Send SMS via Twilio
  const { sendSMS } = require("../config/twilio.config");
  const message = `Your Korpor verification code is: ${phoneVerificationCode}. This code will expire in 10 minutes.`;
  await sendSMS(user.phone, message);
};
```

#### Step 2: Verify Phone (`POST /api/auth/verify-phone`)

**Frontend Request:**

```javascript
// From PhoneOTPCard.tsx
const response = await axios.post("/api/auth/verify-phone", {
  userId: 123,
  verificationCode: "123456",
});
```

**Backend Controller (`authController.js - verifyPhone`):**

```javascript
exports.verifyPhone = async (req, res) => {
  const { userId, verificationCode } = req.body;

  // 1. Find user with role information
  const user = await User.findOne({
    where: { id: userId },
    include: [{ model: Role, as: "role" }],
  });

  // 2. Validate phone verification code
  if (user.phoneVerificationCode !== verificationCode) {
    return res.status(400).json({ message: "Invalid verification code" });
  }

  // 3. Mark phone as verified and auto-approve user
  await User.update(
    {
      phoneVerified: true,
      phoneVerificationCode: null,
      verificationCodeExpires: null,
      approvalStatus: "approved", // Auto-approve after phone verification
    },
    { where: { id: userId } }
  );

  // 4. Generate authentication tokens
  const { accessToken, refreshToken } = generateTokens(updatedUser);

  // 5. Update user with refresh token
  await User.update(
    {
      refreshToken,
      refreshTokenExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      lastLogin: new Date(),
    },
    { where: { id: userId } }
  );
};
```

**Database Changes:**

- **Table:** `users`
- **Action:** UPDATE user record
- **Changes:** `phoneVerified: true`, `approvalStatus: "approved"`, store `refreshToken`

**Backend Response (Complete Authentication):**

```javascript
{
  message: "Phone number verified successfully. You are now logged in!",
  status: "phone_verified",
  accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: {
    id: 123,
    accountNo: "12345678",
    name: "John",
    surname: "Doe",
    email: "john.doe@example.com",
    phone: "+1234567890",
    profilePicture: null,
    lastLogin: "2024-12-21T10:30:00.000Z",
    isVerified: true,
    phoneVerified: true,
    approvalStatus: "approved"
  },
  role: "user",
  privileges: ["read"],
  dashboardRoute: "/dashboard"
}
```

---

### 🔐 User Login Flow (`POST /api/auth/sign-in`)

**Frontend Request:**

```javascript
// From LoginCard.tsx
const response = await signin({
  email: "john.doe@example.com",
  password: "SecurePass123!",
});
```

**Backend Controller (`authController.js - signIn`):**

```javascript
exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  // 1. Find user with role information
  const user = await User.findOne({
    where: { email },
    include: [{ model: Role, as: "role" }],
  });

  // 2. Check account lockout
  if (user.lockedUntil && new Date() < new Date(user.lockedUntil)) {
    return res.status(423).json({
      message: "Account is temporarily locked due to too many failed attempts",
      lockoutDuration: new Date(user.lockedUntil) - new Date(),
      unlockTime: user.lockedUntil,
    });
  }

  // 3. Verify password
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    await recordFailedLoginAttempt(email);
    return res.status(401).json({
      message: "Invalid email or password",
      remainingAttempts: 5 - user.failedLoginAttempts,
    });
  }

  // 4. Check verification status
  if (!user.isVerified) {
    return res.status(403).json({
      message:
        "Email not verified. Please verify your email before signing in.",
    });
  }

  // 5. Check approval status
  if (user.approvalStatus !== "approved") {
    return res.status(403).json({
      message: "Your account is pending approval by an administrator.",
    });
  }

  // 6. Check 2FA requirement
  if (user.twoFactorEnabled) {
    return res.status(200).json({
      message: "Password verified. 2FA verification required.",
      requires2FA: true,
      userId: user.id,
      email: user.email,
      tempSession: true,
    });
  }

  // 7. Generate tokens and complete login
  const { accessToken, refreshToken } = generateTokens(user);

  // 8. Update user login info
  await User.update(
    {
      refreshToken,
      refreshTokenExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      lastLogin: new Date(),
    },
    { where: { id: user.id } }
  );

  // 9. Reset failed login attempts
  await resetFailedLoginAttempts(user.id);
};
```

**Possible Backend Responses:**

#### Standard Login Success:

```javascript
{
  message: "Sign in successful",
  accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: {
    id: 123,
    accountNo: "12345678",
    name: "John",
    surname: "Doe",
    email: "john.doe@example.com",
    profilePicture: null,
    lastLogin: "2024-12-21T10:30:00.000Z"
  },
  role: "user",
  privileges: ["read"],
  deviceInfo: {
    deviceId: "dGVzdA==",
    browser: "Mozilla",
    os: "Windows NT 10.0",
    location: "192.168.1.100"
  },
  dashboardRoute: "/dashboard"
}
```

#### 2FA Required:

```javascript
{
  message: "Password verified. 2FA verification required.",
  requires2FA: true,
  userId: 123,
  email: "john.doe@example.com",
  tempSession: true
}
```

#### Account Issues:

```javascript
// Email not verified
{
  message: "Email not verified. Please verify your email before signing in."
}

// Pending approval
{
  message: "Your account is pending approval by an administrator."
}

// Account locked
{
  message: "Account is temporarily locked due to too many failed attempts",
  lockoutDuration: 1800000, // 30 minutes in milliseconds
  unlockTime: "2024-12-21T11:00:00.000Z",
  waitTime: "30 minute(s)"
}
```

---

### 🔐 Token Management & JWT Structure

#### JWT Token Structure:

```javascript
// Access Token Payload
{
  userId: 123,
  email: "john.doe@example.com",
  role: "user",
  exp: 1703160000, // Expiration timestamp
  iat: 1703156400  // Issued at timestamp
}

// Refresh Token Payload
{
  userId: 123,
  tokenType: "refresh",
  exp: 1703760000, // 7 days later
  iat: 1703156400
}
```

#### Token Refresh Flow (`POST /api/auth/refresh-token`):

**Frontend Request:**

```javascript
const response = await fetch(`${API_URL}/api/auth/refresh-token`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  }),
});
```

**Backend Response:**

```javascript
{
  accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // New access token
  refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  // New refresh token
}
```

---

### 🗃️ Database Schema

#### Users Table Structure:

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  accountNo INT UNIQUE,
  name VARCHAR(255) NOT NULL,
  surname VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  birthdate DATE,
  phone VARCHAR(20),
  profilePicture VARCHAR(500),

  -- Verification fields
  isVerified BOOLEAN DEFAULT false,
  phoneVerified BOOLEAN DEFAULT false,
  signupVerificationCode VARCHAR(10),
  signupVerificationExpires DATETIME,
  phoneVerificationCode VARCHAR(10),
  emailVerificationCode VARCHAR(10),
  verificationCodeExpires DATETIME,

  -- Account status
  approvalStatus ENUM('unverified', 'pending', 'approved', 'rejected') DEFAULT 'unverified',

  -- Authentication
  refreshToken TEXT,
  refreshTokenExpires DATETIME,
  lastLogin DATETIME,

  -- Security
  failedLoginAttempts INT DEFAULT 0,
  lockedUntil DATETIME,
  twoFactorEnabled BOOLEAN DEFAULT false,
  twoFactorSecret VARCHAR(255),

  -- Metadata
  roleId INT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (roleId) REFERENCES roles(id)
);
```

#### State Transitions:

1. **User Creation:** `approvalStatus: "unverified"`, `isVerified: false`
2. **Email Verified:** `isVerified: true`, `approvalStatus: "pending"`
3. **Phone Verified:** `phoneVerified: true`, `approvalStatus: "approved"` (auto-approved)
4. **Fully Authenticated:** All verification complete, tokens issued

## 🏪 State Management

### AuthService (`authService.ts`)

**Core Functions:**

- `storeAuthData(authData)` - Store complete authentication data
- `getValidAccessToken()` - Get current or refreshed access token
- `isAuthenticated()` - Check authentication status
- `logout()` - Clear all authentication data
- `getCurrentUser()` - Get current user information
- `refreshAccessToken()` - Automatic token refresh

**Token Management:**

- Automatic token refresh 5 minutes before expiration
- Secure storage using Expo SecureStore
- JWT token parsing and validation
- Graceful handling of expired tokens

### AuthStore (`authStore.ts`)

**State Variables:**

- `accessToken` - Current access token
- `refreshToken` - Refresh token for renewal
- `user` - Current user object
- `role` - User role (user, admin, agent, superadmin)
- `isLoading` - Loading state
- `isAuthenticated` - Authentication status

## 🔐 Security Features

### Token Management

- **Access Token:** 1-hour expiration, JWT format
- **Refresh Token:** 7-day expiration, secure storage
- **Automatic Refresh:** Tokens refreshed before expiration
- **Secure Storage:** All tokens stored in Expo SecureStore

### Account Security

- **Email Verification:** 4-digit OTP, 10-minute expiration
- **Phone Verification:** 6-digit SMS OTP, 10-minute expiration
- **Two-Factor Authentication:** TOTP-based, optional
- **Password Reset:** 6-digit email code, 1-hour expiration
- **Login Attempts:** Account lockout after failed attempts
- **Password Requirements:** Configurable strength validation

### Admin Controls

- **Account Approval:** Manual approval workflow
- **Role Assignment:** Multiple user roles supported
- **Account Status:** Active, pending, rejected, locked states

## 🛡️ Error Handling

### Frontend Error Handling

- **Network Errors:** Graceful fallback, retry mechanisms
- **Validation Errors:** Real-time form validation
- **Authentication Errors:** Clear error messages
- **Token Expiration:** Automatic refresh or re-authentication

### Backend Error Responses

- **400 Bad Request:** Validation errors, missing fields
- **401 Unauthorized:** Invalid credentials, expired tokens
- **403 Forbidden:** Account not verified, pending approval
- **409 Conflict:** Email already exists
- **429 Too Many Requests:** Rate limiting
- **500 Internal Server Error:** Server-side errors

## 🚀 Navigation Flow Summary

```
Entry Point (/)
    ↓
┌─────────────┐     ┌─────────────┐
│   Signup    │     │    Login    │
│   Screen    │     │   Screen    │
└─────────────┘     └─────────────┘
    ↓                       ↓
┌─────────────┐     ┌─────────────┐
│   Email     │     │  Password   │
│Verification │     │   Check     │
└─────────────┘     └─────────────┘
    ↓                       ↓
┌─────────────┐     ┌─────────────┐
│   Phone     │     │  2FA Check  │
│Verification │     │ (if enabled)│
└─────────────┘     └─────────────┘
    ↓                       ↓
┌─────────────┐     ┌─────────────┐
│ Onboarding  │────▶│  Main App   │
│   Screen    │     │ (Properties)│
└─────────────┘     └─────────────┘
```

## 📝 Key Implementation Notes

1. **Phone Number Handling:** Phone numbers are collected during signup but not sent to the backend initially. They're used for verification after email confirmation.

2. **Auto-Login:** Phone verification automatically logs users in and stores authentication tokens.

3. **Token Refresh:** The system automatically refreshes access tokens 5 minutes before expiration.

4. **Biometric Support:** Optional biometric authentication is integrated into the login flow.

5. **Admin Approval:** After email and phone verification, accounts may require admin approval before full activation.

6. **2FA Integration:** Two-factor authentication is optional and uses TOTP (Time-based One-Time Password) standard.

7. **Cross-Platform:** The authentication system works across iOS and Android using React Native and Expo.

---

**Last Updated:** December 2024  
**Version:** 1.0  
**Maintainer:** Korpor Development Team
