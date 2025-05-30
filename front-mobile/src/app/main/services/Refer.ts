// @main/services/Refer.ts

const API_URL = 'http://192.168.43.44:5000/api'; // Android IP

// Local auth utilities
const getAuthToken = (): string => {
  // For development, use mock token for user ID 1
  return 'mock-token-user-1';
};

const getCurrentUserId = (): number => {
  // For development, hardcode user ID 1
  return 1;
};

export interface ReferralInfo {
  userId: string;
  currency: "TND" | "EUR";
  code: string;
  /** monthly referral bonus */
  referralAmount: number;
  /** minimum investment threshold */
  minInvestment: number;
  stats?: {
    totalReferred: number;
    totalInvested: number;
  };
}

export async function fetchReferralInfo(): Promise<ReferralInfo> {
  try {
    const token = getAuthToken();
    
    const response = await fetch(`${API_URL}/referrals/info`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || 'Failed to fetch referral info');
    }
  } catch (error) {
    console.error('Error fetching referral info:', error);
    
    // Return fallback data for development
    return {
      userId: getCurrentUserId().toString(),
      currency: "TND",
      code: "DEV123",
      referralAmount: 25,
      minInvestment: 2000,
      stats: {
        totalReferred: 0,
        totalInvested: 0
      }
    };
  }
}

export async function switchCurrency(newCurrency: "TND" | "EUR"): Promise<ReferralInfo> {
  try {
    const token = getAuthToken();
    
    const response = await fetch(`${API_URL}/referrals/switch-currency`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currency: newCurrency }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      // Fetch updated referral info after currency switch
      return await fetchReferralInfo();
    } else {
      throw new Error(result.message || 'Failed to switch currency');
    }
  } catch (error) {
    console.error('Error switching currency:', error);
    throw new Error('Failed to switch currency');
  }
}

export async function getReferralCode(): Promise<{ referralCode: string; shareLink: string }> {
  try {
    const token = getAuthToken();
    
    const response = await fetch(`${API_URL}/referrals/get-code`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || 'Failed to get referral code');
    }
  } catch (error) {
    console.error('Error getting referral code:', error);
    throw new Error('Failed to get referral code');
  }
}

export async function getUserCurrency(): Promise<"TND" | "EUR"> {
  try {
    const token = getAuthToken();
    
    const response = await fetch(`${API_URL}/referrals/currency`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data.currency;
    } else {
      throw new Error(result.message || 'Failed to fetch currency');
    }
  } catch (error) {
    console.error('Error fetching currency:', error);
    return "TND"; // Default fallback
  }
}
