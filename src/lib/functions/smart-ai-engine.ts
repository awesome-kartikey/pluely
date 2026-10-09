import {
  INBUILT_AI_CANDIDATES,
  INBUILT_KEYS,
  INBUILT_STT_MODELS,
  AICandidate,
} from "@/config/inbuilt-ai.config";
import { Message } from "@/types";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";

// In-memory cooldown tracking: candidate id -> timestamp (epoch ms) until cooldown expires
const cooldownTracker = new Map<string, number>();

/**
 * Returns whether a candidate model is currently in a cooldown state.
 */
export function isCandidateInCooldown(candidateId: string): boolean {
  const expiry = cooldownTracker.get(candidateId);
  if (!expiry) return false;
  if (Date.now() >= expiry) {
    cooldownTracker.delete(candidateId);
    return false;
  }
  return true;
}

/**
 * Sets a cooldown on a candidate model (defaults to 60 seconds).
 */
export function setCandidateCooldown(
  candidateId: string,
  durationMs: number = 60000
): void {
  cooldownTracker.set(candidateId, Date.now() + durationMs);
}

/**
 * Clears cooldown for a candidate or all candidates.
 */
export function clearCandidateCooldown(candidateId?: string): void {
  if (candidateId) {
    cooldownTracker.delete(candidateId);
  } else {
    cooldownTracker.clear();
  }
}

/**
 * Inspects HTTP status code and response body for rate limit / quota exhaustion indicators.
 */
export function isRateLimitOrQuotaError(
  status: number,
  responseText: string = ""
): boolean {
  if (status === 429 || status === 503 || status === 502 || status === 504) {
    return true;
  }
  const lower = responseText.toLowerCase();
  return (
    lower.includes("resource_exhausted") ||
    lower.includes("quota exceeded") ||
    lower.includes("rate limit") ||
    lower.includes("rate_limit") ||
    lower.includes("too many requests") ||
    lower.includes("overloaded") ||
    lower.includes("temporarily unavailable") ||
    lower.includes("exceeded your current quota") ||
    lower.includes("credit balance")
  );
}

/**
 * Returns live status of all inbuilt candidate models for UI inspection.
 */
export function getCandidatePoolStatuses() {
  const now = Date.now();
  return INBUILT_AI_CANDIDATES.map((candidate) => {
    const cooldownUntil = cooldownTracker.get(candidate.id) || 0;
    const isCooling = cooldownUntil > now;
    const remainingSec = isCooling ? Math.ceil((cooldownUntil - now) / 1000) : 0;
    return {
      ...candidate,
      isCooling,
      remainingSec,
    };
  });
}

/**
 * Builds OpenAI-compatible chat messages for text, history, and image inputs.
 */
function buildMessagesPayload(
  candidate: AICandidate,
  userMessage: string,
  systemPrompt?: string,
  history: Message[] = [],
  imagesBase64: string[] = []
): any[] {
  const messages: any[] = [];

  // Add system message if present
  if (systemPrompt && systemPrompt.trim()) {
    messages.push({
      role: "system",
      content: systemPrompt.trim(),
    });
  }

  // Add chat history
  if (history && history.length > 0) {
    for (const msg of history) {
      if (!msg.content || typeof msg.content !== "string") continue;
      messages.push({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      });
    }
  }

  // Add current user prompt with images (if supported)
  if (imagesBase64 && imagesBase64.length > 0 && candidate.supportsVision) {
    const contentParts: any[] = [{ type: "text", text: userMessage }];
    for (const b64 of imagesBase64) {
      // Strip any data:image... prefix if already present
      const cleanB64 = b64.includes(",") ? b64.split(",")[1] : b64;
      contentParts.push({
        type: "image_url",
        image_url: {
          url: `data:image/png;base64,${cleanB64}`,
        },
      });
    }
    messages.push({
      role: "user",
      content: contentParts,
    });
  } else {
    messages.push({
      role: "user",
      content: userMessage,
    });
  }

  return messages;
}

export interface SmartAIRequestParams {
  userMessage: string;
  systemPrompt?: string;
  history?: Message[];
  imagesBase64?: string[];
  signal?: AbortSignal;
}

/**
 * Executes a streaming AI response with automatic free-tier model rotation and failover.
 * Never displays rate-limit / quota errors to the user.
 */
