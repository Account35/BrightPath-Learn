import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import brightPathMark from "@/assets/brightpath-mark.png";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { useChatSessions } from "@/lib/chat-sessions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BrightPath AI Help Desk" },
      {
        name: "description",
        content: "Ask the BrightPath Learn help desk about lessons, coaching, and account support.",
      },
      { property: "og:title", content: "BrightPath AI Help Desk" },
      {
        property: "og:description",
        content: "Get grounded answers about BrightPath Learn, with document citations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const { createThread } = useChatSessions();
  const didRedirect = useRef(false);

  useEffect(() => {
    if (didRedirect.current) return;
    didRedirect.current = true;
    const threadId = createThread();
    void navigate({ to: "/chat/$threadId", params: { threadId }, replace: true });
  }, [createThread, navigate]);

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-6">
      <div className="flex flex-col items-center text-center">
        <img
          src={brightPathMark}
          alt=""
          loading="lazy"
          width={816}
          height={816}
          className="mb-4 size-14 object-contain"
        />
        <h1 className="text-lg font-semibold text-foreground">BrightPath AI Help Desk</h1>
        <Shimmer className="mt-2 text-sm text-muted-foreground">Opening your conversation…</Shimmer>
      </div>
    </main>
  );
}
