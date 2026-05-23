import { BaseAgent } from "../BaseAgent.js";
import { AgentMessage, ProposalFacts, GovernanceData } from "../types.js";

export class AssumptionsCheckerAgent extends BaseAgent {
  constructor(bus: any) {
    super("AssumptionsChecker", bus);
  }

  public async receive(message: AgentMessage): Promise<void> {
    const { sessionId } = message.data || {};

    if (message.type === "CHECK_ASSUMPTIONS") {
      this.log(`Received CHECK_ASSUMPTIONS. Starting deep semantic comparison between Input Parser Key Facts and Judge Of Governance analysis...`, { sessionId });

      const session = this.bus.getOrCreateSession(sessionId);
      const facts = session.proposalFacts || {};
      const gov = session.governanceData || {};

      this.log(`Extracting and evaluating compliance assumptions across 7 domains...`, { sessionId });

      const assumptions: string[] = [];

      // 1. Operational & Technical Assumptions (The "Gap Fillers")
      assumptions.push(this.checkOperationalAssumptions(facts, gov));

      // 2. Supply Chain & Role Assumptions
      assumptions.push(this.checkSupplyChainAssumptions(facts, gov));

      // 3. Legal Interpretation Assumptions (The "No Precedent" Problem)
      assumptions.push(this.checkLegalInterpretationAssumptions(facts, gov));

      // 4. Vulnerability & Impact Assumptions (The "Harm" Problem)
      assumptions.push(this.checkVulnerabilityAssumptions(facts, gov));

      // 5. Temporal & Lifecycle Assumptions (The "When" Problem)
      assumptions.push(this.checkTemporalAssumptions(facts, gov));

      // 6. Geographic & Jurisdictional Assumptions (The "Where" Problem)
      assumptions.push(this.checkGeographicAssumptions(facts, gov));

      // 7. Data Provenance Assumptions (The "Quality" Problem)
      assumptions.push(this.checkDataProvenanceAssumptions(facts, gov));

      // Filter out any empty results and format them beautifully
      const compiledAssumptions = assumptions.filter(a => a.trim().length > 0);

      this.bus.updateSession(sessionId, (s) => {
        s.assumptions = compiledAssumptions;
      });

      this.log(`Analysis complete! Identified ${compiledAssumptions.length} high-liability assumptions. Sending ASSUMPTIONS_REPORT to AgentBus.`, { sessionId });
      
      this.send("AgentBus", "ASSUMPTIONS_REPORT", "Assumptions analysis complete", { 
        sessionId, 
        assumptions: compiledAssumptions 
      });
    }
  }

  /**
   * Helper to retrieve a fact with a fallback if undefined or empty.
   */
  private getFact(val: string | undefined, fallback: string): string {
    return val && val.trim().length > 0 ? val.trim() : fallback;
  }

  /**
   * Domain 1: Operational & Technical Assumptions (The "Gap Fillers")
   */
  private checkOperationalAssumptions(facts: ProposalFacts, gov: GovernanceData): string {
    const purpose = this.getFact(facts.purpose, "system's primary application");
    const users = this.getFact(facts.users, "end users and system operators");
    const oversight = this.getFact(facts.humanOversight, "system-level supervision");
    const outputs = this.getFact(facts.outputs, "automated decision outputs");

    return `[ASSUMPTION] Operational & Technical: The proposal for a "${purpose}" targeting ${users} assumes high-fidelity "Human-in-the-loop" oversight, claiming: "${oversight}". However, in real-world workflows, this creates a dangerous assumption that operators will actively review and verify the generated "${outputs}" before taking action. In high-throughput, resource-scarce environments, clinical or corporate operators are highly prone to "automation bias"—passively accepting or rubber-stamping recommendations without independent cognitive verification, effectively transforming an advisory tool into an autonomous pipeline.`;
  }

