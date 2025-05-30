# Korpor Verification System

## Overview

The Korpor verification system handles user identity and address verification through a comprehensive 4-step process. Users must complete identity verification (passport + selfie) and address verification (document upload) before they can invest in properties.

## System Architecture

### Backend Components

1. **Models**
   - `Verification.js` - Main verification data model
   - Tracks identity and address verification status separately
   - Includes timestamps, rejection reasons, and overall status

2. **Controllers**
   - `verificationController.js` - Handles document uploads and status management
   - Integrates with Cloudinary for image storage
   - Communicates with backoffice systems

3. **Routes**
   - `verificationRoutes.js` - API endpoints for verification operations
   - Handles file uploads, status checks, and backoffice webhooks

4. **Services**
   - `Verification.ts` (Frontend) - API integration service
   - Handles image uploads and status polling

### Database Schema

```sql
CREATE TABLE verifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  
  -- Identity verification (passport + selfie)
  identity_status ENUM('pending', 'under_review', 'approved', 'rejected') DEFAULT 'pending',
  passport_image_url VARCHAR(255),
  selfie_image_url VARCHAR(255),
  identity_submitted_at DATETIME,
  identity_reviewed_at DATETIME,
  identity_rejection_reason TEXT,
  
  -- Address verification
  address_status ENUM('pending', 'under_review', 'approved', 'rejected') DEFAULT 'pending',
  address_image_url VARCHAR(255),
  address_submitted_at DATETIME,
  address_reviewed_at DATETIME,
  address_rejection_reason TEXT,
  
  -- Overall status
  overall_status ENUM('incomplete', 'under_review', 'verified', 'rejected') DEFAULT 'incomplete',
  backoffice_request_id VARCHAR(255),
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## User Flow

### Step 1-2: Account Setup (Already Complete)
- User creates account
- User provides employment information

### Step 3: Identity Verification
1. User navigates to "Upload Passport" screen
2. User sees guidelines for proper document photos
3. User clicks "Verify passport" → goes to "Verification Progress" screen
4. User captures passport photo using document scanner
5. User takes selfie photo using camera
6. User clicks "Next" → documents uploaded to backend
7. Backend uploads images to Cloudinary
8. Backend sends documents to backoffice for review
9. User returns to "Complete Account Setup" with status "Under review"

### Step 4: Address Verification
1. User (after identity approval) navigates to "Upload Address" screen
2. User scans address document
3. User clicks "Verify address" → document uploaded to backend
4. Backend uploads image to Cloudinary
5. Backend sends document to backoffice for review
6. User returns to "Complete Account Setup" with status "Under review"

### Backoffice Review
1. Backoffice receives documents for manual review
2. Backoffice makes approval/rejection decision
3. Backoffice calls webhook endpoint to update status
4. Frontend polls for status updates and shows appropriate messages

## API Endpoints

### POST /api/verification/identity
Upload identity documents (passport + selfie)

**Request:**
```bash
curl -X POST http://localhost:5000/api/verification/identity \
  -H "Authorization: Bearer <token>" \
  -F "passportImage=@passport.jpg" \
  -F "selfieImage=@selfie.jpg"
```

**Response:**
```json
{
  "success": true,
  "message": "Identity documents uploaded successfully",
  "status": "under_review",
  "passportUrl": "https://cloudinary.com/passport.jpg",
  "selfieUrl": "https://cloudinary.com/selfie.jpg"
}
```

### POST /api/verification/address
Upload address verification document

**Request:**
```bash
curl -X POST http://localhost:5000/api/verification/address \
  -H "Authorization: Bearer <token>" \
  -F "addressImage=@address.jpg"
