# Multi-Agent EU AI Act Compliance Backend

This is an event-driven, extensible, multi-agent compliance pipeline written in TypeScript (Express) for the EU AI Act hackathon. It coordinates a pipeline of agents to audit a proposed AI model and identify governance gaps.

---

## 🏗️ Architecture

The backend uses a central **Agent Message Bus** to coordinate communication between the following agents:
1. **Files Upload** (User Frontend Upload)
2. **Input Parser** (Teammate A - simulated extraction, handles rerun-healing)
3. **Decision Tree** (Teammate B - simulated risk classifier)
4. **Judge of Governance** (Teammate C - simulated governance assessor)
5. **Assumptions Checker** (Teammate C - simulated engineering constraint validator)
6. **Missing Info Checker** (Your Agent - core checklist validation, retry prompting, self-healing)
7. **Prevention of Confidence** (Teammate D - simulated final convergence report)
8. **Humanized UI Display** (Teammate D - simulated visual data presenter)

---

## ⚡ Running Locally

To start the development server with hot-reloading:

```bash
# 1. Navigate to the backend folder
cd backend

# 2. Install dependencies (if you haven't)
npm install

# 3. Start development server
npm run dev
```

The server runs on **`http://localhost:3001`**.

---

## 📊 Visual Dashboard Playground

Open **`http://localhost:3001`** in your browser. This custom interactive single-page dashboard lets you:
* Choose between 3 preloaded compliance test scenarios.
* Run a compliance scan and watch real-time scrolling terminal logs detailing agent-to-agent talk.
* Witness the auto-rerun and self-healing trigger.
* Experience the conditional **Prompt Upload Supplementary Document** popup panel.
* View compliance scorecards, verified criteria checklists, and full compiled Safety reports.

---

## 🔗 Frontend Integration (Vite API Hookup)

To tie your teammates' frontend pages to this backend, invoke these local API routes:

### 1. Load Scenarios
* **Endpoint**: `GET http://localhost:3001/api/scenarios`

### 2. Start Compliance Check
* **Endpoint**: `POST http://localhost:3001/api/session/start`
* **Payload**:
  ```json
  { "sessionId": "custom_uuid_here", "scenario": "Scenario_Incomplete" }
  ```

### 3. Poll Progress & Live State
* **Endpoint**: `GET http://localhost:3001/api/session/:sessionId`
* **Note**: Poll this route every 800ms. Keep an eye on `state.status`. When it becomes `"AWAITING_USER_UPLOAD"`, render your upload modal. When it starts with `"COMPLETED"`, display the summary data and reports.

### 4. Upload Supplementary Files (Stage 2)
* **Endpoint**: `POST http://localhost:3001/api/session/:sessionId/upload`
* **Payload**:
  ```json
  { "files": ["my_monitoring_guide_v2.pdf"] }
  ```

### 5. Skip Upload & Complete Audit
* **Endpoint**: `POST http://localhost:3001/api/session/:sessionId/skip`
