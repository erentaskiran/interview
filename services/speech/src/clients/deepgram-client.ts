interface DeepgramConfig {
  apiKey?: string;
  ttsModel: string;
  sttModel: string;
}

export class DeepgramClient {
  constructor(private readonly config: DeepgramConfig) {}

  private get authHeader() {
    if (!this.config.apiKey) {
      return undefined;
    }
    return `Token ${this.config.apiKey}`;
  }

  private ensureEnabled() {
    if (!this.authHeader) {
      throw new Error("DEEPGRAM_NOT_CONFIGURED");
    }
  }

  async textToSpeech(
    text: string,
    voiceModel?: string
  ): Promise<{ audioBase64: string; mimeType: string }> {
    this.ensureEnabled();

    const model = voiceModel ?? this.config.ttsModel;
    const response = await fetch(
      `https://api.deepgram.com/v1/speak?model=${encodeURIComponent(model)}`,
      {
        method: "POST",
        headers: {
          Authorization: this.authHeader!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      }
    );

    if (!response.ok) {
      throw new Error(`DEEPGRAM_TTS_FAILED_${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return {
      audioBase64: Buffer.from(arrayBuffer).toString("base64"),
      mimeType: response.headers.get("content-type") ?? "audio/mpeg",
    };
  }

  async speechToText(audioBase64: string, mimeType: string): Promise<string> {
    this.ensureEnabled();

    const audioBuffer = Buffer.from(audioBase64, "base64");
    const response = await fetch(
      `https://api.deepgram.com/v1/listen?model=${encodeURIComponent(this.config.sttModel)}`,
      {
        method: "POST",
        headers: {
          Authorization: this.authHeader!,
          "Content-Type": mimeType,
        },
        body: audioBuffer,
      }
    );

    if (!response.ok) {
      throw new Error(`DEEPGRAM_STT_FAILED_${response.status}`);
    }

    const payload = (await response.json()) as {
      results?: {
        channels?: Array<{ alternatives?: Array<{ transcript?: string }> }>;
      };
    };

    const transcript = payload.results?.channels?.[0]?.alternatives?.[0]?.transcript?.trim() ?? "";
    if (!transcript) {
      throw new Error("DEEPGRAM_EMPTY_TRANSCRIPT");
    }
    return transcript;
  }
}
