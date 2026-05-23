import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import { AgentBus } from "./agents/AgentBus.js";
import { InputParserAgent } from "./agents/InputParserAgent.js";
import { DecisionTreeAgent } from "./agents/DecisionTreeAgent.js";
import { JudgeOfGovernanceAgent } from "./agents/JudgeOfGovernanceAgent.js";
import { AssumptionsCheckerAgent } from "./agents/assumption_checker/AssumptionsCheckerAgent.js";
import { MissingInfoCheckerAgent } from "./agents/missing_info_checker/MissingInfoCheckerAgent.js";
import { PreventionOfConfidenceAgent } from "./agents/prevention_of_confidence/PreventionOfConfidenceAgent.js";
import { HumanizerUiDisplayAgent } from "./agents/humanizer_ui_display/HumanizerUiDisplayAgent.js";
import { EmailerAgent } from "./agents/emailer/EmailerAgent.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize the Agent Communication Bus
const bus = new AgentBus();

// Instantiate and Register all 8 agents in the pipeline
const inputParser = new InputParserAgent(bus);
const decisionTree = new DecisionTreeAgent(bus);
const judgeOfGovernance = new JudgeOfGovernanceAgent(bus);
const assumptionsChecker = new AssumptionsCheckerAgent(bus);
const missingInfoChecker = new MissingInfoCheckerAgent(bus);
const preventionOfConfidence = new PreventionOfConfidenceAgent(bus);
const humanizerUiDisplay = new HumanizerUiDisplayAgent(bus);
const emailer = new EmailerAgent(bus);

bus.registerAgent(inputParser);
bus.registerAgent(decisionTree);
bus.registerAgent(judgeOfGovernance);
bus.registerAgent(assumptionsChecker);
bus.registerAgent(missingInfoChecker);
bus.registerAgent(preventionOfConfidence);
bus.registerAgent(humanizerUiDisplay);
bus.registerAgent(emailer);

let latestSessionId: string | null = "session_default";

const seedPaths = [
  path.join(process.cwd(), "src", "default_session.json"),
  path.join(__dirname, "default_session.json"),
  path.join(__dirname, "agents", "default_session.json")
];

for (const p of seedPaths) {
  if (fs.existsSync(p)) {
    try {
      const data = JSON.parse(fs.readFileSync(p, "utf-8"));
      bus.updateSession("session_default", (session) => {
        Object.assign(session, data);
      });
      console.log(`[System] Seeded default compliance session from ${p}`);
      
      // Compile PDF/PPTX assets for the seeded session on start so they are instantly downloadable
      setTimeout(() => {
        console.log(`[System] Generating downloadable PDF/PPTX report assets for session_default...`);
        humanizerUiDisplay.generateReportAssets("session_default", data)
          .then(() => console.log(`[System] Downloadable report assets for session_default are ready!`))
          .catch((e) => console.error(`[System] Failed to compile assets for session_default:`, e));
      }, 1000);
      
      break;
    } catch (e) {
      console.error(`[System] Error seeding default session from ${p}:`, e);
    }
  }
}

// --- HTTP API Endpoints ---

/**
 * Get available test scenarios
 */
app.get("/api/scenarios", (req, res) => {
  res.json([
    {
      id: "Scenario_Complete",
      name: "Scenario A: Medical Diagnostics Platform (Complete)",
      description: "A proposal that includes notes on all 8 required governance items. Passes immediately.",
    },
    {
      id: "Scenario_Incomplete",
      name: "Scenario B: HR CV Screening platform (High-Risk)",
      description: "Initial scan is missing 'monitoring' & 'logging'. Rerun auto-recovers 'logging', but 'monitoring' remains missing, triggering the prompt upload dialog.",
    },
    {
      id: "Scenario_Empty",
      name: "Scenario C: Customer Support Reply Drafts (General)",
      description: "Severe compliance omissions. Requires extensive upload or produces a lengthy gaps assessment report.",
    },
  ]);
});

/**
 * Start a compliance session
 */
