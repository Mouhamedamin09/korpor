import EV_API_URL from "src/shared/constants/api";

export interface Numbers {
  userCount: string;
  propertyVolume: string;
}

export async function getNumbers(): Promise<Numbers> {
  try {
    const response = await fetch(`${EV_API_URL}/api/numbers`);
    if (!response.ok) {
      throw new Error('Failed to fetch numbers');
    }
    const data = await response.json();
    return {
      userCount: data.userCount || "0",
      propertyVolume: data.propertyVolume || "100000000"
    };
  } catch (error) {
    console.error('Error fetching numbers:', error);
    // Return default values as strings
    return {
      userCount: "0",
      propertyVolume: "100000000"
    };
  }
}
