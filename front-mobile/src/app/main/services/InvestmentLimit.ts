// @main/services/InvestmentLimit.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '../../../shared/constants/api';

export interface InvestmentLimitData {
  /** Amount already invested this year (TND) */
  investedThisYear: number;
  /** Total annual limit (TND) */
  annualLimit: number;
  /** ISO date when limit renews */
  renewalDate: string;
  /** Asset threshold (USD) to become professional */
  professionalThreshold: number;
}

export async function fetchInvestmentLimitData(): Promise<InvestmentLimitData> {
  try {
    // Get the JWT token from AsyncStorage
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/api/investments/limits`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        await AsyncStorage.removeItem('accessToken');
        throw new Error('Session expired. Please login again.');
      }
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    return data as InvestmentLimitData;
  } catch (error) {
    console.error('Error fetching investment limits:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch investment limits');
  }
}
