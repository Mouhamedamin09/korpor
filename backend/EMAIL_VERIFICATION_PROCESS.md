# Email Verification Process

## How It Works

When a user wants to change their email address, the following process occurs:

### 1. Request Email Change
- **Endpoint**: `POST /api/user/request-email-change`
- **Body**: `{ userId: 1, newEmail: "new@email.com" }`

**Process:**
1. Validates the request (userId and newEmail required)
2. Checks if user exists
3. **Throttling**: Allows maximum 5 email changes per month (rolling 30-day window)
4. Generates a 6-digit verification code
5. Sets expiration time (10 minutes)
6. Saves to database:
   - `pendingEmail`: The new email address
   - `emailVerificationCode`: The verification code
   - `verificationCodeExpires`: When the code expires
7. **Sends app-themed verification email to CURRENT email** (not the new one)
8. Returns success message with code (in development mode)

### 2. Verify Email Change
- **Endpoint**: `POST /api/user/verify-email`
- **Body**: `{ userId: 1, verificationCode: "123456" }`

**Process:**
1. Validates the request (userId and verificationCode required)
2. Looks up user with matching code that hasn't expired
3. If valid:
   - Updates `email` to the `pendingEmail` value
   - Clears verification fields (`pendingEmail`, `emailVerificationCode`, `verificationCodeExpires`)
   - Updates `lastEmailChange` timestamp
4. Returns success message with new email

## App-Themed Email Design

The verification emails now use a beautiful, app-themed design that perfectly matches your Korpor mobile app:

### 🎨 **Design Alignment with Mobile App:**
- **Korpor Brand Colors**: Matches the exact green palette from your app
  - Primary Green: `#10B981` (same as app buttons and accents)
  - Gradient Header: `#008F6B` to `#00B37D` (same as app carousel cards)
  - Text Colors: `#0F172A` and `#475569` (same as app typography)
- **Visual Consistency**: Clean, modern cards with rounded corners like the app
- **Typography**: Same font stack as your mobile app for consistency

### 🎯 **Key Visual Elements:**
1. **Header Section**: 
   - Korpor green gradient background matching app carousel
   - Animated floating dots for visual interest
   - Updated tagline: "Your Trusted Investment Platform"
   - Clean, bold KORPOR branding

2. **Verification Code Box**:
   - Light green gradient background (`#F0FDF4` to `#DCFCE7`)
   - Korpor green border (`#10B981`) matching app accent color
   - Large, prominent code in brand green
   - Security lock emoji positioned as a badge

3. **Information Sections**:
   - Expiry warning with yellow gradient (clear visual hierarchy)
   - Security information with blue gradient
   - Professional list formatting with proper spacing

4. **Footer**:
   - Subtle gradient background
   - Korpor brand name highlighted in green
   - Professional contact information

### 🔧 **Technical Features:**
- **Cross-platform compatibility**: Works perfectly across all email clients
- **Mobile responsive**: Optimized layout for mobile devices
- **Accessible design**: High contrast ratios and clear typography
- **CSS animations**: Subtle header animation for modern feel
- **Plain text fallback**: Comprehensive text version included

## Security Features

1. **Verification sent to OLD email**: Ensures the user has access to their current email
2. **Time-limited codes**: Codes expire after 10 minutes
3. **Rate limiting**: Maximum 5 changes per month
4. **Rolling window**: The 30-day limit is rolling, not calendar-based
5. **Secure code generation**: Uses cryptographically random 6-digit codes
6. **Security warnings**: Professional security information section with clear guidelines

## API Testing

You can test the API endpoints using these curl commands:

### Request Email Change
```bash
curl -X POST http://localhost:5000/api/user/request-email-change \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "newEmail": "new@example.com"}'
```

### Verify Email Change
```bash
curl -X POST http://localhost:5000/api/user/verify-email \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "verificationCode": "123456"}'
```

## Email Configuration

The system uses Gmail SMTP with app-themed HTML templates. Required environment variables:
- `SMTP_HOST=smtp.gmail.com`
- `SMTP_PORT=587`
- `SMTP_USER=your_email@gmail.com`
- `SMTP_PASS=your_app_password`
- `SMTP_FROM="Korpor" <your_email@gmail.com>`

**Note**: Use Gmail App Password, not your regular Gmail password.

## Template Preview

You can preview the app-themed email template by opening `backend/email-template-preview.html` in your browser to see exactly how the verification emails will look to users. The design perfectly matches your mobile app's visual identity.

## Error Handling

- **Missing credentials**: If SMTP credentials are missing, returns 500 error
- **Invalid/expired code**: If verification code is wrong or expired, returns 400 error
- **Rate limiting**: If user has changed email 5 times in 30 days, returns 400 error
- **User not found**: If userId doesn't exist, returns 404 error

## Frontend Integration

When user clicks "Save Changes" for email:
1. Call `request-email-change` endpoint
2. Show message: "Verification code sent to your current email"
3. Show OTP input field
4. When user enters code, call `verify-email` endpoint
5. Show success message and update UI with new email

The process ensures security by verifying the user has access to their current email before allowing the change, now with a beautiful, app-consistent email experience that reinforces your brand identity. 