import { BaseAgent } from "./BaseAgent.js";
import { AgentMessage } from "./types.js";

export class DecisionTreeAgent extends BaseAgent {
  constructor(bus: any) {
    super("DecisionTree", bus);
  }

  public async receive(message: AgentMessage): Promise<void> {
    const { sessionId, scenario, parsedText, isRerun } = message.data || {};

    if (message.type === "CLASSIFY_REQUEST") {
      this.log(`Analyzing parsed text to determine risk category and EU AI Act obligations...`, { sessionId });
      this.bus.updateSessionStatus(sessionId, "CLASSIFYING");

      // 1. Run dynamic evaluation based on parsed text & scenario
      const evaluation = this.runDynamicEvaluation(parsedText || "", scenario);
      
      const fullClassification = `${evaluation.classification}\n\n**EU AI Act Flowchart Citations**:\n` + 
        evaluation.citations.map(c => `- ${c}`).join("\n");

      this.bus.updateSession(sessionId, (s) => {
        s.riskClassification = fullClassification;
      });

      this.log(`Determination completed: classified as '${evaluation.classification}'. Routing to JudgeOfGovernance.`, { sessionId });
      this.send("JudgeOfGovernance", "ANALYZE_GOVERNANCE", "Run governance metrics check", { 
        sessionId, 
        scenario, 
        parsedText, 
        riskClassification: fullClassification,
        isRerun
      });
    }
  }

