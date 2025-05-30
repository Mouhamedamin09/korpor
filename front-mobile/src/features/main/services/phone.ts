import EV_API_URL from "src/shared/constants/api";

interface PhoneChangeResponse {
  message: string;
  code?: string;
}

export async function requestPhoneChange(userId: string, newPhone: string): Promise<PhoneChangeResponse> {
  try {
    console.log('📱 Requesting phone change:', { userId, newPhone });
    
    const response = await fetch(`${EV_API_URL}/api/users/request-phone-change`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, newPhone }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Phone change request failed:', error);
      throw new Error(error.error || 'Failed to request phone change');
    }

    const result = await response.json();
    console.log('📱 Phone change response:', result);
    
    if (result.code) {
      console.log('✅ Verification code received:', result.code);
    } else {
      console.log('ℹ️ No verification code in response (production mode)');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error requesting phone change:', error);
    throw error;
  }
}

export async function verifyPhone(userId: string, verificationCode: string): Promise<{ message: string }> {
  try {
    console.log('🔐 Verifying phone:', { userId, verificationCode });
    
    const response = await fetch(`${EV_API_URL}/api/users/verify-phone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, verificationCode }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Phone verification failed:', error);
      throw new Error(error.error || 'Failed to verify phone');
    }

    const result = await response.json();
    console.log('✅ Phone verification successful:', result);
    return result;
  } catch (error) {
    console.error('❌ Error verifying phone:', error);
    throw error;
  }
} 