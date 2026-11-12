import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  parts: { type: "text"; text: string }[];
};

export type ChatThread = {
  id: string;
  title: string;
  messages: ChatMessage[];
};

type ChatSessionsValue = {
  threads: ChatThread[];
  createThread: () => string;
  ensureThread: (id: string) => void;
  setMessages: (id: string, update: (messages: ChatMessage[]) => ChatMessage[]) => void;
  setTitle: (id: string, title: string) => void;
};

const ChatSessionsContext = createContext<ChatSessionsValue | null>(null);

export function ChatSessionsProvider({ children }: { children: ReactNode }) {
  const [threads, setThreads] = useState<ChatThread[]>([]);

  const createThread = useCallback(() => {
    const id = crypto.randomUUID();
    setThreads((current) => [{ id, title: "New conversation", messages: [] }, ...current]);
    return id;
  }, []);

  const ensureThread = useCallback((id: string) => {
    setThreads((current) =>
      current.some((thread) => thread.id === id)
        ? current
        : [{ id, title: "New conversation", messages: [] }, ...current],
    );
  }, []);

  const setMessages = useCallback(
    (id: string, update: (messages: ChatMessage[]) => ChatMessage[]) => {
      setThreads((current) =>
        current.map((thread) =>
          thread.id === id ? { ...thread, messages: update(thread.messages) } : thread,
        ),
      );
    },
    [],
  );

  const setTitle = useCallback((id: string, title: string) => {
    setThreads((current) =>
      current.map((thread) =>
        thread.id === id ? { ...thread, title: title || "New conversation" } : thread,
      ),
    );
  }, []);

  const value = useMemo(
    () => ({ threads, createThread, ensureThread, setMessages, setTitle }),
    [threads, createThread, ensureThread, setMessages, setTitle],
  );

  return <ChatSessionsContext.Provider value={value}>{children}</ChatSessionsContext.Provider>;
}

export function useChatSessions() {
  const context = useContext(ChatSessionsContext);
  if (!context) throw new Error("Chat sessions must be used inside the app provider.");
  return context;
}
