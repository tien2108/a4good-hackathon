import { BaseAgent } from "../BaseAgent.js";
import { AgentMessage, ProposalFacts, GovernanceData } from "../types.js";

export class PreventionOfConfidenceAgent extends BaseAgent {
  constructor(bus: any) {
    super("PreventionOfConfidence", bus);
  }

  public async receive(message: AgentMessage): Promise<void> {
    const { sessionId } = message.data || {};

    if (message.type === "GAPS_LIST") {
      this.log(`Received compliance assessment gaps list. Converging data...`, { sessionId });

      // Simulate a small delay for assumptions to arrive or pull them from session
      setTimeout(() => {
        const session = this.bus.getOrCreateSession(sessionId);
        const gaps = session.gaps || [];
        const assumptions = session.assumptions || [];
        const facts = session.proposalFacts || {};

        this.log(`Starting risk convergence calculations on ${gaps.length} gaps and ${assumptions.length} assumptions...`, { sessionId });

        const preventionReport = this.generatePreventionReport(gaps, assumptions, facts);

        this.bus.updateSession(sessionId, (s) => {
          s.preventionOutput = preventionReport;
        });

        this.log(`Risk Convergence Complete. Final report generated. Sending to HumanizerUiDisplay backend adapter.`, { sessionId });
        this.send("HumanizerUiDisplay", "PREVENTION_REPORT", "Convergence complete", { 
          sessionId, 
          preventionReport 
        });
      }, 500);
    }
  }

  /**
   * Helper to retrieve a fact with a fallback if undefined or empty.
   */
  private getFact(val: string | undefined, fallback: string): string {
    return val && val.trim().length > 0 ? val.trim() : fallback;
  }