```

**Response:**
```json
{
  "success": true,
  "message": "Address document uploaded successfully",
  "status": "under_review",
  "addressUrl": "https://cloudinary.com/address.jpg"
}
```

### GET /api/verification/status
Get verification status for authenticated user

**Response:**
```json
{
  "userId": 1,
  "identityStatus": "under_review",
  "addressStatus": "pending",
  "overallStatus": "incomplete",
  "canProceed": false,
  "nextStep": "waiting_review",
  "identitySubmittedAt": "2024-01-15T10:30:00Z"
}
```

### POST /api/verification/update-status
Backoffice webhook to update verification status

**Request:**
```json
{
  "verificationId": 1,
  "type": "identity",
  "status": "approved"
}
```

## Status Management

### Identity Status Flow
- `pending` → User hasn't uploaded documents yet
- `under_review` → Documents uploaded, waiting for backoffice review
- `approved` → Documents approved by backoffice
- `rejected` → Documents rejected with reason

### Address Status Flow
- `pending` → User hasn't uploaded document yet
- `under_review` → Document uploaded, waiting for backoffice review
- `approved` → Document approved by backoffice
- `rejected` → Document rejected with reason

### Overall Status Logic
- `incomplete` → One or both verifications are pending
- `under_review` → At least one verification is under review
- `verified` → Both identity and address are approved
- `rejected` → At least one verification is rejected

## Frontend Integration

### Key Components

1. **CompleteAccountSetupScreen.tsx**
   - Shows verification progress
   - Displays status messages
   - Handles navigation based on verification state
   - Supports pull-to-refresh for status updates

2. **VerificationProgressScreen.tsx**
   - Handles identity document capture
   - Integrates with document scanner and camera
   - Uploads documents to backend
   - Shows upload progress and success/error messages

3. **UploadAddressScreen.tsx**
   - Handles address document capture
   - Uploads document to backend
   - Shows upload progress and success/error messages

4. **Verification.ts Service**
   - API integration layer
   - Handles FormData creation for file uploads
   - Manages authentication tokens
   - Provides status polling functionality

### Status Display Logic

The frontend shows different messages and UI states based on verification status:

- **Pending**: "2 mins" with clock icon (can proceed)
- **Under Review**: "Under review - We are verifying your documents" with yellow clock icon (cannot proceed)
- **Approved**: "Verified successfully" with green checkmark (complete)
- **Rejected**: Rejection reason with red X icon (can retry)

## Testing

### Manual Testing
1. Start backend server: `npm run dev`
2. Use frontend app to upload documents
3. Use test script to simulate backoffice decisions:
   ```bash
   node test-verification-status-update.js
   ```

### Test Scenarios
- Upload valid documents → verify "under_review" status
- Simulate approval → verify "approved" status
- Simulate rejection → verify rejection reason display
- Test resubmission after rejection

## Security Considerations

1. **File Upload Security**
   - 10MB file size limit
   - Image files only (MIME type validation)
   - Files stored in Cloudinary with secure URLs

2. **Authentication**
   - All endpoints require valid JWT token
   - User can only access their own verification data

3. **Data Privacy**
   - Images stored securely in Cloudinary
   - Sensitive data not logged
   - Rejection reasons handled carefully

## Backoffice Integration

### Mock Implementation
Currently includes mock backoffice integration that:
- Logs document submissions
- Provides webhook endpoint for status updates
- Can be replaced with real backoffice API

### Environment Variables
```bash
BACKOFFICE_WEBHOOK_URL=https://backoffice.example.com/verification
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Future Enhancements

1. **Real-time Updates**
   - WebSocket integration for instant status updates
   - Push notifications when verification completes

2. **Advanced Document Processing**
   - OCR for automatic data extraction
   - Document authenticity verification

3. **Analytics**
   - Track verification completion rates
   - Monitor rejection reasons

4. **Audit Trail**
   - Complete history of verification actions
   - Admin dashboard for verification management

## Troubleshooting

### Common Issues

1. **File Upload Fails**
   - Check Cloudinary credentials
   - Verify file size under 10MB
   - Ensure proper MIME type

2. **Status Not Updating**
   - Check database connection
   - Verify webhook endpoint accessibility
   - Check authentication tokens

3. **Frontend Not Showing Updates**
   - Verify API endpoints are working
   - Check authentication token validity
   - Use pull-to-refresh to force status update 