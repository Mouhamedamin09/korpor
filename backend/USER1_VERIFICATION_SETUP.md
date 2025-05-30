# User 1 (Admin Kraiem) Verification Setup - 2/4 Progress

This document explains how to set up user ID 1 (admin kraiem) with the correct 2/4 progress status in the verification system.

## Overview

The verification system has 4 steps:
1. ✅ **Account Created** (Always complete)
2. ✅ **Employment Information** (Always complete) 
3. ⏳ **Identity Verification** (Pending - passport + selfie upload)
4. ⏳ **Address Verification** (Pending - address document upload)

For 2/4 progress, steps 1-2 are complete, and steps 3-4 are pending.

## Current Status

The system has been configured to show 2/4 progress for user ID 1 with the following setup:

### Backend Configuration
- ✅ Verification API endpoints are properly mounted at `/api/verification`
- ✅ Mock authentication supports `mock-token-user-1` for testing
- ✅ Database model supports all verification status fields
- ✅ Controller logic handles new users with default 2/4 progress

### Frontend Configuration  
- ✅ Verification service uses mock tokens for development
- ✅ CompleteAccountSetupScreen shows proper progress indicators
- ✅ Error handling provides graceful fallbacks to 2/4 progress
- ✅ Pull-to-refresh functionality updates verification status

## Setup Scripts

### 1. Initialize User 1 Verification Record
```bash
cd backend
node setup-user1-verification.js
```

This script will:
- Find user ID 1 in the database
- Create or update their verification record with pending status
- Set identity and address status to 'pending'
- Set overall status to 'incomplete'
- Clear any existing uploaded documents

### 2. Test User 1 Status
```bash
cd backend  
node test-user1-status.js
```

This script will:
- Call the verification status API for user 1
- Display the current progress (should show 2/4)
- Verify that canProceed is true
- Show next step should be 'identity'

## API Endpoints

### Get Verification Status
```
GET /api/verification/status/1
Authorization: Bearer mock-token-user-1
```

Expected Response for 2/4 Progress:
```json
{
  "userId": 1,
  "identityStatus": "pending",
  "addressStatus": "pending", 
  "overallStatus": "incomplete",
  "canProceed": true,
  "nextStep": "identity"
}
```

### Upload Identity Documents (Step 3)
```
POST /api/verification/identity
Authorization: Bearer mock-token-user-1
Content-Type: multipart/form-data

passportImage: [file]
selfieImage: [file]
userId: 1
```

### Upload Address Document (Step 4)
```
POST /api/verification/address
Authorization: Bearer mock-token-user-1
Content-Type: multipart/form-data

addressImage: [file]
userId: 1
```

## Frontend Behavior

### CompleteAccountSetupScreen
- Shows steps 1-2 with green checkmarks (✅)
- Shows steps 3-4 with clock icons (⏳) and "2 mins" message
- Displays "Continue" button that leads to passport upload
- Shows "Regulations require us to verify..." message
- Pull-to-refresh updates status from API

### Navigation Flow
1. User sees 2/4 progress on CompleteAccountSetupScreen
2. Taps "Continue" → navigates to UploadPassportScreen
3. After passport upload → status becomes "under_review"
4. When approved → can proceed to AddressScreen
5. After address upload → status becomes fully verified (4/4)

## Database Schema

### Verification Table
```sql
CREATE TABLE verifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  identity_status ENUM('pending', 'under_review', 'approved', 'rejected') DEFAULT 'pending',
  address_status ENUM('pending', 'under_review', 'approved', 'rejected') DEFAULT 'pending', 
  overall_status ENUM('incomplete', 'under_review', 'verified', 'rejected') DEFAULT 'incomplete',
  passport_image_url VARCHAR(255),
  selfie_image_url VARCHAR(255),
  address_image_url VARCHAR(255),
  identity_submitted_at DATETIME,
  address_submitted_at DATETIME,
  identity_reviewed_at DATETIME,
  address_reviewed_at DATETIME,
  identity_rejection_reason TEXT,
  address_rejection_reason TEXT,
  backoffice_request_id VARCHAR(255),
  created_at DATETIME,
  updated_at DATETIME
);
```

## Testing Scenarios

### 1. New User (2/4 Progress)
- No verification record exists
- API returns default pending status  
- Frontend shows 2/4 progress
- User can proceed to identity verification

### 2. Identity Under Review (2/4 Progress)
- Identity status: 'under_review'
- Address status: 'pending'
- canProceed: false
- Frontend shows "Documents under review"

### 3. Identity Approved (3/4 Progress)
- Identity status: 'approved'
- Address status: 'pending'
- canProceed: true, nextStep: 'address'
- User can proceed to address verification

### 4. Verification Complete (4/4 Progress)
- Identity status: 'approved'
- Address status: 'approved'
- Overall status: 'verified'
- Frontend shows "Continue to Dashboard"

### 5. Rejection Handling
- If identity rejected: canProceed: true, nextStep: 'identity'
- If address rejected: canProceed: true, nextStep: 'address'
- Users can retry failed verifications

## Troubleshooting

### Backend Issues
- Ensure verification routes are mounted in server.js
- Check authentication middleware supports mock tokens
- Verify database connection and model associations

### Frontend Issues  
- Check Verification.ts service returns proper default status
- Ensure error handling provides 2/4 fallback
- Verify navigation routes are correct

### Common Problems
1. **"canProceed: false" for new users**: Fixed in controller logic
2. **"Network request failed"**: Check server is running and routes mounted
3. **Wrong progress calculation**: Ensure frontend calculates based on status

## Mock Authentication

For development, the system uses mock tokens:
- Token format: `mock-token-user-{id}`
- User 1: `mock-token-user-1`
- Automatically creates user object with proper fields

This allows testing without real JWT tokens during development. 