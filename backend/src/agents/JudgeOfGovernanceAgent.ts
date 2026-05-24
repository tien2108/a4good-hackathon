import { BaseAgent } from "./BaseAgent.js";
import { AgentMessage, GovernanceData, DecisionTreeFormatInput } from "./types.js";
import { OpenAI } from "openai";

export class JudgeOfGovernanceAgent extends BaseAgent {
  constructor(bus: any) {
    super("JudgeOfGovernance", bus);
  }

  public async receive(message: AgentMessage): Promise<void> {
    if (message.type === "ANALYZE_GOVERNANCE") {
      const sessionId = message.data?.sessionId || "session_default";
      const scenario = message.data?.scenario || "Scenario_Empty";
      const uploadedDocs = this.bus.getOrCreateSession(sessionId).uploadedDocs;
      const attemptCount = this.bus.getOrCreateSession(sessionId).attemptCount;

      this.log(`Analyzing proposal for AI Act compliance parameters (documentation, risk management, human oversight, logging, etc.)...`, { sessionId });
      this.bus.updateSessionStatus(sessionId, "ANALYZING_GOVERNANCE");

      // Extract the nested JSON structure (using our mapper to support both flat and nested JSON)
      const rawPayload = message.data?.decisionTreePayload || message.data || {};
      const nestedInput = this.mapToDecisionTreeFormat(rawPayload);

      this.log(`🎉 Ingesting decision tree format JSON payload:\n` + JSON.stringify(nestedInput, null, 2), { sessionId });

      // Calculate reasoning_trace and risk level for downstream compatibility
      const reasoningTrace = nestedInput.classification?.classification_certainty?.explanation || 
                            nestedInput.classification?.description || 
                            "Completed Decision Tree regulatory assessment.";

      // Formulate downstream routing and styling decisions based on the reasoning trace or sector
      let downstreamDecisions = {
        strictnessLevel: "STANDARD",
        targetAuditFocus: "General AI System",
        assumptionGuidelines: "Evaluate general deployment assumptions.",
        humanizerStyleHint: "Standard Professional Audit Layout"
      };

      const traceLower = reasoningTrace.toLowerCase() + " " + (nestedInput.extracted_fields?.sector?.value || "").toLowerCase();
      if (traceLower.includes("clinical") || traceLower.includes("medical") || traceLower.includes("diagnostic") || traceLower.includes("healthcare")) {
        downstreamDecisions = {
          strictnessLevel: "EXTREME_CLINICAL",
          targetAuditFocus: "Healthcare / Software-as-a-Medical-Device (SaMD)",
          assumptionGuidelines: "Evaluate clinical safety, radiologist automation bias, scanner drift calibration, and medical data containment.",
          humanizerStyleHint: "Premium Clinical-Grade Audit Report (Healthcare Focus)"
        };
      } else if (traceLower.includes("recruitment") || traceLower.includes("employment") || traceLower.includes("cv") || traceLower.includes("hiring")) {
        downstreamDecisions = {
          strictnessLevel: "HIGH_HR",
          targetAuditFocus: "Employment / CV Screening (Annex III High-Risk)",
          assumptionGuidelines: "Evaluate hiring discrimination risks, historical training dataset biases, and candidate livelihood impacts.",
          humanizerStyleHint: "HR & Equal Opportunity Compliance Audit (Employment Focus)"
        };
      } else if (traceLower.includes("customer support") || traceLower.includes("chatbot") || traceLower.includes("brief")) {
        downstreamDecisions = {
          strictnessLevel: "LIGHT_TRANSPARENCY",
          targetAuditFocus: "Limited Risk Chatbot (Article 50/52)",
          assumptionGuidelines: "Evaluate basic user chatbot transparency and LLM drafting bias containment.",
          humanizerStyleHint: "Limited Risk Transparency Disclosure (General Chatbot Focus)"
        };
      }

      this.log(`Decisions formulated from context: ` + JSON.stringify(downstreamDecisions, null, 2), { sessionId });

      // Save these decisions to the session so that other agents (Assumption Checker, Humanizer) can read and reflect them!
      this.bus.updateSession(sessionId, (s) => {
        s.reasoningTrace = reasoningTrace;
        s.downstreamDecisions = downstreamDecisions;
      });

      // 3. Generate the governance data using the required inputs and scenario context
      const govData = await this.generateGovernanceJSON(nestedInput, scenario, attemptCount, uploadedDocs, sessionId);

      this.bus.updateSession(sessionId, (s) => {
        s.governanceData = govData;
      });

      this.log(`Governance Analysis Complete. Fields populated: [${Object.keys(govData).join(", ")}]. Routing to MissingInfoChecker.`, { sessionId });
      
      // Send output to the MissingInfoChecker agent with decisions
      this.send("MissingInfoChecker", "CHECK_MISSING_INFO", "Please run missing info checker on governance analysis", { 
        sessionId, 
        scenario,
        governanceData: govData,
        downstreamDecisions
      });
    }
  }

