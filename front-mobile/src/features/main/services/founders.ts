export interface Founder {
  imageUrl: string;
  linkedInUrl: string;
  name: string;
  role: string;
  description: string;
  logoUrl?: string;
}

// Fake stub: returns mock founder data
export async function getFounders(): Promise<Founder[]> {
  return Promise.resolve([
    {
      imageUrl: "https://randomuser.me/api/portraits/men/32.jpg",
      linkedInUrl: "https://linkedin.com/in/ramitabbara",
      name: "Rami Tabbara",
      role: "Co-Founder & Co-CEO",
      description:
        "Rami, a veteran in Dubai’s real estate industry with 18+ years experience, has been affiliated with The First Group and Damac Properties.",
      logoUrl:
        "https://upload.wikimedia.org/wikipedia/commons/5/5d/Damac_Properties_Logo.png",
    },
  ]);
}
