import { GatewayError, streamResponse } from "@lovable.dev/ai-gateway";

import { BRIGHTPATH_SYSTEM_INSTRUCTIONS } from "./brightpath-knowledge";

export type BrightPathChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function streamBrightPathAnswer(messages: BrightPathChatMessage[]) {
  try {
    const stream = await streamResponse({
      model: "openai/gpt-6-astra",
      instructions: BRIGHTPATH_SYSTEM_INSTRUCTIONS,
      input: messages,
    });

    return stream.toResponse({
      headers: { "Cache-Control": "no-cache, no-transform" },
    });
  } catch (error) {
    if (error instanceof GatewayError) {
      console.error("BrightPath AI request failed", {
        code: error.code,
        httpStatus: error.httpStatus,
        outcome: error.outcome,
        requestId: error.ids?.requestId,
      });
    } else {
      console.error("BrightPath AI request failed", error);
    }

    return Response.json(
      { error: "The help desk could not complete the request." },
      { status: 502 },
    );
  }
}
