import { AgentMessage, MessageType } from "./types.js";
import { AgentBus } from "./AgentBus.js";

export abstract class BaseAgent {
  public readonly name: string;
  protected bus: AgentBus;

  constructor(name: string, bus: AgentBus) {
    this.name = name;
    this.bus = bus;
  }

  /**
   * Handle incoming messages directed to this agent.
   */
  public abstract receive(message: AgentMessage): Promise<void> | void;

  /**
   * Helper method to send a message to another agent or broadcast to the system.
   */
  protected send(recipient: string, type: MessageType, content: string, data?: any): void {
    const msg: AgentMessage = {
      id: `${this.name.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      sender: this.name,
      recipient,
      type,
      content,
      data,
    };
    this.bus.publish(msg);
  }

  /**
   * Helper to write a log message onto the bus.
   */
  protected log(content: string, data?: any): void {
    this.send("System", "LOG", content, data);
  }
}
