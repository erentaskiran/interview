import type { SessionResult } from "@ainterview/shared";
import type {
  AiInterviewProvider,
  ContinueInterviewInput,
  ContinueInterviewResult,
  FinalizeInterviewInput,
  GenerateTemplateResult,
  StartInterviewInput,
  StartInterviewResult,
} from "./types.js";

interface OpenCodeConfig {
  apiUrl: string;
  apiKey: string;
  model?: string;
}

interface ChatCompletionChoice {
  message?: {
    content?: string | null;
  };
  text?: string | null;
}

interface ChatCompletionResponse {
  output?: string;
  text?: string;
  choices?: ChatCompletionChoice[];
}

const extractJsonObject = <T>(raw: string): T => {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw new Error("AI returned non-JSON content");
    }
    const sliced = trimmed.slice(firstBrace, lastBrace + 1);
    return JSON.parse(sliced) as T;
  }
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export class OpenCodeAiProvider implements AiInterviewProvider {
  constructor(private readonly config: OpenCodeConfig) {}

  private async callModel(prompt: string): Promise<string> {
    const model = this.config.model ?? "deepseek-v4-flash";
    const response = await fetch(this.config.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "Return strictly valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(
        `OpenCode request failed with status ${response.status}${body ? `: ${body.slice(0, 240)}` : ""}`
      );
    }

    const payload = (await response.json()) as ChatCompletionResponse;
    const text =
      payload.choices?.[0]?.message?.content ??
      payload.choices?.[0]?.text ??
      payload.output ??
      payload.text;
    if (!text) {
      throw new Error("OpenCode response missing output text");
    }
    return text;
  }

  async startInterview(input: StartInterviewInput): Promise<StartInterviewResult> {
    const prompt = [
      "You are an interview planner.",
      "Return ONLY valid JSON with keys: rubric, plannedCoverage, plannedQuestionCount, firstQuestion.",
      `Template title: ${input.templateTitle}`,
      `Category: ${input.templateCategory}`,
      `Description: ${input.templateDescription}`,
      `System instruction: ${input.systemInstruction}`,
      `Question bounds: min=${input.minQuestionCount}, max=${input.maxQuestionCount}`,
    ].join("\n");

    const raw = await this.callModel(prompt);
    const parsed = extractJsonObject<StartInterviewResult>(raw);

    if (
      !parsed.firstQuestion ||
      !Array.isArray(parsed.plannedCoverage) ||
      typeof parsed.plannedQuestionCount !== "number"
    ) {
      throw new Error("Malformed AI session plan");
    }

    return {
      rubric: parsed.rubric ?? {},
      plannedCoverage: parsed.plannedCoverage,
      plannedQuestionCount: clamp(
        parsed.plannedQuestionCount,
        input.minQuestionCount,
        input.maxQuestionCount
      ),
      firstQuestion: parsed.firstQuestion,
    };
  }

  async continueInterview(input: ContinueInterviewInput): Promise<ContinueInterviewResult> {
    const prompt = [
      "You evaluate interview progress.",
      "Return ONLY valid JSON with keys: decision, reasoning, nextQuestion.",
      "decision must be continue or finish.",
      `Min questions: ${input.minQuestionCount}`,
      `Max questions: ${input.maxQuestionCount}`,
      `Planned questions: ${input.plannedQuestionCount}`,
      `Turns: ${JSON.stringify(input.turns)}`,
    ].join("\n");

    const raw = await this.callModel(prompt);
    const parsed = extractJsonObject<ContinueInterviewResult>(raw);

    if (parsed.decision !== "continue" && parsed.decision !== "finish") {
      throw new Error("Malformed AI continue decision");
    }

    if (parsed.decision === "continue" && !parsed.nextQuestion) {
      throw new Error("AI requested continue without next question");
    }

    return parsed;
  }

  async generateTemplate(prompt: string): Promise<GenerateTemplateResult> {
    const systemPrompt = [
      "You are an interview template generator.",
      "Return ONLY valid JSON with keys: title, category, description, systemInstruction.",
      "title: a concise template title (3-140 chars).",
      "category: a short category name (2-80 chars).",
      "description: a detailed description of the interview context and rubric intent (10-1500 chars).",
      "systemInstruction: a detailed system prompt for an AI interviewer role (10-8000 chars).",
      "CRITICAL: The user may describe their request in any language, but you MUST generate all fields (title, category, description, systemInstruction) in English only.",
      "The output must be strictly JSON, no markdown, no extra text.",
    ].join(" ");

    const userPrompt = `User request: ${prompt}`;

    const response = await fetch(this.config.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model ?? "deepseek-v4-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(
        `OpenCode request failed with status ${response.status}${body ? `: ${body.slice(0, 240)}` : ""}`
      );
    }

    const payload = (await response.json()) as ChatCompletionResponse;
    const text =
      payload.choices?.[0]?.message?.content ??
      payload.choices?.[0]?.text ??
      payload.output ??
      payload.text;
    if (!text) {
      throw new Error("OpenCode response missing output text");
    }

    const parsed = extractJsonObject<GenerateTemplateResult>(text);

    if (
      typeof parsed.title !== "string" ||
      typeof parsed.category !== "string" ||
      typeof parsed.description !== "string" ||
      typeof parsed.systemInstruction !== "string"
    ) {
      throw new Error("Malformed AI template generation payload");
    }

    return parsed;
  }

  async finalizeInterview(input: FinalizeInterviewInput): Promise<SessionResult> {
    const prompt = [
      "You are generating final interview scoring.",
      "Return ONLY valid JSON with keys: score, feedback.",
      "feedback must include strengths, weakAreas, suggestions, summary.",
      `Completion reason: ${input.completionReason}`,
      `Turns: ${JSON.stringify(input.turns)}`,
    ].join("\n");

    const raw = await this.callModel(prompt);
    const parsed = extractJsonObject<SessionResult>(raw);

    if (
      typeof parsed.score !== "number" ||
      !parsed.feedback ||
      !Array.isArray(parsed.feedback.strengths) ||
      !Array.isArray(parsed.feedback.weakAreas) ||
      !Array.isArray(parsed.feedback.suggestions) ||
      typeof parsed.feedback.summary !== "string"
    ) {
      throw new Error("Malformed AI final scoring payload");
    }

    return parsed;
  }
}
