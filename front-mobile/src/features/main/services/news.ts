export interface NewsItem {
  imageUrl: string;
  date: string;
  title: string;
}

// Fake stub: returns mock news items
export async function getNews(): Promise<NewsItem[]> {
  return Promise.resolve([
    {
      imageUrl:
        "https://static.techspot.com/images2/news/bigimage/2023/07/2023-07-11-image-6.jpg",
      date: "10 Jun 2024",
      title:
        "Stake raises $14M to bring its fractional property platform to Saudi Arabia",
    },
    {
      imageUrl: "https://i.insider.com/5f354a4d3f737021a52bafae?width=700",
      date: "12 Jul 2024",
      title: "Stake launches new investment features in Abu Dhabi",
    },
  ]);
}
