// services/exits.ts

export interface ExitHistory {
  id: number;
  property: string;
  date: string;
  amount: number;
  returnRate: string;
}

// Simulated mock response (replace this with your actual API call later)
export async function fetchExitHistory(): Promise<ExitHistory[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          property: "Greenwood Villas",
          date: "May 15, 2024",
          amount: 3200,
          returnRate: "12.5%",
        },
        {
          id: 2,
          property: "Oceanfront Condos",
          date: "Nov 21, 2023",
          amount: 4500,
          returnRate: "9.8%",
        },
        {
          id: 3,
          property: "Skyline Lofts",
          date: "May 10, 2023",
          amount: 2100,
          returnRate: "10.2%",
        },
      ]);
    }, 1800); // simulate delay
  });
}
