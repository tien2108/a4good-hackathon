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
  reasoningTrace?: string;
  downstreamDecisions?: any;
  decisionTreePayload?: any;
}

export interface ExtractedField {
  value: string;
  confidence: number;
  evidence: string;
}

export interface DecisionTreeFormatInput {
  status?: string;
  validation?: {
    can_classify?: boolean;
    avg_extraction_confidence?: number;
    missing_fields?: string[];
    low_confidence_fields?: Array<{
      field: string;
      confidence: number;
      value: string;
    }>;
    steps_at_risk?: { [step: string]: string[] };
    warning?: string;
  };
  extracted_fields?: {
    purpose?: ExtractedField;
    users?: ExtractedField;
    "affected persons"?: ExtractedField;
    affected_persons?: ExtractedField; // Alias
    sector?: ExtractedField;
    "input data"?: ExtractedField;
    input_data?: ExtractedField; // Alias
    outputs?: ExtractedField;
    "automation level"?: ExtractedField;
    automation_level?: ExtractedField; // Alias
    "human oversight"?: ExtractedField;
    human_oversight?: ExtractedField; // Alias
    "deployment context"?: ExtractedField;
    deployment_context?: ExtractedField; // Alias
    "use of AI-generated content"?: ExtractedField;
    use_of_ai_generated_content?: ExtractedField; // Alias
    "use of GPAI"?: ExtractedField;
    use_of_gpai?: ExtractedField; // Alias
    "possible impact on people"?: ExtractedField;
    possible_impact_on_people?: ExtractedField; // Alias
  };
  classification?: {
    risk_level?: string;
    articles?: string[];
    description?: string;
    overall_confidence?: number;
    weakest_link_confidence?: number;
    overall_confidence_label?: string;
    classification_certainty?: {
      score?: number;
      label?: string;
      explanation?: string;
      weak_steps?: string[];
    };
    needs_human_review?: boolean;
    reasoning_trace?: Array<{
      step: string;
      question: string;
      answer: string;
      confidence: number;
      confidence_label?: string;
      justification?: string;
      fact_texts?: any[];
    }>;
  };
}
