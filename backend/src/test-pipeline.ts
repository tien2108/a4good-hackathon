import { AgentBus } from "./agents/AgentBus.js";
import { InputParserAgent } from "./agents/InputParserAgent.js";
import { DecisionTreeAgent } from "./agents/DecisionTreeAgent.js";
import { JudgeOfGovernanceAgent } from "./agents/JudgeOfGovernanceAgent.js";
import { AssumptionsCheckerAgent } from "./agents/assumption_checker/AssumptionsCheckerAgent.js";
import { MissingInfoCheckerAgent } from "./agents/missing_info_checker/MissingInfoCheckerAgent.js";
import { PreventionOfConfidenceAgent } from "./agents/prevention_of_confidence/PreventionOfConfidenceAgent.js";
import { HumanizerUiDisplayAgent } from "./agents/humanizer_ui_display/HumanizerUiDisplayAgent.js";
import { EmailerAgent } from "./agents/emailer/EmailerAgent.js";
import fs from "fs";
import path from "path";

async function runTest() {
  console.log("=== STARTING PIPELINE INTEGRATION TEST ===");
  const bus = new AgentBus();

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

  const sessionId = "test-session-" + Date.now();
  console.log(`Created Session: ${sessionId}`);

  // Subscribe to bus logs to print them
  bus.publish({
    id: `start-${Date.now()}`,
    timestamp: new Date().toISOString(),
    sender: "User",
    recipient: "InputParser",
    type: "START",
    content: "Start compliance pipeline analysis using scenario: Scenario_Complete",
    data: { sessionId, scenario: "Scenario_Complete" },
  });

  // Wait for the pipeline to finish
  console.log("Waiting for agents to process...");
  await new Promise(resolve => setTimeout(resolve, 8000));

  const session = bus.getOrCreateSession(sessionId);
  console.log("\n=== TEST RESULTS ===");
  console.log("Status:", session.status);
  console.log("Gaps Count:", session.gaps?.length);
  console.log("Assumptions Count:", session.assumptions?.length);
  console.log("Humanized Summary Present?:", !!session.humanizedSummary);
  
  if (session.humanizedSummary) {
    console.log("Compliance Score:", session.humanizedSummary.complianceScore);
    console.log("PDF URL:", session.humanizedSummary.pdfUrl);
    console.log("PPTX URL:", session.humanizedSummary.pptxUrl);
    
    // Save to default_session.json
    const outPath = path.join(process.cwd(), "src", "default_session.json");
    // Strip dynamic timestamps or IDs if needed, or keep them as fallback defaults
    const seedSession = {
      ...session,
      sessionId: "session_default",
      humanizedSummary: {
        ...session.humanizedSummary,
        pdfUrl: "/exports/report-session_default.pdf",
        pptxUrl: "/exports/briefing-session_default.pptx"
      }
    };
    fs.writeFileSync(outPath, JSON.stringify(seedSession, null, 2));
    console.log(`Saved default session state to ${outPath}`);
  } else {
    console.log("❌ Error: humanizedSummary is null!");
  }
}

runTest().catch(console.error);
