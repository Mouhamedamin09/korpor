export interface Founder {  imageUrl: string;
  linkedInUrl: string;
  name: string;
  role: string;
  description: string;
  logoUrl?: string;
}

import EV_API_URL from "src/shared/constants/api";

// Real API call to backend
export async function getFounders(): Promise<Founder[]> {
  try {
    const response = await fetch(`${EV_API_URL}/api/founders`);
    if (!response.ok) {
      throw new Error('Failed to fetch founders');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching founders:', error);
    return [];
  }
}
