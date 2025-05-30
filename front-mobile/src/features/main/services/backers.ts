// Fake stub: returns mock backer logo URLs
export async function getBackersLogos(): Promise<string[]> {
  return Promise.resolve([
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/200px-Logo_NIKE.svg.png",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/200px-Adidas_Logo.svg.png",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/200px-Apple_logo_black.svg.png",
    "https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/200px-FC_Barcelona_%28crest%29.svg.png",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Audi_logo_detail.svg/200px-Audi_logo_detail.svg.png",
  ]);
}
