import { BaseAgent } from "./BaseAgent.js";
import { AgentMessage, ProposalFacts } from "./types.js";

export class InputParserAgent extends BaseAgent {
  constructor(bus: any) {
    super("InputParser", bus);
  }

  public async receive(message: AgentMessage): Promise<void> {
    const { sessionId, scenario } = message.data || {};

    if (message.type === "START" || message.type === "PARSE_REQUEST") {
      this.log(`Received initial parsing request for scenario: ${scenario || "Default"}`, { sessionId });
      this.bus.updateSessionStatus(sessionId, "PARSING");
      
      // Simulate file reading/parsing
      const parsedText = this.getParsedTextForScenario(scenario);
      const proposalFacts = this.getProposalFactsForScenario(scenario);

      this.bus.updateSession(sessionId, (s) => {
        s.parsedText = parsedText;
        s.proposalFacts = proposalFacts;
      });

      this.log(`Successfully parsed document. Text length: ${parsedText.length} characters. Key facts compiled. Sending to DecisionTree.`, { sessionId });
      this.send("DecisionTree", "CLASSIFY_REQUEST", "Please run risk classification on parsed text", { sessionId, scenario, parsedText });
    } 
    
    else if (message.type === "RERUN_COMMAND") {
      this.log(`🚨 received RERUN command from ${message.sender}. Purpose: ${message.content}`, { sessionId });
      this.bus.updateSessionStatus(sessionId, "PARSING");
      this.log("Executing advanced NLP entity extraction with high-recall parser configuration...", { sessionId });

      // In Scenario 2 (Incomplete), a rerun "discovers" one missing field (logging), but leaves another field (monitoring) missing.
      this.log("Auto-recovery text scanning complete. Updating parsed text contents.", { sessionId });

      const updatedText = "UPDATED_BY_RERUN: " + (this.bus.getOrCreateSession(sessionId).parsedText || "");
      this.bus.updateSession(sessionId, (s) => {
        s.parsedText = updatedText;
        s.attemptCount = 1; // Mark that rerun occurred
      });

      this.send("DecisionTree", "CLASSIFY_REQUEST", "Please recheck risk classification on updated parsed text", { 
        sessionId, 
        scenario, 
        parsedText: updatedText, 
        isRerun: true 
      });
    }
  }

  private getParsedTextForScenario(scenario?: string): string {
    switch (scenario) {
      case "Scenario_Complete":
        return "[DOC_COMPLETE] This proposal details an autonomous medical diagnostics platform. It has full documentation, active hazard monitoring, comprehensive audit logging, clinical-oversight mechanisms, and a clear role charter for clinical deployers.";
      case "Scenario_Incomplete":
        return "[DOC_PARTIAL] An AI recruitment tool that profiles candidate CVs. Contains details about the data schema and role definitions. (No mention of human-in-the-loop, logging, or risk management registers).";
      case "Scenario_Empty":
        return "[DOC_EMPTY] A basic brainstorming note about using LLMs to draft customer support replies.";
      default:
        return "[DOC_DEFAULT] Basic proposal text.";
    }
  }

  private getProposalFactsForScenario(scenario?: string): ProposalFacts {
    switch (scenario) {
      case "Scenario_Complete":
        return {
          purpose: "autonomous medical diagnostics platform",
          users: "Clinical radiologists and hospital staff",
          affectedPersons: "Patients undergoing diagnostic scanning",
          sector: "Healthcare / High-risk medical diagnostics",
          inputData: "Patient medical images (CT scans, X-rays, MRI), electronic health records (EHR) containing health data",
          outputs: "Diagnostic classification reports, risk indicators, severity scoring, and anatomical annotations",
          automationLevel: "High. Recommends diagnosis and classifications, but includes confirmation gates.",
          humanOversight: "Clinical radiologists review, sign-off on every output, and can override any AI recommendation with an override button.",
          deploymentContext: "Installed on hospital networks as an integrated clinical decision support tool.",
          useOfAiGeneratedContent: "Generates anatomical overlays and synthesized medical reports.",
          useOfGpai: "None. Uses specialized clinical computer vision models.",
          possibleImpactOnPeople: "Clinical decision outcomes, patient health status, medical diagnosis accuracy."
        };
      case "Scenario_Incomplete":
        return {
          purpose: "AI recruitment tool to scan and profile candidate CVs to predict job performance.",
          users: "Corporate HR recruitment managers.",
          affectedPersons: "Job applicants and candidates.",
          sector: "Employment and HR / Candidate evaluation (High-Risk Category Annex III of AI Act).",
          inputData: "Candidate curriculum vitaes (CVs), resume texts, LinkedIn profiles, self-reported skills, and cover letters.",
          outputs: "Automated fit-score (0-100), key capability profiles, and suitability ranking.",
          automationLevel: "Highly automated screening, rank-ordering candidates.",
          humanOversight: "Vague. HR managers can view scores and theoretically ignore them, but there is no built-in mechanism or operational rule ensuring human-in-the-loop validation of low-scored applicants.",
          deploymentContext: "Hosted as a cloud SaaS recruitment platform accessible via web browser.",
          useOfAiGeneratedContent: "None.",
          useOfGpai: "Uses a fine-tuned GPT model via OpenAI API for capability extraction.",
          possibleImpactOnPeople: "Equal employment opportunity, career livelihoods, systematic bias/discrimination based on historical CV data."
        };
      case "Scenario_Empty":
        return {
          purpose: "Customer support email drafting using generative LLMs.",
          users: "Customer support agents.",
          // affectedPersons is OMITTED/OPTIONAL because customer support draft email generation
          // is general support and doesn't directly affect humans in high-risk categories.
          sector: "Customer Service / General Purpose AI.",
          inputData: "General user emails, public support documentation.",
          outputs: "Suggested email reply drafts.",
          automationLevel: "Semi-automated. Agents must copy/paste or edit drafts before sending.",
          humanOversight: "High. Support agent must review and send the email.",
          deploymentContext: "Browser extension for support desk agents.",
          useOfAiGeneratedContent: "High. Suggested draft copy.",
          useOfGpai: "High. Connects directly to external API (e.g., ChatGPT) with minimal local parameter configurations.",
          possibleImpactOnPeople: "General service quality, communication accuracy."
        };
      default:
        return {
          purpose: "Unknown purpose.",
          sector: "General AI"
        };
    }
  }
}