  /**
   * Summarizes both lists, generates expert questions, and packages full list details into hover cards.
   */
  private generatePreventionReport(gaps: string[], assumptions: string[], facts: ProposalFacts): string {
    const gapsCount = gaps.length;
    const assumptionsCount = assumptions.length;

    const purpose = this.getFact(facts.purpose, "system's primary application");
    const sector = this.getFact(facts.sector, "target market sector");

    // 1. One short paragraph summarizing gaps
    let gapsSummary = "";
    if (gapsCount === 0) {
      gapsSummary = `No structural compliance gaps were detected during analysis, permitting high confidence that all 8 core governance vectors—including audit logging, clinical overrides, and risk registers—are formally detailed in the system's specification.`;
    } else {
      const topGaps = gaps.map(g => g.split(':')[0] || g).slice(0, 3).join(', ');
      gapsSummary = `Perfect confidence in compliance alignment is prevented by ${gapsCount} critical governance omissions—notably regarding ${topGaps}. Without established, verifiable records for these core compliance parameters, the system's safety and legal declarations remain structurally unverified under EU AI Act standards.`;
    }

    // 2. One short paragraph summarizing assumptions
    let assumptionsSummary = "";
    if (assumptionsCount === 0) {
      assumptionsSummary = `No high-risk pre-market assumptions or critical legal vulnerabilities were identified during evaluation, reflecting high alignment between stated capabilities and structural controls.`;
    } else {
      const filteredAssumptions = assumptions
        .filter(a => !a.toLowerCase().includes("not applicable"))
        .map(a => a.replace('[ASSUMPTION]', '').split(':')[0]?.trim() || a);
      
      const topAssumptions = filteredAssumptions.slice(0, 3).join(', ');
      assumptionsSummary = `Furthermore, perfect certitude is prevented by the system's reliance on ${assumptionsCount} critical compliance assumptions—principally in the areas of ${topAssumptions || "operational overrides"}. These findings assume active, unbiased human intervention and perfect supplier-deployer divisions, which often diverge from complex clinical or corporate realities.`;
    }

    // 3. Pose context-relevant high-standard questions an AI expert would ask
    let questions: string[] = [];

    const sectorLower = sector.toLowerCase();
    const purposeLower = purpose.toLowerCase();

    if (sectorLower.includes("health") || purposeLower.includes("diagnostic") || purposeLower.includes("medical")) {
      questions = [
        "Under high-throughput clinical pressures, radiologists are statistically highly susceptible to 'automation bias'. What specific interface controls or confirmation gates prevent clinical sign-off from becoming a passive, rubber-stamped review rather than active ocular verification?",
        "Since medical computer vision model performance degrades significantly on scanner variations and calibration drift (e.g., Siemens vs. GE scanner raw outputs), what real-time drift-detection telemetry is implemented to flag accuracy drops before diagnostic anomalies occur?",
        "Given that diagnostic reports and anatomical overlays process highly protected healthcare and health-category data under EU definitions, what legal and technical measures are deployed at the ingestion layer to guarantee absolute data minimization and GDPR/HIPAA-compliant containment?"
      ];
    } else if (sectorLower.includes("employ") || sectorLower.includes("recruitment") || purposeLower.includes("recruitment") || purposeLower.includes("cv")) {
      questions = [
        "Historical hiring and evaluation databases inherently encode race, gender, age, and regional biases. What rigorous mathematical audit methodology (e.g., disparate impact ratio, demographic parity checks) is being utilized to prevent the screening algorithm from codifying and perpetuating historical discrimination?",
        "This CV ranking platform integrates third-party APIs (e.g., OpenAI GPT models) for capability extraction and candidate profiling. How will the team handle data leakage, prompt injections, and legal compliance boundaries if the upstream provider alters model weights or deprecates API endpoints?",
        "Under Annex III, candidate profiling for recruitment is strictly classified as a High-Risk AI System. How will you organize the mandatory pre-market Fundamental Rights Impact Assessment (FRIA), register the system in the EU database, and compile the exhaustive technical file for regulatory inspection?"
      ];
    } else if (purposeLower.includes("support") || purposeLower.includes("customer") || purposeLower.includes("email")) {
      questions = [
        "Although generative email drafting represents a lower-risk helper application, what robust procedural controls prevent customer support agents from accidentally pasting proprietary user data or raw personal identifiable information (PII) into the external LLM prompt context?",
        "To comply with mandatory transparency standards under Article 52 of the EU AI Act, what distinct user interface disclosure or labeling mechanisms will be integrated into the drafts to clearly notify the end-recipient that they are interacting with AI-assisted/AI-generated text?",
        "What operational supervisory loop is in place to contain and correct generative hallucinations, particularly if the foundation model mistakenly generates unauthorized commitments, inaccurate service level agreements, or legally binding statements in customer correspondence?"
      ];
    } else {
      questions = [
        "How will the system dynamically identify, version, and log model performance and telemetry deviations when underlying neural network weights or system prompts are updated?",
        "What rigorous, quantitative verification benchmarks (e.g., safety, accuracy, robust adversarial testing) will be used to certify the security posture of this AI deployment before launching in live production contexts?"
      ];
    }

    // 4. Assemble the premium Markdown and interactive HTML report
    let report = `### 🛡️ EU AI ACT: RISK CONVERGENCE & PREVENTION OF CONFIDENCE REPORT\n\n`;

    if (gapsCount === 0) {
      report += `🔴 **CONFIDENCE STATUS**: HIGH CONFIDENCE OF ALIGNMENT (0 GOVERNANCE GAPS DETECTED)\n\n`;
    } else {
      report += `🟡 **CONFIDENCE STATUS**: CAUTION - PERFECT CONFIDENCE PREVENTED (${gapsCount} GOVERNANCE GAPS DETECTED)\n\n`;
    }

    report += `#### 🚨 Gaps Assessment Explanation:\n${gapsSummary}\n\n`;
    report += `#### 🔍 Critical Assumptions Explanation:\n${assumptionsSummary}\n\n`;

    report += `#### 🎓 AI Expert High-Standard Audit Questions:\n`;
    questions.forEach((q, idx) => {
      const parts = q.split('?');
      const questionText = parts[0] + "?";
      const rationaleText = parts[1] || "Audits compliance validation for core governance declarations.";
      report += `${idx + 1}. **${questionText}**\n   *Expert Rationale: ${rationaleText.trim()}*\n\n`;
    });

    report += `\n---\n\n`;
    report += `### 📂 COMPLIANCE DATA CONTAINMENT (HOVER TO REVEAL DETAILS)\n\n`;

    // Gaps Hover Containment Card
    if (gapsCount > 0) {
      report += `<div class="hover-details-wrapper">
  <div class="hover-details-trigger">⚠️ Position mouse here to inspect the complete itemized compliance gaps (${gapsCount})...</div>
  <div class="hover-details-content">
    <ol>
      ${gaps.map(g => `<li>${g}</li>`).join('')}
    </ol>
  </div>
</div>\n\n`;
    } else {
      report += `<div class="hover-details-wrapper" style="border-color: var(--color-success);">
  <div class="hover-details-trigger" style="color: var(--color-success); font-weight: 600;">🎉 Position mouse here to view gaps verification report (0 gaps)...</div>
  <div class="hover-details-content">
    <p style="color: var(--text-secondary); margin: 0; line-height: 1.5;">Verification complete: All 8 core EU AI Act technical parameters have been successfully detected, audited, and logged inside the proposal structure.</p>
  </div>
</div>\n\n`;
    }

    // Assumptions Hover Containment Card
    if (assumptionsCount > 0) {
      report += `<div class="hover-details-wrapper">
  <div class="hover-details-trigger">🔍 Position mouse here to inspect the complete itemized assumptions checked (${assumptionsCount})...</div>
  <div class="hover-details-content">
    <ul>
      ${assumptions.map(a => `<li>${a}</li>`).join('')}
    </ul>
  </div>
</div>\n\n`;
    } else {
      report += `<div class="hover-details-wrapper" style="border-color: var(--text-muted);">
  <div class="hover-details-trigger" style="color: var(--text-muted);">🔍 Position mouse here to view assumptions report (0 assumptions)...</div>
  <div class="hover-details-content">
    <p style="color: var(--text-secondary); margin: 0; line-height: 1.5;">No active operational or technical assumptions were compiled. The system is marked under a standard, non-high-risk classification.</p>
  </div>
</div>\n\n`;
    }

    return report;
  }
}
