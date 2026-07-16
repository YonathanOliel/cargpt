/** Injection token so the Vision provider can be swapped without touching logic. */
export const VISION_PROVIDER = Symbol('VISION_PROVIDER');

export type VisionTask = 'dashboard_light' | 'general';

export interface VisionInput {
  mimeType: string;
  /** Raw image bytes. */
  buffer: Buffer;
}

export interface VisionResult {
  /** Short label of what was detected, e.g. "נורת מנוע כתומה". */
  detectedLabel: string;
  description: string;
  /** Natural-language complaint fed into the diagnosis engine. */
  suggestedComplaint: string;
  confidence: number;
}

/**
 * Provider-agnostic image understanding. Implementations: MockVisionProvider (now),
 * OpenAI/Gemini vision adapters (next). Logic never depends on a concrete provider.
 */
export interface VisionProvider {
  readonly name: string;
  analyze(input: VisionInput, task: VisionTask): Promise<VisionResult>;
}
