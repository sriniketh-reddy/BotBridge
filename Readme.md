# 🧠 BotBridge — Personalized MCP Client Web Application

**BotBridge** is a next-generation **Model Context Protocol (MCP)** client web application built for **end users**.  
Unlike a traditional chatbot, **BotBridge** acts as your **personal digital operator** — connecting to MCP tools and automating tasks across your daily-used applications with simple natural language prompts.

---

## 🚀 What Makes BotBridge Unique?

BotBridge is **not** just another chatbot interface.  
It is a **personalized MCP client** that dynamically connects to MCP tools hosted on platforms like [mcp.composio.dev](https://mcp.composio.dev) to perform real digital actions on behalf of the user.

### ✨ Example Use Case

> 🧑‍💻 **User Prompt:**  
> “Create a text file with top 10 current tech news in my Google Drive.”

**BotBridge Workflow:**
1. Understands the user’s intent.  
2. Searches for the required MCP tools (e.g., news-fetcher, Google Drive writer).  
3. ✅ If the necessary tools are available, BotBridge executes the task seamlessly.  
4. ❌ If not, it informs the user:
   - “I can’t complete this action because no relevant tools are connected.”  
   - Suggests adding MCP servers that contain the needed tools (e.g., `news.mcp.composio.dev`, `gdrive.mcp.composio.dev`).

---

## 🧩 Core Features

- 🔗 **MCP Integration** — Connects with MCP servers to access real tools and APIs.  
- 💬 **Prompt-to-Action Conversion** — Converts natural language prompts into executable actions.  
- 🧠 **Context-Aware Execution** — Understands user intent and available tool capabilities.  
- 🔍 **Tool Discovery** — Automatically suggests missing MCP servers for unfulfilled actions.  
- 🌐 **Cross-Platform Support** — Works seamlessly across web and mobile platforms.  
- 🧰 **Powered by Composio MCP Tools** — Uses tools from [mcp.composio.dev](https://mcp.composio.dev) to handle integrations like Google Drive, YouTube, LinkedIn, GitHub, and more.

---

## 🏗️ Architecture Overview

BotBridge operates as an **MCP Host**, enabling:
- Secure communication between the chatbot and MCP servers.  
- Tool discovery, connection, and invocation through standardized protocols.  
- Action automation pipelines built on **React Native (Web + Mobile)**.  

Integration with **Pipedream workflows** allows BotBridge to interact with external services efficiently, enabling smooth and secure execution of user actions.

---

## 💡 Vision

BotBridge aims to **bridge the gap** between human intent and digital execution.  
By leveraging MCP and composable AI tools, it transforms everyday prompts into **automated digital actions**, making productivity **simpler, smarter, and faster.**

---

## 🧭 Summary

| Feature | Description |
|----------|-------------|
| **App Type** | Personalized MCP Client |
| **Core Purpose** | Automate digital tasks via MCP tools |
| **Tool Source** | [mcp.composio.dev](https://mcp.composio.dev) |
| **Architecture** | MCP Host built with React Native |
| **Example Action** | “Create a Google Drive file with top 10 tech news” |
| **Fallback Behavior** | Suggests missing tools or servers when unavailable |

---

> “BotBridge isn’t just a chatbot — it’s your bridge between AI and action.” 🌉


## Frontend Folder Structure
/src
 ├─ /assets
 ├─ /components
 │    └─ LoginPage
 │    └─ RegistrationPage
 │    └─ ChatInterface
 │    └─ ChatHistoryList
 │    └─ ServerManagement
 │    └─ AddServerForm
 │    └─ NavBar 
 │    └─ ProtectedRoute
 ├─ /contexts
 │    └─ AuthContext
 │    └─ AppContext 
 ├─ App.tsx
 ├─ main.tsx

---

## Deployment / Base URLs

Set `BASE_URL` in `backend/.env` (see `.env.example`) to control where the server binds and the allowed CORS origin. Set `VITE_API_BASE_URL` in the frontend environment (see `frontend/.env.example`) so the frontend points to the correct backend when deployed.

### CORS and credentials (important)

If your frontend sends requests with credentials (cookies) — which this app does to persist the backend session cookie — the backend must return Access-Control-Allow-Origin set to the exact origin of the frontend (not "*") and include Access-Control-Allow-Credentials: true. To make this easy in development, set `FRONTEND_ORIGIN` in `backend/.env` to match your Vite dev URL (for example `http://localhost:5173`).

Example:

- `FRONTEND_ORIGIN=http://localhost:5173`

If you change the Vite dev server port (Vite may choose a different port when the default is occupied), update `FRONTEND_ORIGIN` accordingly.

### Firebase setup (frontend)

Create a Firebase project and enable Email/Password sign-in. Add the web app configuration values into `frontend/.env` (see `frontend/.env.example`). The frontend uses the Firebase client SDK to sign in users and exchanges the ID token with the backend `/api/auth/verify-token` endpoint to obtain a backend JWT.

---

## 🛠️ Install & Run (Local Development)

Follow these steps to run the frontend and backend locally. Both services are independent; you can run them in separate terminals.

### Backend (Express + Firebase Admin)

1. Open a terminal and change to the backend folder:

```powershell
cd backend
```

2. Install dependencies:

```powershell
npm install
```

3. Create a `.env` file in the `backend/` folder (see `.env.example`) and set the required variables (service account or JSON string, JWT secret, port):

Required `.env` variables:

- `PORT` — port the server listens on (default: 4000)
- `BASE_URL` — full base URL for CORS (e.g. `http://localhost:4000`)
- `FIREBASE_SERVICE_ACCOUNT_PATH` — local path to your Firebase service account JSON (or set `FIREBASE_SERVICE_ACCOUNT_JSON` with the JSON contents)
- `JWT_SECRET` — a random secret for signing backend JWTs

4. Start the backend in development mode:

```powershell
npm run dev
```

The backend will listen on `http://localhost:4000` (or the PORT you set).

### Frontend (Vite + React + Tailwind)

1. Open a new terminal and change to the frontend folder:

```powershell
cd frontend
```

2. Install dependencies:

```powershell
npm install
```

3. Create a `.env` file in the `frontend/` folder (you can copy `frontend/.env.example`) and set the Firebase variables and `VITE_API_BASE_URL`:

Required `frontend/.env` variables:

- `VITE_API_BASE_URL` — backend API base URL (e.g. `http://localhost:4000`)
- `VITE_FIREBASE_API_KEY` — Firebase web apiKey
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

4. Start the frontend dev server:

```powershell
npm run dev
```

Open the browser at the local Vite URL (usually `http://localhost:5173`) and the frontend will call the backend at `VITE_API_BASE_URL`.

---

## ⚙️ Environment Variables Summary

Backend (`backend/.env`)

```text
PORT=4000
BASE_URL=http://localhost:4000
# Either a path to the service account JSON file or the JSON itself
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
# or
FIREBASE_SERVICE_ACCOUNT_JSON={...}
JWT_SECRET=your_jwt_secret_here
```

Frontend (`frontend/.env`)

```text
VITE_API_BASE_URL=http://localhost:4000
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Notes:
- Keep your Firebase service account JSON file out of source control. Add it to `.gitignore` (already included).
- For production, use secure secret management (e.g., environment variables in your hosting platform, secret manager, or CI/CD secrets).