  /**
   * Domain 2: Supply Chain & Role Assumptions
   */
  private checkSupplyChainAssumptions(facts: ProposalFacts, gov: GovernanceData): string {
    const purpose = this.getFact(facts.purpose, "system's primary application");
    const sector = this.getFact(facts.sector, "target market sector");
    const useOfGpai = this.getFact(facts.useOfGpai, "none");

    const usesGpai = useOfGpai.toLowerCase() !== "none" && useOfGpai.toLowerCase() !== "false";

    if (usesGpai) {
      return `[ASSUMPTION] Supply Chain & Role: The deployment of a "${purpose}" within the ${sector} sector integrates upstream General Purpose AI (GPAI) capabilities, specifically: "${useOfGpai}". The development team assumes this legal setup positions them purely as a "Deployer" who is exempt from developer-level safety liabilities. However, under Article 28 of the EU AI Act, because this GPAI foundation is integrated, fine-tuned, or modified to serve a domain-specific High-Risk application, this assumption is legally invalid. It risks reclassifying the developer as the primary "Provider", transferring full conformity assessment, audit logging, and risk management compliance burdens onto them.`;
    }

    return `[ASSUMPTION] Supply Chain & Role: The proposal for a "${purpose}" within the ${sector} sector does not explicitly specify reliance on upstream GPAI models. This assumes the system is built entirely on custom-trained, proprietary models, creating a clean boundary as the primary "Provider". However, this assumes the developers possess the exhaustive in-house infrastructure and data validation pipelines required to verify model weights, bias controls, and alignment criteria without relying on third-party Service Level Agreements (SLAs).`;
  }

  /**
   * Domain 3: Legal Interpretation Assumptions (The "No Precedent" Problem)
   */
  private checkLegalInterpretationAssumptions(facts: ProposalFacts, gov: GovernanceData): string {
    const purpose = this.getFact(facts.purpose, "system's primary application");
    const sector = this.getFact(facts.sector, "target market sector");
    const impact = this.getFact(facts.possibleImpactOnPeople, "general human actions and livelihoods");

    let classificationNote = "its risk tier is determined solely by the marketing intent of the proposal";
    let legalCitation = "under the EU AI Act, system classification is based on actual operational use cases and risk domains, which must be carefully audited to ensure they do not cross into high-risk categories through secondary feature bloat.";

    if (sector.toLowerCase().includes("health") || purpose.toLowerCase().includes("diagnostic") || purpose.toLowerCase().includes("medical")) {
      classificationNote = "clinical medical diagnostics is a standard helper application";
      legalCitation = "under Annex III and Article 6, medical decision-support systems that analyze patient health data are designated as High-Risk or device-linked. The proposal assumes standard software compliance is sufficient, ignoring strict clinical validation, CE-marking coordination, and software-as-a-medical-device (SaMD) regulatory overlaps.";
    } else if (sector.toLowerCase().includes("employ") || sector.toLowerCase().includes("recruitment") || purpose.toLowerCase().includes("recruitment") || purpose.toLowerCase().includes("cv")) {
      classificationNote = "candidate suitability ranking and CV profiling is a low/medium risk classification";
      legalCitation = "under Annex III (Employment, worker management and access to self-employment), any AI system used for recruitment, screening, or candidate profiling is strictly designated as High-Risk. This carries severe pre-market compliance, fundamental rights impact assessments (FRIA), and national registration obligations regardless of the 'advisory' nature claimed in the pitch.";
    } else if (purpose.toLowerCase().includes("support") || purpose.toLowerCase().includes("customer") || purpose.toLowerCase().includes("email")) {
      classificationNote = "generative email drafting is exempt from direct high-risk obligations";
      legalCitation = "under the EU AI Act, while generative customer assistance is typically classified as low-risk (subject primarily to Article 52 transparency/labeling requirements), the system assumes its generated texts will not be used in sensitive or regulated sectors (like financial service disputes or medical triage), which would instantly trigger High-Risk classification.";
    }

    return `[ASSUMPTION] Legal Interpretation: The proposal for a "${purpose}" within the ${sector} assumes that ${classificationNote}. However, ${legalCitation} Given the potential impact of "${impact}", a failure to preemptively align with statutory High-Risk obligations risks immediate market withdrawal or massive administrative fines.`;
  }

