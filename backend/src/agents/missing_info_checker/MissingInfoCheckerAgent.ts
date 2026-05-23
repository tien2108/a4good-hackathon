import { BaseAgent } from "../BaseAgent.js";
import { AgentMessage, GovernanceData } from "../types.js";

export class MissingInfoCheckerAgent extends BaseAgent {
  // The 8 governance fields mandated by the user
  private requiredFields: Array<keyof GovernanceData> = [
    "documentation",
    "riskManagement",
    "transparency",
    "humanOversight",
    "monitoring",
    "logging",
    "accountability",
    "roleClarity",
  ];

  constructor(bus: any) {
    super("MissingInfoChecker", bus);
  }

  public async receive(message: AgentMessage): Promise<void> {
    const { sessionId, scenario } = message.data || {};

    if (message.type === "CHECK_MISSING_INFO") {
      this.log(`Reviewing JudgeOfGovernance JSON for required compliance parameters...`, { sessionId });
      this.bus.updateSessionStatus(sessionId, "CHECKING_MISSING_INFO");

      const session = this.bus.getOrCreateSession(sessionId);
      const govData = session.governanceData || {};

      // 1. Identify which mandated fields are missing
      const missing = this.requiredFields.filter((field) => {
        const val = govData[field];
        return val === undefined || val === null || val === "" || String(val).trim().length === 0;
      });

      this.bus.updateSession(sessionId, (s) => {
        s.missingFields = missing;
      });

      // 2. Action based on gaps found
      if (missing.length === 0) {
        this.log(`🎉 Perfect! All 8 governance parameters are present and validated. Moving to convergence stage.`, { sessionId });
        this.bus.updateSession(sessionId, (s) => {
          s.gaps = [];
        });
        
        // Trigger both Assumptions check and send empty gaps to PreventionOfConfidence
        this.triggerConvergence(sessionId, []);
      } 
      
      else {
        this.log(`⚠️ Missing info detected on fields: [${missing.join(", ")}]`, { sessionId });

        // First Run failure: Try auto-recovery by sending a RERUN command to InputParser
        if (session.attemptCount === 0) {
          this.log(`Attempt 1 failed. Initiating auto-recovery rerun. Sending RERUN_COMMAND to InputParser.`, { sessionId });
          this.bus.updateSession(sessionId, (s) => {
            s.attemptCount = 1;
          });
          
          this.send("InputParser", "RERUN_COMMAND", `Extract details for missing fields: ${missing.join(", ")}`, { 
            sessionId, 
            scenario, 
            missingFields: missing 
          });
        } 
        
        // Second Run failure (post-rerun): Prompt the user to upload documents
        else if (session.attemptCount === 1) {
          // If they already uploaded documents and we still have missing fields, we don't prompt again.
          // Instead, we proceed to produce gaps and transition.
          if (session.uploadedDocs.length > 0) {
            this.log(`Attempt 2 (user upload) still left missing fields: [${missing.join(", ")}]. Proceeding to generate gaps.`, { sessionId });
            this.produceGapsAndProceed(sessionId, missing);
          } else {
            this.log(`Attempt 2 failed. Rerun did not resolve gaps. Shifting status to prompt user upload.`, { sessionId });
            this.bus.updateSessionStatus(sessionId, "AWAITING_USER_UPLOAD");
            
            this.send("User", "PROMPT_USER_UPLOAD", `Compliance check is missing critical info: ${missing.join(", ")}. Please upload supplementary documents.`, {
              sessionId,
              missingFields: missing,
            });
          }
        }
      }
    } 
    
    // User interacted: either uploaded new information or skipped
    else if (message.type === "USER_UPLOADED_INFO") {
      const { skipped, files } = message.data || {};

      if (skipped) {
        this.log(`User elected to SKIP uploading additional documents. Generating assessment gaps list.`, { sessionId });
        const missing = this.bus.getOrCreateSession(sessionId).missingFields;
        this.produceGapsAndProceed(sessionId, missing);
      } 
      
      else if (files && files.length > 0) {
        this.log(`User uploaded ${files.length} supplementary documents: [${files.join(", ")}]. Rerunning parser...`, { sessionId });
        this.bus.updateSession(sessionId, (s) => {
          s.uploadedDocs = [...s.uploadedDocs, ...files];
          // We keep attemptCount = 1, but we trigger the pipeline rerun
        });

        // Trigger InputParser to run with new document contexts
        this.send("InputParser", "START", "Parsing with newly uploaded supplementary files", { 
          sessionId, 
          scenario,
          uploadedFiles: files 
        });
      }
    }
  }

  /**
   * Helper to generate a text list of gaps and trigger convergence
   */
  private produceGapsAndProceed(sessionId: string, missingFields: string[]): void {
    const session = this.bus.getOrCreateSession(sessionId);
    
    // Generate text descriptions of the gaps
    const gapsList = missingFields.map((field) => {
      const label = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1");
      return `[GAP IN ASSESSMENT] Missing Governance Area: '${label}'. No operational notes, procedural evidence, or safety strategies were provided in the proposal for this AI Act mandate. This creates high liability and audit compliance risks.`;
    });

    this.bus.updateSession(sessionId, (s) => {
      s.gaps = gapsList;
    });

    this.log(`Generated assessment gaps list containing ${gapsList.length} compliance warnings. Triggering convergence.`, { sessionId });
    this.triggerConvergence(sessionId, gapsList);
  }

  /**
   * Run the next stages of the pipeline: Trigger Assumptions Checker and send gaps to Prevention of Confidence
   */
  private triggerConvergence(sessionId: string, gapsList: string[]): void {
    this.bus.updateSessionStatus(sessionId, "CONVERGING");

    // 1. Trigger the Assumptions Checker agent in parallel
    this.send("AssumptionsChecker", "CHECK_ASSUMPTIONS", "Verify proposal assumptions", { sessionId });

    // 2. Direct our gaps output list to the Prevention of Confidence agent
    this.send("PreventionOfConfidence", "GAPS_LIST", "Deliver assessment gaps list", { 
      sessionId, 
      gaps: gapsList 
    });
  }
}
