import { BaseAgent } from "../BaseAgent.js";
import { AgentMessage } from "../types.js";
import PDFDocument from "pdfkit";
import pptxgen from "pptxgenjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class HumanizerUiDisplayAgent extends BaseAgent {
  constructor(bus: any) {
    super("HumanizerUiDisplay", bus);
  }

  public async receive(message: AgentMessage): Promise<void> {
    const { sessionId } = message.data || {};

    if (message.type === "PREVENTION_REPORT") {
      this.log(`Received risk convergence report. Formatting humanized summary and compiling PDF/PPTX report assets...`, { sessionId });

      const session = this.bus.getOrCreateSession(sessionId);
      const gapsCount = session.gaps?.length || 0;

      // Compile a gorgeous dashboard summary payload
      const humanizedSummary = {
        complianceScore: gapsCount === 0 ? 100 : Math.max(100 - gapsCount * 25, 10),
        statusLabel: gapsCount === 0 ? "FULLY COMPLIANT" : "ACTION REQUIRED",
        riskClassification: session.riskClassification,
        governanceCompleteness: `${8 - gapsCount} of 8 Parameters Verified`,
        visualIndicators: {
          documentation: !!session.governanceData?.documentation,
          riskManagement: !!session.governanceData?.riskManagement,
          transparency: !!session.governanceData?.transparency,
          humanOversight: !!session.governanceData?.humanOversight,
          monitoring: !!session.governanceData?.monitoring,
          logging: !!session.governanceData?.logging,
          accountability: !!session.governanceData?.accountability,
          roleClarity: !!session.governanceData?.roleClarity,
        },
        finalReportMarkdown: session.preventionOutput,
        timestamp: new Date().toLocaleTimeString(),
        pdfUrl: `/exports/report-${sessionId}.pdf`,
        pptxUrl: `/exports/briefing-${sessionId}.pptx`
      };

      // 1. Save results to the session state IMMEDIATELY so the Lovable UI updates instantly!
      this.bus.updateSession(sessionId, (s) => {
        s.humanizedSummary = humanizedSummary;
        s.status = gapsCount === 0 ? "COMPLETED_SUCCESS" : "COMPLETED_WITH_GAPS";
      });

      this.log(`🎉 COMPLIANCE CHECK PIPELINE FULLY CONCLUDED. Display payload stored. Status: ${gapsCount === 0 ? "COMPLETED_SUCCESS" : "COMPLETED_WITH_GAPS"}`, { sessionId });
      
      this.send("User", "COMPLETED", "Compliance execution workflow finished", { 
        sessionId,
        summary: humanizedSummary
      });

      // 2. Compile PDF and PPTX report assets asynchronously in the background so they do not block UI rendering
      this.log(`Compiling PDF/PPTX report assets in the background (will take 2-3 seconds)...`, { sessionId });
      this.generateReportAssets(sessionId, session)
        .then(({ pdfPath, pptxPath }) => {
          this.log(`Report assets compiled successfully in the background:`, { sessionId });
          this.log(`📄 PDF: ${pdfPath}`, { sessionId });
          this.log(`📊 PPTX: ${pptxPath}`, { sessionId });
        })
        .catch((err) => {
          this.log(`⚠️ Failed to compile report assets in background: ${(err as Error).message}`, { sessionId });
        });
    }
  }

  public async generateReportAssets(sessionId: string, session: any): Promise<{ pdfPath: string; pptxPath: string }> {
    // Resolve exports directory
    const projectRoot = path.resolve(__dirname, "..", "..", "..");
    const exportsDir = path.join(projectRoot, "src", "public", "exports");
    
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    const pdfPath = path.join(exportsDir, `report-${sessionId}.pdf`);
    const pptxPath = path.join(exportsDir, `briefing-${sessionId}.pptx`);

    // Create PDF
    await this.buildPDF(pdfPath, session);

    // Create PPTX
    await this.buildPPTX(pptxPath, session);

    // Copy to dist/public/exports if dist folder exists
    const distExportsDir = path.join(projectRoot, "dist", "public", "exports");
    if (fs.existsSync(path.join(projectRoot, "dist"))) {
      if (!fs.existsSync(distExportsDir)) {
        fs.mkdirSync(distExportsDir, { recursive: true });
      }
      fs.copyFileSync(pdfPath, path.join(distExportsDir, `report-${sessionId}.pdf`));
      fs.copyFileSync(pptxPath, path.join(distExportsDir, `briefing-${sessionId}.pptx`));
    }

    return { pdfPath, pptxPath };
  }

  private buildPDF(pdfPath: string, session: any): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const writeStream = fs.createWriteStream(pdfPath);
        doc.pipe(writeStream);

        // Header Banner (Corporate aesthetic)
        doc.rect(0, 0, 612, 100).fill("#1A365D");
        doc.fontSize(22).fillColor("#FFFFFF").font("Helvetica-Bold").text("EU AI Act Compliance Audit Report", 50, 40);
        doc.font("Helvetica").fontSize(10).fillColor("#E2E8F0").text(`Automated pipeline output | Timestamp: ${new Date().toLocaleString()}`, 50, 70);
        doc.moveDown(3);

        // Session metadata Table
        const score = session.humanizedSummary?.complianceScore ?? 100;
        const status = session.humanizedSummary?.statusLabel ?? "COMPLETE";
        doc.fontSize(13).fillColor("#1A365D").text("Assessment Metadata", { underline: true });
        doc.fontSize(10).fillColor("#2D3748").text(`• Session ID: ${session.sessionId}`);
        doc.fontSize(10).text(`• Compliance Score: ${score}/100`);
        doc.fontSize(10).text(`• Regulatory Status: ${status}`);
        doc.moveDown(1.2);

        // Section 1: Facts from Input Parser
        doc.fontSize(13).fillColor("#1A365D").text("1. Extracted Use-Case Facts (Source: Input Parser Agent)", { underline: true });
        doc.moveDown(0.4);
        const facts = session.proposalFacts || {};
        const factsKeys = [
          { name: "Core Purpose", key: "purpose" },
          { name: "Target Sector", key: "sector" },
          { name: "End Users", key: "users" },
          { name: "Affected Persons", key: "affectedPersons" },
          { name: "Deployment Context", key: "deploymentContext" },
          { name: "Input Data Ingestion", key: "inputData" },
          { name: "Primary Outputs", key: "outputs" },
          { name: "GPAI Component Usage", key: "useOfGpai" },
          { name: "Automation Level", key: "automationLevel" },
          { name: "Human Oversight Claims", key: "humanOversight" },
          { name: "Potential Social Impact", key: "possibleImpactOnPeople" }
        ];

        factsKeys.forEach(f => {
          if (facts[f.key]) {
            doc.fontSize(9).fillColor("#2D3748").font("Helvetica-Bold").text(`${f.name}: `, { continued: true })
               .font("Helvetica").fillColor("#4A5568").text(facts[f.key]);
            doc.moveDown(0.2);
          }
        });
        doc.moveDown(1.2);

        // Section 2: Decision Tree Classifications & Citations
        doc.fontSize(13).fillColor("#1A365D").text("2. EU AI Act Path Classifications & Citations (Source: Decision Tree)", { underline: true });
        doc.moveDown(0.4);
        if (session.riskClassification) {
          const lines = session.riskClassification.split("\n");
          lines.forEach((line: string) => {
            if (line.trim().startsWith("-")) {
              doc.fontSize(9).fillColor("#2C5282").text(line.trim(), { indent: 15 });
            } else if (line.trim().startsWith("**")) {
              doc.fontSize(10).fillColor("#1A365D").font("Helvetica-Bold").text(line.replace(/\*\*/g, "").trim()).font("Helvetica");
            } else {
              doc.fontSize(10).fillColor("#2D3748").text(line.trim());
            }
            doc.moveDown(0.15);
          });
        } else {
          doc.fontSize(9).fillColor("#4A5568").text("Unclassified");
        }
        doc.moveDown(1.2);

        // Section 3: Governance observations
        doc.fontSize(13).fillColor("#1A365D").text("3. Deduced Governance Observations (Source: Judge of Governance)", { underline: true });
        doc.moveDown(0.4);
        const gov = session.governanceData || {};
        const govKeys = [
          { name: "Human Oversight Framework", key: "humanOversight" },
          { name: "Lifecycle Logging & Documentation", key: "documentation" },
          { name: "System Transparency & Disclosures", key: "transparency" },
          { name: "Risk Management Systems", key: "riskManagement" },
          { name: "Continuous Monitoring & Drift", key: "monitoring" },
          { name: "Audit Logging Mechanisms", key: "logging" },
          { name: "Organizational Accountability", key: "accountability" },
          { name: "Operational Role Clarity", key: "roleClarity" }
        ];

        govKeys.forEach(g => {
          if (gov[g.key]) {
            doc.fontSize(9).fillColor("#2D3748").font("Helvetica-Bold").text(`${g.name}: `, { continued: true })
               .font("Helvetica").fillColor("#4A5568").text(gov[g.key]);
            doc.moveDown(0.3);
          }
        });
        doc.moveDown(1.2);

        // Section 4: Gaps and Assumptions Checkers
        doc.fontSize(13).fillColor("#1A365D").text("4. Risk Boundaries: Assumptions & Gaps Checkers", { underline: true });
        doc.moveDown(0.4);

        doc.fontSize(10).fillColor("#2D3748").font("Helvetica-Bold").text("Operational & Technical Assumptions Checked:").font("Helvetica");
        doc.moveDown(0.15);
        if (session.assumptions && session.assumptions.length > 0) {
          session.assumptions.forEach((a: string) => {
            doc.fontSize(9).fillColor("#744210").text(`• ${a.replace('[ASSUMPTION]', '').trim()}`);
            doc.moveDown(0.15);
          });
        } else {
          doc.fontSize(9).fillColor("#4A5568").text("No pre-market or legal compliance assumptions were identified.");
        }
        doc.moveDown(0.6);

        doc.fontSize(10).fillColor("#2D3748").font("Helvetica-Bold").text("Identified Regulatory Assessment Gaps:").font("Helvetica");
        doc.moveDown(0.15);
        if (session.gaps && session.gaps.length > 0) {
          session.gaps.forEach((g: string) => {
            doc.fontSize(9).fillColor("#9B2C2C").text(`• ${g}`);
            doc.moveDown(0.15);
          });
        } else {
          doc.fontSize(9).fillColor("#22543D").text("🎉 No active compliance omissions or gaps detected. Perfect structural compliance achieved!");
        }
        doc.moveDown(1.2);

        // Section 5: Prevention of confidence
        doc.fontSize(13).fillColor("#1A365D").text("5. Confidence Prevention & Auditing Queries (Prevention of Confidence Agent)", { underline: true });
        doc.moveDown(0.4);
        if (session.preventionOutput) {
          const lines = session.preventionOutput.split("\n");
          let isQuestions = false;
          lines.forEach((line: string) => {
            if (line.includes("Expert Questions") || line.includes("Supervisory Questions") || line.includes("Audit Questions")) {
              isQuestions = true;
              doc.fontSize(10).fillColor("#1A365D").font("Helvetica-Bold").text("AI Compliance Expert Auditing Queries:").font("Helvetica");
              doc.moveDown(0.2);
              return;
            }
            if (isQuestions && (line.trim().startsWith("1.") || line.trim().startsWith("2.") || line.trim().startsWith("3.") || line.trim().startsWith("•") || line.match(/^\d+\./))) {
              doc.fontSize(9).fillColor("#2D3748").text(line.trim());
              doc.moveDown(0.2);
            }
          });
          if (!isQuestions) {
            doc.fontSize(9).fillColor("#4A5568").text("Please refer to the interactive Lovable UI or briefing slides to review the targeted expert inquiries.");
          }
        }
        doc.moveDown(1.5);

        // Footer Notice
        doc.fontSize(7).fillColor("#718096").text("Advisory Footnote: This report displays a multi-agent automated compliance assessment to facilitate regulatory review. It does not constitute formal legal counsel or binding certification under the EU AI Act.", { align: "center" });

        doc.end();
        writeStream.on("finish", () => resolve());
        writeStream.on("error", (e) => reject(e));
      } catch (err) {
        reject(err);
      }
    });
  }

  private async buildPPTX(pptxPath: string, session: any): Promise<void> {
    let pptxConstructor = pptxgen;
    if (typeof pptxConstructor !== "function" && (pptxConstructor as any).default) {
      pptxConstructor = (pptxConstructor as any).default;
    }
    const pptx = new (pptxConstructor as any)();

    // 1. Title Slide
    const slide1 = pptx.addSlide();
    slide1.background = { color: "1A365D" };
    slide1.addText("EU AI Act Compliance Briefing", {
      x: 0.5, y: 1.8, w: 9.0, h: 1.0,
      fontSize: 32, bold: true, color: "FFFFFF", align: "left"
    });
    slide1.addText(`Multi-Agent Pipeline Audit Outcomes\nScore: ${session.humanizedSummary?.complianceScore ?? 100}/100 | Status: ${session.humanizedSummary?.statusLabel ?? "COMPLETE"}`, {
      x: 0.5, y: 3.0, w: 9.0, h: 0.8,
      fontSize: 15, color: "E2E8F0", align: "left"
    });
    slide1.addText(`Assessed on: ${new Date().toLocaleDateString()} | Session: ${session.sessionId}`, {
      x: 0.5, y: 5.2, w: 9.0, h: 0.5,
      fontSize: 11, color: "CBD5E0", align: "left"
    });

    const addHeader = (slide: any, title: string) => {
      slide.addShape("rect", { x: 0.0, y: 0.0, w: "100%", h: 0.8, fill: { color: "1A365D" } });
      slide.addText(title, { x: 0.5, y: 0.15, w: 9.0, h: 0.5, fontSize: 18, bold: true, color: "FFFFFF" });
    };

    // 2. Extracted Facts Slide
    const slide2 = pptx.addSlide();
    addHeader(slide2, "1. Extracted Use-Case Facts (Source: Input Parser)");
    const facts = session.proposalFacts || {};
    let factsText = `• Purpose: ${facts.purpose || "N/A"}\n` +
                    `• Sector: ${facts.sector || "N/A"}\n` +
                    `• Targeted End-Users: ${facts.users || "N/A"}\n` +
                    `• Affected Persons: ${facts.affectedPersons || "N/A"}\n` +
                    `• Deployment Context: ${facts.deploymentContext || "N/A"}\n` +
                    `• Human Oversight Claims: ${facts.humanOversight || "N/A"}`;
    slide2.addText(factsText, { x: 0.5, y: 1.0, w: 9.0, h: 4.5, fontSize: 12, color: "2D3748", lineSpacing: 22 });

    // 3. Classification Slide
    const slide3 = pptx.addSlide();
    addHeader(slide3, "2. EU AI Act Classification & Citations (Source: Decision Tree)");
    slide3.addText(`Preliminary Assessment Outcomes:`, { x: 0.5, y: 0.9, w: 9.0, h: 0.3, fontSize: 14, bold: true, color: "1A365D" });
    
    const classificationLine = session.riskClassification?.split("\n\n")[0] || "High-Risk AI System";
    slide3.addText(classificationLine, { x: 0.5, y: 1.3, w: 9.0, h: 0.4, fontSize: 13, color: "9B2C2C", bold: true });

    let citationsText = "";
    if (session.riskClassification && session.riskClassification.includes("Citations")) {
      citationsText = session.riskClassification.split("**EU AI Act Flowchart Citations**:\n")[1] || "";
    } else {
      citationsText = "• Article 2 (Scope & Exclusions)\n• Article 5 (Prohibited AI Systems check)\n• Article 6 (High-Risk Classification rules)\n• Article 26 (Deployer Obligations)\n• Chapter IX (Post-Market Compliance)";
    }
    slide3.addText("Active Flowchart Branch Citations:", { x: 0.5, y: 1.9, w: 9.0, h: 0.3, fontSize: 14, bold: true, color: "2D3748" });
    slide3.addText(citationsText, { x: 0.5, y: 2.3, w: 9.0, h: 3.2, fontSize: 10, color: "4A5568", lineSpacing: 16 });

    // 4. Governance Observations Slide
    const slide4 = pptx.addSlide();
    addHeader(slide4, "3. Deduced Governance Observations (Source: Judge of Governance)");
    const gov = session.governanceData || {};
    let govText = `• Human Oversight Framework: ${gov.humanOversight || "OMITTED/GAPS"}\n` +
                  `• Technical Documentation: ${gov.documentation || "OMITTED/GAPS"}\n` +
                  `• Transparency & Disclosures: ${gov.transparency || "OMITTED/GAPS"}\n` +
                  `• Lifecycle Logging & Traceability: ${gov.logging || "OMITTED/GAPS"}\n` +
                  `• Continuous Monitoring: ${gov.monitoring || "OMITTED/GAPS"}\n` +
                  `• Accountability structure: ${gov.accountability || "OMITTED/GAPS"}`;
    slide4.addText(govText, { x: 0.5, y: 1.0, w: 9.0, h: 4.5, fontSize: 11, color: "2D3748", lineSpacing: 19 });

    // 5. Expert Inquiries Slide
    const slide5 = pptx.addSlide();
    addHeader(slide5, "4. Confidence Boundaries & Auditing Queries");
    
    const gapsLen = session.gaps?.length || 0;
    const assLen = session.assumptions?.length || 0;
    
    slide5.addText(`Audit Findings: Identified ${gapsLen} Assessment Gaps & ${assLen} Compliance Assumptions.`, {
      x: 0.5, y: 0.9, w: 9.0, h: 0.3, fontSize: 12, bold: true, color: "C53030"
    });

    let questionsText = "• Under clinical pressure, how do you mitigate radiologist 'automation bias'?\n" +
                      "• What drift-detection telemetry compensates for scanner raw output variations?\n" +
                      "• How do you organize the pre-market Fundamental Rights Impact Assessment (FRIA)?";

    if (session.preventionOutput) {
      const qLines: string[] = [];
      session.preventionOutput.split("\n").forEach((line: string) => {
        if (line.trim().startsWith("1.") || line.trim().startsWith("2.") || line.trim().startsWith("3.")) {
          qLines.push(line.trim());
        }
      });
      if (qLines.length > 0) {
        questionsText = qLines.map(q => `• ${q}`).join("\n");
      }
    }

    slide5.addText("Expert Regulatory Auditing Inquiries:", { x: 0.5, y: 1.4, w: 9.0, h: 0.3, fontSize: 13, bold: true, color: "1A365D" });
    slide5.addText(questionsText, { x: 0.5, y: 1.8, w: 9.0, h: 3.5, fontSize: 11, color: "2D3748", lineSpacing: 18 });

    // Save File
    return new Promise((resolve, reject) => {
      pptx.writeFile({ fileName: pptxPath })
        .then(() => resolve())
        .catch((err: any) => reject(err));
    });
  }
}
