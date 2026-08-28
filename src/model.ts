import { BedrockModel } from "@strands-agents/sdk/models/bedrock";
import { OpenAIModel } from "@strands-agents/sdk/models/openai";

export type ModelProvider = "bedrock" | "nebius";

export function selectedModelProvider(): ModelProvider {
  return process.env.PAYABLE_MODEL_PROVIDER === "nebius" ? "nebius" : "bedrock";
}

export function createPayableModel() {
  if (selectedModelProvider() === "nebius") {
    const apiKey = process.env.NEBIUS_API_KEY;
    if (!apiKey) {
      throw new Error(
        "NEBIUS_API_KEY is required when PAYABLE_MODEL_PROVIDER=nebius",
      );
    }

    return new OpenAIModel({
      api: "chat",
      apiKey,
      clientConfig: {
        baseURL:
          process.env.NEBIUS_BASE_URL ??
          "https://api.tokenfactory.us-central1.nebius.com/v1/",
      },
      modelId:
        process.env.NEBIUS_MODEL_ID ??
        "nvidia/nemotron-3-super-120b-a12b",
      temperature: 0,
      maxTokens: Number(process.env.NEBIUS_MAX_TOKENS ?? 900),
    });
  }

  return new BedrockModel({
    modelId:
      process.env.BEDROCK_MODEL_ID ?? "global.anthropic.claude-sonnet-4-6",
    region: process.env.AWS_REGION ?? "us-east-1",
    temperature: 0,
  });
}
