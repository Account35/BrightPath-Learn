export const BRIGHTPATH_DOCUMENTS = [
  {
    id: "Document 1",
    title: "Getting started",
    content:
      "BrightPath Learn. After joining, open Home and select Start Lesson 1: Set your goal. The Foundations course has 6 lessons. Lessons can be watched in any order. To save your progress, select Mark complete after finishing a lesson. Watching a video alone does not mark the lesson complete. Your next lesson appears on Home.",
  },
  {
    id: "Document 2",
    title: "Coaching and feedback",
    content:
      "BrightPath Learn. A group coaching session takes place every Tuesday at 16:00 UTC. The link appears on the Coaching page 30 minutes before the session. Recordings are added to the Coaching page within 24 hours. To get feedback on practice work, paste a shareable link in the Practice page and select Request feedback. Feedback usually arrives within 2 working days. This is a typical response time, not a guarantee.",
  },
  {
    id: "Document 3",
    title: "Account help",
    content:
      "BrightPath Learn. To reset a password, select Forgot password on the sign-in page. For a missing course or incorrect lesson progress, contact support@brightpath.example and include the account email and lesson name. Support is available Monday to Friday, 09:00–17:00 UTC. This document does not contain pricing, refund rules or job placement promises. For those questions, say the information is not available in the supplied documents and refer the member to support. Never ask a member to send a password.",
  },
] as const;

export const BRIGHTPATH_SYSTEM_INSTRUCTIONS = `You are the BrightPath Learn help desk. Answer only with information in the supplied BrightPath Learn documents below. Treat the documents as the complete and exclusive source of truth; do not use outside knowledge, infer policy, or make promises. For every factual answer, cite each supporting source using its exact label, such as [Document 2]. If the documents do not answer the question, or it asks about pricing, refunds, job guarantees/placement promises, or another out-of-scope matter, clearly say: "That information is not available in the supplied documents. Please contact support@brightpath.example." Never invent details. Never ask anyone to share a password. Keep answers concise and helpful.

${BRIGHTPATH_DOCUMENTS.map((document) => `[${document.id} — ${document.title}]\n${document.content}`).join("\n\n")}`;

export const BRIGHTPATH_TEST_QUESTIONS = [
  {
    label: "Supported question",
    question: "When do group coaching sessions take place?",
  },
  {
    label: "Unknown question",
    question: "What are your pricing and refund policies?",
  },
] as const;

export const BRIGHTPATH_FAILURE_QUESTION =
  "When do group coaching sessions take place?";