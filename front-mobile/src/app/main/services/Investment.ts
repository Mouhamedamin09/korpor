// @main/services/Investment.ts

const API_URL = 'http://192.168.43.44:5000/api'; // Android IP

// Local auth utilities
const getAuthToken = (): string => {
  // For development, use mock token for user ID 1
  return 'mock-token-user-1';
};

export interface UserInvestmentData {
  currency: "TND" | "EUR";
  totalInvested: number;
  monthlyContribution: number;
  averageYield: number;
  projectedReturns: {
    year1: number;
    year5: number;
    year10: number;
    year15: number;
  };
}

export interface InvestmentProjection {
  years: number;
  monthlyDeposit: number;
  yieldPct: number;
  currency: "TND" | "EUR";
  projections: Array<{
    year: number;
    totalValue: number;
    monthlyIncome: number;
    totalDeposited: number;
    totalReturns: number;
  }>;
}

export async function fetchUserInvestmentData(): Promise<UserInvestmentData> {
  try {
    const token = getAuthToken();
    
    const response = await fetch(`${API_URL}/investments/user-data`, {
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
      throw new Error(result.message || 'Failed to fetch investment data');
    }
  } catch (error) {
    console.error('Error fetching investment data:', error);
    
    // Return fallback data for development
    return {
      currency: "TND",
      totalInvested: 50000,
      monthlyContribution: 6000,
      averageYield: 6.5,
      projectedReturns: {
        year1: 75000,
        year5: 250000,
        year10: 500000,
        year15: 850000
      }
    };
  }
}

export async function calculateInvestmentProjection(
  monthlyDeposit: number,
  years: number,
  yieldPct: number
): Promise<InvestmentProjection> {
  try {
    const token = getAuthToken();
    
    const response = await fetch(`${API_URL}/investments/projection`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        monthlyDeposit,
        years,
        yieldPct
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || 'Failed to calculate projection');
    }
  } catch (error) {
    console.error('Error calculating projection:', error);
    
    // Return fallback calculation
    const projections = [];
    let totalDeposited = 0;
    
    for (let year = 0; year <= years; year++) {
      totalDeposited = monthlyDeposit * 12 * year;
      const compoundValue = totalDeposited * Math.pow(1 + yieldPct / 100, year);
      const totalValue = Math.round(compoundValue);
      const monthlyIncome = Math.round((totalValue * (yieldPct / 100)) / 12);
      const totalReturns = totalValue - totalDeposited;
      
      projections.push({
        year,
        totalValue,
        monthlyIncome,
        totalDeposited,
        totalReturns
      });
    }
    
    return {
      years,
      monthlyDeposit,
      yieldPct,
      currency: "TND",
      projections
    };
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