app.post("/api/session/start", (req, res) => {
  const { sessionId, scenario } = req.body;
  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" });
  }

  console.log(`\n=== Starting compliance session: ${sessionId} | Scenario: ${scenario} ===`);
  bus.resetSession(sessionId);
  const session = bus.getOrCreateSession(sessionId);

  latestSessionId = sessionId;

  // Trigger the start on the bus. Message goes from "User" to the first agent: "InputParser"
  bus.publish({
    id: `start-${Date.now()}`,
    timestamp: new Date().toISOString(),
    sender: "User",
    recipient: "InputParser",
    type: "START",
    content: `Start compliance pipeline analysis using scenario: ${scenario}`,
    data: { sessionId, scenario },
  });

  res.json({ sessionId, status: session.status });
});

/**
 * Fetch the latest active session state
 */
app.get("/api/session/latest", (req, res) => {
  if (!latestSessionId) {
    return res.json(null);
  }
  const session = bus.getOrCreateSession(latestSessionId);
  res.json(session);
});

/**
 * Fetch current session state & full message log
 */
app.get("/api/session/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  const session = bus.getOrCreateSession(sessionId);
  res.json(session);
});

/**
 * Upload additional documents (Step 2 user action)
 */
app.post("/api/session/:sessionId/upload", (req, res) => {
  const { sessionId } = req.params;
  const { files } = req.body; // Array of file names / strings

  if (!files || !Array.isArray(files) || files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  latestSessionId = sessionId;

  console.log(`[HTTP API] User uploading files to session ${sessionId}:`, files);

  // Send USER_UPLOADED_INFO message on the bus to the MissingInfoChecker agent
  bus.publish({
    id: `user-upload-${Date.now()}`,
    timestamp: new Date().toISOString(),
    sender: "User",
    recipient: "MissingInfoChecker",
    type: "USER_UPLOADED_INFO",
    content: `User uploaded supplementary documents: ${files.join(", ")}`,
    data: { sessionId, files, skipped: false },
  });

  res.json({ success: true, status: "PROCESSING_UPLOAD" });
});

/**
 * Skip uploading and continue (Step 2 user action alternative)
 */
app.post("/api/session/:sessionId/skip", (req, res) => {
  const { sessionId } = req.params;

  latestSessionId = sessionId;

  console.log(`[HTTP API] User skipped uploads for session ${sessionId}`);

  // Send USER_UPLOADED_INFO message with skipped flag set to true
  bus.publish({
    id: `user-skip-${Date.now()}`,
    timestamp: new Date().toISOString(),
    sender: "User",
    recipient: "MissingInfoChecker",
    type: "USER_UPLOADED_INFO",
    content: `User skipped upload request`,
    data: { sessionId, files: [], skipped: true },
  });

  res.json({ success: true, status: "SKIPPED" });
});

// Serve exports statically
app.use("/exports", express.static(path.join(__dirname, "public", "exports")));

// Serve UI Playground static files
app.use(express.static(path.join(__dirname, "public")));

/**
 * Simulate emailing the compiled report package
 */
app.post("/api/session/:sessionId/email", (req, res) => {
  const { sessionId } = req.params;
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Recipient email is required" });
  }

  console.log(`[HTTP API] Triggering EmailerAgent for session ${sessionId} to ${email}`);

  const projectRoot = path.resolve(__dirname, "..");
  const pdfPath = path.join(projectRoot, "src", "public", "exports", `report-${sessionId}.pdf`);
  const pptxPath = path.join(projectRoot, "src", "public", "exports", `briefing-${sessionId}.pptx`);

  // Publish EMAIL_REPORT onto the bus
  bus.publish({
    id: `email-trigger-${Date.now()}`,
    timestamp: new Date().toISOString(),
    sender: "User",
    recipient: "Emailer",
    type: "EMAIL_REPORT",
    content: `Request email dispatch of reports to ${email}`,
    data: { sessionId, email, pdfPath, pptxPath },
  });

  res.json({ success: true, message: `Email dispatch scheduled to ${email}` });
});

// Redirect unknown routes to the dashboard
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Multi-Agent Compliance Backend running at http://localhost:${PORT}`);
  console.log(`📊 Open http://localhost:${PORT} in your browser to view the Playground!`);
  console.log(`======================================================\n`);
});
