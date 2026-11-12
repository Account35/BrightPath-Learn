import { createFileRoute } from "@tanstack/react-router";

type RequestMessage = {
  role: "user" | "assistant";
  content: string;
};

function isRequestMessage(value: unknown): value is RequestMessage {
  if (value == null || typeof value !== "object") return false;
  const message = value as Record<string, unknown>;
  return (
    (message["role"] === "user" || message["role"] === "assistant") &&
    typeof message["content"] === "string" &&
    message["content"].length > 0 &&
    message["content"].length <= 4_000
  );
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "A valid chat message is required." }, { status: 400 });
        }

        const messages =
          body != null && typeof body === "object" && "messages" in body
            ? (body as { messages?: unknown }).messages
            : undefined;

        if (
          !Array.isArray(messages) ||
          messages.length === 0 ||
          messages.length > 12 ||
          !messages.every(isRequestMessage) ||
          messages.at(-1)?.role !== "user"
        ) {
          return Response.json({ error: "A valid chat message is required." }, { status: 400 });
        }

        const { streamBrightPathAnswer } = await import("@/lib/brightpath-chat.server");
        return streamBrightPathAnswer(messages);
      },
    },
  },
});