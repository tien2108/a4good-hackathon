import { BaseAgent } from "./BaseAgent.js";
import { AgentMessage, GovernanceData } from "./types.js";

export class JudgeOfGovernanceAgent extends BaseAgent {
  constructor(bus: any) {
    super("JudgeOfGovernance", bus);
  }

  public async receive(message: AgentMessage): Promise<void> {
    const { sessionId, scenario, isRerun } = message.data || {};

    if (message.type === "ANALYZE_GOVERNANCE") {
      this.log(`Analyzing proposal for AI Act compliance parameters (documentation, risk management, human oversight, logging, etc.)...`, { sessionId });
      this.bus.updateSessionStatus(sessionId, "ANALYZING_GOVERNANCE");

      const attemptCount = this.bus.getOrCreateSession(sessionId).attemptCount;
      const uploadedDocs = this.bus.getOrCreateSession(sessionId).uploadedDocs;

      // Determine the governance structure based on scenario, rerun, and uploads
      const govData = this.generateGovernanceJSON(scenario, attemptCount, uploadedDocs);

      this.bus.updateSession(sessionId, (s) => {
        s.governanceData = govData;
      });

      this.log(`Governance Analysis Complete. Fields populated: [${Object.keys(govData).join(", ")}]. Routing to MissingInfoChecker.`, { sessionId });
      
      // Send output to the MissingInfoChecker agent
      this.send("MissingInfoChecker", "CHECK_MISSING_INFO", "Please run missing info checker on governance analysis", { 
        sessionId, 
        scenario,
        governanceData: govData 
      });
    }
  }

  private generateGovernanceJSON(scenario: string, attemptCount: number, uploadedDocs: string[]): GovernanceData {
    // Check if the user uploaded documents that solve missing fields
    const hasUploadedMonitoring = uploadedDocs.some(d => d.toLowerCase().includes("monitoring") || d.toLowerCase().includes("upload"));

    if (scenario === "Scenario_Complete") {
      return {
        documentation: "Full system logs, technical file architectures, and operating guidelines are provided.",
        riskManagement: "Active risk management matrix updated bi-weekly, includes residual liability checks.",
        transparency: "Clear user-instructions manual, system capability bounds disclosed in product footer.",
        humanOversight: "Human override button triggers manual lockouts, clinical review board oversees high-risk alerts.",
        monitoring: "Continuous telemetry monitor registers sensor drifts and model accuracy.",
        logging: "Automated append-only logging of inputs, inferences, and human overrides.",
        accountability: "Named AI compliance officer assigned; annual external safety audits scheduled.",
        roleClarity: "Clinical operators defined as deployers; hospital network defined as provider/deployer.",
      };
    } 
    
    else if (scenario === "Scenario_Incomplete") {
      // First Run (attemptCount = 0): Missing "monitoring" and "logging"
      if (attemptCount === 0) {
        return {
          documentation: "Basic user onboarding documentation is ready.",
          riskManagement: "Risk register outlines initial data protection impact assessment.",
          transparency: "Privacy notice is displayed upon candidate login.",
          humanOversight: "Recruitment HR managers can ignore algorithm scores.",
          accountability: "Recruiting director is responsible for algorithmic hiring review.",
          roleClarity: "Corporate HR is the deployer; SaaS platform is the provider.",
          // MISSING: logging, monitoring
        };
      } 
      
      // Second Run (isRerun / attemptCount === 1)
      else if (attemptCount === 1) {
        // If they did a rerun, the Input Parser successfully extracts "logging" from deeper NLP context!
        // But "monitoring" is STILL missing.
        const baseGov: GovernanceData = {
          documentation: "Basic user onboarding documentation is ready.",
          riskManagement: "Risk register outlines initial data protection impact assessment.",
          transparency: "Privacy notice is displayed upon candidate login.",
          humanOversight: "Recruitment HR managers can ignore algorithm scores.",
          logging: "RERUN_SUCCESS: Inferred system logs are stored in Amazon CloudWatch.", // Recovered on rerun!
          accountability: "Recruiting director is responsible for algorithmic hiring review.",
          roleClarity: "Corporate HR is the deployer; SaaS platform is the provider.",
          // STILL MISSING: monitoring
        };

        // If the user went to stage 2 and actually uploaded a monitoring document, we can resolve it!
        if (hasUploadedMonitoring) {
          baseGov.monitoring = "USER_UPLOADED_RESOLVED: Active runtime checks are handled via file upload context: " + uploadedDocs.join(", ");
        }

        return baseGov;
      }
    } 
    
    else if (scenario === "Scenario_Empty") {
      const emptyGov: GovernanceData = {
        documentation: "Minimal notes on LLM drafting.",
      };

      if (hasUploadedMonitoring) {
        emptyGov.monitoring = "User uploaded raw technical specifications solving monitoring issues.";
      }

      return emptyGov;
    }

    return {
      documentation: "Default document assessment notes.",
    };
  }
}
