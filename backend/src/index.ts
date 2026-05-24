import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { OpenAI } from "openai";

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

let latestSessionId: string | null = null;

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
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" });
  }

  console.log(`\n=== Starting compliance session: ${sessionId} ===`);
  bus.resetSession(sessionId);
  const session = bus.getOrCreateSession(sessionId);

  latestSessionId = sessionId;

  // Disable auto simulation entirely, we are now only doing full pipelines.
  // Set session status cleanly to IDLE to wait for user to upload documents.
  bus.updateSessionStatus(sessionId, "IDLE");

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
 * Upload additional documents (Step 1 or Step 2 user action)
 */
app.all("/api/session/:sessionId/upload", (req, res) => {
  const { sessionId } = req.params;
  latestSessionId = sessionId;

  // Read params from both query and body
  let analysis: any = null;
  if (req.query.analysis) {
    try {
      analysis = JSON.parse(req.query.analysis as string);
    } catch (e) {
      console.error("[HTTP API] Failed to parse analysis from query parameter:", e);
    }
  } else if (req.body && req.body.analysis) {
    analysis = req.body.analysis;
  }

  let files: string[] = [];
  if (req.query.files) {
    try {
      files = JSON.parse(req.query.files as string);
    } catch (e) {
      const queryFiles = req.query.files as string;
      if (queryFiles.trim().startsWith("[")) {
        files = [];
      } else {
        files = queryFiles.split(",").map(f => f.trim()).filter(Boolean);
      }
    }
  } else if (req.body && req.body.files) {
    files = req.body.files;
  }

  // If this is Step 1 (Real Ingested Document Analysis)
  if (analysis) {
    console.log(`[HTTP API] Received real document analysis payload for session ${sessionId}:`, analysis);

    const proposalFacts = {
      purpose: analysis.purpose || "Real uploaded document",
      users: analysis.users || "Unknown users",
      affectedPersons: analysis.affected_persons || "Unknown affected persons",
      sector: analysis.sector || "Unspecified",
      inputData: analysis.input_data || "N/A",
      outputs: analysis.outputs || "N/A",
      automationLevel: analysis.automation_level || "N/A",
      humanOversight: analysis.human_oversight || "N/A",
      deploymentContext: analysis.deployment_context || "N/A",
      useOfAiGeneratedContent: analysis.use_of_ai_generated_content || "N/A",
      useOfGpai: analysis.use_of_gpai || "N/A",
      possibleImpactOnPeople: analysis.possible_impact_on_people || "N/A"
    };

    bus.updateSession(sessionId, (s) => {
      s.parsedText = `Parsed from real PDF upload: Purpose: ${proposalFacts.purpose}. Sector: ${proposalFacts.sector}.`;
      s.riskClassification = analysis.possibleRiskClassification;
      s.proposalFacts = proposalFacts;
      s.decisionTreePayload = analysis;
      if (files && files.length > 0) {
        s.uploadedDocs = Array.from(new Set([...(s.uploadedDocs || []), ...files]));
      }
    });

    // Run DecisionTree validation rule
    const bypass = analysis.bypassValidation === true;
    const canClassify = typeof analysis.can_classify === "boolean" ? analysis.can_classify : true;
    const avgExtractionConfidence = analysis.validation?.avg_extraction_confidence ?? 0.9;
    const overallConfidence = analysis.classification?.overall_confidence ?? 0.85;

    if (!bypass && (!canClassify || avgExtractionConfidence < 0.7 || overallConfidence < 0.6)) {
      console.warn(`[HTTP API] Validation failed for uploaded document: can_classify=${canClassify}, avg_extraction_confidence=${avgExtractionConfidence}, overall_confidence=${overallConfidence}. Reprompting for supplementary documents.`);
      
      bus.updateSessionStatus(sessionId, "AWAITING_USER_UPLOAD");

      bus.publish({
        id: `dt-fail-${Date.now()}`,
        timestamp: new Date().toISOString(),
        sender: "DecisionTree",
        recipient: "User",
        type: "PROMPT_USER_UPLOAD",
        content: `Compliance check is missing critical info: detailed system design specifications. Please upload supplementary documents.`,
        data: {
          sessionId,
          missingFields: ["highly confident proposal text", "supplementary documents"]
        }
      });

      return res.json({ success: true, status: "AWAITING_USER_UPLOAD", error: "Validation threshold not met. Reprompted for missing information." });
    } else {
      const isOutOfScope = 
        analysis.possibleRiskClassification?.toLowerCase().includes("out of scope") ||
        analysis.possibleRiskClassification?.toLowerCase().includes("out-of-scope") ||
        analysis.possibleRiskClassification?.toLowerCase().includes("exempt") ||
        analysis.possibleRiskClassification?.toLowerCase().includes("article 2") ||
        analysis.possibleRiskClassification?.toLowerCase().includes("article 6.3");

      if (isOutOfScope) {
        console.log(`[HTTP API] Submission is out of scope or exempt: '${analysis.possibleRiskClassification}'. Stopping pipeline immediately.`);
        
        bus.updateSession(sessionId, (s) => {
          s.status = "COMPLETED_SUCCESS";
          s.assumptions = [];
          s.gaps = [];
          s.governanceData = null;
          s.preventionOutput = "This system is Out of Scope or Exempt from the EU AI Act. No further governance observations or risk caveats are generated.";
          s.humanizedSummary = {
            statusLabel: "EXEMPT / OUT OF SCOPE",
            riskClassification: analysis.possibleRiskClassification,
            governanceCompleteness: "0 of 0 Parameters (Not Applicable)",
            visualIndicators: {
              documentation: false,
              riskManagement: false,
              transparency: false,
              humanOversight: false,
              monitoring: false,
              logging: false,
              accountability: false,
              roleClarity: false,
            },
            finalReportMarkdown: "This system is Out of Scope or Exempt from the EU AI Act. No further governance observations or risk caveats are generated.",
            timestamp: new Date().toLocaleTimeString(),
            pdfUrl: null,
            pptxUrl: null,
            downstreamDecisions: {
              strictnessLevel: "STANDARD",
              targetAuditFocus: "Exempt / Out of Scope System",
              humanizerStyleHint: "Exempt System Layout"
            }
          };
        });

        bus.updateSessionStatus(sessionId, "COMPLETED_SUCCESS");
        return res.json({ success: true, status: "COMPLETED_SUCCESS" });
      }

      console.log(`[HTTP API] Validation succeeded. Routing directly to JudgeOfGovernance.`);

      bus.updateSessionStatus(sessionId, "ANALYZING_GOVERNANCE");

      bus.publish({
        id: `dt-success-${Date.now()}`,
        timestamp: new Date().toISOString(),
        sender: "DecisionTree",
        recipient: "JudgeOfGovernance",
        type: "ANALYZE_GOVERNANCE",
        content: "Run governance metrics check",
        data: {
          sessionId,
          scenario: "Scenario_RealUpload",
          parsedText: `Parsed from real PDF upload: Purpose: ${proposalFacts.purpose}. Sector: ${proposalFacts.sector}.`,
          riskClassification: analysis.possibleRiskClassification,
          isRerun: false,
          appearsToMeetAiSystemDefinition: analysis.appearsToMeetAiSystemDefinition,
          possibleRiskClassification: analysis.possibleRiskClassification,
          transparencyObligations: analysis.transparencyObligations,
          can_classify: canClassify,
          validation: analysis.validation || { avg_extraction_confidence: avgExtractionConfidence },
          classification: analysis.classification || { overall_confidence: overallConfidence },
          reasoning_trace: analysis.reasoning_trace || "Standard compliance evaluation run.",
          citations: analysis.citations || [],
          users: analysis.users,
          affected_persons: analysis.affected_persons,
          decisionTreePayload: analysis
        }
      });

      return res.json({ success: true, status: "ANALYZING_GOVERNANCE" });
    }
  }

  // Fallback to Step 2 (Supplementary Document Upload)
  if (!files || !Array.isArray(files) || files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

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

/**
 * Landing Page Copilot Chatbot Endpoint
 */
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const apiKey = process.env.VERDA_API_KEY;
  const baseUrl = process.env.VERDA_BASE_LLAMA_URL;

  const isConfigured = 
    apiKey && 
    baseUrl && 
    apiKey !== "your_verda_api_key_here" && 
    baseUrl !== "your_verda_base_llama_url_here";

  if (isConfigured) {
    try {
      console.log(`[HTTP API] Calling Verda Llama LLM for user chat message with multi-turn history...`);
      const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: baseUrl,
        timeout: 5000,
        maxRetries: 0
      });

      const systemPrompt = "You are 'Verda', a premium conversational EU AI Act Legal Compliance Copilot. Your job is to answer the user's questions about the EU AI Act, what files they can upload, how to start, and details about the multi-agent compliance platform. Keep answers professional, practical, encouraging, and format them with beautiful, structured markdown (tables, lists, italicized citations, etc.). Keep response lengths friendly and conversational. Since you have access to the conversation history, make sure to refer to previous messages if the user refers to them (e.g., using pronouns or asking follow-up questions).";

      const apiMessages: any[] = [
        { role: "system", content: systemPrompt }
      ];

      if (history && Array.isArray(history) && history.length > 0) {
        history.forEach((h: any) => {
          if (h.role && h.content) {
            apiMessages.push({
              role: h.role === "user" ? "user" : h.role === "assistant" || h.role === "system" ? h.role : "assistant",
              content: h.content
            });
          }
        });
      } else {
        apiMessages.push({ role: "user", content: message });
      }

      const response = await openai.chat.completions.create({
        model: "meta-llama/Llama-3.1-8B-Instruct",
        messages: apiMessages as any,
        temperature: 0.3,
      });
      const reply = response.choices?.[0]?.message?.content;
      if (reply) {
        return res.json({ reply });
      }
    } catch (e) {
      console.error("[HTTP API] Verda LLM chat failed, falling back to keyword dict:", e);
    }
  }

  // Fallback to high-fidelity keyword matching dictionary
  const query = message.toLowerCase();
  let reply = "";

  if (
    query.includes("risk") || 
    query.includes("prohibit") || 
    query.includes("unacceptable") || 
    query.includes("limited") || 
    query.includes("minimal") || 
    query.includes("tier") || 
    query.includes("classification")
  ) {
    reply = `### 🛡️ EU AI Act Risk Classifications

The EU AI Act classifies AI systems into four risk levels, each with distinct obligations:

1. **❌ Unacceptable/Prohibited Risk**: Systems that pose a clear threat to safety, livelihoods, and rights (e.g., social scoring, cognitive behavioral manipulation, biometric categorization of sensitive traits). *These are strictly banned.*
2. **⚠️ High-Risk**: Systems in sensitive domains (e.g., medical devices, CV screening, biometric ID, education grading, credit scoring). *Must comply with strict governance (transparency, risk management, human oversight, high-quality data datasets).*
3. **💬 Limited Risk**: Chatbots, deepfakes, emotion recognition. *Subject to basic transparency obligations (users must know they are interacting with AI).*
4. **✅ Minimal/No Risk**: Spam filters, AI-enabled video games. *No added regulations.*`;
  } else if (
    query.includes("provider") || 
    query.includes("deployer") || 
    query.includes("distributor") || 
    query.includes("importer") || 
    query.includes("role") || 
    query.includes("legal duty")
  ) {
    reply = `### 🏢 Legal Roles & Obligations

The EU AI Act assigns responsibilities depending on your placement in the supply chain:

*   **⚡ Provider (Developer)**: Any entity that develops an AI system (or has it developed) and places it on the market or puts it into service under its own name. *Carries the heaviest compliance burden (CE marking, conformity assessments, quality management systems).*
*   **👥 Deployer (User)**: Any entity using an AI system under its authority in a professional capacity (e.g., a company deploying an HR CV screening tool). *Responsible for proper human oversight, following instructions of use, and monitoring system operations.*
*   **📦 Importer / Distributor**: Entities placing AI systems on the EU market from outside or distributing them. *Responsible for verifying provider compliance certificates and ensuring proper storage/transport conditions.*`;
  } else if (
    query.includes("file") || 
    query.includes("upload") || 
    query.includes("start") || 
    query.includes("format") || 
    query.includes("pdf") || 
    query.includes("document") || 
    query.includes("how do i") || 
    query.includes("what can i")
  ) {
    reply = `### 📁 Document Upload & Analysis Guide

To start a multi-agent compliance scan, use the dropzone on the landing page:

1.  **Supported Formats**: Upload system proposals, system design specifications, or compliance reviews in **PDF** or raw text format.
2.  **How to Start**: Simply drag-and-drop your document or select it from your files, then click **'Upload & Submit Compliance Files'**.
3.  **The Multi-Agent Pipeline**: 
    *   **Agent 1 (Extractor)** parses the documents via OCR/remote LLMs to extract structural attributes (Purpose, Sector, Outputs, Human Oversight, etc.).
    *   **Agent 2 (Decision Tree)** classifies the risk level and validates completeness.
    *   **Agent 3 (Judge of Governance)** creates legal practical notes for the final report.
4.  **Supplementary Documents**: If a document lacks clarity, the system will prompt you to upload supplementary documents to secure a high-confidence pass.`;
  } else if (
    query.includes("agent") || 
    query.includes("how does it work") || 
    query.includes("pipeline") || 
    query.includes("multi-agent") || 
    query.includes("how it works") || 
    query.includes("system")
  ) {
    reply = `### 🤖 Multi-Agent Compliance Pipeline

Our platform coordinates **8 specialized agents** on an active communication bus:

1.  **📁 Input Parser Agent**: Ingests files and structures textual information.
2.  **🌲 Decision Tree Agent**: Rules on the regulatory scope, risk level, and extraction validity.
3.  **⚖️ Judge of Governance Agent**: Issues precise legal guidance for compliance categories.
4.  **🔍 Assumptions Checker Agent**: Spots and verifies critical unstated engineering assertions.
5.  **💬 Missing Info Checker Agent**: Manages interactive chat loops if documents are rejected or incomplete.
6.  **🛡️ Prevention of Confidence Agent**: Runs adversarial verification checks to combat hallucination or blind trust.
7.  **🎨 Humanizer UI Display Agent**: Packages results into beautifully styled dashboards and exports.
8.  **✉️ Emailer Agent**: Handles secure delivery of compiled PDF/PPTX compliance briefings.`;
  } else if (
    query.includes("eu ai act") || 
    query.includes("ai act") || 
    query.includes("about") || 
    query.includes("what is") || 
    query.includes("regulation")
  ) {
    reply = `### 🇪🇺 What is the EU AI Act?

The **European Union Artificial Intelligence Act (EU AI Act)** is the world's first comprehensive horizontal legal framework for artificial intelligence. 

*   **Primary Objective**: To ensure that AI systems placed on the European market are safe, respect fundamental human rights, and align with EU values, while promoting investment and innovation.
*   **Scope**: Applies to all providers placing systems in the EU, and deployers using systems in the EU, regardless of whether they are located within the EU.
*   **Enforcement**: Non-compliance can lead to massive fines (up to €35 million or 7% of global turnover). This platform helps you automate the heavy lifting of auditing your system design against the Act's stringent requirements.`;
  } else {
    reply = `### 👋 Hello, I'm Verda!

I'm your conversational EU AI Act Legal Compliance Copilot. How can I assist you today?

You can ask me about:
*   **⚠️ High-Risk AI & other risk tiers** (e.g. *"What is a high-risk system?"*)
*   **🏢 Legal Roles** (e.g. *"What is the difference between a provider and a deployer?"*)
*   **📁 How to use this platform & upload files** (e.g. *"How do I upload system specs?"*)
*   **🤖 The 8 Specialized Agents** (e.g. *"Which agents are running in the pipeline?"*)

Simply type your question or use one of the quick action buttons to learn more!`;
  }

  res.json({ reply });
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
