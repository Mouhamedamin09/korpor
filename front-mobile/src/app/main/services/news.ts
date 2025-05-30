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
        "https://i.postimg.cc/gj22yPG1/Chat-GPT-Image-May-28-2025-05-41-56-PM.png",
      date: "1 Jun 2025",
      title:
        "Korpor raises $14M to bring its fractional property platform to Tunisia",
    },
    {
      imageUrl:
        "https://i.postimg.cc/hPbqDYgd/Chat-GPT-Image-May-28-2025-05-47-03-PM.png",
      date: "2 Juin 2025",
      title: "Korpor launches new investment features in France",
    },
  ]);
}