  /**
   * Evaluates the parsed text dynamically against the exact paths and articles of the EU AI Act flowchart.
   */
  private runDynamicEvaluation(text: string, scenario?: string): { classification: string; citations: string[] } {
    const lowerText = text.toLowerCase();
    
    // Primary classification variables
    let classification = "Unclassified / Out of Scope (Article 2)";
    let citationsSet = new Set<string>();

    // Rule 1: Always check Scope (Article 2)
    citationsSet.add("Article 2 (Scope & Exclusions check - Determines if the system's deployment affects the EU market)");

    // Check if the system is explicitly out of scope (e.g. military, or non-EU without effects in EU)
    const isOutOfScope = lowerText.includes("military") || lowerText.includes("national security") || lowerText.includes("out of scope");
    if (isOutOfScope) {
      citationsSet.add("Article 2 (Scope - Out of scope based on military, national security, or non-EU operational exceptions)");
      return {
        classification: "Out of Scope / Exempted (Article 2)",
        citations: Array.from(citationsSet)
      };
    }

    // Rule 2: Check for Prohibited AI Systems (Article 5)
    const isProhibited = lowerText.includes("prohibited") || lowerText.includes("social scoring") || 
                         lowerText.includes("subliminal manipulation") || lowerText.includes("cognitive behavioral manipulation");
    if (isProhibited) {
      classification = "Prohibited AI System (Article 5 - Severe Compliance Violation)";
      citationsSet.add("Article 5 (Prohibited AI Systems - Identifies banned systems like social scoring or manipulative systems)");
      citationsSet.add("Article 99.3 (Fines - Severe penalty tier of up to €35M or 7% of global turnover for Article 5 violations)");
      citationsSet.add("Chapter IX (Post-Market Monitoring and enforcement by Market Surveillance authorities)");
      return {
        classification,
        citations: Array.from(citationsSet)
      };
    }

    // Rule 3: Check Role Reclassification under Article 25.1 (e.g., user acts as a provider)
    const isProviderUnderLaw = lowerText.includes("article 25.1") || lowerText.includes("art 25.1") || 
                               lowerText.includes("rename high-risk") || lowerText.includes("modify high-risk");
    if (isProviderUnderLaw) {
      citationsSet.add("Article 25.1 (Provider Reclassification - User assumes full legal Provider responsibilities for modified systems)");
    }

    // Rule 4: Check if the system is High-Risk under Article 6
    const isMedical = lowerText.includes("medical") || lowerText.includes("diagnostic") || lowerText.includes("healthcare") || scenario === "Scenario_Complete";
    const isRecruitment = lowerText.includes("recruitment") || lowerText.includes("cv screening") || lowerText.includes("employment") || scenario === "Scenario_Incomplete";
    const isHighRiskCategory = isMedical || isRecruitment || lowerText.includes("high-risk") || lowerText.includes("critical infrastructure") || lowerText.includes("law enforcement");

    let isHighRisk = false;

    if (isHighRiskCategory) {
      // Exemption check under Article 6.3
      const isExempt = lowerText.includes("exempt") || lowerText.includes("article 6.3 exemption") || lowerText.includes("purely administrative");
      
      if (isExempt) {
        classification = "Exempted from High-Risk (Article 6.3 - Purely accessory, preparatory, or narrow administrative role)";
        citationsSet.add("Article 6.3 (High-Risk Exemption - System performs preparatory or purely narrow accessory tasks)");
        citationsSet.add("Article 6.3 Notification (Requirement to notify national supervisory authorities of Article 6.3 reliance)");
      } else {
        isHighRisk = true;
        if (isMedical) {
          classification = "High-Risk AI System (Article 6.1 - Annex I Safety Component/Medical Device)";
          citationsSet.add("Article 6.1 (High-Risk - Systems linked to Annex I safety components undergoing third-party checks)");
        } else if (isRecruitment) {
          classification = "High-Risk AI System (Article 6.2 - Annex III Point 4 Employment & HR)";
          citationsSet.add("Article 6.2 (High-Risk - Systems designated under Annex III high-risk use-case domains)");
        } else {
          classification = "High-Risk AI System (Article 6 - General High-Risk Classification)";
          citationsSet.add("Article 6 (High-Risk - Pre-market conformity assessment and registration required)");
        }

        // Add mandatory requirements for High-Risk Systems (Articles 9-15)
        citationsSet.add("Articles 9-15 (High-Risk Requirements - Risk management, data governance, technical file, logging, human oversight)");
      }
    }

    // Rule 5: Check Role Obligations (Article 26, 27, 23, 24, 16-22)
    const isDeployer = lowerText.includes("deployer") || lowerText.includes("hr manager") || lowerText.includes("hospital operator") || isMedical || isRecruitment;
    const isProvider = lowerText.includes("provider") || lowerText.includes("saas platform") || isProviderUnderLaw;
    const isPublicBody = lowerText.includes("public body") || lowerText.includes("public service") || lowerText.includes("government");
    const isDistributor = lowerText.includes("distributor");
    const isImporter = lowerText.includes("importer");

    if (isHighRisk) {
      if (isPublicBody) {
        citationsSet.add("Article 27 (Public Body FRIA - Mandatory Fundamental Rights Impact Assessment for public entities)");
      }
      if (isDeployer) {
        citationsSet.add("Article 26 (Deployer Obligations - Controls, monitoring, human oversight compliance for AI deployers)");
        citationsSet.add("Article 99.4e (Fines - Specific penalty framework for Deployer non-compliance)");
      }
      if (isDistributor) {
        citationsSet.add("Article 24 (Distributor Obligations - Verification of CE mark, documentation, and compliance flags)");
        citationsSet.add("Article 99.4d (Fines - Specific penalty framework for Distributor violations)");
      }
      if (isImporter) {
        citationsSet.add("Article 23 (Importer Obligations - Ensuring provider compliance, contact registration, and labeling)");
        citationsSet.add("Article 99.4c (Fines - Specific penalty framework for Importer violations)");
      }
      if (isProvider) {
        citationsSet.add("Articles 16-22 (Provider Obligations - Conformity assessment, quality management, CE marking, EU registration)");
        citationsSet.add("Article 72 (EU Database Registration - Mandated upload of high-risk provider and system details)");
        citationsSet.add("Article 99.4a (Fines - Specific penalty framework for Provider violations)");
      }
    }

    // Rule 6: Check for General Purpose AI (GPAI - Article 51)
    const isGpai = lowerText.includes("gpai") || lowerText.includes("foundation model") || lowerText.includes("gpt") || 
                    lowerText.includes("llm") || lowerText.includes("chatgpt") || lowerText.includes("openai") || 
                    scenario === "Scenario_Incomplete" || scenario === "Scenario_Empty";
    
    if (isGpai) {
      if (!classification.includes("High-Risk")) {
        classification = "Limited Risk AI System (Article 50 - Chatbot/Generative Text) & General Purpose AI (GPAI)";
      } else {
        classification += " with Integrated General Purpose AI (GPAI)";
      }

      citationsSet.add("Article 51 (GPAI Classification - Classification of foundation models with general capabilities)");
      citationsSet.add("Article 52 (Transparency - Mandatory notification to human users interacting with AI systems)");
      
      const isGpaiProvider = lowerText.includes("gpai provider") || lowerText.includes("model trainer");
      const isGpaiRep = lowerText.includes("gpai representative") || lowerText.includes("authorized representative");
      const hasSystemicRisk = lowerText.includes("systemic risk") || lowerText.includes("high compute") || lowerText.includes("10^25");

      if (isGpaiProvider) {
        citationsSet.add("Article 53 (GPAI Provider obligations - Technical file compilation, copyright compliance, training summaries)");
      } else if (isGpaiRep) {
        citationsSet.add("Article 54 (GPAI Representative obligations - Local agent appointment and regulatory coordination)");
      } else {
        citationsSet.add("Article 53 (GPAI Provider obligations - Documentation for downstream integrators and copyright policies)");
      }

      if (hasSystemicRisk) {
        citationsSet.add("Article 54 (Systemic Risk Obligations - Adversarial testing, incident tracking, cybersecurity standards)");
      }

      citationsSet.add("Article 101 (GPAI Penalties - Non-compliance fines specifically for general purpose AI model providers)");
    }

    // Rule 7: Check for Limited Risk AI Systems under Article 50 (if not already GPAI or High-Risk)
    const isLimitedRisk = lowerText.includes("chatbot") || lowerText.includes("text generator") || lowerText.includes("emotion recognition") || 
                          lowerText.includes("biometric categorization") || scenario === "Scenario_Empty";
    if (isLimitedRisk && !isHighRisk && !isGpai) {
      classification = "Limited Risk AI System (Article 50 - Interactive Chatbot / Text Generator)";
      citationsSet.add("Article 50 (Limited Risk - Transparency disclosure mandate: disclose that text/images are AI-generated)");
      citationsSet.add("Article 99.4g (Fines - Specific penalty framework for transparency obligations breach)");
    }

    // Rule 8: Post-market surveillance and general framework
    citationsSet.add("Chapter IX (Post-Market Surveillance - Conformance framework for monitoring, info sharing, and market oversight)");
    citationsSet.add("Article 99 (General Penalties and Fines framework - Outlines overall administrative enforcement)");
    citationsSet.add("EU Legal Supremacy Disclaimer (The AI Act operates alongside, and does not replace, other sectoral EU laws)");

    return {
      classification,
      citations: Array.from(citationsSet)
    };
  }
}
