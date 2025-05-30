// Fake stub: returns mock backer logo URLs
export async function getBackersLogos(): Promise<string[]> {
  return Promise.resolve([
    "https://i.postimg.cc/NMNNM1Fm/Argaam.png",
    "https://i.postimg.cc/8PfypfSf/koviro.png",
    "https://i.postimg.cc/6QtzfHGC/remax.png",
    "https://i.postimg.cc/nVX8mzxp/visiontech.png",
  ]);
}
