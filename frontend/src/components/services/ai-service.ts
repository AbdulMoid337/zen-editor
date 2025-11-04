interface AIResponse {
  success: boolean;
  data?: string;
  error?: string;
}

class AIService {
  private baseUrl: string;

  constructor(baseUrl: string = "https://zen-editor-backend.onrender.com/api") {
    this.baseUrl = baseUrl;
  }

  private async request(endpoint: string, payload: Record<string, unknown>): Promise<AIResponse> {
    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        return { success: false, error: `HTTP error ${res.status}` };
      }

      const result: AIResponse = await res.json();
      return result;
    } catch (err) {
      console.error("AIService request failed:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown network error",
      };
    }
  }

  async summarize(text: string): Promise<AIResponse> {
    return this.request("/ai/summarize", { text });
  }

  async expand(text: string): Promise<AIResponse> {
    return this.request("/ai/expand", { text });
  }

  async improve(text: string): Promise<AIResponse> {
    return this.request("/ai/improve", { text });
  }
}

export const aiService = new AIService();
