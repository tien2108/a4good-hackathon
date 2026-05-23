import { AgentMessage, SessionState, PipelineStatus } from "./types.js";
import { BaseAgent } from "./BaseAgent.js";

export class AgentBus {
  private agents = new Map<string, BaseAgent>();
  private sessions = new Map<string, SessionState>();

  /**
   * Register an agent onto the communication bus.
   */
  public registerAgent(agent: BaseAgent): void {
    this.agents.set(agent.name, agent);
    console.log(`[AgentBus] Registered Agent: ${agent.name}`);
  }

  /**
   * Get an agent by name.
   */
  public getAgent(name: string): BaseAgent | undefined {
    return this.agents.get(name);
  }

  /**
   * Create or fetch a session state.
   */
  public getOrCreateSession(sessionId: string): SessionState {
    const existing = this.sessions.get(sessionId);
    if (existing) {
      return existing;
    }
    const session: SessionState = {
      sessionId,
      status: "IDLE",
      attemptCount: 0,
      uploadedDocs: [],
      parsedText: null,
      riskClassification: null,
      governanceData: null,
      proposalFacts: null,
      missingFields: [],
      gaps: [],
      assumptions: [],
      preventionOutput: null,
      humanizedSummary: null,
      messages: [],
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * Update the session status.
   */
  public updateSessionStatus(sessionId: string, status: PipelineStatus): void {
    const session = this.getOrCreateSession(sessionId);
    session.status = status;
    
    // Broadcast status change as a system log
    this.publish({
      id: `sys-status-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sender: "System",
      recipient: "User",
      type: "LOG",
      content: `Pipeline status updated to ${status}`,
      data: { sessionId },
    });
  }

  /**
   * Update other properties of the session.
   */
  public updateSession(sessionId: string, updater: (session: SessionState) => void): void {
    const session = this.getOrCreateSession(sessionId);
    updater(session);
  }

  /**
   * Publish a message onto the bus. It appends to logs and routes to the recipient.
   */
  public publish(message: AgentMessage): void {
    const sessionId = message.data?.sessionId;
    if (!sessionId) {
      console.warn(`[AgentBus] Published message is missing sessionId: ${JSON.stringify(message)}`);
      return;
    }

    const session = this.getOrCreateSession(sessionId);
    session.messages.push(message);

    console.log(`[AgentBus] ${message.sender} -> ${message.recipient} | ${message.type}: ${message.content}`);

    // If there is a recipient agent, schedule delivery asynchronously to mimic background agents
    const recipientAgent = this.agents.get(message.recipient);
    if (recipientAgent) {
      setTimeout(async () => {
        try {
          await recipientAgent.receive(message);
        } catch (error) {
          console.error(`[AgentBus] Error in agent ${recipientAgent.name} processing message:`, error);
          this.publish({
            id: `error-${Date.now()}`,
            timestamp: new Date().toISOString(),
            sender: "System",
            recipient: "User",
            type: "LOG",
            content: `ERROR in agent ${recipientAgent.name}: ${(error as Error).message}`,
            data: { sessionId },
          });
        }
      }, 350); // 350ms delay creates a beautiful visible flow on the dashboard
    }
  }

  /**
   * Reset/clear a session.
   */
  public resetSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }
}
