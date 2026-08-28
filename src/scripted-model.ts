import {
  Model,
  type BaseModelConfig,
  type Message,
  type ModelStreamEvent,
  type StreamOptions,
} from "@strands-agents/sdk";

interface ScriptedModelConfig extends BaseModelConfig {
  modelId: string;
}

interface ToolStep {
  name: string;
  input: Record<string, string>;
}

const steps: ToolStep[] = [
  { name: "list_pending_packets", input: {} },
  { name: "inspect_invoice_packet", input: { packetId: "PP-1042" } },
  { name: "queue_human_review", input: { packetId: "PP-1042" } },
  { name: "inspect_invoice_packet", input: { packetId: "PP-1043" } },
  { name: "clear_clean_packet", input: { packetId: "PP-1043" } },
];

/**
 * A deterministic model used only to exercise the real Strands agent loop in
 * tests and local demos without cloud credentials. Production uses Bedrock.
 */
export class ScriptedPayableModel extends Model<ScriptedModelConfig> {
  private config: ScriptedModelConfig = { modelId: "scripted-payable-demo" };
  private step = 0;

  updateConfig(modelConfig: ScriptedModelConfig): void {
    this.config = { ...this.config, ...modelConfig };
  }

  getConfig(): ScriptedModelConfig {
    return this.config;
  }

  async *stream(
    _messages: Message[],
    _options?: StreamOptions,
  ): AsyncIterable<ModelStreamEvent> {
    yield { type: "modelMessageStartEvent", role: "assistant" };

    const next = steps[this.step++];
    if (next) {
      yield {
        type: "modelContentBlockStartEvent",
        start: {
          type: "toolUseStart",
          name: next.name,
          toolUseId: `offline-step-${this.step}`,
        },
      };
      yield {
        type: "modelContentBlockDeltaEvent",
        delta: {
          type: "toolUseInputDelta",
          input: JSON.stringify(next.input),
        },
      };
      yield { type: "modelContentBlockStopEvent" };
      yield { type: "modelMessageStopEvent", stopReason: "toolUse" };
      return;
    }

    yield { type: "modelContentBlockStartEvent" };
    yield {
      type: "modelContentBlockDeltaEvent",
      delta: {
        type: "textDelta",
        text: "Cleared PP-1043. PP-1042 needs one decision: hold INV-44318 and request an $18.40 credit.",
      },
    };
    yield { type: "modelContentBlockStopEvent" };
    yield { type: "modelMessageStopEvent", stopReason: "endTurn" };
  }
}