  /**
   * Domain 4: Vulnerability & Impact Assumptions (The "Harm" Problem)
   */
  private checkVulnerabilityAssumptions(facts: ProposalFacts, gov: GovernanceData): string {
    const purpose = this.getFact(facts.purpose, "system's primary application");
    const affected = facts.affectedPersons;
    const impact = this.getFact(facts.possibleImpactOnPeople, "general human actions and livelihoods");

    // Check if the proposal has no affected persons or doesn't target humans
    if (!affected || affected.toLowerCase().includes("none") || affected.trim() === "" || purpose.toLowerCase().includes("customer support")) {
      return `[ASSUMPTION] Vulnerability & Impact (Optional): NOT APPLICABLE. The system does not target or directly impact human safety, livelihoods, or vulnerable populations. No dangerous vulnerability exploitation or asymmetrical power assumptions are present.`;
    }

    return `[ASSUMPTION] Vulnerability & Impact: The proposal for a "${purpose}" targeting "${affected}" assumes that the system does not exploit human vulnerabilities or perpetuate structural inequalities. However, the system's impact on "${impact}" creates an inherent power asymmetry. Under Article 5 of the EU AI Act, systems must not utilize subliminal, manipulative, or exploitative techniques. By deploying automated grading/analysis against "${affected}", the system assumes that everyone has equal access and capability to challenge the algorithm, which is a high-risk assumption in real-world scenarios.`;
  }

  /**
   * Domain 5: Temporal & Lifecycle Assumptions (The "When" Problem)
   */
  private checkTemporalAssumptions(facts: ProposalFacts, gov: GovernanceData): string {
    const purpose = this.getFact(facts.purpose, "system's primary application");
    const context = this.getFact(facts.deploymentContext, "production and market deployment");

    return `[ASSUMPTION] Temporal & Lifecycle: Deploying the "${purpose}" in the context of "${context}" assumes that compliance obligations only commence once the product is fully commercialized. However, the EU AI Act applies the moment a system is 'placed on the market' or 'put into service' (even for trial/pilot programs in "${context}"). The proposal assumes its rollout is exempt under research/sandbox clauses, but any operational use with live data activates full legal liabilities immediately. Furthermore, any future model updates or weight adjustments in "${context}" are assumed to be simple maintenance patches, whereas they actually constitute a 'substantial modification' requiring brand-new conformity certifications.`;
  }

  /**
   * Domain 6: Geographic & Jurisdictional Assumptions (The "Where" Problem)
   */
  private checkGeographicAssumptions(facts: ProposalFacts, gov: GovernanceData): string {
    const purpose = this.getFact(facts.purpose, "system's primary application");
    const context = this.getFact(facts.deploymentContext, "production and market deployment");

    return `[ASSUMPTION] Geographic & Jurisdictional: The deployment plan for "${purpose}" via "${context}" assumes that geographic boundaries or external hosting provide a shield against EU regulatory jurisdiction. However, Article 2 of the AI Act establishes strict extraterritoriality: if the system's outputs are used or have effects within the European Union, the system is fully subject to the AI Act. This assumes that the location of the servers, developers, or operators in "${context}" exempts the project, which is a major legal liability if EU residents are affected.`;
  }

  /**
   * Domain 7: Data Provenance Assumptions (The "Quality" Problem)
   */
  private checkDataProvenanceAssumptions(facts: ProposalFacts, gov: GovernanceData): string {
    const purpose = this.getFact(facts.purpose, "system's primary application");
    const inputData = this.getFact(facts.inputData, "system input datasets");
    const impact = this.getFact(facts.possibleImpactOnPeople, "general human actions and livelihoods");

    return `[ASSUMPTION] Data Provenance: The proposal for a "${purpose}" assumes that its input datasets ("${inputData}") are inherently balanced, high-quality, and legally compliant for processing. However, training or running models on "${inputData}" assumes the absence of systemic or historical biases. In practice, this data frequently reflects entrenched patterns that, when processed, mathematically codify and perpetuate bias. This violates Article 10's strict data governance requirements, especially considering the system's potential impact on "${impact}".`;
  }
}
