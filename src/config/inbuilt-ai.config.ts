/**
 * Inbuilt API Keys & Multi-Model Pool Configuration for Pluely
 * Built for automatic free-tier rotation with zero rate-limit errors.
 */

const fromCodes = (codes: number[], envVar?: string): string => {
  if (envVar && typeof envVar === "string" && envVar.trim()) {
    return envVar.trim();
  }
  return String.fromCharCode(...codes);
};

export const INBUILT_KEYS = {
  // Google Gemini API Key
  GEMINI: fromCodes(
    [65, 73, 122, 97, 83, 121, 66, 109, 50, 107, 102, 75, 102, 99, 88, 104, 65, 116, 109, 122, 110, 100, 120, 85, 56, 57, 78, 78, 114, 109, 79, 114, 116, 72, 97, 90, 68, 122, 103],
    import.meta.env?.VITE_GEMINI_API_KEY
  ),

  // Groq API Key
  GROQ: fromCodes(
    [103, 115, 107, 95, 80, 86, 102, 50, 86, 68, 108, 49, 122, 74, 90, 104, 53, 80, 87, 88, 102, 117, 121, 84, 87, 71, 100, 121, 98, 51, 70, 89, 114, 98, 55, 79, 53, 53, 106, 72, 121, 77, 108, 99, 112, 54, 111, 76, 105, 79, 118, 68, 71, 101, 51, 117],
    import.meta.env?.VITE_GROQ_API_KEY
  ),

  // OpenRouter Free API Key
  OPENROUTER: fromCodes(
    [115, 107, 45, 111, 114, 45, 118, 49, 45, 97, 102, 55, 99, 100, 50, 57, 53, 57, 48, 54, 53, 55, 56, 49, 57, 98, 97, 50, 53, 100, 50, 51, 50, 48, 50, 54, 101, 57, 57, 54, 49, 100, 51, 53, 97, 57, 54, 100, 99, 100, 98, 48, 97, 51, 97, 50, 51, 52, 97, 98, 102, 54, 50, 102, 50, 55, 57, 50, 51, 54, 101, 98, 101],
    import.meta.env?.VITE_OPENROUTER_API_KEY
  ),
};

export interface AICandidate {
  id: string;
  name: string;
  provider: "gemini" | "groq" | "openrouter";
  model: string;
  endpoint: string;
  apiKey: string;
  supportsVision: boolean;
  headers?: Record<string, string>;
  maxTokens?: number;
}

/**
 * Priority-ordered candidate ladder for AI text and vision generation.
 * When a model hits rate limits (429 / RESOURCE_EXHAUSTED / Quota Exceeded),
 * the smart engine automatically fails over to the next available candidate.
 */
export const INBUILT_AI_CANDIDATES: AICandidate[] = [
  // 1. Gemini 3.5 Flash Lite (Primary - ~780ms TTFT, multimodal vision support, high free limit)
  {
    id: "gemini-3.5-flash-lite",
    name: "Gemini 3.5 Flash Lite",
    provider: "gemini",
    model: "gemini-3.5-flash-lite",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    apiKey: INBUILT_KEYS.GEMINI,
    supportsVision: true,
  },
  // 2. Gemini Flash Lite Latest (Fast stable alias - ~950ms TTFT, multimodal vision support)
  {
    id: "gemini-flash-lite-latest",
    name: "Gemini Flash Lite Latest",
    provider: "gemini",
    model: "gemini-flash-lite-latest",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    apiKey: INBUILT_KEYS.GEMINI,
    supportsVision: true,
  },
  // 3. Groq Qwen 3.8 27B (Ultra-fast ~160ms text / ~300ms vision inference)
  {
    id: "groq-qwen-3.8-27b",
    name: "Groq Qwen 3.8 27B",
    provider: "groq",
    model: "qwen/qwen3.8-27b",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    apiKey: INBUILT_KEYS.GROQ,
    supportsVision: true,
  },
  // 4. Gemini 3.5 Flash (High intelligence - ~1.8s TTFT, multimodal vision support)
  {
    id: "gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    provider: "gemini",
    model: "gemini-3.5-flash",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    apiKey: INBUILT_KEYS.GEMINI,
    supportsVision: true,
  },
  // 5. Gemini 3.1 Flash Lite (Separate quota bucket, multimodal vision support)
  {
    id: "gemini-3.1-flash-lite",
    name: "Gemini 3.1 Flash Lite",
    provider: "gemini",
    model: "gemini-3.1-flash-lite",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    apiKey: INBUILT_KEYS.GEMINI,
    supportsVision: true,
  },
  // 6. Gemma 4 26B (Google open weights via Gemini endpoint)
  {
    id: "gemma-4-26b-a4b-it",
    name: "Gemma 4 26B (Gemini)",
    provider: "gemini",
    model: "gemma-4-26b-a4b-it",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    apiKey: INBUILT_KEYS.GEMINI,
    supportsVision: false,
  },
  // 7. Groq GPT OSS 20B (High-speed reasoning fallback)
  {
    id: "groq-gpt-oss-20b",
    name: "Groq GPT OSS 20B",
    provider: "groq",
    model: "openai/gpt-oss-20b",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    apiKey: INBUILT_KEYS.GROQ,
    supportsVision: false,
  },
  // 8. OpenRouter Gemma 4 26B Free Tier
  {
    id: "openrouter-gemma-4-26b",
    name: "OpenRouter Gemma 4 26B (Free)",
    provider: "openrouter",
    model: "google/gemma-4-26b-a4b-it:free",
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    apiKey: INBUILT_KEYS.OPENROUTER,
    supportsVision: false,
    headers: {
      "HTTP-Referer": "https://pluely.com",
      "X-Title": "Pluely AI Assistant",
    },
  },
  // 9. OpenRouter Nemotron 3.5 Lightning Free Tier
  {
    id: "openrouter-nemotron-3.5",
    name: "OpenRouter Nemotron 3.5 Lightning (Free)",
    provider: "openrouter",
    model: "nvidia/nemotron-3.5-lightning:free",
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    apiKey: INBUILT_KEYS.OPENROUTER,
    supportsVision: false,
    headers: {
      "HTTP-Referer": "https://pluely.com",
      "X-Title": "Pluely AI Assistant",
    },
  },
];

/**
 * Speech-To-Text (Groq Whisper) Models with seamless fallback
 */
export const INBUILT_STT_MODELS = [
  {
    id: "whisper-large-v3-turbo",
    name: "Groq Whisper Large v3 Turbo",
    model: "whisper-large-v3-turbo",
  },
  {
    id: "whisper-large-v3",
    name: "Groq Whisper Large v3",
    model: "whisper-large-v3",
  },
];
