export interface GovernanceData {
  documentation?: string;
  riskManagement?: string;
  transparency?: string;
  humanOversight?: string;
  monitoring?: string;
  logging?: string;
  accountability?: string;
  roleClarity?: string;
}

export interface ProposalFacts {
  purpose?: string;
  users?: string;
  affectedPersons?: string;
  sector?: string;
  inputData?: string;
  outputs?: string;
  automationLevel?: string;
  humanOversight?: string;
  deploymentContext?: string;
  useOfAiGeneratedContent?: string;
  useOfGpai?: string;
  possibleImpactOnPeople?: string;
}

export type MessageType =
  | "START"
  | "PARSE_REQUEST"
  | "PARSED_TEXT"
  | "CLASSIFY_REQUEST"
  | "CLASSIFIED_INFO"
  | "ANALYZE_GOVERNANCE"
  | "GOVERNANCE_ANALYSIS"
  | "CHECK_MISSING_INFO"
  | "CHECK_ASSUMPTIONS"
  | "ASSUMPTIONS_REPORT"
  | "RERUN_COMMAND"
  | "PROMPT_USER_UPLOAD"
  | "USER_UPLOADED_INFO"
  | "GAPS_LIST"
  | "PREVENTION_REPORT"
  | "LOG"
  | "EMAIL_REPORT"
  | "COMPLETED";

export interface AgentMessage {
  id: string;
  timestamp: string;
  sender: string;
  recipient: string;
  type: MessageType;
  content: string;
  data?: any;
}

export type PipelineStatus =
  | "IDLE"
  | "PARSING"
  | "CLASSIFYING"
  | "ANALYZING_GOVERNANCE"
  | "CHECKING_MISSING_INFO"
  | "AWAITING_USER_UPLOAD"
  | "CONVERGING"
  | "COMPLETED_SUCCESS"
  | "COMPLETED_WITH_GAPS";

export interface SessionState {
  sessionId: string;
  status: PipelineStatus;
  attemptCount: number;
  uploadedDocs: string[];
  parsedText: string | null;
  riskClassification: string | null;
  governanceData: GovernanceData | null;
  proposalFacts: ProposalFacts | null;
  missingFields: string[];
  gaps: string[];
  assumptions: string[];
  preventionOutput: string | null;
  humanizedSummary: any | null;
  messages: AgentMessage[];
}