  private mapToDecisionTreeFormat(data: any): DecisionTreeFormatInput {
    if (!data) return {};
    
    // If it's already in the rich nested format, return it
    if (data.status === "success" || (data.validation && data.extracted_fields)) {
      return data as DecisionTreeFormatInput;
    }

    // Otherwise, construct a rich nested JSON from flat attributes (backward compatibility)
    const appearsToMeetAiDef = typeof data.appearsToMeetAiSystemDefinition === "boolean"
      ? data.appearsToMeetAiSystemDefinition
      : !data.possibleRiskClassification?.toLowerCase().includes("out of scope") && !data.riskClassification?.toLowerCase().includes("out of scope");

    const possibleRisk = data.possibleRiskClassification || data.riskClassification || "Unclassified";
    const citationsList = data.citations || data.transparencyObligations || [];

    // Helper to format flat property as an ExtractedField
    const extract = (val: string, conf = 0.85, ev = "Verbatim evidence retrieved from source document.") => ({
      value: val || "",
      confidence: conf,
      evidence: ev
    });

    return {
      validation: {
        can_classify: typeof data.can_classify === "boolean" ? data.can_classify : true,
        avg_extraction_confidence: data.validation?.avg_extraction_confidence || 0.85
      },
      classification: {
        risk_level: possibleRisk,
        overall_confidence: data.classification?.overall_confidence || 0.8,
        articles: citationsList,
        classification_certainty: {
          score: data.classification?.overall_confidence || 0.8,
          label: "HIGH",
          explanation: data.reasoning_trace || "Constructed flat scenario."
        }
      },
      extracted_fields: {
        purpose: extract(data.purpose || data.name || "General Purpose AI System"),
        users: extract(data.users || "Clinical radiologists and hospital staff"),
        affected_persons: extract(data.affected_persons || "Patients undergoing diagnostic scanning"),
        sector: extract(data.sector || "Healthcare"),
        input_data: extract(data.input_data || "Patient medical images and electronic health records"),
        outputs: extract(data.outputs || "Diagnostic classification reports"),
        automation_level: extract(data.automation_level || "High automation level with human reviewer gates"),
        human_oversight: extract(data.humanOversight || data.human_oversight || "Clinical review, override triggers"),
        deployment_context: extract(data.deployment_context || "Installed on hospital networks"),
        use_of_ai_generated_content: extract(data.use_of_ai_generated_content || "None"),
        use_of_gpai: extract(data.use_of_gpai || "None"),
        possible_impact_on_people: extract(data.possible_impact_on_people || "Clinical diagnostics outcomes")
      }
    };
  }

