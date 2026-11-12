# BrightPath AI Help Desk

A lightweight, production-ready AI help desk web application built for the BrightPath Learn platform. The application provides instant support to users by retrieving answers grounded strictly within official documentation, complete with source citations and error handling simulations.

---

## Application Overview

The BrightPath AI Help Desk is designed to demonstrate key AI engineering patterns, including strict source grounding, citation attribution, and graceful fallback handling.

### Key Features

- **Strict Source Grounding:** Answers are derived exclusively from embedded BrightPath Learn support documents (Getting Started, Coaching & Feedback, Account Help).
- **Source Citation:** Every answered query explicitly cites its source document (e.g., `[Document 1]`).
- **Out-of-Scope Detection:** Queries regarding pricing, refund policies, or unverified claims are intercepted with an explicit disclaimer and directed to support (`support@brightpath.example`).
- **API Failure Simulation:** Includes a built-in state toggle to simulate network errors or model service downtime, displaying clear error alerts and retry states.
- **One-Click Test Suite:** Preset buttons to instantly execute mandatory evaluation tests:
  1. **Supported Question:** Checks accuracy and source citation.
  2. **Unknown Question:** Tests out-of-scope handling and support escalation.
  3. **API Failure Test:** Validates fault-tolerant UI execution.
- **Professional UI:** Minimalist, clean corporate layout using slate and neutral tones, zinc borders, and Lucide vector icons.

---

## Tech Stack and Development Workflow

### Tooling and Workflow

- **Gemini (Google AI):** Used for initial prompt engineering, system prompt design, and architectural planning.
- **Lovable:** Primary AI application builder used to rapidly scaffold the initial React frontend and Tailwind CSS layout.
- **GitHub and VS Code:** Used for version control, local repository cloning, code refinement, and resolving UI and logic bugs after reaching Lovable token limits.

### Application Stack

- **Framework:** React (Vite)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React (`lucide-react`)
- **State Management:** React `useState` and `useEffect` (In-memory state handling)

---

## Source Documents Embedded

The application uses three embedded support documents as its knowledge base.

1. **Document 1 — Getting Started:** Platform navigation, lesson completion rules, and saving progress.
2. **Document 2 — Coaching and Feedback:** Group coaching schedules (Tuesdays at 16:00 UTC), link release times, and practice feedback turnaround (2 working days).
3. **Document 3 — Account Help:** Password reset workflow, support contact details (`support@brightpath.example`), operating hours (Monday–Friday, 09:00–17:00 UTC), and out-of-scope policy escalation.

---

## Getting Started and Local Setup

Follow these steps to clone, configure, and run the application locally.

### Prerequisites

Ensure the following tools are installed on your system:

- **Node.js:** Version 18.0 or higher recommended. Check the installed version using `node -v`.
- **npm:** Installed automatically with Node.js. Check the installed version using `npm -v`.
- **Git:** Command-line tool for version control.

---

## Step-by-Step Installation Guide

### 1. Clone the Repository

Open your terminal or command prompt and clone the project from GitHub:

```bash
git clone https://github.com/Account35/BrightPath-Learn.git
```

### 2. Navigate to the Project Directory

Move into the project folder:

```bash
cd BrightPath-Learn
```

### 3. Install Dependencies

Install all required package dependencies defined in `package.json`, including React, Vite, Tailwind CSS, and Lucide Icons:

```bash
npm install
```

### 4. Start the Local Development Server

Launch the Vite development server:

```bash
npm run dev
```

### 5. Open the Application in Your Browser

Once the terminal displays the local development URL, open your browser and navigate to:

```text
http://localhost:5173
```

---

## Test Cases and Execution

The application includes a Quick Tests panel for evaluating its functionality. You can also manually enter queries into the chat interface.

### Test Case 1: Supported Question

**Query:**

> When do group coaching sessions take place?

**Expected Result:**

- Returns the group coaching session time: Tuesday at 16:00 UTC.
- Provides information about link availability.
- Explicitly cites `[Document 2]`.

### Test Case 2: Unknown / Out-of-Scope Question

**Query:**

> What are your pricing and refund policies?

**Expected Result:**

- Returns a message stating that the requested information is unavailable in the embedded documentation.
- Directs the user to `support@brightpath.example`.
- Explicitly cites `[Document 3]`.

### Test Case 3: API Failure Simulation

**Action:**

Toggle the **Simulate API Failure** button ON.

**Expected Result:**

- Intercepts the request.
- Displays a clear red alert banner indicating service unavailability.
- Provides a retry option for the user.

---

## License

Distributed under the MIT License. See the `LICENSE` file for more information.

---

**Built with React, Vite, Tailwind CSS, and AI engineering principles.**
