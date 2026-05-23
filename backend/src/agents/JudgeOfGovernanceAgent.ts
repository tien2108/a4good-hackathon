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
      const govData = await this.generateGovernanceJSON(inputJSON, scenario, attemptCount, uploadedDocs, sessionId);

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

  private async generateGovernanceJSON(
    input: JudgeOfGovernanceInput,
    scenario: string,
    attemptCount: number,
    uploadedDocs: string[],
    sessionId: string
  ): Promise<GovernanceData> {
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

    // Attempt to call Verda Llama LLM if configured
    const apiKey = process.env.VERDA_API_KEY;
    const baseUrl = process.env.VERDA_BASE_LLAMA_URL;

    const isConfigured = 
      apiKey && 
      baseUrl && 
      apiKey !== "your_verda_api_key_here" && 
      baseUrl !== "your_verda_base_llama_url_here";

    if (isConfigured) {
      try {
        this.log(`Querying Verda meta-llama/Llama-3.1-8B-Instruct LLM for advanced governance audit notes...`, { sessionId });


        const systemPrompt = `
You are the 'Judge of Governance', an expert AI Act legal auditor. Your task is to analyze the system's compliance status and generate specific practical notes on governance.

You must return ONLY a valid JSON object matching this exact structure:
{
  "documentation": "Detailed practical notes on logs, technical files, and lifecycle files.",
  "riskManagement": "Detailed practical notes on hazard logs, mitigations, and systemic risks.",
  "transparency": "Detailed practical notes on instruction manuals, disclosure footers, and labeling.",
  "humanOversight": "Detailed practical notes on human overrides, clinical reviewers, and HR intervention gates.",
  "monitoring": "Detailed practical notes on accuracy monitors, data drift, and runtime metrics.",
  "logging": "Detailed practical notes on automatic event captures, input recording, and audit trails.",
  "accountability": "Detailed practical notes on compliance officers, external safety audits, and officer roles.",
  "roleClarity": "Detailed practical notes on who is the legal deployer, provider, importer, or distributor."
}

RULES:
1. First, read the input describing the AI system's compliance status.
2. Based on the system's risk classification and transparency obligations, refer to the EU AI Act and generate detailed, professional, and practical governance notes for each of the 8 fields.
3. Make sure the notes are highly professional and directly relevant to the risk level (e.g. High-Risk needs extensive notes, Limited Risk needs lighter transparency notes).
`;

        const userPrompt = `
Analyze the following system compliance parameters and generate your governance audit notes:

- Appears to meet AI Act definition of an AI system: ${input.appearsToMeetAiSystemDefinition ? "Yes" : "No"}
- Possible risk classification: ${input.possibleRiskClassification}
- Transparency / labeling obligations: ${input.transparencyObligations.join(", ") || "None specified."}
${uploadedDocs.length > 0 ? `- User-uploaded technical documents present: ${uploadedDocs.join(", ")}` : ""}

Return ONLY the completed JSON object with the exact keys "documentation", "riskManagement", "transparency", "humanOversight", "monitoring", "logging", "accountability", and "roleClarity". Do not include any markdown fences or explanatory text.
`;

        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "meta-llama/Llama-3.1-8B-Instruct",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            temperature: 0.1,
            response_format: { type: "json_object" }
          })
        });

        if (!response.ok) {
          throw new Error(`Verda API returned status ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const jsonText = data.choices?.[0]?.message?.content;
        
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          
          // Verify that we got the keys we wanted (use fallback for any missing key)
          const finalGov: GovernanceData = {
            documentation: parsed.documentation || parsed.documentation_notes || "N/A",
            riskManagement: parsed.riskManagement || parsed.risk_management || "N/A",
            transparency: parsed.transparency || parsed.transparency_notes || "N/A",
            humanOversight: parsed.humanOversight || parsed.human_oversight || "N/A",
            monitoring: parsed.monitoring || parsed.monitoring_notes || "N/A",
            logging: parsed.logging || parsed.logging_notes || "N/A",
            accountability: parsed.accountability || parsed.accountability_notes || "N/A",
            roleClarity: parsed.roleClarity || parsed.role_clarity || "N/A"
          };

          this.log(`🎉 Successfully received and parsed audit notes from Verda Llama LLM!`, { sessionId });
          return finalGov;
        }
      } catch (err: any) {
        this.log(`⚠️ Verda Llama LLM query failed: ${err.message}. Falling back to reliable simulation data.`, { sessionId });
      }
    } else {
      this.log(`💡 Verda Llama LLM not fully configured in .env (using fallback simulation data).`, { sessionId });
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

