interface SpeechClientConfig {
  baseUrl: string;
}

export interface TtsResponse {
  audioBase64: string;
  mimeType: string;
}

export class SpeechServiceClient {
  constructor(private readonly config: SpeechClientConfig) {}

  async textToSpeech(text: string, voiceModel?: string): Promise<TtsResponse> {
    const response = await fetch(`${this.config.baseUrl}/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        ...(voiceModel ? { voiceModel } : {}),
      }),
    });
    if (!response.ok) {
      throw new Error(`Speech TTS failed with status ${response.status}`);
    }
    return (await response.json()) as TtsResponse;
  }

  async speechToText(audioBase64: string, mimeType: string): Promise<string> {
    const response = await fetch(`${this.config.baseUrl}/stt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audioBase64, mimeType }),
    });
    if (!response.ok) {
      throw new Error(`Speech STT failed with status ${response.status}`);
    }
    const payload = (await response.json()) as { transcript?: string };
    if (!payload.transcript) {
      throw new Error("Speech STT returned empty transcript");
    }
    return payload.transcript;
  }
}
