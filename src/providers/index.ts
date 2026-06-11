/**
 * Unified Provider interface for OCR and AI.
 * Swap implementations via config without touching module code.
 */

export interface ProviderResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface OCRProvider {
  /** Recognize text from a base64-encoded image or URL. */
  recognize(imageSource: string): Promise<ProviderResult<string>>;
}

export interface AIProvider {
  /** Analyze text for risk. Returns 0-100 score with optional tags. */
  analyzeRisk(text: string): Promise<ProviderResult<{ score: number; reason: string; tags: string[] }>>;
}

// ─── OCR ─────────────────────────────────────────────────────────────────────

import { configManager } from '../core/config/index.js';

class DisabledOCR implements OCRProvider {
  async recognize(): Promise<ProviderResult<string>> {
    return { ok: false, error: 'OCR provider is disabled' };
  }
}

class CustomOCR implements OCRProvider {
  async recognize(imageSource: string): Promise<ProviderResult<string>> {
    const cfg = configManager.get().ocr;
    if (!cfg.customEndpoint) return { ok: false, error: 'No custom OCR endpoint configured' };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);

    try {
      const res = await fetch(cfg.customEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(cfg.customApiKey ? { Authorization: `Bearer ${cfg.customApiKey}` } : {}),
        },
        body: JSON.stringify({ image: imageSource }),
        signal: controller.signal,
      });

      if (!res.ok) return { ok: false, error: `OCR HTTP ${res.status}` };
      const json = (await res.json()) as { text?: string };
      return { ok: true, data: json.text ?? '' };
    } catch (err) {
      return { ok: false, error: String(err) };
    } finally {
      clearTimeout(timer);
    }
  }
}

// ─── AI ──────────────────────────────────────────────────────────────────────

class DisabledAI implements AIProvider {
  async analyzeRisk(): Promise<ProviderResult<{ score: number; reason: string; tags: string[] }>> {
    return { ok: false, error: 'AI provider is disabled' };
  }
}

class OpenAICompatibleAI implements AIProvider {
  async analyzeRisk(text: string): Promise<ProviderResult<{ score: number; reason: string; tags: string[] }>> {
    const cfg = configManager.get().ai;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);

    try {
      const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cfg.apiKey}`,
        },
        body: JSON.stringify({
          model: cfg.model,
          messages: [
            { role: 'system', content: cfg.riskPrompt },
            { role: 'user', content: text },
          ],
          response_format: { type: 'json_object' },
          max_tokens: 200,
        }),
        signal: controller.signal,
      });

      if (!res.ok) return { ok: false, error: `AI HTTP ${res.status}` };

      const json = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };

      const content = json.choices?.[0]?.message?.content ?? '{}';
      const parsed = JSON.parse(content) as {
        score?: number;
        reason?: string;
        tags?: string[];
      };

      return {
        ok: true,
        data: {
          score: Math.min(100, Math.max(0, parsed.score ?? 0)),
          reason: parsed.reason ?? '',
          tags: parsed.tags ?? [],
        },
      };
    } catch (err) {
      return { ok: false, error: String(err) };
    } finally {
      clearTimeout(timer);
    }
  }
}

// ─── Factory functions ────────────────────────────────────────────────────────

export function createOCRProvider(): OCRProvider {
  const cfg = configManager.get().ocr;
  switch (cfg.provider) {
    case 'custom':
      return new CustomOCR();
    case 'disabled':
    default:
      return new DisabledOCR();
  }
}

export function createAIProvider(): AIProvider {
  const cfg = configManager.get().ai;
  switch (cfg.provider) {
    case 'openai':
    case 'anthropic':
    case 'custom':
      return new OpenAICompatibleAI();
    case 'disabled':
    default:
      return new DisabledAI();
  }
}
