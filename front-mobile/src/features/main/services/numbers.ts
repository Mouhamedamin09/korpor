export interface NumbersData {
  registeredUsers: number;
  propertyVolume: number;
}

// Fake stub: returns mock numbers for development
export async function getNumbers(): Promise<NumbersData> {
  return Promise.resolve({
    registeredUsers: 1250000,
    propertyVolume: 950000000,
  });
}
