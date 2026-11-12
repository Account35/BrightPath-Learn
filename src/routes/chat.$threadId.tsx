import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  Check,
  CircleHelp,
  Clock3,
  FileText,
  GraduationCap,
  LifeBuoy,
  LoaderCircle,
  MessageSquare,
  Plus,
  RefreshCw,
  Send,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import brightPathMark from "@/assets/brightpath-mark.png";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  BRIGHTPATH_DOCUMENTS,
  BRIGHTPATH_FAILURE_QUESTION,
  BRIGHTPATH_TEST_QUESTIONS,
} from "@/lib/brightpath-knowledge";
import { useChatSessions, type ChatMessage } from "@/lib/chat-sessions";

type StreamEvent = {
  type?: string;
  delta?: string;
  error?: unknown;
};

export const Route = createFileRoute("/chat/$threadId")({
  head: () => ({
    meta: [
      { title: "BrightPath AI Help Desk — Conversation" },
      {
        name: "description",
        content: "Ask the BrightPath Learn help desk about lessons, coaching, and account support.",
      },
      { property: "og:title", content: "BrightPath AI Help Desk — Conversation" },
      {
        property: "og:description",
        content: "Get grounded answers about BrightPath Learn, with document citations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BrightPathChat,
});

function BrightPathChat() {
  const { threadId } = Route.useParams();
  const navigate = useNavigate();
  const { threads, createThread, ensureThread, setMessages, setTitle } = useChatSessions();
  const thread = threads.find((item) => item.id === threadId);
  const messages = thread?.messages ?? [];
  const [draft, setDraft] = useState("");
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [status, setStatus] = useState<"ready" | "submitted" | "streaming">("ready");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [failedQuestion, setFailedQuestion] = useState<string | null>(null);
  const [sourceListOpen, setSourceListOpen] = useState(false);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    ensureThread(threadId);
  }, [ensureThread, threadId]);

  const focusComposer = useCallback(() => {
    requestAnimationFrame(() => composerRef.current?.focus());
  }, []);

  useEffect(() => {
    setStatus("ready");
    setDraft("");
    setErrorMessage(null);
    setFailedQuestion(null);
    activeRequest.current?.abort();
    focusComposer();
  }, [threadId, focusComposer]);

  useEffect(() => () => activeRequest.current?.abort(), []);

  const sendQuestion = useCallback(
    async (question: string, isRetry = false, forceFailure = false) => {
      const normalizedQuestion = question.trim();
      if (!normalizedQuestion || status !== "ready") return;

      const existingMessages = thread?.messages ?? [];
      const hasPendingUserQuestion =
        existingMessages.at(-1)?.role === "user" &&
        existingMessages
          .at(-1)
          ?.parts.map((part) => part.text)
          .join("") === normalizedQuestion;
      let lastUserIndex = -1;
      for (let index = existingMessages.length - 1; index >= 0; index -= 1) {
        if (existingMessages[index]?.role === "user") {
          lastUserIndex = index;
          break;
        }
      }
      const history = isRetry
        ? existingMessages.filter((message, index) => {
            if (message.role !== "assistant") return true;
            return index < lastUserIndex;
          })
        : existingMessages;
      const outgoingMessages = history
        .filter((message) => message.role === "user" || message.parts.some((part) => part.text))
        .map((message) => ({
          role: message.role,
          content: message.parts.map((part) => part.text).join(""),
        }));

      if (!isRetry && !hasPendingUserQuestion) {
        outgoingMessages.push({ role: "user", content: normalizedQuestion });
        const userMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "user",
          parts: [{ type: "text", text: normalizedQuestion }],
        };
        setMessages(threadId, (current) => [
          ...current,
          userMessage,
          { id: crypto.randomUUID(), role: "assistant", parts: [{ type: "text", text: "" }] },
        ]);
        if (!messages.length) {
          setTitle(threadId, normalizedQuestion.slice(0, 44));
        }
      } else {
        setMessages(threadId, (current) => [
          ...history,
          { id: crypto.randomUUID(), role: "assistant", parts: [{ type: "text", text: "" }] },
        ]);
      }

      setDraft("");
      setErrorMessage(null);
      setFailedQuestion(null);
      setStatus("submitted");
      focusComposer();

      const controller = new AbortController();
      activeRequest.current = controller;

      try {
        if (forceFailure || simulateFailure) {
          throw new Error("Simulated network failure");
        }

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: outgoingMessages.slice(-12) }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error("The help desk request failed.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let pending = "";
        let eventName = "";
        let responseText = "";

        const consumeEventData = (line: string) => {
          if (!line.startsWith("data:")) return;
          const data = line.slice(5).trim();
          if (!data || data === "[DONE]") return;
          const event = JSON.parse(data) as StreamEvent;
          if (
            event.error ||
            eventName === "error" ||
            event.type === "error" ||
            event.type === "response.failed"
          ) {
            throw new Error("The help desk could not complete the request.");
          }
          if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
            responseText += event.delta;
            setStatus("streaming");
            setMessages(threadId, (current) => {
              const next = [...current];
              const last = next.at(-1);
              if (last?.role === "assistant") {
                next[next.length - 1] = {
                  ...last,
                  parts: [{ type: "text", text: responseText }],
                };
              }
              return next;
            });
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          pending += decoder.decode(value, { stream: !done });
          const lines = pending.split(/\r?\n/);
          pending = lines.pop() ?? "";

          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventName = line.slice(6).trim();
            } else if (line === "") {
              eventName = "";
            } else {
              consumeEventData(line);
            }
          }

          if (done) break;
        }

        if (pending.startsWith("data:")) consumeEventData(pending);
        if (!responseText.trim()) throw new Error("The help desk returned an empty answer.");
        setStatus("ready");
        focusComposer();
      } catch {
        if (controller.signal.aborted) {
          setStatus("ready");
          return;
        }
        setStatus("ready");
        setErrorMessage(
          forceFailure || simulateFailure
            ? "A simulated network error interrupted the request."
            : "We couldn't reach the help desk. Check your connection and try again.",
        );
        setFailedQuestion(normalizedQuestion);
        focusComposer();
      } finally {
        if (activeRequest.current === controller) activeRequest.current = null;
      }
    },
    [
      focusComposer,
      messages.length,
      setMessages,
      setTitle,
      simulateFailure,
      status,
      thread,
      threadId,
    ],
  );

  const handleSubmit = useCallback(
    ({ text }: { text: string }) => sendQuestion(text),
    [sendQuestion],
  );

  const handleCreateThread = useCallback(() => {
    const id = createThread();
    void navigate({ to: "/chat/$threadId", params: { threadId: id } });
  }, [createThread, navigate]);

  const handleFailureDemo = useCallback(() => {
    setSimulateFailure(true);
    void sendQuestion(BRIGHTPATH_FAILURE_QUESTION, false, true);
  }, [sendQuestion]);

  const handleRetry = useCallback(() => {
    if (failedQuestion) void sendQuestion(failedQuestion, true);
  }, [failedQuestion, sendQuestion]);

  const handleStop = useCallback(() => {
    activeRequest.current?.abort();
    setStatus("ready");
  }, []);

  return (
    <div className="flex min-h-svh bg-background text-foreground">
      <aside className="flex w-full max-w-[19rem] shrink-0 flex-col border-r border-border bg-card max-md:hidden">
        <div className="flex h-[4.5rem] items-center gap-3 border-b border-border px-5">
          <img
            src={brightPathMark}
            alt=""
            loading="lazy"
            width={816}
            height={816}
            className="size-9 shrink-0 object-contain"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight">BrightPath Learn</p>
            <p className="mt-1 text-xs text-muted-foreground">Member support</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-7 overflow-y-auto px-4 py-5">
          <div>
            <Button onClick={handleCreateThread} className="w-full justify-start gap-2 shadow-none">
              <Plus aria-hidden="true" />
              New conversation
            </Button>
          </div>

          <section aria-labelledby="conversation-list-title">
            <h2
              id="conversation-list-title"
              className="mb-2 px-2 text-xs font-semibold text-muted-foreground"
            >
              CONVERSATIONS
            </h2>
            <nav aria-label="Conversations" className="grid gap-1">
              {threads.map((item) => (
                <div
                  key={item.id}
                  className={`flex min-w-0 items-center gap-2 rounded-md px-2 py-2 text-sm ${item.id === threadId ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"}`}
                >
                  <MessageSquare aria-hidden="true" className="size-4 shrink-0" />
                  <Link
                    to="/chat/$threadId"
                    params={{ threadId: item.id }}
                    aria-current={item.id === threadId ? "page" : undefined}
                    className="min-w-0 flex-1 truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {item.title}
                  </Link>
                </div>
              ))}
              {threads.length === 0 && (
                <p className="px-2 py-2 text-xs text-muted-foreground">No conversations yet</p>
              )}
            </nav>
          </section>

          <section aria-labelledby="test-questions-title">
            <h2
              id="test-questions-title"
              className="mb-2 px-2 text-xs font-semibold text-muted-foreground"
            >
              QUICK TESTS
            </h2>
            <div className="grid gap-2">
              {BRIGHTPATH_TEST_QUESTIONS.map((test, index) => (
                <Button
                  key={test.label}
                  variant="outline"
                  className="h-auto min-h-14 justify-start gap-2 whitespace-normal border-border bg-background px-3 py-2.5 text-left font-normal shadow-none"
                  onClick={() => void sendQuestion(test.question)}
                  disabled={status !== "ready"}
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-medium text-foreground">{test.label}</span>
                    <span className="mt-1 block text-xs leading-snug text-muted-foreground">
                      {test.question}
                    </span>
                  </span>
                </Button>
              ))}
              <Button
                variant="outline"
                className="h-10 justify-start gap-2 border-border bg-background px-3 font-medium text-destructive shadow-none hover:bg-destructive/5 hover:text-destructive"
                onClick={handleFailureDemo}
                disabled={status !== "ready"}
              >
                <AlertTriangle aria-hidden="true" className="size-4" />
                Simulate failure
              </Button>
            </div>
          </section>

          <section
            aria-labelledby="source-list-title"
            className="mt-auto border-t border-border pt-4"
          >
            <button
              type="button"
              id="source-list-title"
              aria-expanded={sourceListOpen}
              onClick={() => setSourceListOpen((open) => !open)}
              className="flex w-full items-center justify-between px-2 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <span className="flex items-center gap-2">
                <BookOpen aria-hidden="true" className="size-4" /> SOURCE DOCUMENTS
              </span>
              <span aria-hidden="true">{sourceListOpen ? "−" : "+"}</span>
            </button>
            {sourceListOpen && (
              <ul className="mt-1 grid gap-1 px-2">
                {BRIGHTPATH_DOCUMENTS.map((document) => (
                  <li
                    key={document.id}
                    className="flex items-center gap-2 py-1 text-xs text-muted-foreground"
                  >
                    <FileText aria-hidden="true" className="size-3.5 shrink-0" />
                    <span className="truncate">
                      {document.id}: {document.title}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="flex items-center gap-2 border-t border-border px-5 py-4 text-xs text-muted-foreground">
          <LifeBuoy aria-hidden="true" className="size-4" />
          <a href="mailto:support@brightpath.example" className="hover:text-primary">
            Contact support
          </a>
          <ArrowUpRight aria-hidden="true" className="ml-auto size-3.5" />
        </div>
      </aside>

      <main className="flex min-h-svh min-w-0 flex-1 flex-col">
        <header className="flex min-h-[4.5rem] flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-5 py-3 sm:px-8">
          <div className="flex min-w-0 items-center gap-2.5">
            <GraduationCap aria-hidden="true" className="size-5 shrink-0 text-primary" />
            <h1 className="truncate text-sm font-semibold sm:text-base">BrightPath AI Help Desk</h1>
            <span className="hidden items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground sm:inline-flex">
              <span className="size-1.5 rounded-full bg-success" /> Ready
            </span>
          </div>
          <label className="flex cursor-pointer items-center gap-2.5 text-xs font-medium text-muted-foreground sm:text-sm">
            <AlertTriangle aria-hidden="true" className="size-4 text-destructive" />
            <span>Simulate API Failure</span>
            <Switch
              checked={simulateFailure}
              onCheckedChange={setSimulateFailure}
              aria-label="Simulate API Failure"
            />
          </label>
        </header>

        <nav
          aria-label="Mobile conversations"
          className="flex items-center gap-2 overflow-x-auto border-b border-border bg-card px-4 py-2 md:hidden"
        >
          <Button
            onClick={handleCreateThread}
            size="sm"
            variant="outline"
            className="shrink-0 gap-1.5"
          >
            <Plus aria-hidden="true" className="size-4" /> New
          </Button>
          {threads.map((item) => (
            <Link
              key={item.id}
              to="/chat/$threadId"
              params={{ threadId: item.id }}
              aria-current={item.id === threadId ? "page" : undefined}
              className={`max-w-40 shrink-0 truncate rounded-md px-2.5 py-1.5 text-xs ${item.id === threadId ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col px-4 sm:px-8">
            {messages.length === 0 ? (
              <div className="flex flex-1 flex-col justify-center py-10 sm:py-14">
                <div className="mb-6 flex size-12 items-center justify-center rounded-lg border border-border bg-card shadow-sm">
                  <CircleHelp aria-hidden="true" className="size-6 text-primary" />
                </div>
                <p className="mb-2 text-sm font-medium text-primary">BRIGHTPATH LEARN SUPPORT</p>
                <h2 className="max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">
                  How can we help you today?
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Ask about lessons, coaching, feedback, or account access.
                </p>
                <div className="mt-8 grid gap-2 sm:grid-cols-2">
                  {BRIGHTPATH_TEST_QUESTIONS.map((test) => (
                    <Button
                      key={test.question}
                      variant="outline"
                      className="h-auto min-h-11 justify-start whitespace-normal border-border bg-card py-3 text-left font-normal shadow-none"
                      onClick={() => void sendQuestion(test.question)}
                    >
                      <Clock3
                        aria-hidden="true"
                        className="mr-1 size-4 shrink-0 text-muted-foreground"
                      />
                      <span>{test.question}</span>
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="mt-3 h-10 w-fit gap-2 border-border bg-card text-destructive shadow-none hover:bg-destructive/5 hover:text-destructive"
                  onClick={handleFailureDemo}
                >
                  <AlertTriangle aria-hidden="true" className="size-4" />
                  Simulate failure
                </Button>
              </div>
            ) : (
              <Conversation className="relative flex-1 overflow-x-hidden">
                <ConversationContent className="gap-7 px-0 py-8 sm:py-10">
                  {messages.map((message, index) => {
                    const text = message.parts.map((part) => part.text).join("");
                    const waiting =
                      message.role === "assistant" &&
                      index === messages.length - 1 &&
                      text.length === 0 &&
                      status === "submitted";

                    return (
                      <Message key={message.id} from={message.role} className="max-w-[88%]">
                        <div
                          className={`flex items-center gap-2 text-xs ${message.role === "user" ? "justify-end" : ""}`}
                        >
                          {message.role === "assistant" && (
                            <img
                              src={brightPathMark}
                              alt=""
                              loading="lazy"
                              width={816}
                              height={816}
                              className="size-6 rounded-sm object-contain"
                            />
                          )}
                          <span className="font-medium text-muted-foreground">
                            {message.role === "user" ? "You" : "BrightPath Support"}
                          </span>
                        </div>
                        <MessageContent
                          className={
                            message.role === "user"
                              ? "bg-primary px-4 py-3 text-primary-foreground"
                              : "px-0 py-0"
                          }
                        >
                          {waiting ? (
                            <Shimmer className="text-sm text-muted-foreground">
                              Finding the right answer…
                            </Shimmer>
                          ) : (
                            <MessageResponse
                              isAnimating={status === "streaming" && index === messages.length - 1}
                            >
                              {text}
                            </MessageResponse>
                          )}
                        </MessageContent>
                      </Message>
                    );
                  })}
                </ConversationContent>
                <ConversationScrollButton />
              </Conversation>
            )}

            <div className="sticky bottom-0 bg-background pb-4 pt-3 sm:pb-6">
              {errorMessage && (
                <div
                  role="alert"
                  className="mb-3 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm"
                >
                  <AlertTriangle
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-destructive"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-destructive">Connection problem</p>
                    <p className="mt-1 text-muted-foreground">{errorMessage}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 gap-1.5 border-destructive/30 bg-card text-destructive hover:bg-destructive/5 hover:text-destructive"
                    onClick={handleRetry}
                    disabled={!failedQuestion}
                  >
                    <RefreshCw aria-hidden="true" className="size-3.5" /> Retry
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0 text-muted-foreground"
                    aria-label="Dismiss error"
                    onClick={() => setErrorMessage(null)}
                  >
                    <X aria-hidden="true" className="size-4" />
                  </Button>
                </div>
              )}

              <PromptInput
                onSubmit={handleSubmit}
                className="rounded-lg border border-border bg-card shadow-sm"
              >
                <PromptInputTextarea
                  ref={composerRef}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Ask about BrightPath Learn…"
                  aria-label="Ask the BrightPath help desk"
                  className="min-h-14 resize-none px-4 pt-4 text-sm"
                  disabled={status !== "ready"}
                />
                <PromptInputFooter className="justify-between border-t border-border/70 px-3 py-2">
                  <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
                    <Check aria-hidden="true" className="size-3.5 text-success" /> Answers cite
                    BrightPath Learn documents
                  </span>
                  <span className="text-xs text-muted-foreground sm:hidden">Cited answers</span>
                  <PromptInputSubmit
                    status={status}
                    disabled={status === "ready" && !draft.trim()}
                    aria-label={
                      status === "submitted" || status === "streaming"
                        ? "Stop response"
                        : "Send message"
                    }
                    onStop={handleStop}
                    className="size-9 rounded-md"
                  >
                    {status === "ready" ? (
                      <Send aria-hidden="true" className="size-4" />
                    ) : status === "submitted" ? (
                      <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                    ) : (
                      <X aria-hidden="true" className="size-4" />
                    )}
                  </PromptInputSubmit>
                </PromptInputFooter>
              </PromptInput>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                BrightPath answers are limited to the supplied support documents.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
