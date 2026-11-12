import { describe, expect, it } from "vitest";

import {
  BRIGHTPATH_DOCUMENTS,
  BRIGHTPATH_FAILURE_QUESTION,
  BRIGHTPATH_SYSTEM_INSTRUCTIONS,
  BRIGHTPATH_TEST_QUESTIONS,
} from "@/lib/brightpath-knowledge";

describe("BrightPath grounding", () => {
  it("includes the supplied Tuesday coaching schedule and citation label", () => {
    expect(BRIGHTPATH_DOCUMENTS[1]?.content).toContain("every Tuesday at 16:00 UTC");
    expect(BRIGHTPATH_SYSTEM_INSTRUCTIONS).toContain("[Document 2 — Coaching and feedback]");
    expect(BRIGHTPATH_SYSTEM_INSTRUCTIONS).toContain("cite each supporting source");
  });

  it("requires the support referral for pricing and refund questions", () => {
    expect(BRIGHTPATH_TEST_QUESTIONS[1]?.question).toBe("What are your pricing and refund policies?");
    expect(BRIGHTPATH_SYSTEM_INSTRUCTIONS).toContain("pricing, refunds, job guarantees/placement promises");
    expect(BRIGHTPATH_SYSTEM_INSTRUCTIONS).toContain("support@brightpath.example");
  });

  it("never asks members to disclose passwords", () => {
    expect(BRIGHTPATH_DOCUMENTS[2]?.content).toContain("Never ask a member to send a password.");
    expect(BRIGHTPATH_SYSTEM_INSTRUCTIONS).toContain("Never ask anyone to share a password.");
  });

  it("has a supported coaching question and an explicit failure test", () => {
    expect(BRIGHTPATH_TEST_QUESTIONS[0]?.question).toBe("When do group coaching sessions take place?");
    expect(BRIGHTPATH_FAILURE_QUESTION).toBe("When do group coaching sessions take place?");
  });
});