export interface LiveChatAgent {
  id: string;
  name: string;
  avatar?: string;
}
const CHAT_AGENTS: LiveChatAgent[] = [
  {
    id: "georges",
    name: "Georges N.",
    avatar: "https://i.pravatar.cc/64?u=georges",
  },
  { id: "amel", name: "Amel D.", avatar: "https://i.pravatar.cc/64?u=amel" },
  { id: "rachid", name: "Rachid K.", avatar: undefined },
];

export const fetchLiveChatAgents = (): Promise<LiveChatAgent[]> =>
  new Promise((res) => setTimeout(() => res(CHAT_AGENTS), 250));
