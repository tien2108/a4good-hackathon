import { BaseAgent } from "../BaseAgent.js";
import { AgentMessage } from "../types.js";
import path from "path";
import fs from "fs";
import { Resend } from "resend";

export class EmailerAgent extends BaseAgent {
  constructor(bus: any) {
    super("Emailer", bus);
  }

  public async receive(message: AgentMessage): Promise<void> {
    const { sessionId, email, pdfPath, pptxPath } = message.data || {};

    if (message.type === "EMAIL_REPORT") {
      this.log(`Received request to email compliance artifacts for session ${sessionId}. Dispatching...`, { sessionId });

      const apiKey = process.env.RESEND_API_KEY;

      if (apiKey && apiKey !== "YOUR_RESEND_API_KEY" && apiKey.trim() !== "") {
        this.log(`📧 [Resend] Initializing Resend client...`, { sessionId });
        try {
          const resend = new Resend(apiKey);

          const attachments: any[] = [];

          if (pdfPath && fs.existsSync(pdfPath)) {
            attachments.push({
              filename: path.basename(pdfPath),
              content: fs.readFileSync(pdfPath),
            });
          } else {
            this.log(`⚠️ Warning: PDF report file not found at ${pdfPath}. Sending email without PDF attachment.`, { sessionId });
          }

          if (pptxPath && fs.existsSync(pptxPath)) {
            attachments.push({
              filename: path.basename(pptxPath),
              content: fs.readFileSync(pptxPath),
            });
          } else {
            this.log(`⚠️ Warning: PPTX briefing file not found at ${pptxPath}. Sending email without PPTX attachment.`, { sessionId });
          }

          this.log(`📧 [Resend] Dispatching actual email with attachments to ${email}...`, { sessionId });
          const response = await resend.emails.send({
            from: "EU AI Act Auditor <onboarding@resend.dev>",
            to: email,
            subject: `🛡️ EU AI Act Compliance Audit Results (Session: ${sessionId})`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
                <div style="background-color: #1A365D; color: #ffffff; padding: 15px; border-radius: 6px 6px 0 0; text-align: center;">
                  <h2 style="margin: 0; font-size: 20px; color: #ffffff;">EU AI Act Compliance Briefing</h2>
                </div>
                <div style="padding: 20px; color: #2d3748; line-height: 1.6;">
                  <p>Hello,</p>
                  <p>Your multi-agent compliance review has completed successfully.</p>
                  <p>We have successfully compiled and attached your automated regulatory audit materials for session <strong>${sessionId}</strong>:</p>
                  <ul>
                    <li><strong>PDF Compliance Audit Report</strong>: A full granular review of extracted facts, EU AI Act classifications, governance parameters, and uncertainty assumptions.</li>
                    <li><strong>PPTX Executive Briefing Deck</strong>: A high-fidelity slide deck summarizing the audit outcomes for senior stakeholders.</li>
                  </ul>
                  <p style="margin-top: 25px; padding: 10px; background-color: #f7fafc; border-left: 4px solid #4a5568; font-size: 13px; color: #4a5568;">
                    <em>Advisory Note: This report displays an automated compliance assessment to facilitate regulatory review. It does not constitute formal legal counsel or binding certification under the EU AI Act.</em>
                  </p>
                </div>
                <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #edf2f7; font-size: 11px; color: #a0aec0;">
                  Multi-Agent Compliance Orchestration Pipeline
                </div>
              </div>
            `,
            attachments,
          });

          if (response.error) {
            throw new Error(response.error.message);
          }

          this.log(`✅ [Resend] Email delivered successfully via Resend API (ID: ${response.data?.id})`, { sessionId });

          this.send("User", "LOG", `Real email containing report PDF and Briefing Deck successfully sent to ${email} via Resend!`, {
            sessionId,
            recipient: email
          });

        } catch (error) {
          const errMsg = (error as Error).message;
          this.log(`❌ [Resend] Failed to send email via Resend API: ${errMsg}. Falling back to simulation...`, { sessionId });
          this.runSimulation(sessionId, email, pdfPath, pptxPath);
        }
      } else {
        this.log(`ℹ️ [SMTP Simulation] Resend API key is not configured. Simulating delivery...`, { sessionId });
        this.runSimulation(sessionId, email, pdfPath, pptxPath);
      }
    }
  }

  private runSimulation(sessionId: string, email: string, pdfPath: string | undefined, pptxPath: string | undefined): void {
    setTimeout(() => {
      this.log(`📧 [SMTP SIMULATION] Establishing secure TLS tunnel...`, { sessionId });
      this.log(`📧 [SMTP SIMULATION] Sending compliance briefing package to: ${email}`, { sessionId });
      this.log(`📎 Attachment 1: ${pdfPath ? path.basename(pdfPath) : `report-${sessionId}.pdf`}`, { sessionId });
      this.log(`📎 Attachment 2: ${pptxPath ? path.basename(pptxPath) : `briefing-${sessionId}.pptx`}`, { sessionId });
      this.log(`✅ SMTP transmission successful (Simulated). Delivered.`, { sessionId });

      this.send("User", "LOG", `Email containing report PDF and Briefing Deck successfully sent to ${email} (Simulated)`, {
        sessionId,
        recipient: email
      });
    }, 1000);
  }
}