  private async generateGovernanceJSON(
    input: DecisionTreeFormatInput,
    scenario: string,
    attemptCount: number,
    uploadedDocs: string[],
    sessionId: string
  ): Promise<GovernanceData> {
    const riskLevel = input.classification?.risk_level || "LIMITED RISK";
    const isOutOfScope = riskLevel.toUpperCase().includes("OUT OF SCOPE");

    // Rule 2 of her Python script: If it is NOT an AI system (or out of scope), set all JSON values to "N/A - Not an AI system".
    if (isOutOfScope) {
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
        this.log(`Querying Verda meta-llama/Llama-3.1-8B-Instruct LLM for advanced governance audit notes using nested JSON input...`, { sessionId });

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

CRITICAL RULES:
1. Read the input JSON containing deep nested fields (evidence and risk classifications).
2. Refer to the EU AI Act and generate detailed, professional, and practical governance notes for each of the 8 fields. Pay close attention to the value and evidence of each argument.
3. You MUST cite at least one relevant EU AI Act Article in EVERY single one of the 8 fields. When citing, you must italicize the reference using HTML italic tags like <i>Article xx</i> where xx is the article number (for example, <i>Article 9</i>, <i>Article 11</i>, <i>Article 12</i>, <i>Article 13</i>, <i>Article 14</i>, <i>Article 15</i>, <i>Article 16</i>, <i>Article 17</i>, <i>Article 26</i>, <i>Article 52</i>, <i>Article 61</i>, etc.). Ensure every field contains at least one HTML italicized Article citation. Do NOT use markdown format (*Article xx*) under any circumstances.
4. Focus intensely on raw extracted values (e.g., purpose, sector, input data, target users) and verbatim evidence quotes to support your statements. Do NOT mention, write, or include any numerical confidence levels or percentages (e.g. do not say "X% confidence" or "90% confident") in your descriptions; replace them with highly direct explanations focusing on sector, purpose, input data, and explicit evidence quotes.
`;

        const userPrompt = `
Analyze this nested JSON compliance payload and generate your governance audit notes:

${JSON.stringify(input, null, 2)}
${uploadedDocs.length > 0 ? `\nUser-uploaded technical documents present: ${uploadedDocs.join(", ")}` : ""}

Return ONLY the completed JSON object with the exact keys "documentation", "riskManagement", "transparency", "humanOversight", "monitoring", "logging", "accountability", and "roleClarity". Do not include any markdown fences or explanatory text.
`;

        const openai = new OpenAI({
          apiKey: apiKey,
          baseURL: baseUrl,
          timeout: 1000,  // fail-fast timeout (guarantees instant simulation fallback)
          maxRetries: 0    // Fail fast without repeating sluggish request cycles
        });

        const response = await openai.chat.completions.create({
          model: "meta-llama/Llama-3.1-8B-Instruct",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.1,
          response_format: { type: "json_object" } as any
        }, { timeout: 1000 });

        const jsonText = response.choices?.[0]?.message?.content;
        
        if (jsonText) {
          let cleanedJson = jsonText.trim();
          if (cleanedJson.startsWith("```")) {
            cleanedJson = cleanedJson.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
          }
          const parsed = JSON.parse(cleanedJson);
          
          return {
            documentation: parsed.documentation || parsed.documentation_notes || "N/A",
            riskManagement: parsed.riskManagement || parsed.risk_management || "N/A",
            transparency: parsed.transparency || parsed.transparency_notes || "N/A",
            humanOversight: parsed.humanOversight || parsed.human_oversight || "N/A",
            monitoring: parsed.monitoring || parsed.monitoring_notes || "N/A",
            logging: parsed.logging || parsed.logging_notes || "N/A",
            accountability: parsed.accountability || parsed.accountability_notes || "N/A",
            roleClarity: parsed.roleClarity || parsed.role_clarity || "N/A"
          };
        }
      } catch (err: any) {
        this.log(`⚠️ Verda Llama LLM query failed: ${err.message}. Falling back to reliable simulation data.`, { sessionId });
      }
    } else {
      this.log(`💡 Verda Llama LLM not fully configured in .env (using fallback simulation data).`, { sessionId });
    }

    // --- Dynamic Fallback Rule-Based Calculations ---
    // Extracted fields helpers (with alias fallbacks)
    const fields = input.extracted_fields || {};
    const purpose = fields.purpose?.value || "General AI Model";
    const purposeEvidence = fields.purpose?.evidence || "Not specified.";
    
    const users = fields.users?.value || fields["users"]?.value || "General Operators";
    const affected = fields.affected_persons?.value || fields["affected persons"]?.value || "General Public";
    
    const sector = fields.sector?.value || fields["sector"]?.value || "Unspecified";
    const inputData = fields.input_data?.value || fields["input data"]?.value || "Ingested operational data";
    
    const outputs = fields.outputs?.value || fields["outputs"]?.value || "Inference predictions";
    const automationLevel = fields.automation_level?.value || fields["automation level"]?.value || "Medium";
    
    const oversight = fields.human_oversight?.value || fields["human oversight"]?.value || "Manual review gates";
    const oversightEvidence = fields.human_oversight?.evidence || fields["human oversight"]?.evidence || "Not specified.";
    
    const deploymentContext = fields.deployment_context?.value || fields["deployment context"]?.value || "General infrastructure";
    
    const aiContent = fields.use_of_ai_generated_content?.value || fields["use of AI-generated content"]?.value || "No";
    const gpai = fields.use_of_gpai?.value || fields["use of GPAI"]?.value || "No";
    
    const impact = fields.possible_impact_on_people?.value || fields["possible impact on people"]?.value || "Minimal";
    const impactEvidence = fields.possible_impact_on_people?.evidence || fields["possible impact on people"]?.evidence || "Not specified.";

    const articles = input.classification?.articles || [];
    const avgConfidence = input.validation?.avg_extraction_confidence ?? 0.85;
    const overallConfidence = input.classification?.overall_confidence ?? 0.8;
    const explanation = input.classification?.classification_certainty?.explanation || "Classification processed successfully.";

    // Incomplete scenario tracking
    const hasUploadedMonitoring = uploadedDocs.some(d => d.toLowerCase().includes("monitoring") || d.toLowerCase().includes("upload"));

    if (scenario === "Scenario_Incomplete" && attemptCount === 0) {
      return {
        documentation: `Detailed technical files compiled for ${purpose} deployment (Sector: ${sector}) under ${riskLevel} pursuant to <i>Article 11</i> technical documentation standards. Backed by explicit evidence: '${purposeEvidence}'.`,
        riskManagement: `Hazard register logs systemic risks regarding: ${impact} pursuant to <i>Article 9</i> risk management specs. Mitigations are defined to protect ${affected} from systematic scanner drift. Evidence: '${impactEvidence}'.`,
        transparency: `Clear manuals disclose system bounds for ${users} to fulfill <i>Article 13</i> requirements. Transparency compliance under ${riskLevel} mapped to articles: ${articles.length > 0 ? articles.map(a => `<i>${a.replace(/\*/g, "")}</i>`).join(", ") : "<i>Article 13</i>"}.`,
        humanOversight: `Manual control gates support human overrides in compliance with <i>Article 14</i> human oversight criteria. Current oversight: ${oversight}. Verbatim evidence: '${oversightEvidence}'.`,
        accountability: `AI Compliance Officer assigned to oversee ${purpose} under ${riskLevel} to satisfy provider duties under <i>Article 16</i>. Supported by system audit explanation: ${explanation}.`,
        roleClarity: `Entity deploying system in ${deploymentContext} is defined as the Deployer under <i>Article 26</i>. Model provider is responsible for provider compliance under <i>Article 16</i>.`,
        // logging and monitoring are missing
      };
    }

    if (scenario === "Scenario_Incomplete" && attemptCount === 1) {
      const baseGov: GovernanceData = {
        documentation: `Detailed technical files compiled for ${purpose} deployment (Sector: ${sector}) under ${riskLevel} pursuant to <i>Article 11</i> technical documentation standards. Backed by explicit evidence: '${purposeEvidence}'.`,
        riskManagement: `Hazard register logs systemic risks regarding: ${impact} pursuant to <i>Article 9</i> risk management specs. Mitigations are defined to protect ${affected} from systematic scanner drift. Evidence: '${impactEvidence}'.`,
        transparency: `Clear manuals disclose system bounds for ${users} to fulfill <i>Article 13</i> requirements. Transparency compliance under ${riskLevel} mapped to articles: ${articles.length > 0 ? articles.map(a => `<i>${a.replace(/\*/g, "")}</i>`).join(", ") : "<i>Article 13</i>"}.`,
        humanOversight: `Manual control gates support human overrides in compliance with <i>Article 14</i> human oversight criteria. Current oversight: ${oversight}. Verbatim evidence: '${oversightEvidence}'.`,
        logging: `RERUN_SUCCESS: Inferred system logs capturing inputs (e.g. ${inputData}) and outputs (${outputs}) are safely stored in Amazon CloudWatch pursuant to <i>Article 12</i> record-keeping guidelines.`, // Recovered on rerun!
        accountability: `AI Compliance Officer assigned to oversee ${purpose} under ${riskLevel} to satisfy provider duties under <i>Article 16</i> and quality management rules under <i>Article 17</i>. Supported by system audit explanation: ${explanation}.`,
        roleClarity: `Entity deploying system in ${deploymentContext} is defined as the Deployer under <i>Article 26</i>. Model provider is responsible for provider compliance under <i>Article 16</i>.`,
      };

      if (hasUploadedMonitoring) {
        baseGov.monitoring = `USER_UPLOADED_RESOLVED: Active runtime drifts and accuracy telemetry checks are resolved pursuant to <i>Article 15</i> (accuracy and robustness) via user-uploaded context: ` + uploadedDocs.join(", ");
      }

      return baseGov;
    }

    // Default Complete Case (Scenario_Complete / Scenario_Empty / general file upload)
    return {
      documentation: `Technical documentation files compiled for ${purpose} (Sector: ${sector}) under ${riskLevel} standards pursuant to <i>Article 11</i>. Supported by explicit evidence: '${purposeEvidence}'. Ingests: ${inputData}.`,
      riskManagement: `Continuous hazard register logs systemic risk controls for ${impact} under <i>Article 9</i> risk management systems. Mitigations are tailored to protect ${affected} from scanner drift or HR biases. Evidence: '${impactEvidence}'.`,
      transparency: `Automated disclosure footers warn users of AI-generated content (${aiContent}) pursuant to transparency requirements in <i>Article 52</i>. Operating manuals outline scope for ${users} per <i>Article 13</i>.`,
      humanOversight: `Critical manual overrides and clinical review boards verify model outputs as mandated by <i>Article 14</i> human oversight. Current oversight: ${oversight}. Verbatim evidence: '${oversightEvidence}'. Strict overrides are established for ${automationLevel} automation levels.`,
      monitoring: `Active telemetry monitors and registers scanner/data drifts and model performance in ${deploymentContext} in compliance with <i>Article 61</i> post-market monitoring. System checks verify ${purpose} bounds.`,
      logging: `Automatic append-only event logs capture inputs (${inputData}), inference outputs (${outputs}), and manual clinical overrides pursuant to <i>Article 12</i> record-keeping.`,
      accountability: `Named regulatory compliance officer assigned to audit ${purpose} in ${sector} in accordance with <i>Article 17</i> quality management systems. Supported by system audit explanation: ${explanation}.`,
      roleClarity: `Hospital or HR team deploying in ${deploymentContext} is defined as the Deployer under <i>Article 26</i>. SaaS provider is the system Provider under <i>Article 16</i>. Importer is registered under <i>Article 23</i>.`,
    };
  }
}
