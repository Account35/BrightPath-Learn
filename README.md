# BrightPath Help Desk

Build a clean, production-ready, single-page React application called "BrightPath AI Help Desk" using Tailwind CSS and Lucide React icons.

UI & DESIGN REQUIREMENTS (IMPORTANT):
- Styling & Palette: Use a clean, professional corporate palette (slate/neutral backgrounds, subtle zinc borders, crisp white containers, and standard royal blue accents). DO NOT use flashy "AI gradient neon" styles, purple/pink glows, or overly rounded sci-fi UI components. Keep it strictly clean and modern.
- Icons: Use clean, standard vector UI icons from lucide-react (such as MessageSquare, Send, AlertTriangle, CheckCircle, RefreshCw, BookOpen). Avoid decorative or weirdly styled icons.
- Borders & Layout: Use simple 1px subtle borders (border border-slate-200), minimal shadows (shadow-sm), clean rounded corners (rounded-lg or rounded-md), and crisp padding across containers.

CORE APPLICATION REQUIREMENTS:
1. Interactive Chat Interface: Allow users to type a question and receive grounded answers from the fictional BrightPath Learn documents.
2. System Prompt & Strict Grounding: Hardcode the 3 source documents below into the system context. The model MUST cite which document supports its answer (e.g., [Document 1]). If information is missing or covers out-of-scope topics (like pricing, refunds, or job guarantees), it must state that the information is not available in the supplied documents and direct the user to support@brightpath.example.
3. API Failure Handling & Toggle: Add a top navbar toggle or button labeled "Simulate API Failure". When toggled ON, any chat query or test button must instantly catch a simulated network error and render a clean red error alert box with retry capability.
4. One-Click Test Panel: Include a dedicated sidebar or bottom panel with 3 preset test buttons to quickly demonstrate functionality:
   - Button 1 (Supported Question): "When do group coaching sessions take place?"
   - Button 2 (Unknown Question): "What are your pricing and refund policies?"
   - Button 3 (Simulate Failure): Triggers the API failure state.

SOURCE DOCUMENTS TO EMBED:
- Document 1 (Getting started): BrightPath Learn. After joining, open Home and select Start Lesson 1: Set your goal. The Foundations course has 6 lessons. Lessons can be watched in any order. To save your progress, select Mark complete after finishing a lesson. Watching a video alone does not mark the lesson complete. Your next lesson appears on Home.
- Document 2 (Coaching and feedback): BrightPath Learn. A group coaching session takes place every Tuesday at 16:00 UTC. The link appears on the Coaching page 30 minutes before the session. Recordings are added to the Coaching page within 24 hours. To get feedback on practice work, paste a shareable link in the Practice page and select Request feedback. Feedback usually arrives within 2 working days. This is a typical response time, not a guarantee.
- Document 3 (Account help): BrightPath Learn. To reset a password, select Forgot password on the sign-in page. For a missing course or incorrect lesson progress, contact support@brightpath.example and include the account email and lesson name. Support is available Monday to Friday, 09:00–17:00 UTC. This document does not contain pricing, refund rules or job placement promises. For those questions, say the information is not available in the supplied documents and refer the member to support. Never ask a member to send a password.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/613d0093-2148-4251-bd7c-7a749ffb24b2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