export async function* executeSmartAIResponse(
  params: SmartAIRequestParams
): AsyncIterable<string> {
  const { userMessage, systemPrompt, history = [], imagesBase64 = [], signal } = params;

  if (signal?.aborted) return;

  const hasImages = imagesBase64 && imagesBase64.length > 0;

  // Filter candidates based on image requirement if needed
  let candidates = INBUILT_AI_CANDIDATES.filter((c) =>
    hasImages ? c.supportsVision : true
  );

  if (candidates.length === 0) {
    // If no vision candidate found (unlikely), fall back to all candidates
    candidates = INBUILT_AI_CANDIDATES;
  }

  // Sort candidates so that non-cooling candidates come first, maintaining priority order
  const now = Date.now();
  const sortedCandidates = [...candidates].sort((a, b) => {
    const aCooling = (cooldownTracker.get(a.id) || 0) > now;
    const bCooling = (cooldownTracker.get(b.id) || 0) > now;
    if (aCooling && !bCooling) return 1;
    if (!aCooling && bCooling) return -1;
    return 0; // maintain relative priority order
  });

  let lastError = "";

  for (const candidate of sortedCandidates) {
    if (signal?.aborted) return;

    try {
      const messages = buildMessagesPayload(
        candidate,
        userMessage,
        systemPrompt,
        history,
        imagesBase64
      );

      const requestBody: any = {
        model: candidate.model,
        messages,
        stream: true,
      };

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${candidate.apiKey}`,
        ...(candidate.headers || {}),
      };

      const fetchFunction = candidate.endpoint.includes("http") ? fetch : tauriFetch;

      let response: Response;
      try {
        response = await fetchFunction(candidate.endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify(requestBody),
          signal,
        });
      } catch (networkErr: any) {
        if (signal?.aborted || networkErr?.name === "AbortError") {
          return;
        }
        console.warn(`[SmartAI] Network error with ${candidate.name}:`, networkErr?.message);
        setCandidateCooldown(candidate.id, 30000); // 30s cooldown for network glitches
        continue;
      }

      // Check for rate limit or quota errors before streaming
      if (!response.ok) {
        let errText = "";
        try {
          errText = await response.text();
        } catch {}

        if (isRateLimitOrQuotaError(response.status, errText)) {
          console.warn(
            `[SmartAI] Model ${candidate.name} hit rate limit / quota (${response.status}). Auto-switching to next model...`,
            errText
          );
          setCandidateCooldown(candidate.id, 60000); // 60s cooldown
          lastError = `Rate limit on ${candidate.name}: ${errText}`;
          continue; // Seamlessly try next candidate!
        }

        // For other server errors (500, 502, etc.), also failover
        console.warn(`[SmartAI] Candidate ${candidate.name} error: ${response.status}`, errText);
        setCandidateCooldown(candidate.id, 45000);
        lastError = `Error on ${candidate.name}: ${errText}`;
        continue;
      }

      if (!response.body) {
        setCandidateCooldown(candidate.id, 30000);
        continue;
      }

      // Read SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let hasStreamedAnyContent = false;
      let inThoughtBlock = false;

      while (true) {
        if (signal?.aborted) {
          reader.cancel().catch(() => {});
          return;
        }

        let readResult;
        try {
          readResult = await reader.read();
        } catch (streamErr: any) {
          if (signal?.aborted || streamErr?.name === "AbortError") {
            return;
          }
          if (!hasStreamedAnyContent) {
            // Failed before emitting, failover to next candidate!
            setCandidateCooldown(candidate.id, 45000);
            break;
          }
          return;
        }

        const { done, value } = readResult;
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;

          const dataContent = trimmed.substring(5).trim();
          if (!dataContent || dataContent === "[DONE]") continue;

          try {
            const parsed = JSON.parse(dataContent);
            const delta =
              parsed.choices?.[0]?.delta?.content ||
              parsed.choices?.[0]?.message?.content ||
              parsed.candidates?.[0]?.content?.parts?.[0]?.text;

            if (delta && typeof delta === "string") {
              // Handle <thought> tags (produced by Gemma / reasoning models)
              let cleanDelta = delta;

              if (cleanDelta.includes("<thought>")) {
                inThoughtBlock = true;
                cleanDelta = cleanDelta.replace(/<thought>[\s\S]*?(<\/thought>|$)/g, "");
              } else if (inThoughtBlock) {
                if (cleanDelta.includes("</thought>")) {
                  inThoughtBlock = false;
                  cleanDelta = cleanDelta.replace(/^[\s\S]*?<\/thought>/, "");
                } else {
                  cleanDelta = ""; // Suppress internal thinking tokens
                }
              }

              if (cleanDelta) {
                hasStreamedAnyContent = true;
                yield cleanDelta;
              }
            }
          } catch {
            // Partial JSON chunk, continue
          }
        }
      }

      // If we successfully finished streaming content, complete!
      if (hasStreamedAnyContent) {
        return;
      }
    } catch (err: any) {
      if (signal?.aborted) return;
      console.warn(`[SmartAI] Exception running ${candidate.name}:`, err);
      setCandidateCooldown(candidate.id, 60000);
      lastError = err?.message || String(err);
      continue;
    }
  }

  // Fallback: If all candidates exhausted their quotas simultaneously
  if (!signal?.aborted) {
    yield `All free-tier models are momentarily busy. Please try again in a few seconds. (${lastError})`;
  }
}

/**
 * Transcribes audio using Groq Whisper with automatic fallback between
 * whisper-large-v3-turbo and whisper-large-v3.
 */
export async function executeSmartSTT(audio: File | Blob): Promise<string> {
  const models = INBUILT_STT_MODELS;
  let lastError = "";

  for (const modelConfig of models) {
    try {
      const formData = new FormData();
      formData.append("file", audio, "audio.wav");
      formData.append("model", modelConfig.model);
      formData.append("temperature", "0");
      formData.append("response_format", "json");

      const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${INBUILT_KEYS.GROQ}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(
          `[SmartSTT] Groq model ${modelConfig.model} failed (${response.status}): ${errText}. Retrying with fallback...`
        );
        lastError = errText;
        continue; // Try next model
      }

      const data = await response.json();
      if (data && typeof data.text === "string" && data.text.trim()) {
        return data.text.trim();
      }
    } catch (err: any) {
      console.warn(`[SmartSTT] Exception with ${modelConfig.model}:`, err?.message);
      lastError = err?.message || String(err);
      continue;
    }
  }

  throw new Error(`Speech transcription failed across all models: ${lastError}`);
}
