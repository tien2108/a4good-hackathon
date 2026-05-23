import { BaseAgent } from "./BaseAgent.js";
import { AgentMessage, GovernanceData } from "./types.js";

interface JudgeOfGovernanceInput {
  appearsToMeetAiSystemDefinition: boolean;
  possibleRiskClassification: string;
  transparencyObligations: string[];
}

export class JudgeOfGovernanceAgent extends BaseAgent {
  constructor(bus: any) {
    super("JudgeOfGovernance", bus);
  }

  public async receive(message: AgentMessage): Promise<void> {
    const { sessionId, scenario, isRerun, riskClassification } = message.data || {};

    if (message.type === "ANALYZE_GOVERNANCE") {
      this.log(`Analyzing proposal for AI Act compliance parameters (documentation, risk management, human oversight, logging, etc.)...`, { sessionId });
      this.bus.updateSessionStatus(sessionId, "ANALYZING_GOVERNANCE");

      const attemptCount = this.bus.getOrCreateSession(sessionId).attemptCount;
      const uploadedDocs = this.bus.getOrCreateSession(sessionId).uploadedDocs;

      // 1. Construct the explicit JSON input from the previous DecisionTree stage,
      // as required by the spec:
      // - whether system meets AI Act definition
      // - possible risk classification
      // - transparency/labelling obligations
      const appearsToMeetDefinition = !riskClassification?.includes("Out of Scope");
      
      // Extract clean risk classification (before the citations text)
      const possibleRiskClassification = riskClassification?.split("\n\n")[0] || "Unclassified";

      // Extract transparency obligations from the citations in riskClassification
      const transparencyObligations: string[] = [];
      if (riskClassification) {
        if (riskClassification.includes("Article 50")) transparencyObligations.push("Article 50: Interactive Chatbot / Text Generator Transparency");
        if (riskClassification.includes("Article 52")) transparencyObligations.push("Article 52: Mandatory notification to human users interacting with AI systems");
        if (riskClassification.includes("Article 23")) transparencyObligations.push("Article 23: Labeling and importer contact registration");
      }

      const inputJSON: JudgeOfGovernanceInput = {
        appearsToMeetAiSystemDefinition: appearsToMeetDefinition,
        possibleRiskClassification,
        transparencyObligations
      };

      this.log(`Input JSON parsed for JudgeOfGovernance:\n` + JSON.stringify(inputJSON, null, 2), { sessionId });

      // 2. Generate the governance data using the required inputs and scenario context
      const govData = this.generateGovernanceJSON(inputJSON, scenario, attemptCount, uploadedDocs);

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

  private generateGovernanceJSON(
    input: JudgeOfGovernanceInput,
    scenario: string,
    attemptCount: number,
    uploadedDocs: string[]
  ): GovernanceData {
    // Rule 2 of her Python script: If it is NOT an AI system, set all JSON values to "N/A - Not an AI system".
    if (!input.appearsToMeetAiSystemDefinition) {
      return {
        documentation: "N/A - Not an AI system",
        riskManagement: "N/A - Not an AI system",
        transparency: "N/A - Not an AI system",
        humanOversight: "N/A - Not an AI system",
        monitoring: "N/A - Not an AI system",
        logging: "N/A - Not an AI system",
        accountability: "N/A - Not an AI system",
        roleClarity: "N/A - Not an AI system",
      };
    }

    // Check if the user uploaded documents that solve missing fields
    const hasUploadedMonitoring = uploadedDocs.some(d => d.toLowerCase().includes("monitoring") || d.toLowerCase().includes("upload"));

    // If High-Risk or Scenario_Complete / Scenario_Incomplete:
    if (input.possibleRiskClassification.includes("High-Risk") || scenario === "Scenario_Complete" || scenario === "Scenario_Incomplete") {
      if (scenario === "Scenario_Complete") {
        return {
          documentation: "Full system logs, technical file architectures, and operating guidelines are provided.",
          riskManagement: "Active risk management matrix updated bi-weekly, includes residual liability checks.",
          transparency: "Clear user-instructions manual, system capability bounds disclosed in product footer. " + input.transparencyObligations.join(", "),
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
            transparency: "Privacy notice is displayed upon candidate login. " + input.transparencyObligations.join(", "),
            humanOversight: "Recruitment HR managers can ignore algorithm scores.",
            accountability: "Recruiting director is responsible for algorithmic hiring review.",
            roleClarity: "Corporate HR is the deployer; SaaS platform is the provider.",
            // MISSING: logging, monitoring
          };
        } 
        
        // Second Run (isRerun / attemptCount === 1)
        else if (attemptCount === 1) {
          const baseGov: GovernanceData = {
            documentation: "Basic user onboarding documentation is ready.",
            riskManagement: "Risk register outlines initial data protection impact assessment.",
            transparency: "Privacy notice is displayed upon candidate login. " + input.transparencyObligations.join(", "),
            humanOversight: "Recruitment HR managers can ignore algorithm scores.",
            logging: "RERUN_SUCCESS: Inferred system logs are stored in Amazon CloudWatch.", // Recovered on rerun!
            accountability: "Recruiting director is responsible for algorithmic hiring review.",
            roleClarity: "Corporate HR is the deployer; SaaS platform is the provider.",
            // STILL MISSING: monitoring
          };

          if (hasUploadedMonitoring) {
            baseGov.monitoring = "USER_UPLOADED_RESOLVED: Active runtime checks are handled via file upload context: " + uploadedDocs.join(", ");
          }

          return baseGov;
        }
      }
    }

    // Limited Risk / General Purpose AI or Scenario_Empty
    if (input.possibleRiskClassification.includes("Limited Risk") || scenario === "Scenario_Empty") {
      const emptyGov: GovernanceData = {
        documentation: "Minimal notes on LLM drafting.",
        riskManagement: "No high-risk requirements. Basic usage guidelines implemented.",
        transparency: "Notification displayed to user: AI-generated text output. " + input.transparencyObligations.join(", "),
        humanOversight: "High oversight: Human support agents review and edit drafts before sending.",
        accountability: "Support department head oversees deployment.",
        roleClarity: "Support agent is the deployer; API provider is the model developer.",
      };

      if (hasUploadedMonitoring) {
        emptyGov.monitoring = "User uploaded raw technical specifications solving monitoring issues.";
      }

      return emptyGov;
    }

    // Default Out-of-Scope or Default Case
    return {
      documentation: "Default document assessment notes.",
      riskManagement: "Standard risk review performed.",
      transparency: "Standard transparency rules apply. " + input.transparencyObligations.join(", "),
      humanOversight: "Standard operator monitoring recommended.",
      monitoring: "N/A - Standard deployment monitoring.",
      logging: "N/A - Standard system logs.",
      accountability: "Standard department manager accountability.",
      roleClarity: "Operator defined as system deployer.",
    };
  }
}

